export type RiskProfile = "Bajo" | "Medio-Bajo" | "Medio" | "Medio-Alto" | "Alto";
export type Severity = "Critica" | "Importante" | "Informativa";
export type AlertStatus = "Abierta" | "En revisión" | "Resuelta";
export type TxType = "Suscripción" | "Rescate";
export type InvestorType = "Persona Humana" | "Persona Jurídica";

export interface Fund {
  id: string;
  name: string;
  shortName: string;
  category: string;
  currency: "ARS";
  riskProfile: RiskProfile;
  benchmark: string;
  feePct: number;
  inceptionDate: string;
}

export interface Investor {
  id: string;
  legalName: string;
  type: InvestorType;
  profile: "Conservador" | "Moderado" | "Agresivo";
  province: string;
  status: "Activo" | "Inactivo";
  since: string;
}

export interface Holding {
  id: string;
  fundId: string;
  investorId: string;
  cuotaPartes: number;
  capital: number;
  initialDate: string;
}

export interface Transaction {
  id: string;
  fundId: string;
  investorId: string;
  holdingId: string;
  type: TxType;
  date: string;
  amount: number;
  cuotaPartes: number;
  cuotaPartValue: number;
  channel: string;
}

export interface DailyMetric {
  id: string;
  fundId: string;
  date: string;
  patrimonio: number;
  cuotaPartValue: number;
  cuotaPartes: number;
  dailyReturn: number;
  activeInvestors: number;
}

export interface Alert {
  id: string;
  fundId?: string;
  investorId?: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  status: AlertStatus;
  title: string;
  description: string;
  createdAt: string;
  metricValue: number;
}

export interface DB {
  funds: Fund[];
  investors: Investor[];
  holdings: Holding[];
  transactions: Transaction[];
  alerts: Alert[];
  dailyMetrics: DailyMetric[];
}