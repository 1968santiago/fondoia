import type { Alert, DB, DailyMetric, Fund, Holding, Transaction } from "../types";
import { daysAgoIso } from "../store";

function datesByFund(db: DB): Map<string, DailyMetric[]> {
  const map = new Map<string, DailyMetric[]>();
  for (const m of db.dailyMetrics) {
    const arr = map.get(m.fundId);
    if (arr) arr.push(m);
    else map.set(m.fundId, [m]);
  }
  return map;
}

const metricsCache = new WeakMap<DB, Map<string, DailyMetric[]>>();

function metricsOf(db: DB): Map<string, DailyMetric[]> {
  let m = metricsCache.get(db);
  if (!m) {
    m = datesByFund(db);
    metricsCache.set(db, m);
  }
  return m;
}

export function lastMetric(db: DB, fundId: string): DailyMetric {
  const arr = metricsOf(db).get(fundId) || [];
  return arr[arr.length - 1];
}

export const cpvOf = (db: DB, fundId: string): number => lastMetric(db, fundId).cuotaPartValue;

export function patrimonyOf(db: DB, fundId: string): number {
  return lastMetric(db, fundId).patrimonio;
}

export function retPct(db: DB, fundId: string, days: number): number {
  const arr = metricsOf(db).get(fundId) || [];
  if (arr.length < 2) return 0;
  const last = arr[arr.length - 1].cuotaPartValue;
  const idx = Math.max(0, arr.length - 1 - days);
  const prev = arr[idx].cuotaPartValue;
  return (last / prev - 1) * 100;
}

export function vol30(db: DB, fundId: string): number {
  const arr = metricsOf(db).get(fundId) || [];
  const n = Math.min(30, arr.length);
  if (n < 5) return 0;
  const returns: number[] = [];
  for (let i = arr.length - n; i < arr.length; i++) {
    if (arr[i].dailyReturn !== 0 || i === 0) returns.push(arr[i].dailyReturn);
  }
  const mean = returns.reduce((s, x) => s + x, 0) / returns.length;
  const variance = returns.reduce((s, x) => s + (x - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(n);
}

export interface FlowWindow {
  subs: number;
  res: number;
  net: number;
  ratio: number;
}

export function flowWindow(db: DB, fundId: string, days: number): FlowWindow {
  const from = daysAgoIso(days);
  let subs = 0;
  let res = 0;
  for (const tx of db.transactions) {
    if (tx.fundId !== fundId || tx.date < from) continue;
    if (tx.type === "Suscripción") subs += tx.amount;
    else res += tx.amount;
  }
  const patrim = patrimonyOf(db, fundId);
  return {
    subs,
    res,
    net: subs - res,
    ratio: patrim > 0 ? ((subs - res) / patrim) * 100 : 0,
  };
}

export interface FundRow {
  fund: Fund;
  patrimonio: number;
  cpv: number;
  investors: number;
  ret30: number;
  ret90: number;
  vol30: number;
  flow: FlowWindow;
  alerts: { Critica: number; Importante: number; Informativa: number };
}

export function fundRows(db: DB): FundRow[] {
  const rows: FundRow[] = db.funds.map((fund) => {
    const holdings = db.holdings.filter((h) => h.fundId === fund.id && h.cuotaPartes > 0);
    const count: FundRow["alerts"] = { Critica: 0, Importante: 0, Informativa: 0 };
    for (const a of db.alerts) {
      if (a.fundId !== fund.id || a.status === "Resuelta") continue;
      count[a.severity]++;
    }
    return {
      fund,
      patrimonio: patrimonyOf(db, fund.id),
      cpv: cpvOf(db, fund.id),
      investors: new Set(holdings.map((h) => h.investorId)).size,
      ret30: retPct(db, fund.id, 30),
      ret90: retPct(db, fund.id, 90),
      vol30: vol30(db, fund.id),
      flow: flowWindow(db, fund.id, 30),
      alerts: count,
    };
  });
  rows.sort((a, b) => b.patrimonio - a.patrimonio);
  return rows;
}

export interface MonthlyFlow {
  label: string;
  subs: number;
  res: number;
}

export function monthlyFlows(db: DB, fundId: string, months = 6): MonthlyFlow[] {
  const buckets = new Map<string, MonthlyFlow>();
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = months - 1; i >= 0; i--) {
    const cursor = new Date(d);
    cursor.setMonth(cursor.getMonth() - i);
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { label: key, subs: 0, res: 0 });
  }
  for (const tx of db.transactions) {
    if (tx.fundId !== fundId) continue;
    const key = tx.date.slice(0, 7);
    const b = buckets.get(key);
    if (!b) continue;
    if (tx.type === "Suscripción") b.subs += tx.amount;
    else b.res += tx.amount;
  }
  return [...buckets.values()];
}

export interface TopHolding {
  holding: Holding;
  investorName: string;
  investorType: string;
  value: number;
  pct: number;
}

export function topHoldings(db: DB, fundId: string, limit = 8): TopHolding[] {
  const cpv = cpvOf(db, fundId);
  const invById = new Map(db.investors.map((i) => [i.id, i]));
  const rows: TopHolding[] = db.holdings
    .filter((h) => h.fundId === fundId && h.cuotaPartes > 0)
    .map((h) => {
      const inv = invById.get(h.investorId);
      return {
        holding: h,
        investorName: inv ? inv.legalName : h.investorId,
        investorType: inv ? inv.type : "",
        value: h.cuotaPartes * cpv,
        pct: 0,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
  const total = patrimonyOf(db, fundId);
  rows.forEach((r) => {
    r.pct = total > 0 ? (r.value / total) * 100 : 0;
  });
  return rows;
}

export function fundTxRecent(db: DB, fundId: string, limit = 40): Transaction[] {
  return db.transactions
    .filter((t) => t.fundId === fundId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

export function alertsByFund(db: DB, fundId: string): Alert[] {
  return db.alerts
    .filter((a) => a.fundId === fundId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}