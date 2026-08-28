export default async (req, context) => {
  if (req.method === "GET") {
    const key = context?.secrets?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    return new Response(
      JSON.stringify({
        ok: true,
        configured: Boolean(key),
        model: process.env.LLM_MODEL || "gpt-4o-mini",
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const key = context?.secrets?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response(
      JSON.stringify({ ok: false, error: "no key configured" }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "bad body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const base = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  const temperature = Number(body.temperature ?? 0.3);

  try {
    const resp = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: 900,
        messages: [
          { role: "system", content: String(body.system || "") },
          { role: "user", content: String(body.user || "") },
        ],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return new Response(
        JSON.stringify({ ok: false, error: "upstream", detail: err.slice(0, 500) }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return new Response(
        JSON.stringify({ ok: false, error: "empty completion" }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ ok: true, text, model }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: "exception", detail: String(e) }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }
};