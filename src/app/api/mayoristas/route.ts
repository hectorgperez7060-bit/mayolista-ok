import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Listar mayoristas del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
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
