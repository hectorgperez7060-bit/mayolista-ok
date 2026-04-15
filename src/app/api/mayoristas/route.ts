import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper to get userId from header
function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// GET - Listar mayoristas del usuario
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const mayoristas = await db.mayorista.findMany({
      where: { userId },
      include: { _count: { select: { productos: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(mayoristas);
  } catch (error) {
    console.error("Error al listar mayoristas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear mayorista
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { nombre, rubro } = body;

    if (!nombre || !rubro) {
      return NextResponse.json({ error: "Nombre y rubro son obligatorios" }, { status: 400 });
    }

    // Desactivar mayoristas anteriores
    await db.mayorista.updateMany({
      where: { userId, activo: true },
      data: { activo: false },
    });

    const mayorista = await db.mayorista.create({
      data: {
        nombre,
        rubro,
        userId,
        activo: true,
      },
    });

    return NextResponse.json(mayorista, { status: 201 });
  } catch (error) {
    console.error("Error al crear mayorista:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Borrar mayorista (y todos sus pedidos/productos)
export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta el ID del comercio" }, { status: 400 });
    }

    // Verificar que el comercio pertenece al usuario
    const mayorista = await db.mayorista.findFirst({ where: { id, userId } });
    if (!mayorista) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 });
    }

    // Borrar pedidos asociados primero (foreign key)
    await db.pedido.deleteMany({ where: { mayoristaId: id } });

    // Borrar mayorista (cascadea productos automáticamente)
    await db.mayorista.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al borrar mayorista:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
