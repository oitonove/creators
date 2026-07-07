// /dashboard - painel do criador: cupom, link pessoal, vendas, comissão,
// pagamentos, campanhas e regras. Todo dado vem do CRM, escopado ao bearer.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe, getSales, getPayouts, getMaterials, CrmError, type Sale } from "@/lib/crm";
import { clearSessionToken } from "@/lib/session";
import { CopyButton } from "@/components/CopyButton";
import { MonthlyBarChart } from "@/components/MonthlyBarChart";

export const metadata = { title: "Meu painel - Portal do Criador OITONOVE" };

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

/** Receita confirmada dos últimos 6 meses, um ponto por mês (mês atual incluso). */
function last6MonthsRevenue(sales: Sale[]) {
  const months: { key: string; label: string; valueCents: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      valueCents: 0,
    });
  }
  const byKey = new Map(months.map((m) => [m.key, m]));
  for (const s of sales) {
    if (s.status !== "confirmada") continue;
    const d = new Date(s.date);
    const bucket = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.valueCents += s.totalCents;
  }
  return months;
}

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ senha?: string }>;
}) {
  const sp = await searchParams;
  let me, sales, payouts, materials;
  try {
    [me, sales, payouts, materials] = await Promise.all([
      getMe(),
      getSales(),
      getPayouts(),
      getMaterials(),
    ]);
  } catch (e) {
    if (e instanceof CrmError && e.status === 401) {
      await clearSessionToken();
      redirect("/login");
    }
    throw e;
  }

  const personalLink = me.couponCode
    ? `https://www.oitonove.com.br/?cupom=${me.couponCode}`
    : null;
  const confirmed = sales.filter((s) => s.status === "confirmada");
  const pending = sales.filter((s) => s.status === "pendente");

  return (
    <main>
      {sp.senha === "1" && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
          Senha atualizada.
        </div>
      )}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.03em]">Olá, {me.name}</h1>
          <p className="text-[13px] text-neutral-500">{me.instagram}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/senha" className="text-[12px] text-neutral-400 underline hover:text-neutral-600">
            trocar senha
          </Link>
          <form action="/logout" method="POST">
            <button
              type="submit"
              className="cursor-pointer text-[12px] text-neutral-400 underline hover:text-neutral-600"
            >
              sair
            </button>
          </form>
        </div>
      </div>

      {/* Cupom + link pessoal */}
      <div className="mb-8 rounded-2xl border border-neutral-200/60 bg-neutral-900 p-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
              Seu cupom pessoal · 10% pro seu público
            </div>
            <div className="mt-1 font-mono text-[28px] font-semibold tracking-wide">
              {me.couponCode ?? "-"}
            </div>
          </div>
          {me.couponCode && <CopyButton text={me.couponCode} label="Copiar cupom" />}
        </div>
        {personalLink && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-neutral-300">
            <span>Link pessoal:</span>
            <a
              href={personalLink}
              target="_blank"
              rel="noopener"
              className="font-mono text-[12px] text-white underline decoration-neutral-500 underline-offset-2"
            >
              {personalLink}
            </a>
            <CopyButton text={personalLink} label="Copiar link" />
          </div>
        )}
        {me.couponCode && personalLink && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Usa meu cupom ${me.couponCode} e ganha 10% na OITONOVE: ${personalLink}`
              )}`}
              target="_blank"
              rel="noopener"
              className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-emerald-500"
            >
              Compartilhar no WhatsApp
            </a>
            <CopyButton
              text={`Usa meu cupom ${me.couponCode} e ganha 10% de desconto na OITONOVE 👉 ${personalLink}`}
              label="Copiar texto pra bio"
            />
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
      <p className="-mt-8 mb-10 text-[12px] leading-relaxed text-neutral-400">
        <strong className="text-neutral-500">Disponível</strong> é a comissão acumulada
        que ainda não foi paga. Pagamento é feito via Pix pelo time OITONOVE, sem prazo
        fixo - some do "disponível" e aparece em "Pagamentos" assim que for feito.
      </p>

      {/* Vendas por mês */}
      <section className="mb-10">
        <h2 className="mb-3 text-[14px] font-medium">Vendas confirmadas por mês</h2>
        <div className="rounded-xl border border-neutral-200/60 bg-white p-4">
          <MonthlyBarChart data={last6MonthsRevenue(sales)} />
        </div>
      </section>

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
                    {s.commissionCents ? brl(s.commissionCents) : "-"}
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
        <a
          href={materials.brand.guidelines}
          target="_blank"
          rel="noopener"
          className="mt-4 flex items-center justify-between rounded-xl border border-neutral-200/60 bg-white p-4 text-[13px] font-medium transition hover:border-neutral-300"
        >
          <span>📎 Guia do criador - fotos, tom de voz e regras de conteúdo</span>
          <span className="text-neutral-400">→</span>
        </a>
        <p className="mt-3 text-[12px] text-neutral-400">
          Instagram da marca:{" "}
          <a href={materials.brand.instagram} className="underline">
            @oitonoveoficial
          </a>
        </p>
      </section>
    </main>
  );
}
