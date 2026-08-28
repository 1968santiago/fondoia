import type { AgentId } from "../../agents/registry";
import Chip from "../ui/Chip";

export default function AgentTag({ agentId, skillId }: { agentId: AgentId; skillId?: string }) {
  return (
    <Chip tone="brand">
      {agentId === "executive-analyst"
        ? "Analista Ejecutivo"
        : agentId === "fund-analyst"
          ? "Analista de Fondos"
          : "Monitor de Riesgos"}
      {skillId && <span className="text-slate-400">· skill {skillId}</span>}
    </Chip>
  );
}