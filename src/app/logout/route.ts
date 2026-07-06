// /logout — limpa o cookie de sessão e volta pro login.
// POST-only: GET tem efeito colateral (derruba sessão) e é alvo de
// prefetch/crawler/CSRF via link — evitado de propósito.
import { NextRequest, NextResponse } from "next/server";
import { clearSessionToken } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await clearSessionToken();
  return NextResponse.redirect(new URL("/login", req.nextUrl.origin), { status: 303 });
}
