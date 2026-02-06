import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.VITE_GEMINI_API_KEY;

const DEFAULT_MARKET: "BR" | "US" =
  (String(process.env.DEFAULT_MARKET || "US").toUpperCase() === "BR" ? "BR" : "US");

function looksLikePortuguese(text: string) {
  const t = (text || "").toLowerCase();
  return /[ãõçáéíóúâêôà]/.test(t) || /\b(você|vocês|preço|comprar|recomenda|indica|melhor|barato|caro)\b/.test(t);
}

function shouldFetchRecommendations(text: string) {
  const t = (text || "").toLowerCase();
  return /recomenda|recomendação|indica|indicação|melhor|top|opç|opcao|opção|comprar|compra|sugere|sugest|qual (eu|devo) comprar|custo|preço|barato|caro/.test(t);
}

async function fetchRecommendations(baseUrl: string, message: string, market: "BR" | "US") {
  const url = `${baseUrl.replace(/\/$/, "")}/api/recommendations`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: message, market })
  });

  // mesmo se der erro, não derruba o chat
  try {
    const data = await resp.json();
    if (data?.ok && Array.isArray(data?.recommendations)) return data.recommendations;
  } catch {}
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // aceita message, query ou prompt
    const message: string = body?.message || body?.query || body?.prompt || "";
    const market: "BR" | "US" =
      (String(body?.market || DEFAULT_MARKET).toUpperCase() === "BR") ? "BR" : "US";

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Campo 'message' é obrigatório." });
    }

    // base URL (para chamar /api/recommendations de forma absoluta)
    // Em produção na Vercel, isso resolve sozinho.
    const baseUrl =
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      (req.headers["x-forwarded-proto"] && req.headers.host
        ? `${req.headers["x-forwarded-proto"]}://${req.headers.host}`
        : "");

    // Se não tiver chave do Gemini, não quebra: responde simples + (se der) recomendações via endpoint
    if (!GEMINI_API_KEY) {
      const langIsPT = looksLikePortuguese(message);
      const recs =
        baseUrl && shouldFetchRecommendations(message)
          ? await fetchRecommendations(baseUrl, message, market)
          : null;

      const reply = langIsPT
        ? "Estou online. No momento o chat está em modo básico (sem IA), mas consigo te entregar 3 opções pelo /api/recommendations."
        : "I'm online. Chat is in basic mode (no AI), but I can still return 3 options via /api/recommendations.";

      return res.status(200).json({
        ok: true,
        market,
        mode: "fallback_no_key",
        reply,
        recommendations: recs || undefined
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const wantRecs = shouldFetchRecommendations(message);

    const system = `
You are Mordomo.top, a premium shopping assistant.
Rules:
- Reply in pt-BR if user writes Portuguese; otherwise reply in English.
- Be concise, practical, and ask 1 short follow-up question if needed.
- If user asks for product suggestions, you will provide a short answer AND (when available) attach 3 recommendations from /api/recommendations.
- Never output markdown code fences. Plain text only.
`.trim();

    const user = `User message: ${message}`;

    const result = await model.generateContent(`${system}\n\n${user}`);
    const reply = (result.response.text() || "").trim();

    // se o usuário pediu recomendação, tenta anexar
    const recs =
      baseUrl && wantRecs ? await fetchRecommendations(baseUrl, message, market) : null;

    return res.status(200).json({
      ok: true,
      market,
      mode: "gemini",
      reply,
      recommendations: recs || undefined
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro interno"
    });
  }
}
