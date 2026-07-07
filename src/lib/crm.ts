// src/lib/crm.ts - Portal do Criador OITONOVE
// Cliente server-side da API do CRM (/api/creators/*). O portal NÃO tem
// banco próprio - todo dado vem do CRM, escopado pelo bearer do criador.

import { getSessionToken } from "./session";

const BASE = process.env.CRM_API_BASE_URL || "https://crm.oitonove.com.br";
// Mock nunca liga em produção, mesmo com a flag setada por engano.
const MOCK_ENABLED =
  process.env.CRM_USE_MOCK_AUTH === "true" && process.env.NODE_ENV !== "production";
const MOCK_EMAIL = process.env.MOCK_CREATOR_EMAIL || "teste@oitonove.com.br";
const MOCK_PASSWORD = process.env.MOCK_CREATOR_PASSWORD || "teste1234";
const MOCK_TOKEN = "mock-session-token";

type Json = Record<string, unknown>;

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

export type CreatorOnboarding = {
  name: string;
  email: string;
  phone: string | null;
  postalCode: string | null;
  address: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
};

const mockMe: Me = {
  name: "Criadora Teste",
  instagram: "@criadora.teste",
  couponCode: "CRIADORA10",
  commissionPct: 10,
  stage: "active",
  salesCount: 8,
  commissionAccruedCents: 23800,
  commissionPaidCents: 12000,
  commissionAvailableCents: 11800,
};

const mockSales: Sale[] = [
  { date: "2026-02-11T12:00:00.000Z", status: "confirmada", totalCents: 15900, commissionCents: 1590 },
  { date: "2026-03-03T12:00:00.000Z", status: "confirmada", totalCents: 24900, commissionCents: 2490 },
  { date: "2026-03-22T12:00:00.000Z", status: "pendente", totalCents: 9900, commissionCents: 990 },
  { date: "2026-04-09T12:00:00.000Z", status: "confirmada", totalCents: 18900, commissionCents: 1890 },
  { date: "2026-05-18T12:00:00.000Z", status: "confirmada", totalCents: 32900, commissionCents: 3290 },
  { date: "2026-06-02T12:00:00.000Z", status: "confirmada", totalCents: 27900, commissionCents: 2790 },
  { date: "2026-06-24T12:00:00.000Z", status: "pendente", totalCents: 13900, commissionCents: 1390 },
  { date: "2026-07-01T12:00:00.000Z", status: "confirmada", totalCents: 18600, commissionCents: 1860 },
];

const mockPayouts: Payout[] = [
  {
    amountCents: 12000,
    periodStart: "2026-02-01T00:00:00.000Z",
    periodEnd: "2026-04-30T23:59:59.000Z",
    status: "paid",
    paidAt: "2026-05-12T12:00:00.000Z",
  },
  {
    amountCents: 11800,
    periodStart: "2026-05-01T00:00:00.000Z",
    periodEnd: "2026-07-06T23:59:59.000Z",
    status: "pending",
    paidAt: null,
  },
];

const mockMaterials: Materials = {
  rules: [
    "Sempre divulgue o cupom e o link pessoal juntos.",
    "Não prometa desconto maior que 10% sem alinhamento com a OITONOVE.",
    "Marque @oitonoveoficial em conteúdos de campanha.",
  ],
  brand: {
    instagram: "https://instagram.com/oitonoveoficial",
    site: "https://www.oitonove.com.br",
    guidelines: "https://www.oitonove.com.br/criadores",
  },
  campaigns: [
    {
      title: "Campanha Inverno 2026",
      description: "Foco em looks de frio e rotina real. Janela de postagem até 31/07.",
    },
  ],
};

function isMockSessionToken(token: string | null): boolean {
  return token === MOCK_TOKEN;
}

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
async function authedFetch(path: string, init?: RequestInit): Promise<Json> {
  const token = await getSessionToken();
  if (!token) throw new CrmError("unauthorized", 401);
  if (MOCK_ENABLED && isMockSessionToken(token)) return {};
  return crmFetch(path, { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } });
}

export function getMockCredentials(): { email: string; password: string } | null {
  if (!MOCK_ENABLED) return null;
  return { email: MOCK_EMAIL, password: MOCK_PASSWORD };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Login por email+senha. Retorna o bearer da sessão ou null (credenciais inválidas). */
export async function loginWithPassword(email: string, password: string): Promise<string | null> {
  if (MOCK_ENABLED) {
    return email === MOCK_EMAIL && password === MOCK_PASSWORD ? MOCK_TOKEN : null;
  }
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
  if (MOCK_ENABLED) return;
  await crmFetch("/api/creators/auth/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Troca a senha do criador logado. Lança CrmError com a mensagem do CRM se falhar.
 * Retorna o bearer novo - o CRM bumpa a sessionVersion na troca (revoga sessões
 * antigas), então o cookie do portal precisa ser atualizado com esse token.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<string> {
  if (MOCK_ENABLED) {
    if (currentPassword !== MOCK_PASSWORD) {
      throw new CrmError("Senha atual inválida.", 400);
    }
    if (newPassword.length < 8) {
      throw new CrmError("A nova senha precisa ter pelo menos 8 caracteres.", 400);
    }
    throw new CrmError("Troca de senha não está disponível no modo local de teste.", 400);
  }
  const json = await authedFetch("/api/creators/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (typeof json.sessionToken !== "string") {
    throw new CrmError("server_misconfigured", 500);
  }
  return json.sessionToken;
}

// ── Dados do criador ──────────────────────────────────────────────────────────

export async function getMe(): Promise<Me> {
  if (MOCK_ENABLED) return mockMe;
  return (await authedFetch("/api/creators/me")).me as Me;
}

export async function getSales(): Promise<Sale[]> {
  if (MOCK_ENABLED) return mockSales;
  return (await authedFetch("/api/creators/sales")).sales as Sale[];
}

export async function getPayouts(): Promise<Payout[]> {
  if (MOCK_ENABLED) return mockPayouts;
  return (await authedFetch("/api/creators/payouts")).payouts as Payout[];
}

export async function getMaterials(): Promise<Materials> {
  if (MOCK_ENABLED) return mockMaterials;
  return (await authedFetch("/api/creators/materials")).materials as Materials;
}

// ── Onboarding público pós-aprovação ─────────────────────────────────────────

export async function getCreatorOnboarding(token: string): Promise<CreatorOnboarding | null> {
  try {
    const json = await crmFetch(`/api/creators/onboarding/${encodeURIComponent(token)}`);
    return json.creator as CreatorOnboarding;
  } catch (e) {
    if (e instanceof CrmError && e.status === 404) return null;
    throw e;
  }
}

export async function submitCreatorOnboarding(
  token: string,
  payload: {
    phone: string;
    postalCode: string;
    address: string;
    addressNumber: string;
    addressComplement?: string | null;
    district: string;
    city: string;
    state: string;
  }
): Promise<{ warning?: string | null }> {
  const json = await crmFetch(`/api/creators/onboarding/${encodeURIComponent(token)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { warning: typeof json.warning === "string" ? json.warning : null };
}
