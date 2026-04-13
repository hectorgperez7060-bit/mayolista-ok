import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Simple login API - returns user data directly without NextAuth redirect
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
    }

    const githubId = email.split("@")[0] || "user_" + Date.now();

    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          githubId,
        },
      });
    }

    const token = uuidv4();

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
