import type { Alert, AlertStatus, DB } from "../types";

const SEVERITY_WEIGHT: Record<string, number> = { Critica: 3, Importante: 2, Informativa: 1 };

export function activeAlerts(db: DB): Alert[] {
  return db.alerts
    .filter((a) => a.status !== "Resuelta")
    .sort((a, b) => {
      const w = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
      if (w !== 0) return w;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
}

export function alertCounts(db: DB): { Critica: number; Importante: number; Informativa: number } {
  const c = { Critica: 0, Importante: 0, Informativa: 0 };
  for (const a of db.alerts) {
    if (a.status === "Resuelta") continue;
    c[a.severity]++;
  }
  return c;
}

export function allAlerts(db: DB): Alert[] {
  return db.alerts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function summaryOf(a: Alert): string {
  return `${a.ruleName} · ${a.title}`;
}

export const STATUS_TRANSLATION: Record<AlertStatus, string> = {
  Abierta: "Abierta",
  "En revisión": "En revisión",
  Resuelta: "Resuelta",
};