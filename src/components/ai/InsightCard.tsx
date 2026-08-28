import { useCallback, useEffect, useState } from "react";
import { Sparkles, Send, Loader2, Cpu, RefreshCw } from "lucide-react";
import { analyzeAgent, type AnalysisResult } from "../../agents/engine";
import type { AgentId } from "../../agents/registry";
import AgentTag from "./AgentTag";
import { useAiStatus } from "../../hooks/useAiStatus";

export default function InsightCard({
  agentId,
  title,
  subtitle,
  fundId,
  investorId,
  defaultQuestion = "",
  className = "",
  accent = "brand",
}: {
  agentId: AgentId;
  title: string;
  subtitle?: string;
  fundId?: string;
  investorId?: string;
  defaultQuestion?: string;
  className?: string;
  accent?: "brand" | "warm" | "critical";
}) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const status = useAiStatus();

  const run = useCallback(
    async (question: string) => {
      setLoading(true);
      try {
        const res = await analyzeAgent({ agentId, question, fundId, investorId });
        setResult(res);
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [agentId, fundId, investorId]
  );

  useEffect(() => {
    run(defaultQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const accentBorder =
    accent === "warm" ? "border-l-warm-500" : accent === "critical" ? "border-l-critical-500" : "border-l-brand-600";

  return (
    <div className={`card overflow-hidden border-l-4 ${accentBorder}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            {subtitle && <p className="muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AgentTag agentId={agentId} skillId={result?.skillId} />
          <Chip status={status} />
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <AnalysisBody loading={loading} result={result} onRegen={() => run(result?.question || defaultQuestion)} />
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim() || loading) return;
            run(q.trim());
            setQ("");
          }}
        >
          <input
            className="input flex-1 bg-white"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              fundId
                ? "Hacé una pregunta sobre este fondo…"
                : investorId
                  ? "Hacé una pregunta sobre este inversor…"
                  : "Hacé una pregunta sobre el negocio…"
            }
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-primary !px-3"
            disabled={loading || !q.trim()}
            aria-label="Enviar pregunta"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Cpu size={12} />
          {result
            ? result.source === "ia"
              ? `Respuesta generada por ${result.agentName} con la skill ${result.skillName} · LLM en línea`
              : `Respuesta generada por ${result.agentName} con la skill ${result.skillName} · motor local de demostración`
            : "Los datos son ficticios y de uso académico."}
        </p>
      </div>
    </div>
  );
}

function Chip({ status }: { status: { state: string; model?: string } }) {
  return (
    <span
      className={`chip ${
        status.state === "checking"
          ? "bg-slate-100 text-slate-500 ring-slate-200"
          : status.state === "ia"
            ? "bg-positive-50 text-positive-700 ring-positive-100"
            : "bg-warm-50 text-warm-700 ring-warm-100"
      }`}
    >
      {status.state === "checking"
        ? "Verificando IA…"
        : status.state === "ia"
          ? `IA en línea · ${status.model}`
          : "Modo demo local"}
    </span>
  );
}

function AnalysisBody({
  loading,
  result,
  onRegen,
}: {
  loading: boolean;
  result: AnalysisResult | null;
  onRegen: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
        <Loader2 className="animate-spin" size={16} />
        Analizando la información…
      </div>
    );
  }
  if (!result) {
    return (
      <div className="flex items-center justify-between gap-3 py-4 text-sm text-slate-400">
        <span>No se pudo generar esta instancia del análisis.</span>
        <button onClick={onRegen} className="btn-ghost !py-1.5 !text-xs">
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    );
  }
  return <p className="prose-ai">{result.text}</p>;
}