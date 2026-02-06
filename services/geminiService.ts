type ChatResponse = {
  ok?: boolean;
  reply?: string;
  error?: string;
};

type Recommendation = {
  title: string;
  why: string;
  label?: string;
  priceHint?: string;
  link: string;
};

type RecommendationsResponse = {
  ok?: boolean;
  market: "BR" | "US";
  query: string;
  recommendations: Recommendation[];
  error?: string;
};

const API_BASE = ""; // sempre relativo na Vercel

/**
 * Envia mensagem para o endpoint /api/chat
 */
export async function sendChatMessage(message: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  const data: ChatResponse = await resp.json();

  if (!resp.ok || data.error) {
    throw new Error(data.error || "Erro ao comunicar com o chat");
  }

  return data.reply || "";
}

/**
 * Busca recomendações de produtos (3 cards)
 */
export async function getRecommendations(
  query: string,
  market: "BR" | "US" = "BR"
): Promise<Recommendation[]> {
  const resp = await fetch(`${API_BASE}/api/recommendations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, market })
  });

  const data: RecommendationsResponse = await resp.json();

  if (!resp.ok || data.error) {
    throw new Error(data.error || "Erro ao buscar recomendações");
  }

  return data.recommendations || [];
}
