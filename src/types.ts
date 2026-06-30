export enum MascotState {
  IDLE = 'idle',
  THINKING = 'thinking',
  SPEAKING = 'speaking',
  LISTENING = 'listening'
}

export enum UserRole {
  CUSTOMER = 'customer',
  TOP = 'top'
}

export type Locale = 'en-US' | 'pt-BR' | 'es-LATAM' | 'pt-PT';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Recommendation {
  rank: number;
  label: string;
  platform: "ebay" | "amazon";
  title: string;
  why: string[];
  target_url: string;
  cta_text: string;
  price_estimate?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  recommendations?: Recommendation[];
  sources?: GroundingSource[];
}

export interface UserProfile {
  uid: string; // matches id
  id?: string; // fallback alias
  email?: string; // optional as requested
  locale?: Locale;
  preferredTone?: string;
  mainGoal?: string;
  importantPeople?: string[];
  dailyCareFocus?: string[];
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  amazonIdBR?: string;
  amazonIdUS?: string;
  subscriptionLevel?: 'free' | 'standard' | 'elite';
  stripeCustomerId?: string;
}

export interface ImportantThing {
  id: string;
  userId?: string;
  sessionId?: string;
  type: string; // e.g. "document", "compromise", "dream", "person", "goal", "other"
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedPerson?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LifeArea {
  id: string;
  name: string; // e.g. "Family", "Health", "Money"
  description: string;
  status: 'critical' | 'stable' | 'optimizing';
  priority: 'high' | 'medium' | 'low';
}

export interface DailyBriefing {
  id: string;
  userId: string;
  date: string;
  items: string[];
  summary: string;
}

export interface FounderLead {
  id?: string;
  name?: string;
  email: string;
  source: string;
  locale?: string;
  createdAt: string;
  consentAccepted?: boolean;
}

export interface FirebaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface InputContext {
  query: string;
  tenant: string;
  user_id: string;
  source: string;
  locale: Locale;
  market: string;
  currency: string;
}
