import { RULES } from "../../rules/engine";
import { SKILLS } from "../../skills";
import { AGENTS } from "../../agents/registry";
import { useAiStatus } from "../../hooks/useAiStatus";

export default function Footer() {
  const status = useAiStatus();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200/70 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white">
              V
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-ink">Valo FCI</div>
              <div className="text-xs text-slate-500">Demo académica · MVP</div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Tablero ejecutivo de demostración para fondos comunes de inversión. Todos los datos son
            ficticios, generados localmente en el navegador con una semilla fija, y tienen fines
            exclusivamente académicos. No se utilizan datos reales de clientes ni información
            confidencial. No se requiere login ni instalación.
          </p>
        </div>

        <FooterCol
          title="Reglas (rules)"
          items={RULES.map((r) => ({ name: r.name, desc: r.description }))}
        />

        <FooterCol
          title="Skills"
          items={SKILLS.map((s) => ({ name: s.name, desc: s.purpose }))}
        />

        <FooterCol
          title="Agentes personalizados"
          items={AGENTS.map((a) => ({ name: a.name, desc: a.role }))}
        />

        <FooterCol
          title="LLM utilizado"
          items={[
            {
              name: status.model || "gpt-4o-mini",
              desc:
                status.state === "ia"
                  ? "Modelo de OpenAI consultado en línea desde una Netlify Function; la API key se guarda como variable de entorno, nunca en el código."
                  : "Modelo de OpenAI (gpt-4o-mini) configurado vía variable de entorno. Sin API key activa, responde el motor local determinístico de demostración.",
            },
          ]}
        />
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-semibold text-slate-600">Modelo de IA:</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${status.state === "checking" ? "bg-slate-300" : status.state === "ia" ? "bg-positive-500" : "bg-warm-500"}`}
              />
              {status.state === "checking"
                ? "Verificando…"
                : status.state === "ia"
                  ? `LLM en línea (${status.model}) vía Netlify Function · clave en variables de entorno, no en el código`
                  : "Motor determinístico local (demostración) · activá la API key en Netlify para usar el LLM"}
            </span>
          </div>
          <div className="text-right text-slate-400">
            <div className="font-semibold text-slate-500">
              Trabajo Práctico Integrador · Módulo Finanzas · Postgrado de Inteligencia Artificial
              UCEMA 2026
            </div>
            <div className="mt-1">MVP de finanzas con agentes IA · Agosto 2026 · Santiago Brandán</div>
            <div className="mt-1">© {year} Valo FCI · Datos ficticios de uso académico · Sin costo · Sin login</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: Array<{ name: string; desc: string }> }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it.name}>
            <div className="text-sm font-semibold text-ink">{it.name}</div>
            <div className="text-xs leading-relaxed text-slate-500">{it.desc}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}