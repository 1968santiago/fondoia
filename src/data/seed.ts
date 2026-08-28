import type {
  DB,
  Fund,
  Investor,
  InvestorType,
  DailyMetric,
  Transaction,
  Holding,
  RiskProfile,
} from "./types";
import { RNG } from "./rng";

const DAYS = 371;

const LOAD_TODAY = new Date();
LOAD_TODAY.setHours(12, 0, 0, 0);

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const TOTAL_DAYS = DAYS;
function dayDate(t: number): Date {
  const d = new Date(LOAD_TODAY);
  d.setDate(d.getDate() - (TOTAL_DAYS - 1 - t));
  return d;
}

interface FundDef {
  id: string;
  name: string;
  shortName: string;
  category: string;
  riskProfile: RiskProfile;
  benchmark: string;
  feePct: number;
  mu: number;
  sigma: number;
  baseAum: number;
  susRate: number;
  resRate: number;
  phase: number;
  accepted: RiskProfile[];
}

const DEFS: FundDef[] = [
  {
    id: "F01",
    name: "Valo Money Market Plus",
    shortName: "Money Market",
    category: "Money Market",
    riskProfile: "Bajo",
    benchmark: "Badlar",
    feePct: 0.35,
    mu: 0.027,
    sigma: 0.05,
    baseAum: 6.2e9,
    susRate: 0.45,
    resRate: 0.4,
    phase: 0.4,
    accepted: ["Bajo", "Medio-Bajo"],
  },
  {
    id: "F02",
    name: "Valo Plazo Fijo Argentina",
    shortName: "Plazo Fijo",
    category: "Renta Fija Peso",
    riskProfile: "Bajo",
    benchmark: "Badlar",
    feePct: 0.45,
    mu: 0.038,
    sigma: 0.14,
    baseAum: 4.3e9,
    susRate: 0.32,
    resRate: 0.26,
    phase: 1.1,
    accepted: ["Bajo", "Medio-Bajo", "Medio"],
  },
  {
    id: "F03",
    name: "Valo Renta Fija Corta",
    shortName: "Renta Fija Corta",
    category: "Renta Fija Peso",
    riskProfile: "Medio-Bajo",
    benchmark: "Badlar + 150pb",
    feePct: 0.7,
    mu: 0.046,
    sigma: 0.32,
    baseAum: 3.2e9,
    susRate: 0.28,
    resRate: 0.24,
    phase: 2.3,
    accepted: ["Medio-Bajo", "Medio"],
  },
  {
    id: "F04",
    name: "Valo Renta Equilibrada",
    shortName: "Renta Equilibrada",
    category: "Balanceado",
    riskProfile: "Medio",
    benchmark: "Índice Mixto",
    feePct: 1.05,
    mu: 0.055,
    sigma: 0.85,
    baseAum: 2.4e9,
    susRate: 0.4,
    resRate: 0.34,
    phase: 0.8,
    accepted: ["Medio", "Medio-Alto"],
  },
  {
    id: "F05",
    name: "Valo Acciones Locales",
    shortName: "Acciones Locales",
    category: "Renta Variable",
    riskProfile: "Alto",
    benchmark: "S&P Merval",
    feePct: 1.45,
    mu: 0.06,
    sigma: 1.85,
    baseAum: 1.15e9,
    susRate: 0.3,
    resRate: 0.26,
    phase: 1.7,
    accepted: ["Alto"],
  },
  {
    id: "F06",
    name: "Valo Bonos CER",
    shortName: "Bonos CER",
    category: "Renta Fija Ajustable",
    riskProfile: "Medio",
    benchmark: "CER",
    feePct: 0.95,
    mu: 0.047,
    sigma: 0.72,
    baseAum: 1.9e9,
    susRate: 0.24,
    resRate: 0.22,
    phase: 2.9,
    accepted: ["Medio-Bajo", "Medio", "Medio-Alto"],
  },
  {
    id: "F07",
    name: "Valo Dólar CCL",
    shortName: "Dólar CCL",
    category: "Renta Fija Dolar",
    riskProfile: "Bajo",
    benchmark: "Dólar CCL",
    feePct: 0.8,
    mu: 0.02,
    sigma: 0.2,
    baseAum: 0.9e9,
    susRate: 0.2,
    resRate: 0.18,
    phase: 0.2,
    accepted: ["Bajo", "Medio-Bajo"],
  },
  {
    id: "F08",
    name: "Valo Balance Crecimiento",
    shortName: "Balance Crecimiento",
    category: "Balanceado",
    riskProfile: "Medio-Alto",
    benchmark: "Índice Mixto",
    feePct: 1.15,
    mu: 0.052,
    sigma: 1.05,
    baseAum: 1.55e9,
    susRate: 0.3,
    resRate: 0.28,
    phase: 3.4,
    accepted: ["Medio-Alto", "Alto"],
  },
];

