import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Send,
  Loader2,
  Cpu,
  Bot,
  Briefcase,
  ShieldAlert,
  UserRound,
  Wand2,
  GitBranch,
  BookOpen,
} from "lucide-react";
import { getDB } from "../data/store";
import { analyzeAgent, type AnalysisResult } from "../agents/engine";
import { routeIntent, AGENTS, type AgentId } from "../agents/registry";
import { SKILLS } from "../skills";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Chip from "../components/ui/Chip";

type AgentSel = "auto" | AgentId;

interface Msg {
  id: number;
  role: "user" | "assistant";
  text: string;
  meta?: {
    agentName: string;
    skillId: string;
    skillName: string;
    source: "ia" | "local";
    model?: string;
  };
}

const SUGGESTIONS = [
  "¿Cómo está el flujo neto del último mes?",
  "¿Qué fondo rinde más en los últimos 30 días?",
  "¿Hay riesgos que requieran atención?",
  "Resumí el estado del negocio para el gerente.",
];

const AGENT_META: Record<string, { icon: typeof Bot; cls: string }> = {
  "executive-analyst": { icon: Briefcase, cls: "bg-brand-50 text-brand-700" },
  "fund-analyst": { icon: Bot, cls: "bg-positive-50 text-positive-700" },
  "risk-monitor": { icon: ShieldAlert, cls: "bg-warm-50 text-warm-700" },
};

