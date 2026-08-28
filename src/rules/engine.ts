import type { Alert, DB } from "../data/types";
import { fundRows, topHoldings } from "../data/services/funds";
import { daysAgoIso } from "../data/store";
import { moneyShort, pctPlain } from "../format";

const VOL_THRESHOLDS: Record<string, number> = {
  Bajo: 1.2,
  "Medio-Bajo": 2.6,
  Medio: 5,
  "Medio-Alto": 6.8,
  Alto: 9.5,
};

export const RULES = [
  {
    id: "R-FLOW",
    name: "Flujo neto de capitales",
    description:
      "Evalúa la relación entre suscripciones y rescates de los últimos 30 días respecto del patrimonio del fondo. Un flujo negativo elevado indica salida de capitales.",
  },
  {
    id: "R-VOL",
    name: "Volatilidad de cuotaparte",
    description:
      "Compara la volatilidad observada de los últimos 30 días contra un umbral según el perfil de riesgo del fondo.",
  },
  {
    id: "R-CONC",
    name: "Concentración de inversores",
    description:
      "Mide qué participación de un fondo concentra el mayor inversor. Participaciones elevadas generan dependencia de un único cliente.",
  },
  {
    id: "R-GROWTH",
    name: "Captación de capitales",
    description:
      "Detecta fondos con flujo neto positivo significativo en los últimos 30 días, señal de crecimiento sostenido.",
  },
];

export function runRules(db: DB): void {
  db.alerts.length = 0;
  const today = daysAgoIso(0);
  let n = 0;
  const push = (
    fundId: string,
    rule: (typeof RULES)[number],
    severity: Alert["severity"],
    title: string,
    description: string,
    metricValue: number,
    daysAgo = 0
  ) => {
    db.alerts.push({
      id: `AL-${String(++n).padStart(3, "0")}`,
      fundId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity,
      status: "Abierta",
      title,
      description,
      createdAt: daysAgoIso(daysAgo),
      metricValue,
    });
  };

  const FLOW_CRITICA = -8;
  const FLOW_IMPORTANTE = -5;
  const GROWTH_Umbral = 4.5;
  const CONC_IMPORTANTE = 18;
  const CONC_CRITICA = 30;

  for (const row of fundRows(db)) {
    const f = row.fund;

    if (row.flow.ratio <= FLOW_CRITICA) {
      push(
        f.id,
        RULES[0],
        "Critica",
        "Salida neta de capitales",
        `El fondo ${f.shortName} registró un flujo neto de ${moneyShort(row.flow.net)} en los últimos 30 días (${pctPlain(row.flow.ratio)} % del patrimonio). Requiere revisión urgente.`,
        row.flow.ratio,
        1
      );
    } else if (row.flow.ratio <= FLOW_IMPORTANTE) {
      push(
        f.id,
        RULES[0],
        "Importante",
        "Flujo neto negativo",
        `El fondo ${f.shortName} redujo su patrimonio por rescates netos de ${moneyShort(row.flow.net)} en 30 días (${pctPlain(row.flow.ratio)} %).`,
        row.flow.ratio,
        1
      );
    }

    if (row.vol30 > VOL_THRESHOLDS[f.riskProfile]) {
      push(
        f.id,
        RULES[1],
        "Importante",
        "Volatilidad elevada",
        `La volatilidad de la cuotaparte de ${f.shortName} alcanzó ${pctPlain(row.vol30 * 1, 1)} en 30 días, por encima del rango esperado para su perfil ${f.riskProfile.toLowerCase()}.`,
        row.vol30,
        0
      );
    }

    const top = topHoldings(db, f.id, 1)[0];
    if (top && top.pct >= CONC_CRITICA) {
      push(
        f.id,
        RULES[2],
        "Critica",
        "Concentración crítica",
        `${f.shortName} depende de un único inversor (${top.investorName}) por ${pctPlain(top.pct, 1)} del patrimonio.`,
        top.pct,
        0
      );
    } else if (top && top.pct >= CONC_IMPORTANTE) {
      push(
        f.id,
        RULES[2],
        "Importante",
        "Riesgo de concentración",
        `El mayor inversor de ${f.shortName} concentra el ${pctPlain(top.pct, 1)} del patrimonio del fondo.`,
        top.pct,
        0
      );
    }

    if (row.flow.ratio >= GROWTH_Umbral) {
      push(
        f.id,
        RULES[3],
        "Informativa",
        "Captación sólida de capitales",
        `${f.shortName} recibió suscripciones netas por ${moneyShort(row.flow.net)} en los últimos 30 días (${pctPlain(row.flow.ratio, 1)} %), señal de crecimiento.`,
        row.flow.ratio,
        1
      );
    }
  }
}