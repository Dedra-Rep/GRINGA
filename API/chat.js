import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS (importante para estabilidade no browser)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem inválida" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não configurada no Vercel",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Você é o Mordomo.AI, um personal shopper especialista no Brasil. " +
            "Responda em português do Brasil, de forma educada e clara. " +
            "Quando recomendar produtos, traga 3 opções com prós e contras e finalize com uma sugestão.",
        },
        { role: "user", content: message },
      ],
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno no Mordomo",
      details: String(error?.message || error),
    });
  }
}
