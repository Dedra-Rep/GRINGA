import React, { createContext, useContext, useState, useEffect } from 'react';
import { IntelligentMemory, PermanentMemory, LongTermMemory, ShortTermMemory, InstantMemory, MemoryDecision } from './types';
import { MemoryService } from './MemoryService';

interface MemoryContextProps {
  memory: IntelligentMemory;
  isMemoryLoaded: boolean;
  evaluateMessageMemory: (userInput: string) => MemoryDecision;
  updatePermanent: (data: Partial<PermanentMemory>) => void;
  addDream: (dreamText: string) => void;
  addWeeklyMission: (missionText: string, priority?: 'high' | 'medium' | 'low') => void;
  addImportantRelationship: (name: string, role: string) => void;
  clearMemory: () => void;
}

const MemoryContext = createContext<MemoryContextProps | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode; currentUserId?: string }> = ({
  children,
  currentUserId = 'anonymous_mordomo'
}) => {
  const [memory, setMemory] = useState<IntelligentMemory>(() => 
    MemoryService.createDefaultMemory(currentUserId, '')
  );
  const [isMemoryLoaded, setIsMemoryLoaded] = useState(false);

  // Load from localStorage on mount or when currentUserId changes
  useEffect(() => {
    const key = `mordomo_memory_${currentUserId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setMemory(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored memory, creating fresh profile', e);
        setMemory(MemoryService.createDefaultMemory(currentUserId, ''));
      }
    } else {
      setMemory(MemoryService.createDefaultMemory(currentUserId, ''));
    }
    setIsMemoryLoaded(true);
  }, [currentUserId]);

  // Persist memory on updates
  const saveMemory = (newMemory: IntelligentMemory) => {
    setMemory(newMemory);
    const key = `mordomo_memory_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(newMemory));
  };

  const evaluateMessageMemory = (userInput: string): MemoryDecision => {
    return MemoryService.analyzeInformation(memory, userInput, '');
  };

  const updatePermanent = (data: Partial<PermanentMemory>) => {
    const updated: IntelligentMemory = {
      ...memory,
      permanent: {
        ...memory.permanent,
        ...data
      }
    };
    saveMemory(updated);
  };

  const addDream = (dreamText: string) => {
    const newDream = {
      id: Math.random().toString(36).substring(7),
      description: dreamText,
      status: 'active' as const,
      targetYear: new Date().getFullYear() + 1
    };
    const updated: IntelligentMemory = {
      ...memory,
      longTerm: {
        ...memory.longTerm,
        dreams: [...memory.longTerm.dreams, newDream]
      }
    };
    saveMemory(updated);
  };

  const addWeeklyMission = (missionText: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    const newMission = {
      id: Math.random().toString(36).substring(7),
      text: missionText,
      completed: false,
      priority
    };
    const updated: IntelligentMemory = {
      ...memory,
      shortTerm: {
        ...memory.shortTerm,
        weeklyMissions: [...memory.shortTerm.weeklyMissions, newMission]
      }
    };
    saveMemory(updated);
  };

  const addImportantRelationship = (name: string, role: string) => {
    const newRelation = {
      id: Math.random().toString(36).substring(7),
      name,
      role,
      interactionFrequency: 'weekly' as const
    };
    const updated: IntelligentMemory = {
      ...memory,
      longTerm: {
        ...memory.longTerm,
        importantRelationships: [...memory.longTerm.importantRelationships, newRelation]
      }
    };
    saveMemory(updated);
  };

  const clearMemory = () => {
    const fresh = MemoryService.createDefaultMemory(currentUserId, '');
    saveMemory(fresh);
  };

  return (
    <MemoryContext.Provider value={{
      memory,
      isMemoryLoaded,
      evaluateMessageMemory,
      updatePermanent,
      addDream,
      addWeeklyMission,
      addImportantRelationship,
      clearMemory
    }}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useIntelligentMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useIntelligentMemory must be used within a MemoryProvider');
  }
  return context;
};
