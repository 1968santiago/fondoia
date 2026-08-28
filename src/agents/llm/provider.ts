export interface OnlineResult {
  text: string;
  model?: string;
  source: "ia";
}

export async function llmAnalyze(
  system: string,
  user: string
): Promise<OnlineResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ system, user, temperature: 0.3 }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.ok && typeof data.text === "string" && data.text.trim()) {
      return { text: data.text.trim(), model: data.model, source: "ia" };
    }
    return null;
  } catch {
    return null;
  }
}