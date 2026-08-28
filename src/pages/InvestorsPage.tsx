import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Sparkles, Building2, User } from "lucide-react";
import { getDB } from "../data/store";
import { investorRows, type InvestorRow } from "../data/services/investors";
import { moneyShort, dateShort } from "../format";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import DataTable, { type Col } from "../components/ui/DataTable";
import Chip from "../components/ui/Chip";

type TypeFilter = "Todos" | "Persona Humana" | "Persona Jurídica";

export default function InvestorsPage() {
  const db = useMemo(() => getDB(), []);
  const rows = useMemo(() => investorRows(db), [db]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("Todos");
  const navigate = useNavigate();

  const filtered = rows.filter((r) => {
    const q = query.toLowerCase();
    const matchesQ = r.investor.legalName.toLowerCase().includes(q) || r.investor.province.toLowerCase().includes(q);
    const matchesType = type === "Todos" || r.investor.type === type;
    return matchesQ && matchesType;
  });

  const personas = rows.filter((r) => r.investor.type === "Persona Humana").length;
  const juridicas = rows.length - personas;

  const cols: Col<InvestorRow>[] = [
    {
      key: "nombre",
      header: "Inversor",
      render: (r) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">{r.investor.legalName}</span>
            {r.investor.type === "Persona Jurídica" ? (
              <Building2 size={13} className="shrink-0 text-slate-300" />
            ) : (
              <User size={13} className="shrink-0 text-slate-300" />
            )}
          </div>
          <div className="text-xs text-slate-400">{r.investor.type}</div>
        </div>
      ),
      sortValue: (r) => r.investor.legalName,
    },
    {
      key: "perfil",
      header: "Perfil",
      render: (r) => <Chip tone={r.investor.profile === "Conservador" ? "brand" : r.investor.profile === "Moderado" ? "slate" : "warm"}>{r.investor.profile}</Chip>,
    },
    {
      key: "provincia",
      header: "Provincia",
      render: (r) => <span className="text-slate-600">{r.investor.province}</span>,
      sortValue: (r) => r.investor.province,
    },
    {
      key: "patrimonio",
      header: "Patrimonio",
      align: "right",
      render: (r) => <span className="font-semibold text-ink">{moneyShort(r.patrimonio)}</span>,
      sortValue: (r) => r.patrimonio,
    },
    {
      key: "fondos",
      header: "Fondos",
      align: "right",
      render: (r) => r.fundsCount,
      sortValue: (r) => r.fundsCount,
    },
    {
      key: "aporte",
      header: "Aporte neto",
      align: "right",
      render: (r) => <span className="text-slate-600">{moneyShort(r.aporteNeto)}</span>,
      sortValue: (r) => r.aporteNeto,
    },
    {
      key: "ultima",
      header: "Última actividad",
      render: (r) => (
        <span className="text-slate-500">{r.lastTx ? dateShort(r.lastTx.date) : "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Clientes e inversores"
        title="Inversores"
        subtitle={`${rows.length} inversores · ${personas} personas humanas · ${juridicas} personas jurídicas`}
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
            placeholder="Buscar por nombre o provincia…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["Todos", "Persona Humana", "Persona Jurídica"] as TypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                type === t
                  ? "bg-brand-700 text-white"
                  : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t === "Persona Humana" ? "Personas" : t === "Persona Jurídica" ? "Empresas" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <DataTable
          cols={cols}
          rows={filtered}
          rowKey={(r) => r.investor.id}
          onRowClick={(r) => navigate(`/inversores/${r.investor.id}`)}
          empty="No se encontraron inversores con ese criterio."
        />
      </Card>
    </div>
  );
}