const FIRST_NAMES = [
  "Marcela", "Jorge", "Lucía", "Martín", "Valentina", "Andrés", "Carolina",
  "Diego", "Florencia", "Santiago", "Paula", "Ricardo", "Camila", "Federico",
  "Ana", "Gustavo", "Rocío", "Leandro", "Silvina", "Nicolás", "Brenda",
  "Matías", "Verónica", "Gabriel", "Inés", "Rodrigo", "Micaela", "Emiliano",
  "Teresa", "Hernán", "Cecilia", "Alejandro", "Mariana", "Fernando", "Lorena",
  "Hugo", "Pilar", "Darío", "Graciela", "Ramón", "Natalia", "Osvaldo", "Adriana",
  "Franco", "Miriam", "Sebastián", "Romina", "Claudio", "Elena", "Damián",
  "Sofía", "Rubén", "Carla",
];

const LAST_NAMES = [
  "González", "Rodríguez", "Fernández", "López", "Martínez", "Pérez", "García",
  "Sánchez", "Romero", "Silva", "Torres", "Acuña", "Vega", "Castillo", "Ríos",
  "Medina", "Herrera", "Agüero", "Salto", "Bustos", "Navarro", "Pereyra",
  "Domínguez", "Roldán", "Cáceres", "Escobar", "Vidal", "Barrios", "Ojeda",
  "Molina", "Fuentes", "Báez", "Sosa", "Aguirre", "Quiroga", "Ledesma",
  "Ferreira", "Duarte", "Leiva", "Godoy", "Paredes", "Corvalán", "Luna",
  "Soria", "Benítez", "Castro", "Ramos", "Álvarez", "Mendoza", "Suárez",
];

const COMPANY_PARTS_A = [
  "Norte", "Sur", "Austral", "Andina", "Aldebarán", "Pampa", "Costa", "Nueva",
  "Verde", "Estable", "Frontera", "Aurora",
];
const COMPANY_PARTS_B = [
  "Inversiones", "Grupo", "Capitales", "Patrimonial", "Fiduciaria", "Gestora",
  "Administradora", "Financiera",
];
const COMPANY_SUFFIX = ["S.A.", "S.R.L.", "S.A.P.E.M."];

const PROVINCES = [
  "Buenos Aires", "CABA", "Córdoba", "Santa Fe", "Mendoza", "Entre Ríos",
  "Tucumán", "Salta", "Neuquén", "Chaco", "Río Negro",
];

const PERSONAS = 88;
const EMPRESAS = 20;

