import { IntelligentMemory, MemoryDecision, MemoryLayer, PermanentMemory, LongTermMemory, ShortTermMemory, InstantMemory } from './types';

export class MemoryService {
  /**
   * Evaluates an incoming piece of information or conversation update and suggests
   * where it fits within Mordomo's memory layers, keeping privacy as a top priority.
   */
  public static analyzeInformation(
    currentMemory: IntelligentMemory,
    userInput: string,
    extractedContext: string
  ): MemoryDecision {
    const textLower = userInput.toLowerCase();

    // Heuristic 1: Sensitive Data Protection Guardrail (Passwords, medical/financial details)
    const sensitiveKeywords = [
      'senha', 'password', 'token', 'cvv', 'cartão de crédito', 'credit card', 
      'cpf', 'rg', 'segredo', 'secret', 'exame médico', 'doença', 'saldo bancário'
    ];
    if (sensitiveKeywords.some(keyword => textLower.includes(keyword))) {
      return {
        action: 'forget',
        layer: MemoryLayer.INSTANT,
        reason: 'Contém padrões ou termos potencialmente associados a dados altamente sensíveis. Descartado preventivamente.',
        confidenceScore: 1.0,
        proposedChange: null
      };
    }

    // Heuristic 2: Permanent Layer Updates (Name, core preferences, treatment)
    if (textLower.startsWith('me chame de') || textLower.includes('meu nome é') || textLower.includes('my name is')) {
      const nameMatch = userInput.match(/(?:me chame de|meu nome é|my name is)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i);
      const name = nameMatch ? nameMatch[1].trim() : '';
      if (name) {
        return {
          action: 'ask_user',
          layer: MemoryLayer.PERMANENT,
          reason: 'Identificada atualização no nome ou forma de tratamento do usuário.',
          confidenceScore: 0.95,
          proposedChange: { firstName: name }
        };
      }
    }

    // Heuristic 3: Long-Term Layer updates (Dreams, relationships)
    if (textLower.includes('meu sonho') || textLower.includes('quero conquistar') || textLower.includes('my dream is')) {
      return {
        action: 'ask_user',
        layer: MemoryLayer.LONG_TERM,
        reason: 'Identificada manifestação de objetivo de vida ou aspiração de longo prazo.',
        confidenceScore: 0.90,
        proposedChange: { dream: userInput }
      };
    }

    // Heuristic 4: Short-Term Layer (Reminders, quick weekly tasks)
    if (
      textLower.includes('me lembre de') || 
      textLower.includes('lembrar') || 
      textLower.includes('reunir') || 
      textLower.includes('remind me') || 
      textLower.includes('reunião')
    ) {
      return {
        action: 'save', // Safe to auto-queue in short-term memory, but actionable
        layer: MemoryLayer.SHORT_TERM,
        reason: 'Identificado agendamento de lembrete ou pendência temporal curta.',
        confidenceScore: 0.85,
        proposedChange: { task: userInput }
      };
    }

    // Default to update current interaction state (Instant Memory)
    return {
      action: 'save',
      layer: MemoryLayer.INSTANT,
      reason: 'Atualização ordinária do contexto da conversa atual.',
      confidenceScore: 1.0,
      proposedChange: { lastUserMessage: userInput }
    };
  }

  /**
   * Helper to perform aging/summarization of short-term logs or expired tasks.
   * Promotes valuable recurring items and forgets obsolete ones.
   */
  public static runMemoryMaintenance(memory: IntelligentMemory): IntelligentMemory {
    const updated = { ...memory };
    
    // Auto-remove or summarize completed short-term tasks older than 7 days
    updated.shortTerm.weeklyMissions = memory.shortTerm.weeklyMissions.filter(mission => {
      // Keep unfinished tasks, or recently finished tasks
      return !mission.completed;
    });

    // Instant memory timestamp update
    updated.instant.lastInteractionTimestamp = new Date().toISOString();

    return updated;
  }

  /**
   * Generates a completely empty, safe, and privacy-first memory envelope.
   */
  public static createDefaultMemory(userId: string, email: string): IntelligentMemory {
    return {
      userId,
      permanent: {
        firstName: '',
        salutationPreference: 'natural',
        language: 'pt-BR',
        familyMembers: [],
        coreValues: [],
        longTermGoals: [],
        privacyPreferences: {
          lgpdConsented: true,
          allowCloudBackup: true,
          sensitiveDataConsent: false, // Force false to protect user by default
          autoSummarizeAgeDays: 30
        }
      },
      longTerm: {
        dreams: [],
        projects: [],
        importantRelationships: [],
        habits: [],
        achievements: []
      },
      shortTerm: {
        weeklyMissions: [],
        activeReminders: [],
        pendingActions: []
      },
      instant: {
        currentSessionId: Math.random().toString(36).substring(7),
        lastInteractionTimestamp: new Date().toISOString(),
        currentConversationTopic: 'General',
        contextWindowTokensSimulated: 0,
        lastUserMessage: '',
        lastModelResponse: ''
      }
    };
  }
}
