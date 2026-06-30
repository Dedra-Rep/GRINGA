import { Recommendation, InputContext, Locale, GroundingSource } from "../types";

export class GeminiService {
  async getRecommendations(context: InputContext): Promise<{ text: string; OUTPUT: any; sources: GroundingSource[] }> {
    const isBR = context.locale === 'pt-BR';
    try {
      const response = await fetch("/api/mordomo-care", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (e) {
      console.error("Mordomo Engine Proxy Failure:", e);
      const errorText = isBR 
        ? "Desculpe. Encontrei uma pequena instabilidade no sistema de cuidado. Vamos tentar novamente?" 
        : "Sorry. I encountered a minor issue with the care system. Let's try again?";
      return { 
        text: errorText, 
        OUTPUT: { recommendations: [] }, 
        sources: [] 
      };
    }
  }

  async speak(text: string, locale: Locale, ctx: AudioContext): Promise<AudioBuffer | null> {
    try {
      const response = await fetch("/api/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, locale })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (!data.audio) return null;
      return await this.decodeAudioData(this.decode(data.audio), ctx, 24000, 1);
    } catch (e) {
      console.error("Speech Engine Proxy Failure:", e);
      return null;
    }
  }

  private decode(b64: string): Uint8Array {
    const s = atob(b64);
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, rate: number, chans: number): Promise<AudioBuffer> {
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
