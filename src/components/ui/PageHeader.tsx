import type { ReactNode } from "react";

export default function PageHeader({
  kicker,
  title,
  subtitle,
  right,
}: {
  kicker?: string;
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {kicker && (
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-700">{kicker}</div>
        )}
        <h1 className="h1 mt-1">{title}</h1>
        {subtitle && <div className="muted mt-1.5">{subtitle}</div>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}