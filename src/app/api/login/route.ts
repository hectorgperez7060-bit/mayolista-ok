import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Login - crea o encuentra usuario en la DB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Buscar o crear usuario
    let user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
        },
      });
    } else {
      // Actualizar nombre si cambió
      await db.user.update({
        where: { id: user.id },
        data: { name: cleanName },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
