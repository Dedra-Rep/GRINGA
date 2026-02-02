import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS básico (opcional, mas ajuda caso o front use fetch com headers diferentes)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem ausente ou inválida" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não configurada no servidor",
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Você é um personal shopper especialista. Responda em português do Brasil. " +
            "Quando recomendar produtos, traga 3 opções com prós e contras e conclua com uma sugestão final.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion?.choices?.[0]?.message?.content ?? "";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("API/chat error:", error);
    return res.status(500).json({
      error: "Erro ao chamar a OpenAI",
      details: String(error?.message || error),
    });
  }
}
