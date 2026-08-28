import { NavLink } from "react-router-dom";
import { LayoutDashboard, Coins, Users, Sparkles, X } from "lucide-react";
import { RULES } from "../../rules/engine";
import { SKILLS } from "../../skills";
import { AGENTS } from "../../agents/registry";
import { useAiStatus } from "../../hooks/useAiStatus";

const NAV = [
  { to: "/", label: "Dashboard", hint: "Vista ejecutiva", icon: LayoutDashboard, end: true },
  { to: "/fondos", label: "Fondos", hint: "Análisis por fondo", icon: Coins, end: false },
  { to: "/inversores", label: "Inversores", hint: "Carteras y clientes", icon: Users, end: false },
  { to: "/analista", label: "Analista IA", hint: "Consultas en lenguaje natural", icon: Sparkles, end: false },
];

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white shadow-sm">
        V
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-bold tracking-tight text-ink">Valo FCI</div>
        <div className="text-[11px] font-medium text-slate-500">Fondos comunes de inversión</div>
      </div>
    </div>
  );
}

function AiMiniCard() {
  const status = useAiStatus();
  return (
    <div className="rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-200/70 p-3">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        <span>Motor de IA</span>
        <span
          className={`h-2 w-2 rounded-full ${status.state === "checking" ? "bg-slate-300" : status.state === "ia" ? "bg-positive-500" : "bg-warm-500"}`}
        />
      </div>
      <div className="mt-1 text-xs font-medium text-ink">
        {status.state === "checking"
          ? "Verificando…"
          : status.state === "ia"
            ? `IA en línea · ${status.model}`
            : "Modo demostración local"}
      </div>
      <div className="mt-2.5 space-y-0.5 text-[11px] text-slate-500">
        <div>{AGENTS.length} agentes · {SKILLS.length} skills · {RULES.length} reglas</div>
      </div>
    </div>
  );
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const content = (
    <div className="flex h-full w-64 flex-col bg-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Brand />
        <button
          className="rounded-lg p-1.5 text-slate-400 hover:text-ink lg:hidden"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                isActive
                  ? "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-ink"
              }`
            }
          >
            <item.icon size={19} strokeWidth={2} />
            <span className="leading-tight">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-[11px] text-slate-400">{item.hint}</span>
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 pb-5">
        <AiMiniCard />
        <p className="mt-4 text-[10px] leading-relaxed text-slate-400">
          Demo académica con datos 100% ficticios. Sin fines comerciales.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
          <div className="absolute inset-y-0 left-0">{content}</div>
        </div>
      )}
    </>
  );
}