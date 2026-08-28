import type { ReactNode } from "react";

const TONES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  positive: "bg-positive-50 text-positive-700 ring-positive-100",
  warm: "bg-warm-50 text-warm-700 ring-warm-100",
  critical: "bg-critical-50 text-critical-600 ring-critical-100",
};

export default function Chip({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return <span className={`chip ${TONES[tone]}`}>{children}</span>;
}