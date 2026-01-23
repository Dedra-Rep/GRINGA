// services/geminiService.ts
import { Recommendation, InputContext, Locale, GroundingSource } from "../types";
import { REGION_CONFIGS } from "../constants";

type RecommendationsResponse = {
  success: boolean;
  text: string;
  OUTPUT: { recommendations: Recommendation[] };
  sources: GroundingSource[];
  error?: string;
};

type TTSResponse = {
  success: boolean;
  audioBase64?: string; // PCM 16-bit LE base64, 24kHz mono (padrão)
  sampleRate?: number;
  channels?: number;
  error?: string;
};

export class GeminiService {
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  private backendToken = import.meta.env.VITE_BACKEND_TOKEN as string | undefined;

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.backendToken) headers["x-backend-token"] = this.backendToken;
    return headers;
  }

  async getRecommendations(
    context: InputContext
  ): Promise<{ text: string; OUTPUT: any; sources: GroundingSource[] }> {
    const config = REGION_CONFIGS[context.locale];
    const isBR = context.locale === "pt-BR";

    // Mantém a mesma "inteligência de instrução" que você já tinha,
    // mas envia para o backend executar com Vertex/GenAI de forma segura.
    const systemInstruction = `
You are the "Mordomo.AI Elite Shopping Engine".
Your role is to act as a world-class personal shopper for the ${config.countryName} market.

CRITICAL DELIVERY RULE:
- You MUST ALWAYS provide EXACTLY 3 product recommendations.
- The delivery MUST be a JSON object containing an 'OUTPUT' key with a 'recommendations' array of 3 items.

${isBR ? `
BRAZIL MARKET SPECIFICATIONS (pt-BR):
1. PLATFORM: Recommend items from Amazon.com.br ONLY.
2. AFFILIATE LINKS: Construct the target_url using this template:
   https://www.amazon.com.br/s?k={PRODUCT_KEYWORDS}&tag=${config.amazonId}
3. PRICING: Provide estimated prices in BRL (R$).
4. LANGUAGE: Your response 'text' and all fields in the JSON MUST be in PORTUGUESE (pt-BR).
` : `
USA MARKET SPECIFICATIONS (en-US):
1. PLATFORM: Recommend items from eBay.com ONLY.
2. AFFILIATE LINKS: Construct the target_url using this template:
   https://www.ebay.com/sch/i.html?_nkw={PRODUCT_KEYWORDS}&mkrid=711-53200-19255-0&campid=${config.ebayId}&toolid=10001
3. PRICING: Provide estimated prices in USD ($).
4. LANGUAGE: Your response 'text' and all fields in the JSON MUST be in ENGLISH.
`}

TONE:
- Sophisticated, professional British butler (speaking the appropriate language).
- Concisely explain why these choices represent the best value/quality.
`.trim();

    try {
      if (!this.apiBaseUrl) {
        throw new Error("VITE_API_BASE_URL não definida no Vercel.");
      }

      const res = await fetch(`${this.apiBaseUrl}/api/recommendations`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          locale: context.locale,
          query: context.query,
          systemInstruction
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = (await res.json()) as RecommendationsResponse;

      // Mantém assinatura do seu app mesmo em falha
      if (!data?.success) {
        throw new Error(data?.error || "Falha no backend");
      }

      return {
        text: data.text,
        OUTPUT: data.OUTPUT,
        sources: data.sources || []
      };
    } catch (e) {
      console.error("Mordomo Engine Failure:", e);
      const errorText = isBR
        ? "Peço mil desculpas, senhor. Encontrei uma instabilidade nos dados do mercado brasileiro. Podemos tentar novamente?"
        : "I deeply apologize, sir. I encountered a momentary disruption in the market data feed. Shall we re-examine your request?";
      return { text: errorText, OUTPUT: { recommendations: [] }, sources: [] };
    }
  }

  async speak(text: string, locale: Locale): Promise<AudioBuffer | null> {
    try {
      if (!this.apiBaseUrl) return null;

      const res = await fetch(`${this.apiBaseUrl}/api/tts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ text, locale })
      });

      if (!res.ok) return null;

      const data = (await res.json()) as TTSResponse;
      if (!data.success || !data.audioBase64) return null;

      const sampleRate = data.sampleRate ?? 24000;
      const channels = data.channels ?? 1;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate
      });

      return await this.decodeAudioData(
        this.decode(data.audioBase64),
        ctx,
        sampleRate,
        channels
      );
    } catch {
      return null;
    }
  }

  private decode(b64: string): Uint8Array {
    const s = atob(b64);
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }

  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    rate: number,
    chans: number
  ): Promise<AudioBuffer> {
    const i16 = new Int16Array(data.buffer);
    const len = i16.length / chans;
    const buf = ctx.createBuffer(chans, len, rate);
    for (let c = 0; c < chans; c++) {
      const cd = buf.getChannelData(c);
      for (let i = 0; i < len; i++) cd[i] = i16[i * chans + c] / 32768.0;
    }
    return buf;
  }
}

export const geminiService = new GeminiService();
