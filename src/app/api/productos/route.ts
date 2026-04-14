import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// Smart column mapping - optimized for real-world Excel files
function mapProductData(raw: any): { codigo: string; descripcion: string; precio: number } | null {
  const keys = Object.keys(raw);
  if (keys.length === 0) return null;

  let codigoKey: string | null = null;
  let descKey: string | null = null;
  let precioKey: string | null = null;

  // 1. Find descripcion first - look for text-heavy columns
  for (const k of keys) {
    if (k === "__EMPTY" || k.toLowerCase().includes("empty")) {
      const val = String(raw[k] || "").trim();
      if (val.length > 2) {
        descKey = k;
        break;
      }
    }
  }

  // If no __EMPTY, look for common description names
  if (!descKey) {
    const descPatterns = ["descripcion", "descrip", "nombre", "producto", "detail", "detalle", "articulo", "denominacion"];
    const normKeys = Object.fromEntries(keys.map(k => [k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), k]));
    for (const p of descPatterns) {
      for (const [norm, orig] of Object.entries(normKeys)) {
        if (norm.includes(p)) { descKey = orig; break; }
      }
      if (descKey) break;
    }
  }

  // 2. Find codigo - first column with numeric values
  for (const k of keys) {
    if (k === descKey) continue;
    if (typeof raw[k] === "number" && raw[k] > 0) {
      if (!codigoKey) {
        codigoKey = k;
      }
    }
  }

  // 3. Find precio - prefer "$ UNIT" over "$ DTO" (unit price is what we want)
  // Priority: $ UNIT > precio > $ DTO > any remaining numeric column
  for (const k of keys) {
    if (k === descKey || k === codigoKey) continue;
    const norm = k.toLowerCase();
    if (norm.includes("$ unit") || norm.includes("pr. unit") || norm.includes("preciounitario") || norm === "precio unitario") {
      precioKey = k;
      break;
    }
  }

  if (!precioKey) {
    for (const k of keys) {
      if (k === descKey || k === codigoKey) continue;
      const norm = k.toLowerCase();
      if (norm.includes("precio") || norm.includes("price") || norm.includes("pvp") || norm === "valor") {
        precioKey = k;
        break;
      }
    }
  }

  if (!precioKey) {
    // Avoid "$ DTO" (bulk discount price) - prefer any other numeric column
    for (const k of keys) {
      if (k === descKey || k === codigoKey) continue;
      const norm = k.toLowerCase();
      if (norm.includes("dto") || norm.includes("descuento") || norm.includes("costo")) {
        continue; // skip discount columns
      }
      if (typeof raw[k] === "number" && raw[k] > 0) {
        precioKey = k;
        break;
      }
    }
  }

  // 4. Fallback: if still no precio, take any numeric column except codigoKey
  if (!precioKey) {
    for (const k of keys) {
      if (k === descKey || k === codigoKey) continue;
      if (typeof raw[k] === "number" && raw[k] > 0) {
        precioKey = k;
        break;
      }
    }
  }

  // Extract values
  const codigo = codigoKey ? String(raw[codigoKey] || "").trim() : "";
  const descripcion = descKey ? String(raw[descKey] || "").trim() : "";
  let precio = 0;
  if (precioKey) {
    const rawPrecio = raw[precioKey];
    if (typeof rawPrecio === "number") {
      precio = rawPrecio;
    } else {
      const cleaned = String(rawPrecio).replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
      precio = parseFloat(cleaned) || 0;
    }
  }

  // Skip empty rows
  if (!descripcion && !codigo) return null;

  // Skip category headers (text-only rows with semicolons)
  if (!codigo && precio === 0 && descripcion.includes(";")) return null;

  return { codigo, descripcion: descripcion || codigo, precio };
}

// GET - Search products with smart matching
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mayoristaId = searchParams.get("mayoristaId");
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!mayoristaId) {
      return NextResponse.json({ error: "mayoristaId es obligatorio" }, { status: 400 });
    }

    const mayorista = await db.mayorista.findFirst({
      where: { id: mayoristaId, userId },
    });
    if (!mayorista) {
      return NextResponse.json({ error: "Mayorista no encontrado" }, { status: 404 });
    }

    const where: any = { mayoristaId };

    if (query) {
      // Normalize query - remove accents for matching
      const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Split into words, filter out short ones (1-2 chars) unless it's the only word
      const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
      const allWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

      if (words.length > 0) {
        // OR logic: if ANY word matches, return the product
        where.OR = [];
        for (const word of words) {
          where.OR.push(
            { codigo: { contains: word, mode: "insensitive" } },
            { descripcion: { contains: word, mode: "insensitive" } }
          );
        }
      } else if (allWords.length > 0) {
        // Single short word - search as-is
        const word = allWords[0];
        where.OR = [
          { codigo: { contains: word, mode: "insensitive" } },
          { descripcion: { contains: word, mode: "insensitive" } },
        ];
      }
    }

    const productos = await db.producto.findMany({
      where,
      orderBy: { descripcion: "asc" },
      take: 100,
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Load products from Excel
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { mayoristaId, productos } = body;

    if (!mayoristaId || !productos || !Array.isArray(productos)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const mayorista = await db.mayorista.findFirst({
      where: { id: mayoristaId, userId },
    });
    if (!mayorista) {
      return NextResponse.json({ error: "Mayorista no encontrado" }, { status: 404 });
    }

    // Delete previous products
    await db.producto.deleteMany({ where: { mayoristaId } });

    // Map all products
    const productData: { codigo: string; descripcion: string; precio: number; mayoristaId: string }[] = [];
    let skipped = 0;

    for (const p of productos) {
      const mapped = mapProductData(p);
      if (mapped) {
        productData.push({ ...mapped, mayoristaId });
      } else {
        skipped++;
      }
    }

    // Load in large batches for speed
    const BATCH_SIZE = 500;
    for (let i = 0; i < productData.length; i += BATCH_SIZE) {
      const batch = productData.slice(i, i + BATCH_SIZE);
      await db.producto.createMany({ data: batch });
    }

    return NextResponse.json({
      message: `Se cargaron ${productData.length} productos correctamente`,
      total: productData.length,
      skipped,
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
