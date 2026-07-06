// /logout — limpa o cookie de sessão e volta pro login.
import { NextRequest, NextResponse } from "next/server";
import { clearSessionToken } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await clearSessionToken();
  return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
}
