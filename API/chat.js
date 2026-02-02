import OpenAI from "openai";

export default async function handler(req, res) {
  // 🔎 Health check para GET no navegador
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      service: "Mordomo API",
      method: "Use POST with { message }",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem ausente ou inválida" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não configurada no servidor",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é um personal shopper especialista. Responda em português do Brasil. " +
            "Quando recomendar produtos, traga 3 opções com prós e contras e conclua com uma sugestão final.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao chamar a OpenAI",
      details: String(error?.message || error),
    });
  }
}
