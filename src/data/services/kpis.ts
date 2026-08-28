import type { DB } from "../types";
import { patrimonyOf, retPct, flowWindow } from "./funds";

export interface EvolutionPoint {
  date: string;
  value: number;
}

export function evolutionOf(db: DB, days = 365): EvolutionPoint[] {
  const byDate = new Map<string, number>();
  for (const m of db.dailyMetrics) {
    const cut = new Date(m.date);
    cut.setHours(12, 0, 0, 0);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - cut.getTime()) / 86400000);
    if (diffDays < 0 || diffDays >= days) continue;
    byDate.set(m.date, (byDate.get(m.date) || 0) + m.patrimonio);
  }
  return [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function totalPatrimony(db: DB): number {
  return db.funds.reduce((s, f) => s + patrimonyOf(db, f.id), 0);
}

export function totalInvestors(db: DB): number {
  return new Set(db.holdings.filter((h) => h.cuotaPartes > 0).map((h) => h.investorId)).size;
}

export function totalFlows30(db: DB): { subs: number; res: number; net: number } {
  let subs = 0;
  let res = 0;
  for (const f of db.funds) {
    const w = flowWindow(db, f.id, 30);
    subs += w.subs;
    res += w.res;
  }
  return { subs, res, net: subs - res };
}

export function weightedRet30(db: DB): number {
  const total = totalPatrimony(db);
  if (total <= 0) return 0;
  let acc = 0;
  for (const f of db.funds) {
    acc += (retPct(db, f.id, 30) * patrimonyOf(db, f.id)) / 100;
  }
  return (acc / total) * 100;
}

export function categoryComposition(db: DB): Array<{ category: string; value: number }> {
  const map = new Map<string, number>();
  for (const f of db.funds) {
    const v = patrimonyOf(db, f.id);
    map.set(f.category, (map.get(f.category) || 0) + v);
  }
  return [...map.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

export function patrimonioFlowRatio(db: DB): number {
  const f = totalFlows30(db);
  const p = totalPatrimony(db);
  return p > 0 ? (f.net / p) * 100 : 0;
}