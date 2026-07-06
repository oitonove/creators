// src/lib/crm.ts — Portal do Criador OITONOVE
// Cliente server-side da API do CRM (/api/creators/*). O portal NÃO tem
// banco próprio — todo dado vem do CRM, escopado pelo bearer do criador.

import { getSessionToken } from "./session";

const BASE = process.env.CRM_API_BASE_URL || "https://crm.oitonove.com.br";

type Json = Record<string, unknown>;

async function crmFetch(path: string, init?: RequestInit): Promise<Json> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Json;
  if (!res.ok) {
    throw new CrmError(String(json.error ?? `HTTP ${res.status}`), res.status);
  }
  return json;
}

export class CrmError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

/** Fetch autenticado com o bearer do cookie. Lança CrmError(401) sem sessão. */
async function authedFetch(path: string): Promise<Json> {
  const token = await getSessionToken();
  if (!token) throw new CrmError("unauthorized", 401);
  return crmFetch(path, { headers: { Authorization: `Bearer ${token}` } });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Login por email+senha. Retorna o bearer da sessão ou null (credenciais inválidas). */
export async function loginWithPassword(email: string, password: string): Promise<string | null> {
  try {
    const json = await crmFetch("/api/creators/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return typeof json.sessionToken === "string" ? json.sessionToken : null;
  } catch {
    return null;
  }
}

/** Pede reset de senha (nova senha é gerada e enviada por email). */
export async function requestPasswordReset(email: string): Promise<void> {
  await crmFetch("/api/creators/auth/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ── Dados do criador ──────────────────────────────────────────────────────────

export type Me = {
  name: string;
  instagram: string;
  couponCode: string | null;
  commissionPct: number;
  stage: string;
  salesCount: number;
  commissionAccruedCents: number;
  commissionPaidCents: number;
  commissionAvailableCents: number;
};

export type Sale = {
  date: string;
  status: "confirmada" | "pendente";
  totalCents: number;
  commissionCents: number;
};

export type Payout = {
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  paidAt: string | null;
};

export type Materials = {
  rules: string[];
  brand: { instagram: string; site: string; guidelines: string };
  campaigns: Array<{ title: string; description: string; until?: string }>;
};

export async function getMe(): Promise<Me> {
  return (await authedFetch("/api/creators/me")).me as Me;
}

export async function getSales(): Promise<Sale[]> {
  return (await authedFetch("/api/creators/sales")).sales as Sale[];
}

export async function getPayouts(): Promise<Payout[]> {
  return (await authedFetch("/api/creators/payouts")).payouts as Payout[];
}

export async function getMaterials(): Promise<Materials> {
  return (await authedFetch("/api/creators/materials")).materials as Materials;
}
