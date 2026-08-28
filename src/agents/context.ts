import type { DB } from "../data/types";
import {
  totalPatrimony,
  totalFlows30,
  weightedRet30,
  categoryComposition,
  evolutionOf,
} from "../data/services/kpis";
import {
  fundRows,
  topHoldings,
  flowWindow,
  retPct,
  vol30,
  patrimonyOf,
  lastMetric,
} from "../data/services/funds";
import { activeAlerts } from "../data/services/alerts";
import { investorDetail } from "../data/services/investors";
import { moneyShort, pctPlain, monthLabel } from "../format";
import { daysAgoIso } from "../data/store";

export interface ExecutiveContext {
  patrimonio: number;
  evo30: number;
  investors: number;
  funds: number;
  flows: { subs: number; res: number; net: number; ratio: number };
  weightedRet30: number;
  best: { name: string; ret30: number };
  worst: { name: string; ret30: number };
  categories: Array<{ category: string; value: number }>;
  alerts: Array<{ severity: string; fund: string; title: string }>;
}

export interface FundContext {
  name: string;
  short: string;
  category: string;
  risk: string;
  benchmark: string;
  fee: number;
  patrimonio: number;
  cpv: number;
  ret30: number;
  ret90: number;
  vol30: number;
  flow: { subs: number; res: number; net: number; ratio: number };
  investors: number;
  top: Array<{ name: string; pct: number }>;
  alerts: Array<{ severity: string; title: string }>;
}

export interface RiskContext {
  flowsNeg: Array<{ fund: string; ratio: number; net: number }>;
  flowsPos: Array<{ fund: string; ratio: number }>;
  conc: Array<{ fund: string; investor: string; pct: number }>;
  volAlta: Array<{ fund: string; vol: number; risk: string }>;
  alerts: Array<{ severity: string; fund: string; title: string }>;
}

export interface InvestorContext {
  name: string;
  type: string;
  profile: string;
  province: string;
  total: number;
  aporte: number;
  lastActivity: string | null;
  txCount: number;
  holdings: Array<{ fund: string; value: number; pct: number }>;
}

export function buildExecutiveContext(db: DB) {
  const patrim = totalPatrimony(db);
  const evo = evolutionOf(db, 30);
  const evo30 = evo.length >= 2 ? ((evo[evo.length - 1].value / evo[0].value) - 1) * 100 : 0;
  const flows = totalFlows30(db);
  const rows = fundRows(db);
  const sort30 = [...rows].sort((a, b) => b.ret30 - a.ret30);
  const best = sort30[0];
  const worst = sort30[sort30.length - 1];
  const ratio = patrim > 0 ? (flows.net / patrim) * 100 : 0;

  const ctx: ExecutiveContext = {
    patrimonio: patrim,
    evo30,
    investors: new Set(db.holdings.filter((h) => h.cuotaPartes > 0).map((h) => h.investorId)).size,
    funds: db.funds.length,
    flows: { subs: flows.subs, res: flows.res, net: flows.net, ratio },
    weightedRet30: weightedRet30(db),
    best: { name: best ? best.fund.shortName : "-", ret30: best ? best.ret30 : 0 },
    worst: { name: worst ? worst.fund.shortName : "-", ret30: worst ? worst.ret30 : 0 },
    categories: categoryComposition(db),
    alerts: activeAlerts(db).map((a) => ({
      severity: a.severity,
      fund: a.fundId || "",
      title: a.title,
    })),
  };

  const fundName = (id: string) => {
    const f = db.funds.find((x) => x.id === id);
    return f ? f.shortName : id;
  };

  const raw = [
    `Patrimonio total administrado: ${moneyShort(ctx.patrimonio)}.`,
    `Evolución del patrimonio últimos 30 días: ${pctPlain(ctx.evo30, 1)}.`,
    `Inversores activos: ${ctx.investors}. Fondos administrados: ${ctx.funds}.`,
    `Últimos 30 días — suscripciones: ${moneyShort(ctx.flows.subs)}, rescates: ${moneyShort(ctx.flows.res)}, flujo neto: ${moneyShort(ctx.flows.net)} (${pctPlain(ctx.flows.ratio, 1)} del patrimonio).`,
    `Rendimiento promedio ponderado 30 días: ${pctPlain(ctx.weightedRet30, 2)}.`,
    `Mejor fondo 30 días: ${ctx.best.name} (${pctPlain(ctx.best.ret30, 2)}). Peor fondo 30 días: ${ctx.worst.name} (${pctPlain(ctx.worst.ret30, 2)}).`,
    `Composición por categoría: ${ctx.categories.map((c) => `${c.category} ${moneyShort(c.value)}`).join("; ")}.`,
    `Alertas abiertas (${ctx.alerts.length}): ${ctx.alerts.map((a) => `${a.severity} - ${a.title} (${fundName(a.fund)})`).join(" | ")}.`,
  ].join("\n");

  return { ctx, raw };
}