export default function AnalystPage() {
  const db = useMemo(() => getDB(), []);
  const [params] = useSearchParams();
  const entityId = useMemo(() => {
    let fundId: string | undefined;
    let investorId: string | undefined;
    const f = db.funds.find((x) => x.id === params.get("fondo") || x.shortName === params.get("fondo") || x.name.toLowerCase() === (params.get("fondo") || "").toLowerCase());
    if (params.get("fondo")) fundId = f ? f.id : params.get("fondo") || undefined;
    const inv = db.investors.find((x) => x.id === params.get("inversor"));
    if (params.get("inversor")) investorId = inv ? inv.id : params.get("inversor") || undefined;
    return { fundId, investorId };
  }, [db, params]);

  const [agentSel, setAgentSel] = useState<AgentSel>("auto");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const fundName = useMemo(
    () => (entityId.fundId ? db.funds.find((f) => f.id === entityId.fundId)?.name : undefined),
    [db, entityId.fundId]
  );
  const investorName = useMemo(
    () =>
      entityId.investorId
        ? db.investors.find((i) => i.id === entityId.investorId)?.legalName
        : undefined,
    [db, entityId.investorId]
  );

  const push = (m: Omit<Msg, "id">) => {
    setMessages((prev) => [...prev, { ...m, id: ++idRef.current }]);
  };

  const send = async (raw: string) => {
    const q = raw.trim();
    if (!q || busy) return;
    push({ role: "user", text: q });
    setInput("");
    setBusy(true);

    try {
      let agentId: AgentId =
        agentSel === "auto" ? routeIntent(q) : agentSel;
      if (agentSel === "auto" && entityId.fundId && agentId === "executive-analyst") {
        agentId = "fund-analyst";
      }

      let fundId = entityId.fundId;
      if (!fundId) {
        const match = db.funds.find(
          (f) =>
            q.toLowerCase().includes(f.shortName.toLowerCase()) ||
            q.toLowerCase().includes(f.name.toLowerCase())
        );
        if (match) fundId = match.id;
      }

      const res: AnalysisResult = await analyzeAgent({
        agentId,
        question: q,
        fundId,
        investorId: entityId.investorId,
      });
      push({
        role: "assistant",
        text: res.text,
        meta: {
          agentName: res.agentName,
          skillId: res.skillId,
          skillName: res.skillName,
          source: res.source,
          model: res.model,
        },
      });
    } catch {
      push({
        role: "assistant",
        text: "No se pudo completar el análisis en este momento. Intentalo nuevamente.",
        meta: { agentName: "Analista IA", skillId: "executive-report", skillName: "Informe ejecutivo", source: "local" },
      });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (entityId.fundId && fundName && !messages.length) {
      send(`Analizá el estado actual del fondo ${fundName}.`);
    } else if (entityId.investorId && investorName && !messages.length) {
      send(`Evaluá el perfil y la composición del inversor ${investorName}.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, fundName, investorName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const suggestions = entityId.fundId
    ? ["Analizá el rendimiento y los flujos de este fondo.", "¿Qué riesgos presenta este fondo?"]
    : entityId.investorId
      ? ["¿Está bien diversificada esta cartera?", "¿Coincide el perfil con la exposición?"]
      : SUGGESTIONS;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Inteligencia artificial"
        title="Analista IA"
        subtitle="Consultá en lenguaje natural: la IA elige el agente, aplica sus skills sobre los datos y responde en lenguaje ejecutivo."
      />

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Agente a cargo
            </div>
            <div className="mt-3 space-y-2">
              <AgentOption
                active={agentSel === "auto"}
                onClick={() => setAgentSel("auto")}
                icon={Wand2}
                name="Asignación automática"
                desc="El sistema elige el agente según tu pregunta"
                cls="bg-slate-100 text-slate-600"
              />
              {AGENTS.map((a) => {
                const meta = AGENT_META[a.id];
                return (
                  <AgentOption
                    key={a.id}
                    active={agentSel === a.id}
                    onClick={() => setAgentSel(a.id)}
                    icon={meta.icon}
                    name={a.name}
                    desc={a.role}
                    cls={meta.cls}
                  />
                );
              })}
            </div>
          </Card>

          <Card className="hidden p-4 lg:block">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cómo funciona
            </div>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-500">
              <Step icon={UserRound} text="El Gerente General hace una pregunta en lenguaje natural." />
              <Step icon={Wand2} text="Un enrutador asigna el agente especializado (o lo elegís manualmente)." />
              <Step icon={BookOpen} text="El agente carga su skill (instrucciones reutilizables) y la data relacionada." />
              <Step icon={GitBranch} text="Responde el LLM en línea o el motor local de demostración." />
            </ul>
          </Card>

          <Card className="hidden p-4 lg:block">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills</div>
            <ul className="mt-3 space-y-2.5">
              {SKILLS.map((s) => (
                <li key={s.id}>
                  <div className="text-xs font-semibold text-ink">{s.name}</div>
                  <div className="text-[11px] leading-snug text-slate-500">{s.purpose}</div>
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        <Card className="flex flex-col">
          <div
            ref={scrollRef}
            className="scrollbar-thin max-h-[62vh] min-h-[300px] flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:min-h-[380px] sm:px-5"
          >
            {!messages.length && !busy && (
              <IntroRow fundName={fundName} investorName={investorName} />
            )}
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {busy && (
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <Bot size={17} />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="animate-spin" size={15} />
                  El analista está procesando…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
            {suggestions.length > 0 && messages.length < 4 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100 transition hover:bg-brand-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                className="input flex-1 bg-white"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí una pregunta, en lenguaje natural…"
                disabled={busy}
              />
              <button type="submit" className="btn-primary !px-3" disabled={busy || !input.trim()} aria-label="Enviar">
                <Send size={16} />
              </button>
            </form>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Cpu size={12} /> Análisis generado sobre datos ficticios de demostración, sin datos reales de clientes.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AgentOption({
  active,
  onClick,
  icon: Icon,
  name,
  desc,
  cls,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Bot;
  name: string;
  desc: string;
  cls: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        active ? "bg-brand-50 ring-1 ring-inset ring-brand-200" : "hover:bg-slate-50"
      }`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${cls}`}>
        <Icon size={16} />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[13px] font-semibold text-ink">{name}</span>
        <span className="block truncate text-[11px] text-slate-400">{desc}</span>
      </span>
    </button>
  );
}

function Step({ icon: Icon, text }: { icon: typeof Bot; text: string }) {
  return (
    <li className="flex items-start gap-2">
      <Icon size={14} className="mt-0.5 shrink-0 text-brand-600" />
      <span>{text}</span>
    </li>
  );
}

function IntroRow({ fundName, investorName }: { fundName?: string; investorName?: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-slate-50 px-5 py-6 text-center ring-1 ring-inset ring-slate-100">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Sparkles size={24} />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink">
        {fundName
          ? `Analista listo para revisar ${fundName}`
          : investorName
            ? `Analista listo para revisar a ${investorName}`
            : "¿Qué necesitás saber?"}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
        Puedo resumir el estado del negocio, analizar fondos, flujos y rendimientos, o detectar
        situaciones que requieran tu atención. Probalo con las preguntas sugeridas.
      </p>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-700 px-4 py-2.5 text-sm leading-relaxed text-white">
          {msg.text}
        </div>
      </div>
    );
  }
  const m = msg.meta;
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Bot size={17} />
      </div>
      <div className="min-w-0 max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-100">
        {m && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Chip tone="brand">{m.agentName}</Chip>
            <Chip tone="slate">skill {m.skillId}</Chip>
            <Chip tone={m.source === "ia" ? "positive" : "warm"}>
              {m.source === "ia" ? `LLM en línea${m.model ? ` · ${m.model}` : ""}` : "Motor local (demo)"}
            </Chip>
          </div>
        )}
        <p className="prose-ai">{msg.text}</p>
      </div>
    </div>
  );
}