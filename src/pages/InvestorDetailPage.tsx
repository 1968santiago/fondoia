import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  PiggyBank,
  Layers,
  Hash,
  ArrowLeftRight,
  Sparkles,
} from "lucide-react";
import { getDB } from "../data/store";
import { investorDetail } from "../data/services/investors";
import { money, moneyShort, pct, dateShort } from "../format";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import KpiCard from "../components/ui/KpiCard";
import Chip from "../components/ui/Chip";
import CompositionDonut from "../components/charts/CompositionDonut";
import InsightCard from "../components/ai/InsightCard";

export default function InvestorDetailPage() {
  const { id = "" } = useParams();
  const db = useMemo(() => getDB(), []);
  const detail = useMemo(() => investorDetail(db, id), [db, id]);

  if (!detail) return <Navigate to="/inversores" replace />;

  const fundOfTx = new Map(db.funds.map((f) => [f.id, f.shortName]));
  const donutData = detail.holdings.map((h) => ({ category: h.fundShort, value: h.value }));
  const avgPerFund = detail.holdings.length ? detail.total / detail.holdings.length : 0;

  return (
    <div className="space-y-6">
      <Link
        to="/inversores"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Todos los inversores
      </Link>

      <PageHeader
        kicker="Detalle de inversor"
        title={detail.investor.legalName}
        subtitle={
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Chip tone="slate">{detail.investor.type}</Chip>
            <Chip tone={detail.investor.profile === "Conservador" ? "brand" : detail.investor.profile === "Moderado" ? "slate" : "warm"}>
              Perfil {detail.investor.profile}
            </Chip>
            <Chip>{detail.investor.province}</Chip>
            <Chip>Alta {dateShort(detail.investor.since)}</Chip>
            <Chip tone="positive">{detail.investor.status}</Chip>
          </div>
        }
        right={
          <Link to="/analista" className="btn-ghost !text-xs">
            <Sparkles size={14} /> Preguntar sobre este inversor
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        <KpiCard label="Patrimonio en cartera" value={money(detail.total)} icon={Wallet} tone="brand" />
        <KpiCard label="Capital aportado" value={moneyShort(detail.aporteNeto)} icon={PiggyBank} tone="positive" />
        <KpiCard label="Posiciones" value={detail.holdings.length.toString()} icon={Layers} tone="slate" />
        <KpiCard label="Promedio por fondo" value={moneyShort(avgPerFund)} icon={Hash} tone="slate" />
        <KpiCard label="Operaciones" value={detail.txCount.toLocaleString("es-AR")} icon={ArrowLeftRight} tone="brand" />
        <KpiCard label="Última actividad" value={detail.lastActivity ? dateShort(detail.lastActivity) : "—"} icon={Sparkles} tone="slate" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 sm:p-5 lg:col-span-2">
          <SectionTitle title="Posiciones en fondos" subtitle="Tenencia actual según valor de mercado" />
          <div className="mt-4 -mx-2 overflow-x-auto scrollbar-thin">
            {detail.holdings.length ? (
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-2.5">Fondo</th>
                    <th className="px-2 py-2.5 text-right">Cuotapartes</th>
                    <th className="px-2 py-2.5 text-right">Cuotaparte</th>
                    <th className="px-2 py-2.5 text-right">Valor</th>
                    <th className="px-2 py-2.5">% cartera</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.holdings.map((h) => (
                    <tr key={h.holding.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-3">
                        <Link to={`/fondos/${h.holding.fundId}`} className="font-semibold text-ink hover:text-brand-700">
                          {h.fundName}
                        </Link>
                        <div className="text-xs text-slate-400">{h.category}</div>
                      </td>
                      <td className="px-2 py-3 text-right text-slate-600">
                        {Math.round(h.holding.cuotaPartes).toLocaleString("es-AR")}
                      </td>
                      <td className="px-2 py-3 text-right text-slate-600">{moneyShort(h.cpv)}</td>
                      <td className="px-2 py-3 text-right font-semibold text-ink">{moneyShort(h.value)}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(h.pct, 100)}%` }} />
                          </div>
                          <span className="w-10 text-right text-xs text-slate-500">{pct(h.pct, 1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-400">Este inversor no presenta posiciones activas.</p>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle title="Distribución de la cartera" subtitle="Por fondo" />
          <div className="mt-4">
            <CompositionDonut data={donutData} height={210} />
          </div>
        </Card>
      </div>

      <InsightCard
        agentId="risk-monitor"
        title="Evaluación del inversor"
        subtitle="Perfil, exposición y composición de cartera · agente Monitor de Riesgos"
        investorId={detail.investor.id}
        defaultQuestion={`Evaluá el perfil, la diversificación y los riesgos de cartera del inversor ${detail.investor.legalName}.`}
        accent="warm"
      />

      <Card className="p-4 sm:p-5">
        <SectionTitle title="Historial de operaciones" subtitle="Suscripciones y rescates recientes" />
        <div className="mt-4 -mx-2 overflow-x-auto scrollbar-thin">
          {detail.transactions.length ? (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-2 py-2.5">Fecha</th>
                  <th className="px-2 py-2.5">Tipo</th>
                  <th className="px-2 py-2.5">Fondo</th>
                  <th className="px-2 py-2.5 text-right">Monto</th>
                  <th className="px-2 py-2.5 text-right">Cuotapartes</th>
                  <th className="px-2 py-2.5">Canal</th>
                </tr>
              </thead>
              <tbody>
                {detail.transactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-3 text-slate-500">{dateShort(t.date)}</td>
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
                    <td className="px-2 py-3 font-medium text-ink">{fundOfTx.get(t.fundId) || t.fundId}</td>
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
            <p className="text-sm text-slate-400">Sin operaciones registradas.</p>
          )}
        </div>
      </Card>
    </div>
  );
}