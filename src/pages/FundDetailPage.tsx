import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  Users,
  Coins,
  TrendingUp,
  ArrowLeftRight,
  Activity,
  Sparkles,
} from "lucide-react";
import { getDB } from "../data/store";
import { fundRows, monthlyFlows, topHoldings, alertsByFund, fundTxRecent } from "../data/services/funds";
import { money, moneyShort, pct, dateShort } from "../format";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import KpiCard from "../components/ui/KpiCard";
import Chip from "../components/ui/Chip";
import SeverityBadge from "../components/ui/SeverityBadge";
import PatrimonyChart from "../components/charts/PatrimonyChart";
import CashflowChart from "../components/charts/CashflowChart";
import InsightCard from "../components/ai/InsightCard";

export default function FundDetailPage() {
  const { id = "" } = useParams();
  const db = useMemo(() => getDB(), []);
  const fund = db.funds.find((f) => f.id === id);
  const row = useMemo(() => fundRows(db).find((r) => r.fund.id === id), [db, id]);

  const invById = useMemo(
    () => new Map(db.investors.map((i) => [i.id, i.legalName])),
    [db]
  );

  if (!fund || !row) return <Navigate to="/fondos" replace />;

  const series = db.dailyMetrics
    .filter((m) => m.fundId === fund.id)
    .map((m) => ({ date: m.date, value: m.patrimonio }));

  const flows6 = monthlyFlows(db, fund.id, 6);
  const tops = topHoldings(db, fund.id, 8);
  const alerts = alertsByFund(db, fund.id);
  const txs = fundTxRecent(db, fund.id, 15);

  return (
    <div className="space-y-6">
      <Link
        to="/fondos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Todos los fondos
      </Link>

      <PageHeader
        kicker="Detalle de fondo"
        title={fund.name}
        subtitle={
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Chip tone="brand">{fund.category}</Chip>
            <Chip>{fund.riskProfile}</Chip>
            <Chip>Benchmark · {fund.benchmark}</Chip>
            <Chip>Fee {fund.feePct}%</Chip>
            <Chip>Desde {dateShort(fund.inceptionDate)}</Chip>
          </div>
        }
        right={
          <Link to="/analista" className="btn-ghost !text-xs">
            <Sparkles size={14} /> Preguntar sobre este fondo
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
        <KpiCard label="Patrimonio" value={money(row.patrimonio)} icon={Wallet} tone="brand" />
        <KpiCard label="Inversores" value={row.investors.toLocaleString("es-AR")} icon={Users} tone="positive" />
        <KpiCard label="Valor cuotaparte" value={moneyShort(row.cpv)} icon={Coins} tone="slate" />
        <KpiCard
          label="Rendimiento 30d"
          value={pct(row.ret30, 2)}
          icon={TrendingUp}
          tone={row.ret30 >= 0 ? "positive" : "critical"}
        />
        <KpiCard
          label="Flujo neto 30d"
          value={moneyShort(row.flow.net)}
          icon={ArrowLeftRight}
          tone={row.flow.net >= 0 ? "positive" : "warm"}
          delta={row.flow.ratio}
          deltaSuffix="%"
        />
        <KpiCard
          label="Volatilidad 30d"
          value={pct(row.vol30, 1)}
          icon={Activity}
          tone="slate"
          deltaGoodWhenRising={false}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 sm:p-5 lg:col-span-2">
          <SectionTitle title="Evolución del patrimonio" subtitle="Serie diaria del fondo · últimos 12 meses" />
          <div className="mt-4">
            <PatrimonyChart data={series} height={270} />
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle title="Flujos mensuales" subtitle="Suscripciones y rescates · últimos 6 meses" />
          <div className="mt-4">
            <CashflowChart data={flows6} height={230} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <SectionTitle title="Principales inversores" subtitle="Tenencia según valor de mercado" />
          <div className="mt-4 space-y-3">
            {tops.map((t, i) => (
              <Link
                key={t.holding.id}
                to={`/inversores/${t.holding.investorId}`}
                className="block rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate font-medium text-ink">
                    <span className="mr-1.5 text-xs text-slate-400">{i + 1}</span>
                    {t.investorName}
                  </span>
                  <span className="font-semibold text-ink">{moneyShort(t.value)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(t.pct, 100)}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-slate-500">{pct(t.pct, 1)}</span>
                </div>
              </Link>
            ))}
            {!tops.length && <p className="text-sm text-slate-400">Sin inversores registrados.</p>}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle title="Alertas del fondo" subtitle="Situaciones detectadas por el motor de reglas" />
          <div className="mt-4 space-y-2.5">
            {alerts.length === 0 && (
              <p className="text-sm text-slate-400">Sin alertas registradas para este fondo.</p>
            )}
            {alerts.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <SeverityBadge severity={a.severity} />
                  <span className="flex items-center gap-2 text-[11px] text-slate-400">
                    {a.status} · {dateShort(a.createdAt)}
                  </span>
                </div>
                <div className="mt-1.5 text-sm font-semibold text-ink">{a.title}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{a.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <InsightCard
          agentId="fund-analyst"
          title={`Análisis del fondo ${fund.shortName}`}
          subtitle="Generado por el agente fund-analyst con la skill de análisis de FCI"
          fundId={fund.id}
          defaultQuestion={`Analizá en detalle el estado actual del fondo ${fund.name}.`}
        />
        <InsightCard
          agentId="risk-monitor"
          title="Perspectiva de riesgos"
          subtitle="Focus del monitor de riesgos sobre este fondo"
          fundId={fund.id}
          defaultQuestion={`¿Qué situaciones de este fondo requieren atención?`}
          accent="warm"
        />
      </div>

      <Card className="p-4 sm:p-5">
        <SectionTitle title="Últimas operaciones" subtitle="Transacciones recientes del fondo" />
        <div className="mt-4 -mx-2 overflow-x-auto scrollbar-thin">
          {txs.length ? (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-2 py-2.5">Fecha</th>
                  <th className="px-2 py-2.5">Inversor</th>
                  <th className="px-2 py-2.5">Tipo</th>
                  <th className="px-2 py-2.5 text-right">Monto</th>
                  <th className="px-2 py-2.5 text-right">Cuotapartes</th>
                  <th className="px-2 py-2.5">Canal</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-3 text-slate-500">{dateShort(t.date)}</td>
                    <td className="px-2 py-3 font-medium text-ink">{invById.get(t.investorId) || "-"}</td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          t.type === "Suscripción"
                            ? "bg-positive-50 text-positive-700"
                            : "bg-warm-50 text-warm-700"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right font-medium text-ink">{moneyShort(t.amount)}</td>
                    <td className="px-2 py-3 text-right text-slate-500">
                      {Math.round(t.cuotaPartes).toLocaleString("es-AR")}
                    </td>
                    <td className="px-2 py-3 text-slate-500">{t.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-400">Sin operaciones recientes.</p>
          )}
        </div>
      </Card>
    </div>
  );
}