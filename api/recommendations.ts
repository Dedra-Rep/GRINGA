import type { VercelRequest, VercelResponse } from "@vercel/node";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.VITE_GEMINI_API_KEY;

const AMAZON_TAG_BR = process.env.AMAZON_ASSOCIATES_TAG_BR || "mordomoai-20";

// eBay tracking (US) — correto via rover
const EBAY_ROVER_PREFIX = (process.env.EBAY_ROVER_PREFIX || "").trim(); // termina com mpre=
const EBAY_CAMPAIGN_ID = (process.env.EBAY_CAMPAIGN_ID || "").trim();

function buildAmazonSearchLink(query: string) {
  const q = encodeURIComponent(query.trim());
  return `https://www.amazon.com.br/s?k=${q}&tag=${encodeURIComponent(AMAZON_TAG_BR)}`;
}

function buildEbayTrackedLink(targetUrl: string) {
  if (EBAY_ROVER_PREFIX) {
    return `${EBAY_ROVER_PREFIX}${encodeURIComponent(targetUrl)}`;
  }
  if (EBAY_CAMPAIGN_ID) {
    const prefix = `https://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=${encodeURIComponent(
      EBAY_CAMPAIGN_ID
    )}&toolid=10001&mpre=`;
    return `${prefix}${encodeURIComponent(targetUrl)}`;
  }
  return targetUrl; // sem tracking
}

function buildEbaySearchLink(query: string) {
  const q = encodeURIComponent(query.trim());
  const url = `https://www.ebay.com/sch/i.html?_nkw=${q}`;
  return buildEbayTrackedLink(url);
}

// fallback sem Gemini (não quebra em produção)
function fallbackRecommendations(query: string, market: "BR" | "US") {
  const base = [
    { title: `Top pick: ${query}`, why: "Mais recomendado para seu objetivo.", label: "Top pick" },
    { title: `Best value: ${query}`, why: "Equilíbrio entre custo e qualidade.", label: "Best value" },
    { title: `Premium: ${query}`, why: "Opções superiores (materiais/garantia).", label: "Premium" }
  ];

  return base.map((r) => {
    const link = market === "BR" ? buildAmazonSearchLink(query) : buildEbaySearchLink(query);
    return { ...r, priceHint: "", link };
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const query: string = body?.query || body?.message || body?.prompt || "";
    const market: "BR" | "US" = (String(body?.market || "US").toUpperCase() === "BR") ? "BR" : "US";

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing query in request body." });
    }

    // Se não tiver chave do Gemini, não quebra: devolve fallback
    if (!GEMINI_API_KEY) {
      return res.status(200).json({
        ok: true,
        market,
        query,
        mode: "fallback",
        recommendations: fallbackRecommendations(query, market)
      });
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
      // falhou? devolve fallback, não quebra
      return res.status(200).json({
        ok: true,
        market,
        query,
        mode: "fallback_due_to_gemini_error",
        geminiStatus: geminiResp.status,
        recommendations: fallbackRecommendations(query, market)
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") || "";

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) {
        return res.status(200).json({
          ok: true,
          market,
          query,
          mode: "fallback_due_to_invalid_json",
          recommendations: fallbackRecommendations(query, market)
        });
      }
      parsed = JSON.parse(m[0]);
    }

    const recs = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
    const normalized = recs.slice(0, 3).map((r: any) => {
      const title = String(r?.title || "").trim();
      const why = String(r?.why || "").trim();
      const q = String(r?.query || title || query).trim();
      const label = String(r?.label || "").trim();
      const priceHint = String(r?.priceHint || "").trim();

      const link = market === "BR" ? buildAmazonSearchLink(q) : buildEbaySearchLink(q);

      return {
        title: title || q,
        why,
        label,
        priceHint,
        link
      };
    });

    // garante 3 sempre
    while (normalized.length < 3) {
      normalized.push(...fallbackRecommendations(query, market).slice(normalized.length, 3));
    }

    return res.status(200).json({
      ok: true,
      market,
      query,
      mode: "gemini",
      recommendations: normalized.slice(0, 3)
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message || String(err)
    });
  }
}
