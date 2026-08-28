export type AgentId = "executive-analyst" | "fund-analyst" | "risk-monitor";

export interface AgentDef {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  primarySkill: string;
  secondarySkill: string;
  systemPrompt: string;
}

export const AGENTS: AgentDef[] = [
  {
    id: "executive-analyst",
    name: "Analista Ejecutivo",
    role: "Estado general del negocio",
    description:
      "Revisa los indicadores agregados de la administradora y resume el estado del negocio para el Gerente General.",
    primarySkill: "executive-report",
    secondarySkill: "fci-analysis",
    systemPrompt:
      "Sos un analista ejecutivo senior de una administradora argentina de fondos comunes de inversión (FCI). Tu función es interpretar el estado general del negocio a partir de KPIs agregados y comunicarlo de forma clara y accionable a un Gerente General. Trabajás con datos ficticios de demostración. Respondés siempre en español rioplatense y con tono profesional y calmo.",
  },
  {
    id: "fund-analyst",
    name: "Analista de Fondos",
    role: "Análisis individual de fondos",
    description:
      "Analiza un fondo puntual: rendimiento, flujo, estructura de inversores y posición relativa.",
    primarySkill: "fci-analysis",
    secondarySkill: "executive-report",
    systemPrompt:
      "Sos un analista de fondos comunes de inversión argentinos. Tu función es analizar en profundidad un fondo individual: valor de cuotaparte, rendimiento, volatilidad, flujos de suscripción y rescate, composición de inversores y alertas. Trabajás con datos ficticios de demostración. Respondés en español rioplatense, con cifras concretas y criterio financiero profesional.",
  },
  {
    id: "risk-monitor",
    name: "Monitor de Riesgos",
    role: "Identificación de situaciones de atención",
    description:
      "Detecta y explica las situaciones que requieren atención: flujos negativos, concentración, volatilidad y alertas abiertas.",
    primarySkill: "financial-alerts",
    secondarySkill: "fci-analysis",
    systemPrompt:
      "Sos el monitor de riesgos de una administradora argentina de FCI. Tu función es identificar situaciones que requieren atención, evaluar su severidad real y sugerir acciones. Trabajás con datos ficticios de demostración y con alertas generadas por un motor de reglas. Respondés en español rioplatense, con tono calmo, profesional y equilibrado.",
  },
];

export const agentById = (id: string): AgentDef | undefined =>
  AGENTS.find((a) => a.id === id);

const KEYWORDS: Array<[AgentId, string[]]> = [
  [
    "fund-analyst",
    [
      "fondo", "rendimiento", "cuotaparte", "liquid", "performance", "rentab",
      "money market", "plazo fijo", "acciones", "bonos", "equilibrada", "dólar",
      "dolar", "card", "banco", "merval", "badlar", "fee", "comisión", "gasto",
    ],
  ],
  [
    "risk-monitor",
    [
      "riesgo", "alerta", "peligro", "caída", "rescate", "salida", "concentr",
      "volatil", "atención", "preocup", "negativo", "fuga", "urgencia", "critic",
    ],
  ],
  [
    "executive-analyst",
    [
      "negocio", "patrimonio", "inversor", "suscripcion", "suscripción", "flujo",
      "evolución", "evolucion", "general", "resumen", "estado", "kpi", "competit",
      "mercado", "estrategia", "panorama", "capit", "capitales",
    ],
  ],
];

export function routeIntent(question: string): AgentId {
  const q = question.toLowerCase();
  for (const [agentId, words] of KEYWORDS) {
    if (words.some((w) => q.includes(w))) return agentId;
  }
  return "executive-analyst";
}