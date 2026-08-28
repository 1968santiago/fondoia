import type { ExecutiveContext, FundContext, RiskContext, InvestorContext } from "../context";
import { moneyShort, pctPlain } from "../../format";

function bullets(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

function sign(n: number): string {
  return n > 0 ? "+" : "";
}

function executive(ctx: ExecutiveContext, question: string): string {
  const trend = ctx.evo30 >= 0 ? "creció" : "se contrajo";
  const negativos = ctx.alerts.filter((a) => a.severity !== "Informativa");
  const intro = question
    ? `En relación a "${question}", esto es lo que indica la información disponible:`
    : "Este es el panorama actual del negocio, según los indicadores agregados:";

  return [
    intro,
    "",
    bullets([
      `El negocio administra ${moneyShort(ctx.patrimonio)} en ${ctx.funds} fondos, con ${ctx.investors} inversores activos.`,
      `En los últimos 30 días el patrimonio ${trend} ${pctPlain(Math.abs(ctx.evo30), 1)} y el rendimiento promedio ponderado fue ${sign(ctx.weightedRet30)}${pctPlain(ctx.weightedRet30, 2)}.`,
      `El flujo neto de 30 días fue ${moneyShort(ctx.flows.net)} (suscripciones ${moneyShort(ctx.flows.subs)} contra rescates ${moneyShort(ctx.flows.res)}).`,
      `El fondo con mejor desempeño reciente es ${ctx.best.name} (${sign(ctx.best.ret30)}${pctPlain(ctx.best.ret30, 2)} en 30 días) y el más rezagado, ${ctx.worst.name} (${pctPlain(ctx.worst.ret30, 2)}).`,
      ctx.alerts.length
        ? `Hay ${ctx.alerts.length} alerta(s) activa(s); la/s más relevante/s: ${negativos
            .slice(0, 2)
            .map((a) => `${a.title} (${a.severity})`)
            .join(", ")}.`
        : "No hay alertas activas que requieran atención inmediata.",
    ]),
    "",
    `En síntesis: el negocio muestra ${ctx.flows.net >= 0 ? "una base sólida de captación" : "una relación de flujos a vigilar"}, con foco en ${ctx.best.name} como principal motor de rendimiento.`,
  ].join("\n");
}

function fund(ctx: FundContext, question: string): string {
  const tends = ctx.ret30 >= 0 ? "positiva" : "negativa";
  return [
    question ? `En relación a "${question}", el análisis del fondo ${ctx.name} indica:` : `Análisis del fondo ${ctx.name}:`,
    "",
    bullets([
      `Administra ${moneyShort(ctx.patrimonio)} con un valor de cuotaparte de ${moneyShort(ctx.cpv)} (perfil ${ctx.risk}, benchmark ${ctx.benchmark}).`,
      `Rendimiento de ${sign(ctx.ret30)}${pctPlain(ctx.ret30, 2)} a 30 días y ${sign(ctx.ret90)}${pctPlain(ctx.ret90, 2)} a 90 días, con volatilidad de ${pctPlain(ctx.vol30, 2)}.`,
      `El flujo neto de 30 días fue ${moneyShort(ctx.flow.net)} (${pctPlain(ctx.flow.ratio, 2)} del patrimonio): ${ctx.flow.net >= 0 ? "entradas superan a las salidas" : "las salidas superan a las entradas"}.`,
      `Tiene ${ctx.investors} inversores activos; el principal concentra ${ctx.top.length ? pctPlain(ctx.top[0].pct, 1) : "-"}: ${ctx.top.length ? ctx.top[0].name : "-"}.`,
      ctx.alerts.length
        ? `Alertas del fondo: ${ctx.alerts.map((a) => `${a.severity}: ${a.title}`).join(", ")}.`
        : "Sin alertas abiertas para este fondo.",
    ]),
    "",
    `Conclusión: la evolución reciente es ${tends} y el flujo ${ctx.flow.net >= 0 ? "acompaña con captación de capitales" : "amerita seguimiento en las próximas semanas"}.`,
  ].join("\n");
}

function risk(ctx: RiskContext, question: string): string {
  return [
    question ? `En relación a "${question}", el panorama de riesgos es el siguiente:` : "Panorama de situaciones que requieren atención:",
    "",
    bullets([
      ctx.flowsNeg.length
        ? `Flujo neto negativo: ${ctx.flowsNeg.map((f) => `${f.fund} ${pctPlain(f.ratio, 2)} (${moneyShort(f.net)})`).join(", ")}.`
        : "Sin fondos con flujo neto negativo relevante a 30 días.",
      ctx.conc.length
        ? `Concentración de inversores: ${ctx.conc.map((c) => `${c.fund} con ${c.investor} al ${pctPlain(c.pct, 1)}`).join("; ")}.`
        : "Sin concentraciones de inversores por encima del umbral.",
      ctx.volAlta.length
        ? `Volatilidad elevada en: ${ctx.volAlta.map((v) => `${v.fund} (${pctPlain(v.vol, 2)})`).join(", ")}.`
        : "Niveles de volatilidad dentro de lo esperado.",
      `Alertas abiertas: ${ctx.alerts.length} (${ctx.alerts.map((a) => `${a.severity}: ${a.title}`).join(" | ") || "ninguna"}).`,
    ]),
    "",
    `Acción sugerida: priorizar la revisión de ${ctx.flowsNeg[0]?.fund || "los fondos con mayor salida de capitales"} y monitorear la concentración del principal inversor.`,
  ].join("\n");
}

function investor(ctx: InvestorContext): string {
  return [
    `Perfil del inversor ${ctx.name} (${ctx.type}, perfil ${ctx.profile}, ${ctx.province}):`,
    "",
    bullets([
      `Patrimonio total en cartera: ${moneyShort(ctx.total)}. Capital aportado neto: ${moneyShort(ctx.aporte)}.`,
      ctx.holdings.length
        ? `Principales posiciones: ${ctx.holdings.map((h) => `${h.fund} ${pctPlain(h.pct, 1)}`).join(", ")}.`
        : "Sin posiciones activas actualmente.",
      `Operaciones registradas: ${ctx.txCount}.`,
    ]),
    "",
    `Observación: la cartera ${ctx.holdings.length > 1 ? "está bien diversificada entre fondos" : "se concentra en pocos fondos"}; verificar que el perfil de riesgo declarado sea coherente con la exposición.`,
  ].join("\n");
}

export function fallbackReply(agentId: string, question: string, ctx: unknown): string {
  if (agentId === "fund-analyst" && ctx && typeof (ctx as FundContext).name === "string") {
    return fund(ctx as FundContext, question);
  }
  if (agentId === "risk-monitor") {
    const r = ctx as RiskContext;
    if (r && Array.isArray(r.alerts) && !Array.isArray((ctx as InvestorContext).holdings)) {
      return risk(r, question);
    }
    if (ctx && Array.isArray((ctx as InvestorContext).holdings)) {
      return investor(ctx as InvestorContext);
    }
    return risk({ flowsNeg: [], flowsPos: [], conc: [], volAlta: [], alerts: [] }, question);
  }
  return executive(ctx as ExecutiveContext, question);
}