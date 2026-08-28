import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ChevronRight, Sparkles } from "lucide-react";
import { getDB } from "../data/store";
import { fundRows, type FundRow } from "../data/services/funds";
import { money, moneyShort, pct } from "../format";
import { totalPatrimony } from "../data/services/kpis";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import DataTable, { type Col } from "../components/ui/DataTable";
import Chip from "../components/ui/Chip";

export default function FundsPage() {
  const db = useMemo(() => getDB(), []);
  const rows = useMemo(() => fundRows(db), [db]);
  const [query, setQuery] = useState("");

  const filtered = rows.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.fund.name.toLowerCase().includes(q) ||
      r.fund.shortName.toLowerCase().includes(q) ||
      r.fund.category.toLowerCase().includes(q)
    );
  });

  const navigate = useNavigate();

  const cols: Col<FundRow>[] = [
    {
      key: "fondo",
      header: "Fondo",
      render: (r) => (
        <div className="min-w-0">
          <div className="font-semibold text-ink">{r.fund.shortName}</div>
          <div className="truncate text-xs text-slate-400">{r.fund.category}</div>
        </div>
      ),
      sortValue: (r) => r.fund.shortName,
    },
    {
      key: "riesgo",
      header: "Perfil",
      render: (r) => <Chip>{r.fund.riskProfile}</Chip>,
    },
    {
      key: "patrimonio",
      header: "Patrimonio",
      align: "right",
      render: (r) => <span className="font-semibold text-ink">{moneyShort(r.patrimonio)}</span>,
      sortValue: (r) => r.patrimonio,
    },
    {
      key: "inversores",
      header: "Inversores",
      align: "right",
      render: (r) => r.investors.toLocaleString("es-AR"),
      sortValue: (r) => r.investors,
    },
    {
      key: "ret30",
      header: "Rend. 30d",
      align: "right",
      render: (r) => <Return pct={r.ret30} />,
      sortValue: (r) => r.ret30,
    },
    {
      key: "ret90",
      header: "Rend. 90d",
      align: "right",
      render: (r) => <Return pct={r.ret90} />,
      sortValue: (r) => r.ret90,
    },
    {
      key: "flujo",
      header: "Flujo 30d",
      align: "right",
      render: (r) => (
        <div className="text-right">
          <div className="font-medium text-ink">{moneyShort(r.flow.net)}</div>
          <div className="text-[11px] text-slate-400">{pct(r.flow.ratio, 1)} patr.</div>
        </div>
      ),
      sortValue: (r) => r.flow.ratio,
    },
    {
      key: "alertas",
      header: "Alertas",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {r.alerts.Critica > 0 && <span className="rounded-full bg-critical-50 px-2 py-0.5 text-xs font-bold text-critical-600">{r.alerts.Critica}</span>}
          {r.alerts.Importante > 0 && <span className="rounded-full bg-warm-50 px-2 py-0.5 text-xs font-bold text-warm-600">{r.alerts.Importante}</span>}
          {r.alerts.Informativa > 0 && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{r.alerts.Informativa}</span>}
          {r.alerts.Critica === 0 && r.alerts.Importante === 0 && r.alerts.Informativa === 0 && (
            <span className="text-xs text-slate-300">—</span>
          )}
        </div>
      ),
      sortValue: (r) => r.alerts.Critica * 10 + r.alerts.Importante,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Cartera de productos"
        title="Fondos administrados"
        subtitle={`${rows.length} fondos · patrimonio total ${money(totalPatrimony(db))}`}
        right={
          <Link to="/analista" className="btn-ghost !text-xs">
            <Sparkles size={14} /> Consultar a la IA
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input w-full !pl-9"
            placeholder="Buscar por nombre o categoría…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">
          {filtered.length} de {rows.length} fondos
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <DataTable
          cols={cols}
          rows={filtered}
          rowKey={(r) => r.fund.id}
          onRowClick={(r) => navigate(`/fondos/${r.fund.id}`)}
          empty="No se encontraron fondos con ese criterio."
        />
      </Card>
    </div>
  );
}

export function Return({ pct: value }: { pct: number }) {
  const cls = value >= 0 ? "text-positive-600" : "text-critical-500";
  return <span className={`font-semibold ${cls}`}>{pct(value, 2)}</span>;
}