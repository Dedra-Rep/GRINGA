import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS básico (mesma origem no Vercel normalmente nem precisa, mas não atrapalha)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido. Use POST." });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem ausente ou inválida" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ error: "OPENAI_API_KEY não configurada no servidor" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é o Mordomo, um personal shopper especialista. Responda em português do Brasil. " +
            "Quando recomendar produtos, traga 3 opções com prós e contras e conclua com uma sugestão final. " +
            "Se faltar informação (ex: orçamento, uso, preferência), faça 1-2 perguntas objetivas antes de recomendar."
        },
        { role: "user", content: message }
      ],
      temperature: 0.7
    });

    const reply = completion?.choices?.[0]?.message?.content ?? "";

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao chamar a OpenAI",
      details: String(error?.message || error)
    });
  }
}
