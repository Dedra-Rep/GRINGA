export type Market = "BR" | "US";

const env = (import.meta as any).env || {};

// Se você já usa alguma ENV no Vercel pro frontend, ele pega aqui.
// Se não tiver, ele usa as rotas relativas /api/* (Vercel Functions).
const API_BASE =
  env.VITE_API_BASE_URL ||
  env.VITE_API_BASE_API_URL ||
  env.VITE_API_URL_BASE ||
  "";

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

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `Erro HTTP ${resp.status} em ${path}`;
    throw new Error(msg);
  }

  return data as T;
}

export const geminiService = {
  chat(message: string) {
    return postJSON<{ ok: boolean; reply?: string }>(`/api/chat`, { message });
  },

  recommendations(query: string, market: Market = "US") {
    return postJSON<{
      ok: boolean;
      market: Market;
      query: string;
      recommendations: Array<{
        title: string;
        why: string;
        label?: string;
        priceHint?: string;
        link: string;
      }>;
    }>(`/api/recommendations`, { query, market });
  },
};

// Exporta dos dois jeitos (resolve qualquer import)
export default geminiService;
