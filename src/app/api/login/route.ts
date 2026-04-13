import { NextRequest, NextResponse } from "next/server";

// Login SIN base de datos - evita crashear el servidor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        id: "usr_" + Date.now(),
        name: name.trim(),
        email: email.trim(),
      },
      token: "tok_" + Date.now(),
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
