// src/lib/session.ts - Portal do Criador OITONOVE
// Cookie httpOnly próprio do portal guardando o bearer emitido pelo CRM.

import { cookies } from "next/headers";

export const SESSION_COOKIE = "creator_session";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 dias (mesmo TTL do bearer no CRM)

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function clearSessionToken(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
