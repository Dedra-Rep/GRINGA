import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Mensagem ausente" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um personal shopper especialista. Responda em português do Brasil.",
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
      details: String(error.message || error),
    });
  }
}
