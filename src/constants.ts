import { UserRole, Locale } from './types';

export const APP_NAME = "Mordomo.AI";
export const APP_CATEGORY = "Sistema de Cuidado Inteligente";
export const APP_PROMISE = "Enquanto você vive, o Mordomo cuida.";
export const DEFAULT_LOCALE = "pt-BR";

export const MORDOMO_CORE_PRINCIPLES = {
  care: "Cuidado proativo e atento ao que de fato importa para o bem-estar do usuário.",
  trust: "Transparência radical e controle absoluto do usuário sobre suas próprias informações.",
  clarity: "Simplificação de rotinas complexas em ações leves, claras e executáveis.",
  privacy: "Segurança de dados no estado da arte e conformidade integral com a LGPD.",
  calm: "Uma presença serena que reduz ruído e ansiedade, em vez de gerar novas demandas.",
  autonomy: "Empoderamento do usuário para decidir o que a inteligência deve ou não lembrar."
};

export const REGION_CONFIGS: Record<Locale, {
  market: string;
  currency: string;
  ebayId?: string;
  amazonId?: string;
  countryName: string;
  flagUrl: string;
}> = {
  'en-US': {
    market: 'US',
    currency: 'USD',
    amazonId: 'mordomoai0a-20',
    countryName: 'USA',
    flagUrl: 'https://flagcdn.com/w80/us.png'
  },
  'pt-BR': {
    market: 'BR',
    currency: 'BRL',
    amazonId: 'mordomoai-20',
    countryName: 'Brasil',
    flagUrl: 'https://flagcdn.com/w80/br.png'
  },
  'es-LATAM': {
    market: 'MX',
    currency: 'MXN',
    amazonId: 'mordomoai-20',
    countryName: 'LatAm',
    flagUrl: 'https://flagcdn.com/w80/mx.png'
  },
  'pt-PT': {
    market: 'PT',
    currency: 'EUR',
    amazonId: 'mordomoai-20',
    countryName: 'Portugal',
    flagUrl: 'https://flagcdn.com/w80/pt.png'
  }
};

export interface SupportedLocale {
  code: Locale;
  label: string;
  flagUrl: string;
  isActive: boolean;
}

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: 'pt-BR', label: 'Português (Brasil)', flagUrl: 'https://flagcdn.com/w80/br.png', isActive: true },
  { code: 'en-US', label: 'English (United States)', flagUrl: 'https://flagcdn.com/w80/us.png', isActive: true },
  { code: 'es-LATAM', label: 'Español (LatAm)', flagUrl: 'https://flagcdn.com/w80/es.png', isActive: false },
  { code: 'pt-PT', label: 'Português (Portugal)', flagUrl: 'https://flagcdn.com/w80/pt.png', isActive: false }
];

export const COLORS = {
  acaiDark: '#1a0621',
  acaiMedium: '#2e0854',
  acaiLight: '#4b0082',
  gold: '#fbbf24',
  goldDark: '#d97706',
  textMain: '#f3f4f6',
  [UserRole.CUSTOMER]: {
    butlerSuit: '#2e0854',
    tie: '#fbbf24',
  },
  [UserRole.TOP]: {
    butlerSuit: '#1e293b',
    tie: '#10b981',
  }
};

export const MORDOMO_TONE_GUIDE = {
  prohibitedWords: [
    "senhor", "sir", "meu caro", "patrão", "chefe", "amigo", "vossa excelência",
    "honrado em servi-lo", "assistente supremo", "dor emocional", "aliviar sua carga mental"
  ],
  preferredPhrases: [
    "vamos transformar em algo simples de acompanhar",
    "vou te ajudar a não deixar isso se perder no meio da rotina",
    "hoje vale focar em três coisas",
    "isso merece atenção",
    "não precisa resolver tudo agora. Vamos começar pelo próximo passo"
  ],
  responseRules: {
    noPromisesOfPhysicalExecution: true, // Never say "I will pay", "I will call", etc.
    preferredActions: ["ajudar a organizar", "preparar lembrete", "montar plano", "deixar registrado", "sugerir o próximo passo"],
    language: "pt-BR natural"
  },
  personalizationRules: {
    anonymousGreeting: "Me diga algo importante. Eu ajudo você a transformar isso em lembrete, prioridade ou plano.",
    namedGreetingTemplate: "{firstName}, hoje vou te ajudar a cuidar do que realmente importa."
  }
};