export function buildFundContext(db: DB, fundId: string) {
  const fund = db.funds.find((f) => f.id === fundId);
  if (!fund) return null;
  const flow = flowWindow(db, fundId, 30);
  const top = topHoldings(db, fundId, 3);
  const alerts = activeAlerts(db).filter((a) => a.fundId === fundId);

  const ctx: FundContext = {
    name: fund.name,
    short: fund.shortName,
    category: fund.category,
    risk: fund.riskProfile,
    benchmark: fund.benchmark,
    fee: fund.feePct,
    patrimonio: patrimonyOf(db, fundId),
    cpv: lastMetric(db, fundId).cuotaPartValue,
    ret30: retPct(db, fundId, 30),
    ret90: retPct(db, fundId, 90),
    vol30: vol30(db, fundId),
    flow: { subs: flow.subs, res: flow.res, net: flow.net, ratio: flow.ratio },
    investors: new Set(
      db.holdings.filter((h) => h.fundId === fundId && h.cuotaPartes > 0).map((h) => h.investorId)
    ).size,
    top: top.map((t) => ({ name: t.investorName, pct: t.pct })),
    alerts: alerts.map((a) => ({ severity: a.severity, title: a.title })),
  };

  const raw = [
    `Fondo: ${ctx.name} (${ctx.short}).`,
    `Categoría: ${ctx.category}. Perfil de riesgo: ${ctx.risk}. Benchmark: ${ctx.benchmark}. Comisión de gestión: ${ctx.fee}% anual.`,
    `Patrimonio: ${moneyShort(ctx.patrimonio)}. Valor de cuotaparte: ${moneyShort(ctx.cpv)} (cotiza por cuotaparte).`,
    `Rendimiento: 30 días ${pctPlain(ctx.ret30, 2)}, 90 días ${pctPlain(ctx.ret90, 2)}. Volatilidad 30 días: ${pctPlain(ctx.vol30, 2)}.`,
    `Flujos 30 días: suscripciones ${moneyShort(ctx.flow.subs)}, rescates ${moneyShort(ctx.flow.res)}, neto ${moneyShort(ctx.flow.net)} (${pctPlain(ctx.flow.ratio, 2)} del patrimonio).`,
    `Inversores: ${ctx.investors}.`,
    `Principales inversores: ${ctx.top.map((t) => `${t.name} ${pctPlain(t.pct, 1)}`).join(", ")}.`,
    `Alertas del fondo (${ctx.alerts.length}): ${ctx.alerts.map((a) => `${a.severity}: ${a.title}`).join(" | ")}.`,
  ].join("\n");

  return { ctx, raw };
}

export function buildRiskContext(db: DB) {
  const rows = fundRows(db);
  const flowsNeg = rows
    .filter((r) => r.flow.net < 0)
    .map((r) => ({ fund: r.fund.shortName, ratio: r.flow.ratio, net: r.flow.net }))
    .sort((a, b) => a.ratio - b.ratio);
  const flowsPos = rows
    .filter((r) => r.flow.net > 0)
    .map((r) => ({ fund: r.fund.shortName, ratio: r.flow.ratio }))
    .sort((a, b) => b.ratio - a.ratio);
  const conc: RiskContext["conc"] = [];
  for (const r of rows) {
    const top = topHoldings(db, r.fund.id, 1)[0];
    if (top && top.pct >= 15) {
      conc.push({ fund: r.fund.shortName, investor: top.investorName, pct: top.pct });
    }
  }
  const volAlta = rows
    .filter((r) => r.vol30 > 8)
    .map((r) => ({ fund: r.fund.shortName, vol: r.vol30, risk: r.fund.riskProfile }));
  const alerts = activeAlerts(db).map((a) => ({
    severity: a.severity,
    fund: (db.funds.find((f) => f.id === a.fundId)?.shortName || ""),
    title: a.title,
  }));

  const ctx: RiskContext = { flowsNeg, flowsPos, conc, volAlta, alerts };

  const raw = [
    `Flujo neto 30 días negativo: ${ctx.flowsNeg.length} fondo(s) — ${ctx.flowsNeg
      .map((f) => `${f.fund} ${pctPlain(f.ratio, 2)} (${moneyShort(f.net)})`)
      .join("; ")}.`,
    `Flujo neto 30 días positivo: ${ctx.flowsPos.length} fondo(s) — ${ctx.flowsPos
      .map((f) => `${f.fund} +${pctPlain(f.ratio, 2)}`)
      .join("; ") || "ninguno"}.`,
    `Concentración de inversores >= 15%: ${ctx.conc.length} caso(s) — ${ctx.conc
      .map((c) => `${c.fund}: ${c.investor} ${pctPlain(c.pct, 1)}`)
      .join("; ") || "ninguna"}.`,
    `Volatilidad 30 días elevada (mayor a 8%): ${ctx.volAlta
      .map((v) => `${v.fund} ${pctPlain(v.vol, 2)}`)
      .join(", ") || "ninguna"}.`,
    `Alertas abiertas (${ctx.alerts.length}): ${ctx.alerts
      .map((a) => `${a.severity} - ${a.title} (${a.fund})`)
      .join(" | ")}.`,
  ].join("\n");

  return { ctx, raw };
}

