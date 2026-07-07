"use client";

import { useState } from "react";

type Props = {
  token: string;
  initial: {
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
};

type Status = "idle" | "loading" | "done" | "error";

export function OnboardingForm({ token, initial }: Props) {
  const [form, setForm] = useState({
    phone: initial.phone ?? "",
    postalCode: initial.postalCode ?? "",
    address: initial.address ?? "",
    addressNumber: initial.addressNumber ?? "",
    addressComplement: initial.addressComplement ?? "",
    district: initial.district ?? "",
    city: initial.city ?? "",
    state: initial.state ?? "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const canSubmit =
    form.phone.trim() &&
    form.postalCode.trim() &&
    form.address.trim() &&
    form.addressNumber.trim() &&
    form.district.trim() &&
    form.city.trim() &&
    form.state.trim().length === 2;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || status === "loading") return;

    setStatus("loading");
    setError("");
    setWarning("");

    const res = await fetch(`/api/onboarding/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; warning?: string };

    if (!res.ok || json.ok === false) {
      setStatus("error");
      setError(
        json.error === "invalid_or_expired_token"
          ? "Esse link expirou ou já foi usado."
          : "Não conseguimos salvar seus dados agora. Tente novamente em alguns minutos."
      );
      return;
    }

    setStatus("done");
    if (json.warning) setWarning(json.warning);
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-[14px] text-emerald-900">
        <div className="font-semibold">Cadastro concluído.</div>
        <p className="mt-2 leading-relaxed">
          Seus dados foram recebidos. Se o acesso ao portal já estiver liberado, você receberá as instruções por email.
        </p>
        {warning ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
            {warning}
          </p>
        ) : null}
        <p className="mt-3 text-[13px] text-emerald-800">
          Depois disso, entre por <a href="/login" className="underline">/login</a>.
        </p>
      </div>
    );
  }

  const input =
    "rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-[13px] text-neutral-600">
        <div className="font-medium text-neutral-900">{initial.name}</div>
        <div>{initial.email}</div>
      </div>

      <input
        name="phone"
        required
        value={form.phone}
        onChange={(e) => set("phone", e.target.value)}
        placeholder="Telefone"
        className={input}
      />
      <div className="grid gap-3 md:grid-cols-[1fr_100px]">
        <input
          name="postalCode"
          required
          value={form.postalCode}
          onChange={(e) => set("postalCode", e.target.value)}
          placeholder="CEP"
          className={input}
        />
        <input
          name="state"
          required
          maxLength={2}
          value={form.state}
          onChange={(e) => set("state", e.target.value.toUpperCase())}
          placeholder="UF"
          className={`${input} uppercase`}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_120px]">
        <input
          name="address"
          required
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Endereço"
          className={input}
        />
        <input
          name="addressNumber"
          required
          value={form.addressNumber}
          onChange={(e) => set("addressNumber", e.target.value)}
          placeholder="Número"
          className={input}
        />
      </div>
      <input
        name="addressComplement"
        value={form.addressComplement}
        onChange={(e) => set("addressComplement", e.target.value)}
        placeholder="Complemento (opcional)"
        className={input}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="district"
          required
          value={form.district}
          onChange={(e) => set("district", e.target.value)}
          placeholder="Bairro"
          className={input}
        />
        <input
          name="city"
          required
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Cidade"
          className={input}
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit || status === "loading"}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Salvando..." : "Concluir cadastro"}
      </button>
    </form>
  );
}
