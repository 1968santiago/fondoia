import { Menu } from "lucide-react";
import { useAiStatus } from "../../hooks/useAiStatus";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const status = useAiStatus();
  const now = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onMenu}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <span className="text-[13px] font-medium capitalize text-slate-500">{now}</span>
        </div>
        <div
          className={`hidden items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset sm:inline-flex ${
            status.state === "checking"
              ? "bg-slate-50 text-slate-500 ring-slate-200"
              : status.state === "ia"
                ? "bg-positive-50 text-positive-700 ring-positive-100"
                : "bg-warm-50 text-warm-700 ring-warm-100"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status.state === "checking" ? "bg-slate-300" : status.state === "ia" ? "bg-positive-500" : "bg-warm-500"}`}
          />
          {status.state === "checking"
            ? "Verificando motor de IA…"
            : status.state === "ia"
              ? `Análisis IA activo · ${status.model}`
              : "Analista IA en modo demostración local"}
        </div>
      </div>
    </header>
  );
}