import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Users,
  PieChart as PieIcon,
  ArrowLeftRight,
  Bell,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { getDB, todayIso, daysAgoIso } from "../data/store";
import {
  totalPatrimony,
  totalInvestors,
  totalFlows30,
  weightedRet30,
  evolutionOf,
  categoryComposition,
} from "../data/services/kpis";
import { fundRows, monthlyFlows } from "../data/services/funds";
import { activeAlerts, alertCounts } from "../data/services/alerts";
import { money, moneyShort, pct, dateShort } from "../format";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import KpiCard from "../components/ui/KpiCard";
import SeverityBadge from "../components/ui/SeverityBadge";
import PatrimonyChart from "../components/charts/PatrimonyChart";
import CashflowChart from "../components/charts/CashflowChart";
import CompositionDonut from "../components/charts/CompositionDonut";
import PerfBars from "../components/charts/PerfBars";
import InsightCard from "../components/ai/InsightCard";

export default function DashboardPage() {
  const db = useMemo(() => getDB(), []);

  const evolution = evolutionOf(db, 365);
  const evo30 = useMemo(() => {
    const ev = evolutionOf(db, 30);
    return ev.length >= 2
      ? ((ev[ev.length - 1].value / ev[0].value) - 1) * 100
      : 0;
  }, [db]);

  const invDelta = useMemo(() => {
    const today = todayIso();
    const day30 = daysAgoIso(30);
    const sumFor = (d: string) =>
      db.dailyMetrics.filter((m) => m.date === d).reduce((s, m) => s + m.activeInvestors, 0);
    const now = sumFor(today);
    const before = sumFor(day30);
    return before ? ((now - before) / before) * 100 : 0;
  }, [db]);

  const patr = totalPatrimony(db);
  const investors = totalInvestors(db);
  const flows = totalFlows30(db);
  const ret30 = weightedRet30(db);
  const flowsMonthly = useMemo(() => {
    const buckets = new Map<string, { label: string; subs: number; res: number }>();
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const c = new Date(d);
      c.setMonth(c.getMonth() - i);
      const key = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, { label: key, subs: 0, res: 0 });
    }
    for (const tx of db.transactions) {
      const key = tx.date.slice(0, 7);
      const b = buckets.get(key);
      if (!b) continue;
      if (tx.type === "Suscripción") b.subs += tx.amount;
      else b.res += tx.amount;
    }
    return [...buckets.values()];
  }, [db]);

  const alerts = activeAlerts(db);
  const counts = alertCounts(db);
  const perf = fundRows(db);
  const composition = categoryComposition(db);
  const criticalCount = counts.Critica;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Valo FCI · Fondo común de inversión"
        title="Dashboard Ejecutivo"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>{new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="text-slate-300">·</span>
            <span>Estado del negocio en 30 segundos</span>
          </span>
        }
        right={
          <Link to="/analista" className="btn-primary">
            <Sparkles size={16} /> Preguntar al Analista IA
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          label="Patrimonio administrado"
          value={money(patr)}
          icon={Wallet}
          tone="brand"
          delta={evo30}
          deltaSuffix="%"
          sub="últimos 30 días"
        />
        <KpiCard
          label="Inversores activos"
          value={investors.toLocaleString("es-AR")}
          icon={Users}
          tone="positive"
          delta={invDelta}
          deltaSuffix="%"
          sub="variación 30 días"
        />
        <KpiCard
          label="Fondos administrados"
          value={db.funds.length.toString()}
          icon={PieIcon}
          tone="slate"
          sub="8 vehículos de inversión"
        />
        <KpiCard
          label="Flujo neto · 30 días"
          value={money(flows.net)}
          icon={ArrowLeftRight}
          tone={flows.net >= 0 ? "positive" : "warm"}
          delta={patr > 0 ? (flows.net / patr) * 100 : 0}
          deltaSuffix="%"
          sub={`susc. ${moneyShort(flows.subs)} · resc. ${moneyShort(flows.res)}`}
        />
      </div>

      {criticalCount > 0 && (
        <Card className="border-l-4 border-l-critical-500 px-4 py-3.5 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-critical-50 text-critical-600">
                <Bell size={18} />
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">
                  {criticalCount} situación(es) requieren atención
                </div>
                <div className="text-xs text-slate-500">
                  Revisá el panel de alertas debajo para priorizar esta semana.
                </div>
              </div>
            </div>
            <Link to="/analista" className="btn-ghost !py-2 !text-xs">
              Ver panorama de riesgos <ChevronRight size={14} />
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 sm:p-5 lg:col-span-2">
          <SectionTitle
            title="Evolución del patrimonio"
            subtitle="Suma del patrimonio administrado por todos los fondos (últimos 12 meses)"
            right={<span className="text-sm font-semibold text-brand-700">{pct(ret30, 2)} ponderado 30d</span>}
          />
          <div className="mt-4">
            <PatrimonyChart data={evolution} height={280} />
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle
            title="Alertas activas"
          />
          <div className="mt-4 space-y-3">
            <AlertSummary counts={counts} />
            <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin">
              {alerts.length === 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-positive-50 px-3 py-3 text-sm text-positive-700">
                  <ShieldCheck size={16} /> Sin alertas abiertas. Todo bajo control.
                </div>
              )}
              {alerts.map((a) => {
                const fund = db.funds.find((f) => f.id === a.fundId);
                return (
                  <Link
                    key={a.id}
                    to={a.fundId ? `/fondos/${a.fundId}` : "/analista"}
                    className="block rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <SeverityBadge severity={a.severity} />
                      <span className="text-[11px] text-slate-400">{dateShort(a.createdAt)}</span>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-ink">{a.title}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">{a.description}</div>
                    {fund && <div className="mt-1 text-[11px] font-medium text-brand-700">{fund.shortName}</div>}
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <InsightCard
        agentId="executive-analyst"
        title="Informe ejecutivo del negocio"
        subtitle="Resumen automático del estado general generado por el agente executive-analyst"
        defaultQuestion="Generá el informe ejecutivo del estado actual del negocio."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <SectionTitle title="Desempeño por fondo · 30 días" subtitle="Rendimiento de la cuotaparte por fondo" />
          <div className="mt-5">
            <PerfBars
              items={perf.map((r) => ({
                id: r.fund.id,
                name: r.fund.shortName,
                sub: `${moneyShort(r.patrimonio)} bajo gestión`,
                ret30: r.ret30,
              }))}
            />
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle
            title="Suscripciones vs rescates"
            subtitle="Flujo de capitales mensual del conjunto (últimos 6 meses)"
            right={
              <Link to="/fondos" className="btn-ghost !py-1.5 !text-xs">
                Ver fondos <ChevronRight size={14} />
              </Link>
            }
          />
          <div className="mt-4">
            <CashflowChart data={flowsMonthly} height={250} />
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <SectionTitle title="Composición del patrimonio por categoría" subtitle="Distribución actual del patrimonio administrado" />
        <div className="mt-2">
          <CompositionDonut data={composition} height={230} />
        </div>
      </Card>
    </div>
  );
}

function AlertSummary({
  counts,
}: {
  counts: { Critica: number; Importante: number; Informativa: number };
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(
        [
          ["Critica", counts.Critica, "text-critical-600 bg-critical-50"],
          ["Importante", counts.Importante, "text-warm-600 bg-warm-50"],
          ["Informativa", counts.Informativa, "text-brand-700 bg-brand-50"],
        ] as const
      ).map(([label, n, cls]) => (
        <div key={label} className={`rounded-xl px-3 py-2 text-center ${cls}`}>
          <div className="text-lg font-bold leading-none">{n}</div>
          <div className="mt-1 text-[11px] font-medium opacity-80">{label}</div>
        </div>
      ))}
    </div>
  );
}