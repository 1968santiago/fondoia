import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface PerfItem {
  id: string;
  name: string;
  sub?: string;
  ret30: number;
  value?: number;
}

export default function PerfBars({ items }: { items: PerfItem[] }) {
  const maxAbs = Math.max(...items.map((i) => Math.abs(i.ret30)), 1);
  return (
    <ul className="space-y-3.5">
      {items.map((it) => {
        const positive = it.ret30 >= 0;
        const width = Math.max(4, (Math.abs(it.ret30) / maxAbs) * 100);
        return (
          <li key={it.id}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 truncate font-medium text-ink">{it.name}</span>
              <span
                className={`inline-flex shrink-0 items-center gap-0.5 font-semibold ${
                  positive ? "text-positive-600" : "text-critical-500"
                }`}
              >
                {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {it.ret30.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                <span className="text-xs text-slate-400">%</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  positive ? "bg-positive-500" : "bg-critical-400/70"
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
            {it.sub && <div className="mt-0.5 text-[11px] text-slate-400">{it.sub}</div>}
          </li>
        );
      })}
    </ul>
  );
}