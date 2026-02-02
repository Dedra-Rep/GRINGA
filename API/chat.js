import OpenAI from "openai";

export default async function handler(req, res) {
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
        error: "OPENAI_API_KEY não configurada no servidor",
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
            "Você é o Mordomo.AI, um personal shopper especialista. " +
            "Responda sempre em português do Brasil. " +
            "Quando recomendar produtos, traga 3 opções com prós e contras e finalize com uma recomendação clara.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "Não consegui gerar uma resposta agora.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Erro OpenAI:", error);

    return res.status(500).json({
      error: "Erro interno ao processar a mensagem",
      details: String(error?.message || error),
    });
  }
}
