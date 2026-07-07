import { NextRequest, NextResponse } from "next/server";

const CRM_API_BASE_URL = process.env.CRM_API_BASE_URL || "https://crm.oitonove.com.br";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    const res = await fetch(`${CRM_API_BASE_URL}/api/creators/onboarding/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network_error";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
