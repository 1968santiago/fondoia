import { useEffect, useState } from "react";

export interface AiStatus {
  state: "checking" | "ia" | "local";
  model?: string;
}

let cached: Promise<AiStatus> | null = null;

function probe(): Promise<AiStatus> {
  return fetch("/api/analyze", { method: "GET" })
    .then((r) => r.json().catch(() => null))
    .then((data): AiStatus => {
      if (data && data.configured) return { state: "ia", model: data.model };
      return { state: "local" };
    })
    .catch((): AiStatus => ({ state: "local" }));
}

export function useAiStatus(): AiStatus {
  const [status, setStatus] = useState<AiStatus>({ state: "checking" });
  useEffect(() => {
    if (!cached) cached = probe();
    cached.then(setStatus);
  }, []);
  return status;
}