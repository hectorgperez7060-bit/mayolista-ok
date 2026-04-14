import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper to get userId from header
function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// Smart column mapping - tries to find the right column regardless of naming
function mapProductData(raw: any): { codigo: string; descripcion: string; precio: number } | null {
  const keys = Object.keys(raw);
  if (keys.length === 0) return null;

  // Normalize all keys to lowercase for matching
  const normalizedKeys: Record<string, string> = {};
  for (const k of keys) {
    normalizedKeys[k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] = k;
  }

  // Try to find codigo column
  const codigoPatterns = ["codigo", "cod", "code", "codigo_barras", "cod_barras", "codigobarra", "cb", "sku", "id", "codigo_producto", "cod_producto"];
  let codigoKey: string | null = null;
  for (const pattern of codigoPatterns) {
    for (const [norm, original] of Object.entries(normalizedKeys)) {
      if (norm.includes(pattern)) {
        codigoKey = original;
        break;
      }
    }
    if (codigoKey) break;
  }

  // Try to find descripcion column
  const descPatterns = ["descripcion", "descrip", "desc", "descripcion_producto", "nombre", "producto", "detail", "detalle", "articulo", "denominacion", "nombre_producto", "productodesc"];
  let descKey: string | null = null;
  for (const pattern of descPatterns) {
    for (const [norm, original] of Object.entries(normalizedKeys)) {
      if (norm.includes(pattern)) {
        descKey = original;
        break;
      }
    }
    if (descKey) break;
  }

  // Try to find precio column
  const precioPatterns = ["precio", "price", "pr unit", "pr unitario", "precio_lista", "preciounitario", "punit", "precio_unitario", "valor", "costo", "importe", "pvp", "pr"];
  let precioKey: string | null = null;
  for (const pattern of precioPatterns) {
    for (const [norm, original] of Object.entries(normalizedKeys)) {
      if (norm.includes(pattern)) {
        precioKey = original;
        break;
      }
    }
    if (precioKey) break;
  }

  // If no columns found, try positional (first = codigo, second = descripcion, third = precio)
  if (!codigoKey && !descKey && !precioKey) {
    if (keys.length >= 2) {
      codigoKey = keys[0];
      descKey = keys[1];
      precioKey = keys.length >= 3 ? keys[2] : null;
    } else if (keys.length === 1) {
      descKey = keys[0];
    }
  }

  // If only codigo and desc found, look for numeric column as precio
  if (codigoKey && descKey && !precioKey) {
    for (const k of keys) {
      if (k !== codigoKey && k !== descKey) {
        const val = raw[k];
        if (typeof val === "number" || (typeof val === "string" && /^\d/.test(val.replace(",", ".")))) {
          precioKey = k;
          break;
        }
      }
    }
  }

  // If only desc found, look for numeric column as precio
  if (!codigoKey && descKey && !precioKey) {
    for (const k of keys) {
      if (k !== descKey) {
        const val = raw[k];
        if (typeof val === "number" || (typeof val === "string" && /^\d/.test(val.replace(",", ".")))) {
          if (!precioKey) {
            precioKey = k;
          } else if (!codigoKey) {
            codigoKey = k;
            break;
          }
        }
      }
    }
  }

  const codigo = codigoKey ? String(raw[codigoKey] || "").trim() : "";
  const descripcion = descKey ? String(raw[descKey] || "").trim() : "";
  let precio = 0;
  if (precioKey) {
    const rawPrecio = raw[precioKey];
    if (typeof rawPrecio === "number") {
      precio = rawPrecio;
    } else {
      precio = parseFloat(String(rawPrecio).replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0;
    }
  }

  // Skip empty rows
  if (!descripcion && !codigo) return null;

  return { codigo, descripcion: descripcion || codigo, precio };
}

// GET - Obtener productos del mayorista
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mayoristaId = searchParams.get("mayoristaId");
    const query = searchParams.get("q") || "";

    if (!mayoristaId) {
      return NextResponse.json({ error: "mayoristaId es obligatorio" }, { status: 400 });
    }

    // Verificar que el mayorista pertenece al usuario
    const mayorista = await db.mayorista.findFirst({
      where: { id: mayoristaId, userId },
    });

    if (!mayorista) {
      return NextResponse.json({ error: "Mayorista no encontrado" }, { status: 404 });
    }

    const where: any = { mayoristaId };

    if (query) {
      // Split query into words and search for each
      const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

      if (words.length > 0) {
        where.OR = [];
        for (const word of words) {
          where.OR.push(
            { codigo: { contains: word, mode: "insensitive" } },
            { descripcion: { contains: word, mode: "insensitive" } }
          );
        }
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

// POST - Cargar productos (lista completa, reemplaza anterior)
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

    // Verificar que el mayorista pertenece al usuario
    const mayorista = await db.mayorista.findFirst({
      where: { id: mayoristaId, userId },
    });

    if (!mayorista) {
      return NextResponse.json({ error: "Mayorista no encontrado" }, { status: 404 });
    }

    // Borrar productos anteriores de este mayorista
    await db.producto.deleteMany({
      where: { mayoristaId },
    });

    // Mapear productos con detección inteligente de columnas
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

    // Cargar en lotes de 100
    const BATCH_SIZE = 100;
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
