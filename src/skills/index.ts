export interface Skill {
  id: string;
  name: string;
  purpose: string;
  instructions: string;
  outputFormat: string;
}

export const SKILLS: Skill[] = [
  {
    id: "fci-analysis",
    name: "Análisis de FCI",
    purpose:
      "Instrucciones reutilizables para analizar fondos comunes de inversión: rendimiento, volatilidad, flujos y estructura.",
    instructions:
      "Analizá los fondos comunes de inversión (FCI) con las siguientes métricas: patrimonio administrado, valor de cuotaparte, rendimiento a 30 y 90 días, volatilidad reciente, flujos de suscripciones y rescates a 30 días, cantidad de inversores, concentración del principal inversor y comparación con el benchmark declarado. Considerá siempre el perfil de riesgo del fondo: lo que es normal para uno de renta variable no lo es para uno de money market. Distinguí ruido de corto plazo de tendencia real. Usá únicamente los números provistos: no inventes cifras ni supongas datos.",
    outputFormat:
      "Respuesta ejecutiva en español, entre 3 y 6 oraciones, con cifras concretas y comentario por fondo analizado. Si hay alertas asociadas, mencionalas con su severidad.",
  },
  {
    id: "executive-report",
    name: "Informe ejecutivo",
    purpose:
      "Instrucciones para redactar informes breves y claros orientados a un Gerente General.",
    instructions:
      "Redactá informes ejecutivos breves y claros para un Gerente General de una administradora de FCI. Jerarquizá la información: primero el estado general del negocio, qué sube, qué baja y qué requiere atención; después los detalles de respaldo. Usá lenguaje simple y directo, sin tecnicismos innecesarios. Mencioná cifras redondeadas y siempre en pesos argentinos (ARS). Cerrá con una conclusión de una línea sobre a qué prestar atención.",
    outputFormat:
      "Informe ejecutivo en español: un cierre ejecutivo de 1 línea, luego 3-5 oraciones de desarrollo y, opcionalmente, una lista breve de puntos clave con cifras.",
  },
  {
    id: "financial-alerts",
    name: "Alertas financieras",
    purpose:
      "Instrucciones para evaluar alertas y situaciones que requieren atención, con causa probable y acciones sugeridas.",
    instructions:
      "Dado un conjunto de alertas y métricas, evaluá la severidad real de cada situación, explicá la causa probable usando los datos provistos y proponé una o dos acciones concretas y accionables. Mantené un tono calmo, profesional y no dramático. Las alertas críticas merecen prioridad pero no deben sonar alarmistas. No inventes causas: fundamentá cada explicación en los números disponibles.",
    outputFormat:
      "Respuesta en español: para cada alerta prioritaria, severidad, causa probable (con cifra) y 1-2 acciones sugeridas. Máximo 8 líneas.",
  },
];

export const skillById = (id: string): Skill => {
  const s = SKILLS.find((x) => x.id === id);
  return s || SKILLS[0];
};