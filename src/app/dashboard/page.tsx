// /dashboard — painel do criador: cupom, link pessoal, vendas, comissão,
// pagamentos, campanhas e regras. Todo dado vem do CRM, escopado ao bearer.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe, getSales, getPayouts, getMaterials, CrmError } from "@/lib/crm";

export const metadata = { title: "Meu painel — Portal do Criador OITONOVE" };

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200/60 bg-white p-4 shadow-[0_1px_3px_0_rgb(0,0,0,0.04)]">
      <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">{value}</div>
      {note && <div className="mt-0.5 text-[11px] text-neutral-400">{note}</div>}
    </div>
  );
}

export default async function DashboardPage() {
  let me, sales, payouts, materials;
  try {
    [me, sales, payouts, materials] = await Promise.all([
      getMe(),
      getSales(),
      getPayouts(),
      getMaterials(),
    ]);
  } catch (e) {
    if (e instanceof CrmError && e.status === 401) redirect("/logout");
    throw e;
  }

  const personalLink = me.couponCode
    ? `https://www.oitonove.com.br/?cupom=${me.couponCode}`
    : null;
  const confirmed = sales.filter((s) => s.status === "confirmada");
  const pending = sales.filter((s) => s.status === "pendente");

  return (
    <main>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.03em]">Olá, {me.name}</h1>
          <p className="text-[13px] text-neutral-500">{me.instagram}</p>
        </div>
        <Link href="/logout" className="text-[12px] text-neutral-400 underline hover:text-neutral-600">
          sair
        </Link>
      </div>

      {/* Cupom + link pessoal */}
      <div className="mb-8 rounded-2xl border border-neutral-200/60 bg-neutral-900 p-6 text-white">
        <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          Seu cupom pessoal · 10% pro seu público
        </div>
        <div className="mt-1 font-mono text-[28px] font-semibold tracking-wide">
          {me.couponCode ?? "—"}
        </div>
        {personalLink && (
          <div className="mt-3 text-[12px] text-neutral-300">
            Link pessoal:{" "}
            <a
              href={personalLink}
              target="_blank"
              rel="noopener"
              className="font-mono text-[12px] text-white underline decoration-neutral-500 underline-offset-2"
            >
              {personalLink}
            </a>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Vendas confirmadas" value={String(confirmed.length)} note={pending.length ? `${pending.length} pendente(s)` : undefined} />
        <Stat label={`Comissão (${me.commissionPct}%)`} value={brl(me.commissionAccruedCents)} />
        <Stat label="Já recebida" value={brl(me.commissionPaidCents)} />
        <Stat label="Disponível" value={brl(me.commissionAvailableCents)} />
      </div>

      {/* Vendas */}
      <section className="mb-10">
        <h2 className="mb-3 text-[14px] font-medium">Suas vendas</h2>
        <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-400">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Venda</th>
                <th className="px-4 py-3 text-right font-medium">Sua comissão</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                    Nenhuma venda ainda. Compartilhe seu cupom!
                  </td>
                </tr>
              )}
              {sales.map((s, i) => (
                <tr key={i} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3">{date(s.date)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        s.status === "confirmada"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{brl(s.totalCents)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {s.commissionCents ? brl(s.commissionCents) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagamentos */}
      <section className="mb-10">
        <h2 className="mb-3 text-[14px] font-medium">Pagamentos</h2>
        <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-400">
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-neutral-400">
                    Nenhum pagamento ainda.
                  </td>
                </tr>
              )}
              {payouts.map((p, i) => (
                <tr key={i} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3">
                    {date(p.periodStart)} – {date(p.periodEnd)}
                  </td>
                  <td className="px-4 py-3 text-right">{brl(p.amountCents)}</td>
                  <td className="px-4 py-3">
                    {p.status === "paid" ? `pago em ${p.paidAt ? date(p.paidAt) : ""}` : "pendente"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Campanhas + regras */}
      {materials.campaigns.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-[14px] font-medium">Campanhas disponíveis</h2>
          <div className="flex flex-col gap-2">
            {materials.campaigns.map((c, i) => (
              <div key={i} className="rounded-xl border border-neutral-200/60 bg-white p-4">
                <div className="text-[13px] font-medium">{c.title}</div>
                <div className="text-[12px] text-neutral-500">{c.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-[14px] font-medium">Regras da parceria</h2>
        <ul className="flex flex-col gap-2 rounded-xl border border-neutral-200/60 bg-white p-4">
          {materials.rules.map((r, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-neutral-600">
              <span className="text-neutral-300">·</span> {r}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-neutral-400">
          Materiais da marca:{" "}
          <a href={materials.brand.guidelines} className="underline">
            guia do criador
          </a>{" "}
          ·{" "}
          <a href={materials.brand.instagram} className="underline">
            @oitonoveoficial
          </a>
        </p>
      </section>
    </main>
  );
}
