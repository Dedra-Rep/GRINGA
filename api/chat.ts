import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY não configurada no Vercel");
  return key;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = (req.body || {}) as { message?: string };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Campo 'message' é obrigatório" });
    }

    const genAI = new GoogleGenerativeAI(getApiKey());

    // Você pode trocar o modelo depois; esse é um padrão seguro para chat.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Você é o Mordomo.top, um assistente de compras objetivo e educado.
Responda em pt-BR se o usuário escrever em português; em inglês se escrever em inglês.
Se o usuário pedir recomendações, diga que você pode sugerir 3 opções e que a lista vem no endpoint /api/recommendations.

Usuário: ${message}
`.trim();

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
