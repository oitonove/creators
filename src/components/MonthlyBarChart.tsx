type MonthlyPoint = { label: string; valueCents: number };

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function MonthlyBarChart({ data }: { data: MonthlyPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.valueCents));

  return (
    <div className="flex h-32 items-end gap-3">
      {data.map((d, i) => {
        const heightPct = Math.round((d.valueCents / max) * 100);
        return (
          <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
            <div className="pointer-events-none absolute -top-8 z-10 rounded-md bg-neutral-900 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
              {brl(d.valueCents)}
            </div>
            <div className="flex h-24 w-full items-end rounded-md bg-neutral-100">
              <div
                className="w-full rounded-t-[4px] bg-neutral-900 transition-[height]"
                style={{ height: `${d.valueCents > 0 ? Math.max(heightPct, 4) : 0}%` }}
              />
            </div>
            <span className="text-[11px] text-neutral-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
