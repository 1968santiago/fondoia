import type { DB, Investor, Holding, Transaction } from "../types";
import { cpvOf, patrimonyOf } from "./funds";
import { daysAgoIso } from "../store";

export interface InvestorRow {
  investor: Investor;
  patrimonio: number;
  fundsCount: number;
  holdingsCount: number;
  aporteNeto: number;
  lastTx: Transaction | null;
}

export function investorRows(db: DB): InvestorRow[] {
  const invById = new Map(db.investors.map((i) => [i.id, i]));
  const lastTx = new Map<string, Transaction | null>();
  for (const tx of db.transactions) {
    lastTx.set(tx.investorId, tx);
  }
  const rows: InvestorRow[] = db.investors.map((investor) => {
    const holdings = db.holdings.filter(
      (h) => h.investorId === investor.id && h.cuotaPartes > 0
    );
    let patrimonio = 0;
    for (const h of holdings) patrimonio += h.cuotaPartes * cpvOf(db, h.fundId);
    const funds = new Set(holdings.map((h) => h.fundId));
    const aporte = holdings.reduce((s, h) => s + h.capital, 0);
    return {
      investor,
      patrimonio,
      fundsCount: funds.size,
      holdingsCount: holdings.length,
      aporteNeto: aporte,
      lastTx: lastTx.get(investor.id) || null,
    };
  });
  rows.sort((a, b) => b.patrimonio - a.patrimonio);
  return rows;
}

export interface InvestorHoldingView {
  holding: Holding;
  fundName: string;
  fundShort: string;
  category: string;
  riskProfile: string;
  cpv: number;
  value: number;
  pct: number;
}

export interface InvestorDetail {
  investor: Investor;
  total: number;
  aporteNeto: number;
  lastActivity: string | null;
  txCount: number;
  subsTotal: number;
  resTotal: number;
  holdings: InvestorHoldingView[];
  transactions: Transaction[];
}

export function investorDetail(db: DB, investorId: string): InvestorDetail | null {
  const investor = db.investors.find((i) => i.id === investorId);
  if (!investor) return null;

  const fundById = new Map(db.funds.map((f) => [f.id, f]));
  const holdings = db.holdings.filter(
    (h) => h.investorId === investorId && h.cuotaPartes > 0
  );

  let total = 0;
  const views: InvestorHoldingView[] = holdings
    .map((h) => {
      const f = fundById.get(h.fundId)!;
      const value = h.cuotaPartes * cpvOf(db, h.fundId);
      total += value;
      return {
        holding: h,
        fundName: f.name,
        fundShort: f.shortName,
        category: f.category,
        riskProfile: f.riskProfile,
        cpv: cpvOf(db, h.fundId),
        value,
        pct: 0,
      };
    })
    .sort((a, b) => b.value - a.value);
  views.forEach((v) => {
    v.pct = total > 0 ? (v.value / total) * 100 : 0;
  });

  const txs = db.transactions
    .filter((t) => t.investorId === investorId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  let subsTotal = 0;
  let resTotal = 0;
  for (const tx of txs) {
    if (tx.type === "Suscripción") subsTotal += tx.amount;
    else resTotal += tx.amount;
  }

  return {
    investor,
    total,
    aporteNeto: holdings.reduce((s, h) => s + h.capital, 0),
    lastActivity: txs.length ? txs[0].date : null,
    txCount: txs.length,
    subsTotal,
    resTotal,
    holdings: views,
    transactions: txs.slice(0, 30),
  };
}

export function investorTxRecent(db: DB, investorId: string, limit = 20): Transaction[] {
  return db.transactions
    .filter((t) => t.investorId === investorId && t.date >= daysAgoIso(400))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}