import { getDB } from "../data/store";
import { AGENTS, agentById, type AgentId } from "./registry";
import { skillById } from "../skills";
import { contextFor } from "./context";
import { llmAnalyze } from "./llm/provider";
import { fallbackReply } from "./llm/fallback";

export interface AnalysisInput {
  agentId: AgentId;
  question: string;
  fundId?: string;
  investorId?: string;
}

export interface AnalysisResult {
  text: string;
  source: "ia" | "local";
  model?: string;
  agentId: AgentId;
  agentName: string;
  skillId: string;
  skillName: string;
  question: string;
}

export async function analyzeAgent(input: AnalysisInput): Promise<AnalysisResult> {
  const db = getDB();
  const agent = agentById(input.agentId) || AGENTS[0];
  const skill = skillById(agent.primarySkill);

  const built = contextFor(db, input.agentId, {
    fundId: input.fundId,
    investorId: input.investorId,
  });
  const ctxRaw = built ? built.raw : "Sin contexto disponible para esta consulta.";

  const system = [
    agent.systemPrompt,
    "",
    `Skill aplicada: ${skill.name}.`,
    skill.instructions,
    "",
    "Formato de salida:",
    skill.outputFormat,
    "",
    "Los datos son ficticios y tienen fines exclusivamente académicos de demostración.",
  ].join("\n");

  const user = `Pregunta del Gerente General: "${input.question || "Generá el resumen ejecutivo del estado actual."}"\n\nDATOS ACTUALES DISPONIBLES:\n${ctxRaw}`;

  const online = await llmAnalyze(system, user);

  if (online && online.source === "ia") {
    return {
      text: online.text,
      source: "ia",
      model: online.model,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      question: input.question,
    };
  }

  const text = fallbackReply(agent.id, input.question, built?.ctx);
  return {
    text,
    source: "local",
    agentId: agent.id,
    agentName: agent.name,
    skillId: skill.id,
    skillName: skill.name,
    question: input.question,
  };
}