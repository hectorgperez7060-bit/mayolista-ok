import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// GET - Search products
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mayoristaId = searchParams.get("mayoristaId");
    const query = (searchParams.get("q") || "").trim();

    if (!mayoristaId) {
      return NextResponse.json({ error: "mayoristaId requerido" }, { status: 400 });
    }

    const mayorista = await db.mayorista.findFirst({
      where: { id: mayoristaId, userId },
    });
    if (!mayorista) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const where: any = { mayoristaId };

    if (query.length > 0) {
      const normalized = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const words = normalized.split(/\s+/).filter(w => w.length >= 2);
      const meaningfulWords = words.length > 1 ? words.filter(w => w.length >= 3) : words;

      if (meaningfulWords.length > 0) {
        where.OR = [];
        for (const word of meaningfulWords) {
          where.OR.push(
            { codigo: { contains: word, mode: "insensitive" } },
            { descripcion: { contains: word, mode: "insensitive" } }
          );
        }
      } else if (words.length > 0) {
        where.OR = [
          { codigo: { contains: words[0], mode: "insensitive" } },
          { descripcion: { contains: words[0], mode: "insensitive" } },
        ];
      }
    }

    // Load all products (up to 5000) when no query, limit 100 when searching
    const productos = await db.producto.findMany({
      where: query.length > 0 ? where : { mayoristaId },
      orderBy: { descripcion: "asc" },
      take: query.length > 0 ? 100 : 5000,
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error("GET /api/productos error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST - Insert products (data already processed from client side)
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { mayoristaId, productos, replace } = body;

    if (!mayoristaId || !Array.isArray(productos)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const mayorista = await db.mayorista.findFirst({
      where: { id: mayoristaId, userId },
    });
    if (!mayorista) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Delete old products only on first chunk
    if (replace) {
      await db.producto.deleteMany({ where: { mayoristaId } });
    }

    // Insert - data comes pre-processed from client (codigo, descripcion, precio)
    const productData = productos.map((p: any) => ({
      codigo: String(p.codigo || ""),
      descripcion: String(p.descripcion || ""),
      precio: Number(p.precio) || 0,
      mayoristaId,
    }));

    if (productData.length > 0) {
      await db.producto.createMany({ data: productData });
    }

    return NextResponse.json({
      ok: true,
      total: productData.length,
    });
  } catch (error) {
    console.error("POST /api/productos error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
