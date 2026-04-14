import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { query, mayoristaId } = await req.json();
    if (!query || !mayoristaId) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // First, get a sample of products from this mayorista to give context to AI
    const sampleProducts = await db.producto.findMany({
      where: { mayoristaId },
      take: 500,
      orderBy: { descripcion: "asc" },
    });

    if (sampleProducts.length === 0) {
      return NextResponse.json({ results: [], message: "No hay productos cargados" });
    }

    // Use AI to find matching products
    const zai = await ZAI.create();

    const productList = sampleProducts
      .slice(0, 300)
      .map((p, i) => `${i}: [${p.codigo}] ${p.descripcion} ($${p.precio})`)
      .join("\n");

    const aiPrompt = `Sos un asistente de búsqueda de productos para un sistema de mayoristas.

El usuario busca: "${query}"

Lista de productos disponibles (los primeros 300 de ${sampleProducts.length}):
${productList}

Instrucciones:
- Encontrá TODOS los productos que coincidan con lo que el usuario busca
- Usá criterio amplio: si busca "azúcar chango", encontrá TODOS los productos de azúcar chango
- Si busca por categoría (ej "aceites"), encontrá todos los aceites
- Ignorá mayúsculas/minúsculas y tildes
- Si busca "80 unidades", ese es la cantidad que quiere pedir, no parte de la búsqueda

Respondé SOLO con un JSON array de números (los índices de los productos que coinciden).
Ejemplo: [2, 15, 23, 45]
Si no encontrás nada respondé: []`;

    const aiResponse = await zai.chat.completions.create({
      model: "default",
      messages: [{ role: "user", content: aiPrompt }],
    });

    const content = aiResponse.choices?.[0]?.message?.content || "[]";

    // Parse the indices from AI response
    const indicesMatch = content.match(/\[[\d,\s]+\]/);
    let indices: number[] = [];
    if (indicesMatch) {
      try {
        indices = JSON.parse(indicesMatch[0]);
      } catch {
        // Try to extract numbers manually
        const nums = content.match(/\d+/g);
        if (nums) indices = nums.map(Number);
      }
    }

    // Get the matching products
    const results = indices
      .filter((i) => i >= 0 && i < sampleProducts.length)
      .map((i) => sampleProducts[i]);

    // If AI didn't find anything, fall back to simple text search
    if (results.length === 0) {
      const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const searchWords = normalizedQuery.split(/\s+/).filter((w: string) => w.length > 2);

      if (searchWords.length > 0) {
        const fallback = sampleProducts.filter((p) => {
          const desc = (p.descripcion || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const cod = (p.codigo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return searchWords.some((w: string) => desc.includes(w) || cod.includes(w));
        });
        results.push(...fallback);
      }
    }

    // Remove duplicates and limit
    const seen = new Set<string>();
    const unique = results.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    }).slice(0, 50);

    return NextResponse.json({ results: unique, total: sampleProducts.length });
  } catch (error) {
    console.error("Error en AI search:", error);
    return NextResponse.json({ error: "Error en búsqueda inteligente" }, { status: 500 });
  }
}
