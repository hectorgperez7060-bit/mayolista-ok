import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Obtener productos del mayorista
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
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
      where.OR = [
        { codigo: { contains: query, mode: "insensitive" } },
        { descripcion: { contains: query, mode: "insensitive" } },
      ];
    }

    const productos = await db.producto.findMany({
      where,
      orderBy: { descripcion: "asc" },
      take: 50,
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
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

    // Cargar nuevos productos
    const productData = productos.map((p: any) => ({
      codigo: String(p.codigo || ""),
      descripcion: String(p.descripcion || p.descripción || ""),
      precio: parseFloat(p.precio) || 0,
      mayoristaId,
    }));

    // Cargar en lotes de 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < productData.length; i += BATCH_SIZE) {
      const batch = productData.slice(i, i + BATCH_SIZE);
      await db.producto.createMany({ data: batch });
    }

    return NextResponse.json({
      message: `Se cargaron ${productData.length} productos correctamente`,
      total: productData.length,
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
