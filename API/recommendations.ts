import type { VercelRequest, VercelResponse } from "@vercel/node";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.VITE_GEMINI_API_KEY;

const AMAZON_TAG_BR = process.env.AMAZON_ASSOCIATES_TAG_BR || "mordomoai-20";

// (Opcional) se quiser aplicar tracking do eBay depois, a gente liga aqui.
const EBAY_CAMPAIGN_ID = process.env.EBAY_CAMPAIGN_ID || "";
const EBAY_CUSTOM_ID = process.env.EBAY_CUSTOM_ID || "";

function buildAmazonSearchLink(query: string) {
  const q = encodeURIComponent(query.trim());
  return `https://www.amazon.com.br/s?k=${q}&tag=${encodeURIComponent(AMAZON_TAG_BR)}`;
}

function buildEbaySearchLink(query: string) {
  const q = encodeURIComponent(query.trim());
  // Link simples (sem rover). Se você já tiver o rover/campaign pronto, eu adapto.
  // Mantém funcionando agora.
  let url = `https://www.ebay.com/sch/i.html?_nkw=${q}`;
  if (EBAY_CUSTOM_ID) url += `&customid=${encodeURIComponent(EBAY_CUSTOM_ID)}`;
  if (EBAY_CAMPAIGN_ID) url += `&campid=${encodeURIComponent(EBAY_CAMPAIGN_ID)}`;
  return url;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing Gemini API key",
        hint: "Configure GEMINI_API_KEY (or GOOGLE_API_KEY) in Vercel Environment Variables."
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Aceita:
    // { query: "..." }  ou { message: "..." } ou { prompt: "..." }
    const query: string = body?.query || body?.message || body?.prompt || "";

    // Opcional: "market" para você controlar no frontend:
    // "BR" -> Amazon BR / "US" -> eBay US (ou Amazon US depois)
    const market: "BR" | "US" = (body?.market || "US").toUpperCase() === "BR" ? "BR" : "US";

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing query in request body." });
    }

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(GEMINI_API_KEY);

    const systemHint = `
You are a shopping assistant.
Return EXACTLY valid JSON (no markdown, no commentary), with this shape:

{
  "recommendations": [
    {
      "title": "string",
      "why": "string (1-2 sentences)",
      "query": "string (best search keywords)",
      "label": "string (e.g., Best value / Top pick / Premium)",
      "priceHint": "string (optional, can be empty)"
    }
  ]
}

Rules:
- recommendations MUST be an array of exactly 3 items.
- Keep titles short.
- Focus on the user's intent and the market (${market}).
`;

    const geminiResp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemHint }] },
          { role: "user", parts: [{ text: `User query: ${query}` }] }
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

    // Tenta parsear o JSON retornado
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // fallback robusto: tenta extrair o primeiro bloco JSON
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Gemini did not return JSON");
      parsed = JSON.parse(m[0]);
    }

    const recs = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];

    // Normaliza: garante 3 itens
    const normalized = recs.slice(0, 3).map((r: any) => {
      const title = String(r?.title || "").trim();
      const why = String(r?.why || "").trim();
      const q = String(r?.query || title || query).trim();
      const label = String(r?.label || "").trim();
      const priceHint = String(r?.priceHint || "").trim();

      const link =
        market === "BR" ? buildAmazonSearchLink(q) : buildEbaySearchLink(q);

      return {
        title: title || q,
        why,
        label,
        priceHint,
        link
      };
    });

    return res.status(200).json({
      ok: true,
      market,
      query,
      recommendations: normalized
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message || String(err)
    });
  }
}
