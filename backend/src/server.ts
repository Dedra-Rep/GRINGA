import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();


// Healthcheck (required for Vercel rewrite validation)
app.get("/api", (_req, res) => res.status(200).json({ status: "ok", service: "gringa-backend" }));

/**
 * CORS: deixe liberado por enquanto para destravar.
 * Depois a gente restringe para o domínio do Vercel.
 */

/*__API_HEALTH_ALIASES__*/
app.get(["/", "/health", "/api", "/api/health"], (_req, res) => {
  return res.status(200).json({ status: "ok", service: "gringa-backend" });
});
/*__END_API_HEALTH_ALIASES__*/

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const BACKEND_TOKEN = process.env.BACKEND_TOKEN || "";

/**
 * Se BACKEND_TOKEN estiver definido no Cloud Run, exigimos o header:
 *   x-backend-token: <token>
 */
function requireToken(req: express.Request, res: express.Response): boolean {
  if (!BACKEND_TOKEN) return true; // sem token configurado => não bloqueia
  const got = (req.header("x-backend-token") || "").trim();
  if (!got || got !== BACKEND_TOKEN) {
    res.status(401).json({ error: "Unauthorized: missing/invalid x-backend-token" });
    return false;
  }
  return true;
}

app.get("/", (_req, res) => res.status(200).send("gringa-backend OK"));
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

/**
 * POST /api/recommendations
 * O frontend espera JSON com chave OUTPUT: { recommendations: [...] }
 */
app.post("/api/recommendations", async (req, res) => {
  try {
    if (!requireToken(req, res)) return;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });
    }

    const { context } = req.body || {};
    const userText =
      (context?.text || context?.query || context?.message || "").toString().trim();

    if (!userText) {
      return res.status(400).json({ error: "Missing context.text/query/message" });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Você é um personal shopper premium para Brasil.
Gere exatamente 3 recomendações de produtos para a necessidade abaixo.
Responda APENAS em JSON válido, sem markdown, sem texto extra.

NECESSIDADE: ${JSON.stringify(userText)}

FORMATO EXATO:
{
  "OUTPUT": {
    "recommendations": [
      {
        "title": "string",
        "label": "string (ex: Melhor custo-benefício)",
        "platform": "amazon",
        "price_estimate": "string (ex: R$ 199-249)",
        "cta_text": "string (ex: Ver na Amazon)",
        "target_url": "string (url pesquisável ou genérica, pode ser https://www.amazon.com.br/s?k=... )",
        "why": ["string","string","string"]
      }
    ]
  },
  "sources": []
}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // tenta parsear JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // fallback: devolve algo mínimo para o frontend não quebrar
      data = {
        OUTPUT: {
          recommendations: [
            {
              title: "Sugestão 1 (fallback)",
              label: "Fallback",
              platform: "amazon",
              price_estimate: "",
              cta_text: "Ver opções",
              target_url: `https://www.amazon.com.br/s?k=${encodeURIComponent(userText)}`,
              why: ["Resposta não veio em JSON perfeito", "Estamos ajustando o modelo", "Tente novamente"]
            },
            {
              title: "Sugestão 2 (fallback)",
              label: "Fallback",
              platform: "amazon",
              price_estimate: "",
              cta_text: "Ver opções",
              target_url: `https://www.amazon.com.br/s?k=${encodeURIComponent(userText)}`,
              why: ["Fallback automático", "Para não travar a UI", "Tente novamente"]
            },
            {
              title: "Sugestão 3 (fallback)",
              label: "Fallback",
              platform: "amazon",
              price_estimate: "",
              cta_text: "Ver opções",
              target_url: `https://www.amazon.com.br/s?k=${encodeURIComponent(userText)}`,
              why: ["Fallback automático", "Para não travar a UI", "Tente novamente"]
            }
          ]
        },
        sources: []
      };
    }

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`gringa-backend listening on :${PORT}`);
});

app.get('/api', (_req, res) => res.status(200).json({ status: 'ok', service: 'gringa-backend' }));
app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }));
