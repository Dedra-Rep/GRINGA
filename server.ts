import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { REGION_CONFIGS } from "./src/constants";

// Initialize environment variables from .env
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // 1. Basic Security Headers (configured to be friendly with iframes in development/AI Studio)
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // 2. CORS setup restricted for security and compatibility
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Same-origin or server-to-server requests
      const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
      const isSandboxRun = origin.includes("run.app"); // AI Studio live preview cloud run URL
      
      if (allowedOrigins.includes(origin) || isLocalhost || isSandboxRun) {
        return callback(null, true);
      }
      return callback(new Error("CORS Policy: Request origin not allowed."), false);
    },
    credentials: true,
  }));

  // 3. Request limits to prevent Denial of Service and buffer overflows
  app.use(express.json({ limit: "1mb" }));

  // Initialize Gemini Client lazily to protect startup if key is missing
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing on the server. Please define it in your environment or .env file.");
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development",
      features: {
        geminiActive: !!process.env.GEMINI_API_KEY,
        port: PORT
      }
    });
  });

  // Core Care Engine processing logic
  const handleCareRequest = async (req: express.Request, res: express.Response) => {
    try {
      const { query, locale } = req.body;
      const currentLocale = (locale === "en-US" || locale === "pt-BR") ? locale : "pt-BR";
      const isBR = currentLocale === "pt-BR";

      // Validation 1: Require user message
      if (!query || typeof query !== "string" || query.trim() === "") {
        const errorMsg = isBR 
          ? "A mensagem de cuidado é obrigatória." 
          : "The care message is required.";
        return res.status(400).json({ error: "Validation Error", message: errorMsg });
      }

      // Validation 2: Message length limit (1500 chars)
      if (query.length > 1500) {
        const errorMsg = isBR 
          ? "Sua mensagem é um pouco longa demais. Para que o Mordomo cuide com precisão, tente reduzir para até 1500 caracteres." 
          : "Your message is a bit too long. To enable the Mordomo to care with precision, please shorten it to 1500 characters.";
        return res.status(400).json({ error: "Validation Error", message: errorMsg });
      }

      const ai = getGeminiClient();
      const config = REGION_CONFIGS[currentLocale] || REGION_CONFIGS["pt-BR"];

      const systemInstruction = `
        Você é o "Mordomo.AI — Sistema de Cuidado Inteligente".
        
        O Mordomo.AI é um Sistema de Cuidado Inteligente. Ele fala em português brasileiro natural (ou inglês se o locale for en-US), com clareza, proximidade e discrição. Ele ajuda o usuário a lembrar, organizar e priorizar o que realmente importa. Nunca usa formalidade artificial. Nunca promete executar ações reais que ainda não existem. Sempre transforma preocupações em próximo passo simples.
        
        REGRAS DE TOM E LINGUAGEM:
        - NUNCA use "senhor", "sir", "meu caro", "patrão", "chefe", "amigo" ou tratamentos bajuladores e exagerados.
        - EVITE formalidade excessiva de robô, tom motivacional de coach ou tom terapêutico forçado.
        - Quando souber o nome do usuário, use o primeiro nome com naturalidade. Quando não souber, use "você" ou fale de forma neutra, sem inventar nomes.
        - Ajude a lembrar, organizar e priorizar com clareza e discrição.
        
        REGRAS DE CONTEÚDO (NÃO PROMETER O QUE NÃO FAZ):
        - Nunca prometa executar ações físicas ou reais diretamente se a funcionalidade não existir.
        - NÃO use expressões como: "vou pagar", "vou cancelar", "vou ligar", "vou enviar", "vou resolver sozinho".
        - Em vez disso, use expressões como: "posso te ajudar a organizar", "posso preparar um lembrete", "posso montar um plano", "posso deixar isso registrado", "posso sugerir o próximo passo".
        - Sempre transforme preocupações e problemas em um próximo passo simples de acompanhar.

        CRITICAL DELIVERY RULE:
        - Você DEVE SEMPRE fornecer exatamente 3 recomendações ou próximos passos práticos de cuidado no array 'recommendations' do JSON.
        - Essas recomendações representam passos ou recursos sugeridos (como livros de bem-estar, organizadores, acessórios ergonômicos ou ferramentas práticas de cuidado) disponíveis na Amazon para dar suporte ao cuidado do usuário.
        - A entrega DEVE ser um objeto JSON contendo a chave 'text' (com sua resposta elegante, próxima e discreta em linguagem natural) e a chave 'OUTPUT' contendo um objeto com o array 'recommendations' de exatamente 3 itens.

        ${isBR ? `
        ESPECIFICAÇÕES DO MERCADO BRASILEIRO (pt-BR):
        1. PLATAFORMA: Sugira itens úteis da Amazon.com.br que deem suporte à necessidade do usuário.
        2. LINKS DE AFILIADO: Construa a target_url de cada recomendação usando EXATAMENTE este template:
           https://www.amazon.com.br/s?k={TERMOS_DE_BUSCA_DO_PRODUTO_OU_RECURSO}&tag=${config.amazonId}
        3. PREÇOS: Forneça preços estimados em Reais (R$) ou coloque "Recurso Sugerido" ou "Sob Consulta".
        4. IDIOMA: Sua resposta 'text' e todos os campos no JSON devem estar em PORTUGUÊS (pt-BR).
        ` : `
        USA MARKET SPECIFICATIONS (en-US):
        1. PLATFORM: Suggest useful items from Amazon.com to support the user's need.
        2. AFFILIATE LINKS: Construct the target_url of each recommendation using EXATAMENTE this template:
           https://www.amazon.com/s?k={PRODUCT_OR_RESOURCE_SEARCH_KEYWORDS}&tag=${config.amazonId}
        3. PRICING: Provide estimated prices in USD ($) or use "Suggested Resource" or "On Request".
        4. LANGUAGE: Your response 'text' and all fields in the JSON MUST be in ENGLISH.
        `}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: query,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Elegant butler introduction/response." },
              OUTPUT: {
                type: Type.OBJECT,
                properties: {
                  recommendations: {
                    type: Type.ARRAY,
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        rank: { type: Type.NUMBER },
                        label: { type: Type.STRING },
                        platform: { type: Type.STRING, enum: ["ebay", "amazon"] },
                        title: { type: Type.STRING },
                        price_estimate: { type: Type.STRING },
                        why: { type: Type.ARRAY, items: { type: Type.STRING } },
                        target_url: { type: Type.STRING },
                        cta_text: { type: Type.STRING }
                      },
                      required: ["rank", "label", "platform", "title", "price_estimate", "why", "target_url", "cta_text"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            },
            required: ["text", "OUTPUT"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web && chunk.web.title && chunk.web.uri)
        .map(chunk => ({ title: chunk.web!.title!, uri: chunk.web!.uri! })) || [];

      res.json({ ...result, sources });
    } catch (e: any) {
      console.error("Server-side Gemini Care Failure:", e);
      res.status(500).json({
        error: "Mordomo Care Processing Error",
        message: "Não consegui processar a instrução de cuidado no momento. Por favor, tente novamente de forma breve."
      });
    }
  };

  // API Route: POST /api/mordomo-care (Official secure care route)
  app.post("/api/mordomo-care", handleCareRequest);

  // API Route: POST /api/recommendations (Preserved for backward compatibility)
  app.post("/api/recommendations", handleCareRequest);

  // API Route: Text-To-Speech
  app.post("/api/speak", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing required 'text' parameter." });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        return res.status(500).json({ error: "No audio data returned from Gemini." });
      }

      res.json({ audio: base64Audio });
    } catch (e: any) {
      console.error("Server-side Speech Engine Failure:", e);
      res.status(500).json({
        error: "Speech Engine Failure",
        message: "Não consegui processar o sintetizador de voz."
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Express Error Handler to prevent white screens or crash leaking
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Uncaught Server Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Algo deu errado de forma inesperada. O Mordomo está reiniciando os sistemas."
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
