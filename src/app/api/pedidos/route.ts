import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Listar pedidos del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const pedidos = await db.pedido.findMany({
      where: { userId },
      include: {
        cliente: true,
        mayorista: true,
        items: { include: { producto: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al listar pedidos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear pedido
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { clienteId, mayoristaId, items, observaciones, descuentoPct } = body;

    if (!mayoristaId || !items || items.length === 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Generar número de pedido
    const count = await db.pedido.count({ where: { userId } });
    const numero = `PED-${String(count + 1).padStart(4, "0")}`;

    // Calcular total
    let total = 0;
    for (const item of items) {
      const itemTotal = (item.cantidad + item.cantidadRegalo) * item.precioUnitario;
      const itemDiscount = itemTotal * (item.descuentoPct / 100);
      total += itemTotal - itemDiscount;
    }
    total = total * (1 - (descuentoPct || 0) / 100);

    const pedido = await db.pedido.create({
      data: {
        numero,
        observaciones: observaciones || null,
        estado: "confirmado",
        descuentoPct: descuentoPct || 0,
        total,
        userId,
        clienteId: clienteId || null,
        mayoristaId,
        items: {
          create: items.map((item: any) => ({
            cantidad: item.cantidad,
            cantidadRegalo: item.cantidadRegalo || 0,
            precioUnitario: item.precioUnitario,
            descuentoPct: item.descuentoPct || 0,
            productoId: item.productoId,
          })),
        },
      },
      include: {
        cliente: true,
        mayorista: true,
        items: { include: { producto: true } },
      },
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
