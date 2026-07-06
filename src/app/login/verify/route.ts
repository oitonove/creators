// /login/verify?token=... — destino do magic-link. Troca o token one-time
// por sessão bearer no CRM, grava cookie httpOnly próprio e vai pro dashboard.
import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/crm";
import { setSessionToken } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const session = token ? await verifyMagicToken(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login?erro=1", req.nextUrl.origin));
  }

  await setSessionToken(session);
  return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
}
