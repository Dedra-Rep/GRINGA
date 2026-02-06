import type { VercelRequest, VercelResponse } from "@vercel/node";

// Se você já usa outra variável, pode manter.
// Aqui suportamos 3 nomes pra não quebrar nada:
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.VITE_GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS básico (se você chamar do browser)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing Gemini API key",
        hint: "Configure GEMINI_API_KEY (or GOOGLE_API_KEY) in Vercel Environment Variables."
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Aceita formatos comuns:
    // { message: "..." }
    // { prompt: "..." }
    // { text: "..." }
    // { messages: [{role:'user', content:'...'}] }
    const message: string =
      body?.message ||
      body?.prompt ||
      body?.text ||
      body?.messages?.slice?.(-1)?.[0]?.content ||
      "";

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message in request body." });
    }

    // Chamando Gemini via REST (não depende de SDK, mais estável no serverless)
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(GEMINI_API_KEY);

    const geminiResp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ]
      })
    });

    const data = await geminiResp.json();

    if (!geminiResp.ok) {
      return res.status(geminiResp.status).json({
        error: "Gemini request failed",
        details: data
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") ||
      "";

    return res.status(200).json({
      ok: true,
      reply: text,
      raw: data
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message || String(err)
    });
  }
}
