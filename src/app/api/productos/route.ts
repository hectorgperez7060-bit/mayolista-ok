import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// GET - Search products or load all for a mayorista
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

    if (query.length === 0) {
      // Load all products (no search) - up to 10000
      const productos = await db.producto.findMany({
        where: { mayoristaId },
        orderBy: { descripcion: "asc" },
        take: 10000,
      });
      return NextResponse.json(productos);
    }

    // Search with query - normalize and split into words
    const normalized = query
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const words = normalized
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    if (words.length === 0) {
      const productos = await db.producto.findMany({
        where: { mayoristaId },
        orderBy: { descripcion: "asc" },
        take: 500,
      });
      return NextResponse.json(productos);
    }

    // Build OR conditions: each word must match in codigo OR descripcion
    const conditions = [];
    for (const word of words) {
      conditions.push({
        OR: [
          { codigo: { contains: word } },
          { descripcion: { contains: word } },
        ],
      });
    }

    const productos = await db.producto.findMany({
      where: {
        mayoristaId,
        AND: conditions,
      },
      orderBy: { descripcion: "asc" },
      take: 500,
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
      // Insert in batches of 500 to avoid SQLite limits
      const BATCH = 500;
      for (let i = 0; i < productData.length; i += BATCH) {
        const batch = productData.slice(i, i + BATCH);
        await db.producto.createMany({ data: batch });
      }
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

// DELETE - Delete a single product (?id=xxx) or all for a mayorista (?mayoristaId=xxx)
export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productoId = searchParams.get("id");
    const mayoristaId = searchParams.get("mayoristaId");

    if (productoId) {
      // Delete single product - verify ownership through mayorista
      const producto = await db.producto.findFirst({
        where: { id: productoId },
        include: { mayorista: { select: { userId: true } } },
      });
      if (!producto || producto.mayorista.userId !== userId) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      }
      await db.producto.delete({ where: { id: productoId } });
      return NextResponse.json({ ok: true });
    }

    if (!mayoristaId) {
      return NextResponse.json({ error: "id o mayoristaId requerido" }, { status: 400 });
    }

    const mayorista = await db.mayorista.findFirst({
      where: { id: mayoristaId, userId },
    });
    if (!mayorista) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const result = await db.producto.deleteMany({ where: { mayoristaId } });

    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (error) {
    console.error("DELETE /api/productos error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH - Update a single product (?id=xxx)
export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productoId = searchParams.get("id");
    if (!productoId) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }

    const producto = await db.producto.findFirst({
      where: { id: productoId },
      include: { mayorista: { select: { userId: true } } },
    });
    if (!producto || producto.mayorista.userId !== userId) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const { codigo, descripcion, precio } = body;

    const updated = await db.producto.update({
      where: { id: productoId },
      data: {
        ...(codigo !== undefined && { codigo: String(codigo) }),
        ...(descripcion !== undefined && { descripcion: String(descripcion) }),
        ...(precio !== undefined && { precio: Number(precio) || 0 }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/productos error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
