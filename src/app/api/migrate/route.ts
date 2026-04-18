import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Endpoint de migración — solo el owner puede correrlo
// Llamar una sola vez: GET /api/migrate?secret=mayolista2026
const SECRET = "mayolista2026";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Cambiar cantidad de INT a FLOAT en PedidoItem
    await db.$executeRaw`ALTER TABLE "PedidoItem" ALTER COLUMN "cantidad" TYPE DOUBLE PRECISION`;
    results.push("✓ cantidad → DOUBLE PRECISION");
  } catch (e: any) {
    results.push(`- cantidad ya es FLOAT o error: ${e.message}`);
  }

  try {
    await db.$executeRaw`ALTER TABLE "PedidoItem" ALTER COLUMN "cantidadRegalo" TYPE DOUBLE PRECISION`;
    results.push("✓ cantidadRegalo → DOUBLE PRECISION");
  } catch (e: any) {
    results.push(`- cantidadRegalo ya es FLOAT o error: ${e.message}`);
  }

  return NextResponse.json({ ok: true, results });
}
