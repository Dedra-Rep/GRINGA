export enum MemoryLayer {
  PERMANENT = 'permanent',
  LONG_TERM = 'long_term',
  SHORT_TERM = 'short_term',
  INSTANT = 'instant'
}

export interface PermanentMemory {
  firstName: string;
  salutationPreference: string; // e.g. "Senhor", "Marcos", "Direct"
  language: string; // e.g. "pt-BR", "en-US"
  familyMembers: Array<{
    id: string;
    name: string;
    relationship: string; // e.g. "spouse", "son", "parent"
    birthdate?: string;
    notes?: string;
  }>;
  coreValues: string[]; // key philosophical guiding values
  longTermGoals: string[];
  privacyPreferences: {
    lgpdConsented: boolean;
    allowCloudBackup: boolean;
    sensitiveDataConsent: boolean; // requires prompt before saving
    autoSummarizeAgeDays: number;
  };
}

export interface LongTermMemory {
  dreams: Array<{
    id: string;
    description: string;
    targetYear?: number;
    status: 'active' | 'achieved' | 'paused';
    notes?: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    status: 'ongoing' | 'planning' | 'completed';
    associatedPeopleIds?: string[];
  }>;
  importantRelationships: Array<{
    id: string;
    name: string;
    role: string; // e.g. "business partner", "important client", "key physician"
    interactionFrequency: 'weekly' | 'monthly' | 'as_needed';
    notes?: string;
  }>;
  habits: Array<{
    id: string;
    habitName: string;
    frequency: string;
    streakCount: number;
    lastCompleted?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
  }>;
}

export interface ShortTermMemory {
  weeklyMissions: Array<{
    id: string;
    text: string;
    completed: boolean;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  activeReminders: Array<{
    id: string;
    text: string;
    datetime: string;
    frequency: 'once' | 'daily' | 'weekly';
    acknowledged: boolean;
  }>;
  pendingActions: Array<{
    id: string;
    description: string;
    deadline?: string;
  }>;
}

export interface InstantMemory {
  currentSessionId: string;
  lastInteractionTimestamp: string;
  currentConversationTopic: string;
  contextWindowTokensSimulated: number;
  lastUserMessage: string;
  lastModelResponse: string;
}

export interface IntelligentMemory {
  userId: string;
  permanent: PermanentMemory;
  longTerm: LongTermMemory;
  shortTerm: ShortTermMemory;
  instant: InstantMemory;
}

export interface MemoryDecision {
  action: 'save' | 'forget' | 'summarize' | 'ask_user';
  layer: MemoryLayer;
  reason: string;
  confidenceScore: number; // 0 to 1
  proposedChange: any;
}
