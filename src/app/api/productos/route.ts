import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// Column mapping - specifically handles the common Argentine mayorista Excel format
function mapRow(raw: any, keys: string[]): { codigo: string; descripcion: string; precio: number } | null {
  // Strategy: 
  // 1. Description = the column that has the longest text value (usually product name)
  // 2. Codigo = a numeric column (usually first column)
  // 3. Precio = a column with "$" and "unit" in name, or the highest numeric value column
  
  let descKey: string | null = null;
  let codigoKey: string | null = null;
  let precioKey: string | null = null;

  // Step 1: Find description column - the one with the most text content
  let longestTextLen = 0;
  for (const k of keys) {
    const val = String(raw[k] || "").trim();
    if (val.length > longestTextLen && val.length > 3) {
      longestTextLen = val.length;
      descKey = k;
    }
  }

  // Step 2: Find numeric columns and classify them
  const numericColumns: { key: string; value: number; name: string }[] = [];
  for (const k of keys) {
    if (k === descKey) continue;
    const val = raw[k];
    if (typeof val === "number" && val > 0) {
      numericColumns.push({ key: k, value: val, name: k.toLowerCase() });
    }
  }

  // Step 3: Among numeric columns, find precio (prefer "$ unit" or "precio" in name)
  for (const col of numericColumns) {
    if (col.name.includes("$ unit") || col.name.includes("preciounitario") || col.name.includes("precio unitario")) {
      precioKey = col.key;
      break;
    }
  }

  // Step 4: The remaining numeric column(s) are codigo
  for (const col of numericColumns) {
    if (col.key !== precioKey && col.key !== descKey) {
      if (!codigoKey) {
        codigoKey = col.key;
      }
    }
  }

  // Step 5: Fallback - if no precio found, use the largest numeric value
  if (!precioKey && numericColumns.length > 0) {
    // Skip "$ dto" columns (discount prices)
    const nonDtoCols = numericColumns.filter(c => !c.name.includes("dto") && !c.name.includes("descuento"));
    if (nonDtoCols.length > 1) {
      // Use the one with higher value as precio (unit price is usually higher than codigo)
      nonDtoCols.sort((a, b) => b.value - a.value);
      precioKey = nonDtoCols[0].key;
      codigoKey = nonDtoCols[1]?.key || numericColumns.find(c => c.key !== precioKey)?.key || null;
    } else if (nonDtoCols.length === 1) {
      // Only one numeric column - could be either
      codigoKey = nonDtoCols[0].key;
    }
  }

  // Extract values
  const codigo = codigoKey ? String(raw[codigoKey] || "").trim() : "";
  const descripcion = descKey ? String(raw[descKey] || "").trim() : "";
  let precio = 0;
  if (precioKey) {
    precio = typeof raw[precioKey] === "number" ? raw[precioKey] : 0;
  }

  // Skip empty rows
  if (!descripcion && !codigo) return null;
  // Skip category headers (text with semicolons, no codigo, no precio)
  if (!codigo && precio === 0 && descripcion.includes(";")) return null;

  return { codigo, descripcion: descripcion || codigo, precio };
}

// GET - Search products (simple and reliable)
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
      // Normalize: remove accents, lowercase
      const normalized = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      // Split into words, keep only meaningful ones (3+ chars, or 2+ if it's the only word)
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
        // Single 2-char word
        where.OR = [
          { codigo: { contains: words[0], mode: "insensitive" } },
          { descripcion: { contains: words[0], mode: "insensitive" } },
        ];
      }
    }

    // Get products - load ALL when no query, limit 100 when searching
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

// POST - Load products (optimized for Vercel's 10s limit)
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { mayoristaId, productos } = body;

    if (!mayoristaId || !Array.isArray(productos)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const mayorista = await db.mayorista.findFirst({
      where: { id: mayoristaId, userId },
    });
    if (!mayorista) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Delete old products
    await db.producto.deleteMany({ where: { mayoristaId } });

    // Map ALL products at once (fast - just object manipulation)
    const keys = Object.keys(productos[0] || {});
    const productData: { codigo: string; descripcion: string; precio: number; mayoristaId: string }[] = [];
    let skipped = 0;

    for (const p of productos) {
      const mapped = mapRow(p, keys);
      if (mapped) {
        productData.push({ ...mapped, mayoristaId });
      } else {
        skipped++;
      }
    }

    // Single insert - Prisma createMany is fast, should complete within 10s
    if (productData.length > 0) {
      await db.producto.createMany({ data: productData });
    }

    return NextResponse.json({
      ok: true,
      total: productData.length,
      skipped,
      message: `${productData.length} productos cargados OK`,
    });
  } catch (error) {
    console.error("POST /api/productos error:", error);
    return NextResponse.json({ error: "Error al cargar: " + (error instanceof Error ? error.message : "desconocido") }, { status: 500 });
  }
}
