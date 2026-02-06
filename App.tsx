import type { InputContext, Locale } from "../types";

type Recommendation = {
  title: string;
  why: string;
  label?: string;
  priceHint?: string;
  link: string;
};

type Source = {
  title: string;
  uri: string;
};

type RecommendationsResponse = {
  ok?: boolean;
  market?: "BR" | "US";
  query?: string;
  mode?: string;
  recommendations?: Recommendation[];
};

type ChatResponse = {
  ok?: boolean;
  reply?: string;
};

const env = (import.meta as any).env || {};

const API_BASE =
  env.VITE_API_BASE_URL ||
  env.VITE_API_BASE_API_URL ||
  env.VITE_API_BASE ||
  env.VITE_API_URL ||
  "";

/** Monta URL final: se não tiver base, usa rota relativa /api/... do Vercel */
function apiUrl(path: string) {
  if (!API_BASE) return path;
  return `${String(API_BASE).replace(/\/$/, "")}${path}`;
}

async function postJSON<T>(path: string, payload: any): Promise<T> {
  const resp = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({} as any));

  if (!resp.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `HTTP ${resp.status} em ${path}`;
    throw new Error(msg);
  }

  return data as T;
}

/**
 * TTS (speak)
 * - Por enquanto, NÃO temos endpoint TTS no seu /api.
 * - Então devolvemos null e o App cai no modo "sem áudio" automaticamente.
 *   (Você já trata isso: if (audioBuffer) playAudio(audioBuffer);)
 */
async function speak(_text: string, _locale: Locale): Promise<AudioBuffer | null> {
  return null;
}

/**
 * Recomendações:
 * - Chama /api/recommendations
 * - Converte para o formato que o App.tsx espera: { text, OUTPUT: { recommendations }, sources }
 */
async function getRecommendations(ctx: InputContext): Promise<{
  text: string;
  OUTPUT?: { recommendations: any[] };
  sources?: Source[];
}> {
  const query = (ctx as any)?.query || "";
  const market = (ctx as any)?.market || "US";

  const data = await postJSON<RecommendationsResponse>(`/api/recommendations`, {
    query,
    market,
    locale: (ctx as any)?.locale,
    currency: (ctx as any)?.currency,
    tenant: (ctx as any)?.tenant,
    user_id: (ctx as any)?.user_id,
    source: (ctx as any)?.source,
  });

  const recs = Array.isArray(data?.recommendations) ? data.recommendations : [];

  const text =
    recs.length > 0
      ? `Encontrei 3 opções para "${query}". Veja abaixo as seleções curadas.`
      : `Não consegui gerar recomendações agora para "${query}". Tente novamente.`;

  // Seu ProductCard já lê recommendation.link, label etc.
  // O App espera result.OUTPUT?.recommendations
  return {
    text,
    OUTPUT: { recommendations: recs as any[] },
    sources: [],
  };
}

/**
 * Chat simples:
 * (se você quiser usar depois)
 */
async function chat(message: string): Promise<{ reply: string }> {
  const data = await postJSON<ChatResponse>(`/api/chat`, { message });
  return { reply: data?.reply || "" };
}

export const geminiService = {
  getRecommendations,
  speak,
  chat,
};

export default geminiService;
