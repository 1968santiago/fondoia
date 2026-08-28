import type { DB } from "./types";
import { buildSeed } from "./seed";
import { runRules } from "../rules/engine";

let db: DB | null = null;

export function getDB(): DB {
  if (!db) {
    db = buildSeed();
    runRules(db);
  }
  return db;
}

export function todayIso(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return isoLocal(d);
}

export function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function daysAgoIso(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return isoLocal(d);
}

export function lastNDaysIso(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(daysAgoIso(i));
  return out;
}