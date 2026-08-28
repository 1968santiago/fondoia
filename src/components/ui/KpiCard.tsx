import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function TrendBadge({
  value,
  suffix = "%",
  goodWhenRising = true,
}: {
  value: number;
  suffix?: string;
  goodWhenRising?: boolean;
}) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
        <Minus size={12} /> 0{suffix}
      </span>
    );
  }
  const good = goodWhenRising ? value > 0 : value < 0;
  const Icon = value > 0 ? TrendingUp : TrendingDown;
  const cls = good
    ? "bg-positive-50 text-positive-700"
    : "bg-critical-50 text-critical-600";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={12} />
      {value > 0 ? "+" : "-"} {Math.abs(value).toLocaleString("es-AR", {
        maximumFractionDigits: 1,
      })}
      {suffix}
    </span>
  );
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  delta,
  deltaSuffix = "%",
  deltaGoodWhenRising = true,
  sub,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  tone?: "brand" | "positive" | "warm" | "critical" | "slate";
  delta?: number;
  deltaSuffix?: string;
  deltaGoodWhenRising?: boolean;
  sub?: ReactNode;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    positive: "bg-positive-50 text-positive-700",
    warm: "bg-warm-50 text-warm-700",
    critical: "bg-critical-50 text-critical-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-slate-500">{label}</div>
          <div className="mt-1.5 truncate text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {value}
          </div>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      {(delta !== undefined || sub) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {delta !== undefined && (
            <TrendBadge value={delta} suffix={deltaSuffix} goodWhenRising={deltaGoodWhenRising} />
          )}
          {sub && <span className="min-w-0 truncate">{sub}</span>}
        </div>
      )}
    </div>
  );
}