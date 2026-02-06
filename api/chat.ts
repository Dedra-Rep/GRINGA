import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

function isPt(text: string) {
  return /[áàâãéêíóôõúç]|(?:\b(para|com|por|que|uma|um|você|vocês|isso|esse|essa|aqui|agora)\b)/i.test(
    text
  );
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
        ok: false,
        error: "Missing Gemini API key",
        hint: "Configure GEMINI_API_KEY (or GOOGLE_API_KEY) in Vercel Environment Variables."
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const message: string = body?.message || body?.query || body?.prompt || "";

    if (!message || typeof message !== "string") {
      return res.status(400).json({ ok: false, error: "Campo 'message' é obrigatório" });
    }

    const lang = isPt(message) ? "pt-BR" : "en-US";

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt =
      lang === "pt-BR"
        ? `Você é o Mordomo.top, um assistente de compras objetivo e educado.
Responda SEM markdown.
Se o usuário pedir recomendações, diga que você pode sugerir 3 opções e que a lista vem do endpoint /api/recommendations.

Usuário: ${message}`
        : `You are Mordomo.top, a concise and polite shopping assistant.
Reply with plain text (no markdown).
If the user asks for recommendations, say you can suggest 3 options and that the list comes from /api/recommendations.

User: ${message}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text() || "";

    return res.status(200).json({ ok: true, reply });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro interno"
    });
  }
}