export function buildInvestorContext(db: DB, investorId: string) {
  const detail = investorDetail(db, investorId);
  if (!detail) return null;
  const ctx: InvestorContext = {
    name: detail.investor.legalName,
    type: detail.investor.type,
    profile: detail.investor.profile,
    province: detail.investor.province,
    total: detail.total,
    aporte: detail.aporteNeto,
    lastActivity: detail.lastActivity,
    txCount: detail.txCount,
    holdings: detail.holdings.map((h) => ({ fund: h.fundName, value: h.value, pct: h.pct })),
  };

  const raw = [
    `Inversor: ${ctx.name} (${ctx.type}). Perfil: ${ctx.profile}. Provincia: ${ctx.province}.`,
    `Patrimonio total del inversor: ${moneyShort(ctx.total)}. Capital aportado neto: ${moneyShort(ctx.aporte)}.`,
    `Posiciones: ${ctx.holdings
      .map((h) => `${h.fund} ${moneyShort(h.value)} (${pctPlain(h.pct, 1)})`)
      .join(", ")}.`,
    `Operaciones totales: ${ctx.txCount}. Última actividad: ${ctx.lastActivity ? monthLabel(ctx.lastActivity) : "sin movimientos"}.`,
  ].join("\n");

  return { ctx, raw };
}

export function buildFundRiskContext(db: DB, fundId: string) {
  const fund = db.funds.find((f) => f.id === fundId);
  if (!fund) return buildRiskContext(db);
  const flow = flowWindow(db, fundId, 30);
  const top = topHoldings(db, fundId, 1)[0];
  const alerts = activeAlerts(db).filter((a) => a.fundId === fundId);
  const vol = vol30(db, fundId);

  const ctx: RiskContext = {
    flowsNeg: flow.net < 0 ? [{ fund: fund.shortName, ratio: flow.ratio, net: flow.net }] : [],
    flowsPos: flow.net > 0 ? [{ fund: fund.shortName, ratio: flow.ratio }] : [],
    conc:
      top && top.pct >= 8
        ? [{ fund: fund.shortName, investor: top.investorName, pct: top.pct }]
        : [],
    volAlta: vol > 8 ? [{ fund: fund.shortName, vol, risk: fund.riskProfile }] : [],
    alerts: alerts.map((a) => ({ severity: a.severity, fund: fund.shortName, title: a.title })),
  };

  const raw = [
    `Flujo neto 30 días: ${moneyShort(flow.net)} (${pctPlain(flow.ratio, 2)} del patrimonio).`,
    `Mayor inversor: ${top ? `${top.investorName} ${pctPlain(top.pct, 1)}` : "-"}.`,
    `Volatilidad 30 días: ${pctPlain(vol, 2)} (perfil ${fund.riskProfile}).`,
    `Alertas del fondo (${ctx.alerts.length}): ${ctx.alerts
      .map((a) => `${a.severity} - ${a.title}`)
      .join(" | ") || "ninguna"}.`,
  ].join("\n");

  return { ctx, raw };
}

export const contextFor = (
  db: DB,
  agentId: string,
  entity?: { fundId?: string; investorId?: string }
):
  | { ctx: unknown; raw: string }
  | null =>
  agentId === "fund-analyst"
    ? entity?.fundId
      ? buildFundContext(db, entity.fundId)
      : null
    : agentId === "risk-monitor"
      ? entity?.investorId
        ? buildInvestorContext(db, entity.investorId)
        : entity?.fundId
          ? buildFundRiskContext(db, entity.fundId)
          : buildRiskContext(db)
      : buildExecutiveContext(db);