export function buildSeed(): DB {
  const rng = new RNG(20240801);
  const funds: Fund[] = DEFS.map((d) => ({
    id: d.id,
    name: d.name,
    shortName: d.shortName,
    category: d.category,
    currency: "ARS",
    riskProfile: d.riskProfile,
    benchmark: d.benchmark,
    feePct: d.feePct,
    inceptionDate: iso(dayDate(TOTAL_DAYS - 31)),
  }));

  const investors: Investor[] = [];
  const investorType = (i: number): InvestorType =>
    i < PERSONAS ? "Persona Humana" : "Persona Jurídica";
  const profileOf = (t: InvestorType): Investor["profile"] => {
    const r = rng.random();
    if (t === "Persona Humana") return r < 0.4 ? "Conservador" : r < 0.78 ? "Moderado" : "Agresivo";
    return r < 0.3 ? "Conservador" : r < 0.85 ? "Moderado" : "Agresivo";
  };

  for (let i = 0; i < PERSONAS + EMPRESAS; i++) {
    const t = investorType(i);
    const name =
      t === "Persona Humana"
        ? `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`
        : `Valo ${rng.pick(COMPANY_PARTS_A)} ${rng.pick(COMPANY_PARTS_B)} ${rng.pick(COMPANY_SUFFIX)}`;
    const since = iso(dayDate(rng.int(90, TOTAL_DAYS - 1)));
    investors.push({
      id: `I${String(i + 1).padStart(3, "0")}`,
      legalName: name,
      type: t,
      profile: profileOf(t),
      province: rng.pick(PROVINCES),
      status: "Activo",
      since,
    });
  }

  const anchorF4: Investor = {
    id: "IANC1",
    legalName: "Fiduciaria Regional del Plata S.A.",
    type: "Persona Jurídica",
    profile: "Moderado",
    province: "CABA",
    status: "Activo",
    since: iso(dayDate(TOTAL_DAYS - 30)),
  };
  const anchorF6: Investor = {
    id: "IANC2",
    legalName: "Tesorería Agro Andina S.A.",
    type: "Persona Jurídica",
    profile: "Moderado",
    province: "Santa Fe",
    status: "Activo",
    since: iso(dayDate(TOTAL_DAYS - 60)),
  };
  const anchorF7: Investor = {
    id: "IANC3",
    legalName: "Gestora Frontera Capital S.A.",
    type: "Persona Jurídica",
    profile: "Agresivo",
    province: "Mendoza",
    status: "Activo",
    since: iso(dayDate(TOTAL_DAYS - 200)),
  };
  investors.push(anchorF4, anchorF6, anchorF7);

  const PROFILE_FUNDS: Record<Investor["profile"], RiskProfile[]> = {
    Conservador: ["Bajo", "Medio-Bajo"],
    Moderado: ["Medio-Bajo", "Medio"],
    Agresivo: ["Medio-Alto", "Alto"],
  };

  const compatible = (fund: FundDef, inv: Investor): number => {
    const accepts = PROFILE_FUNDS[inv.profile];
    const ok = fund.accepted.some((r) => accepts.includes(r));
    if (!ok) return 0;
    if (inv.type === "Persona Jurídica") return 1.6;
    return 1;
  };

  const cpv: number[][] = DEFS.map(() => []);
  DEFS.forEach((d, fi) => {
    let v = 100;
    for (let t = 0; t < TOTAL_DAYS; t++) {
      if (t > 0) {
        const drift = d.mu + 0.02 * Math.sin(t / 21 + d.phase) * 0.4;
        v = v * (1 + rng.gauss(drift, d.sigma) / 100);
      }
      cpv[fi][t] = v;
    }
  });

  const pos: Map<string, Map<string, number>> = new Map();
  DEFS.forEach((d) => pos.set(d.id, new Map()));

  const patrimonio: number[][] = DEFS.map(() => new Array(TOTAL_DAYS).fill(0));
  const out: number[][] = DEFS.map(() => new Array(TOTAL_DAYS).fill(0));
  const acts: number[][] = DEFS.map(() => new Array(TOTAL_DAYS).fill(0));
  const capitalNet: Map<string, Map<string, number>> = new Map();

  let txCounter = 0;
  const tx: Transaction[] = [];
  const txId = () => `TX-${String(txCounter++).padStart(6, "0")}`;

  const applyTx = (
    fi: number,
    investorId: string,
    cuotas: number,
    tipo: "Suscripción" | "Rescate",
    atDay: number,
    channel: string
  ) => {
    const fund = DEFS[fi];
    const fundPos = pos.get(fund.id)!;
    const price = cpv[fi][atDay];
    const prev = fundPos.get(investorId) || 0;
    const next = tipo === "Suscripción" ? prev + cuotas : Math.max(0, prev - cuotas);
    fundPos.set(investorId, next);
    const capMap = capitalNet.get(fund.id)!;
    const prevCap = capMap.get(investorId) || 0;
    capMap.set(
      investorId,
      prevCap + (tipo === "Suscripción" ? cuotas * price : -cuotas * price)
    );
    tx.push({
      id: txId(),
      fundId: fund.id,
      investorId,
      holdingId: "",
      type: tipo,
      date: iso(dayDate(atDay)),
      amount: Math.round(cuotas * price),
      cuotaPartes: cuotas,
      cuotaPartValue: price,
      channel,
    });
  };

  DEFS.forEach((d, fi) => {
    capitalNet.set(d.id, new Map());
    const fundPos = pos.get(d.id)!;

    const bucket =
      d.id === "F04" ? [anchorF4] : d.id === "F06" ? [anchorF6] : d.id === "F07" ? [anchorF7] : [];
    const others = investors.filter((iv) => iv.id !== "IANC1" && iv.id !== "IANC2" && iv.id !== "IANC3");
    const candidates = others.filter((iv) => compatible(d, iv) > 0);

    const totalCuotas = d.baseAum / 100;
    let bottom = 0;
    if (d.id === "F04") bottom = totalCuotas * 0.11;
    if (d.id === "F07") bottom = totalCuotas * 0.24;

    let anchorGot = 0;
    bucket.forEach((iv) => {
      const cuotas = bottom;
      anchorGot += cuotas;
      fundPos.set(iv.id, cuotas);
      capitalNet.get(d.id)!.set(iv.id, cuotas * 100);
      tx.push({
        id: txId(),
        fundId: d.id,
        investorId: iv.id,
        holdingId: "",
        type: "Suscripción",
        date: iso(dayDate(0)),
        amount: Math.round(cuotas * cpv[fi][0]),
        cuotaPartes: cuotas,
        cuotaPartValue: cpv[fi][0],
        channel: "Adjunta",
      });
    });

    const rest = totalCuotas - anchorGot;
    const remaining = new Map(candidates.map((iv) => [iv, 0]));
    const nInit = rng.int(16, 30);
    for (let k = 0; k < nInit; k++) {
      const w = candidates.map((iv) => ({ item: iv, weight: 0.4 + rng.random() * 1.8 }));
      const pick = rng.weighted(w);
      remaining.set(pick, (remaining.get(pick) || 0) + 1);
    }
    const selected = [...remaining.entries()].filter(([, c]) => c > 0);
    const totalW = selected.reduce((s, [, c]) => s + c, 0);
    selected.forEach(([iv, c]) => {
      const cuotas = (rest * c) / totalW;
      fundPos.set(iv.id, cuotas);
      capitalNet.get(d.id)!.set(iv.id, cuotas * cpv[fi][0]);
      tx.push({
        id: txId(),
        fundId: d.id,
        investorId: iv.id,
        holdingId: "",
        type: "Suscripción",
        date: iso(dayDate(0)),
        amount: Math.round(cuotas * cpv[fi][0]),
        cuotaPartes: cuotas,
        cuotaPartValue: cpv[fi][0],
        channel: "Adjunta",
      });
    });

    patrimonio[fi][0] = totalCuotas * cpv[fi][0];
    out[fi][0] = totalCuotas;
    acts[fi][0] = fundPos.size;
  });

  const scripted: Record<string, Array<{ fi: number; inv: string; cuotas: number; tipo: "Suscripción" | "Rescate"; day: number }>> = {
    F04: [],
    F06: [],
  };
  const mkScript = (fi: number, inv: string, pct: number, day: number, tipo: "Suscripción" | "Rescate") => {
    scripted[DEFS[fi].id].push({
      fi,
      inv,
      cuotas: ((DEFS[fi].baseAum * pct) / 100) / 100,
      tipo,
      day,
    });
  };
  const D = TOTAL_DAYS;
  const f4i = DEFS.findIndex((f) => f.id === "F04");
  const f6i = DEFS.findIndex((f) => f.id === "F06");
  [D - 27, D - 25, D - 22, D - 17, D - 13, D - 9, D - 5].forEach((day, i) => {
    mkScript(f4i, "IANC1", 1.45 - i * 0.06, day, "Rescate");
  });
  [D - 30, D - 26, D - 21, D - 16, D - 11, D - 7, D - 3].forEach((day, i) => {
    mkScript(f6i, "IANC2", 0.5 + i * 0.08, day, "Suscripción");
  });

  const channels = ["App", "App", "Web", "Sucursal", "Banco"];

  for (let t = 1; t < TOTAL_DAYS; t++) {
    DEFS.forEach((d, fi) => {
      const fundPos = pos.get(d.id)!;
      const holders = [...fundPos.entries()].filter(([, c]) => c > 0);

      const wave = 1 + 0.35 * Math.sin(t / 34 + d.phase);
      const nSus = rng.poisson(d.susRate * wave);
      const nRes = rng.poisson(d.resRate * wave);

      for (let i = 0; i < nSus; i++) {
        const cand = investors.filter((iv) => compatible(d, iv) > 0 && !iv.id.startsWith("IANC"));
        const inv = rng.weighted(cand.map((iv) => ({ item: iv, weight: 0.5 + rng.random() * 2 })));
        const base = d.baseAum;
        const amt =
          inv.type === "Persona Jurídica"
            ? base * rng.range(0.0004, 0.012)
            : base * rng.range(0.00004, 0.0012);
        applyTx(fi, inv.id, amt / cpv[fi][t], "Suscripción", t, rng.pick(channels));
      }

      for (let i = 0; i < nRes; i++) {
        const avail = holders.filter(([ivId]) => !ivId.startsWith("IANC"));
        if (!avail.length) continue;
        const [invId, cuo] = rng.pick(avail);
        const base = d.baseAum;
        const amt =
          cuo * cpv[fi][t] > base * 0.01
            ? base * rng.range(0.0004, 0.01)
            : Math.max(100000, rng.range(120000, 900000));
        const cuotas = Math.min(amt / cpv[fi][t], cuo * rng.range(0.25, 0.85));
        applyTx(fi, invId, cuotas, "Rescate", t, rng.pick(channels));
      }

      const s = scripted[d.id] || [];
      for (const ev of s) {
        if (ev.day === t) {
          applyTx(fi, ev.inv, ev.cuotas, ev.tipo, t, "Adjunta");
        }
      }

      let sum = 0;
      for (const [, c] of fundPos) if (c > 0) sum += c;
      out[fi][t] = sum;
      patrimonio[fi][t] = sum * cpv[fi][t];
      acts[fi][t] = 0;
      for (const [, c] of fundPos) if (c > 0) acts[fi][t]++;
    });
  }

  const dailyMetrics: DailyMetric[] = [];
  DEFS.forEach((d, fi) => {
    for (let t = 0; t < TOTAL_DAYS; t++) {
      const dailyReturn = t > 0 ? ((cpv[fi][t] / cpv[fi][t - 1]) - 1) * 100 : 0;
      dailyMetrics.push({
        id: `DM-${d.id}-${t}`,
        fundId: d.id,
        date: iso(dayDate(t)),
        patrimonio: Math.round(patrimonio[fi][t]),
        cuotaPartValue: cpv[fi][t],
        cuotaPartes: Math.round(out[fi][t]),
        dailyReturn: Math.round(dailyReturn * 10000) / 10000,
        activeInvestors: acts[fi][t],
      });
    }
  });

  const holdings: Holding[] = [];
  let holdCounter = 0;
  DEFS.forEach((d) => {
    const fundPos = pos.get(d.id)!;
    const capMap = capitalNet.get(d.id)!;
    for (const [invId, cuo] of fundPos) {
      if (cuo <= 0) continue;
      const holderTx = tx.filter((t) => t.fundId === d.id && t.investorId === invId);
      holdings.push({
        id: `H-${String(holdCounter++).padStart(5, "0")}`,
        fundId: d.id,
        investorId: invId,
        cuotaPartes: cuo,
        capital: Math.max(0, Math.round(capMap.get(invId) || 0)),
        initialDate: holderTx.length ? holderTx[0].date : iso(dayDate(0)),
      });
    }
  });

  const holdByKey = new Map<string, string>();
  holdings.forEach((h) => holdByKey.set(`${h.fundId}:${h.investorId}`, h.id));
  tx.forEach((t) => {
    const key = `${t.fundId}:${t.investorId}`;
    const hid = holdByKey.get(key);
    const holderTx = tx.filter((x) => x.id !== t.id && x.fundId === t.fundId && x.investorId === t.investorId);
    t.holdingId = hid || (holderTx.length ? "" : "");
  });

  tx.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return {
    funds,
    investors,
    holdings,
    transactions: tx,
    alerts: [],
    dailyMetrics,
  };
}

export const SEED_META = {
  seed: 20240801,
  days: TOTAL_DAYS,
  currencies: "ARS · datos 100% ficticios",
  dateAnchor: iso(LOAD_TODAY),
};