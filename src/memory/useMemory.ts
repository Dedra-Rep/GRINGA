import { useIntelligentMemory } from './MemoryContext';

export const useMemory = () => {
  const {
    memory,
    isMemoryLoaded,
    evaluateMessageMemory,
    updatePermanent,
    addDream,
    addWeeklyMission,
    addImportantRelationship,
    clearMemory
  } = useIntelligentMemory();

  return {
    userId: memory.userId,
    permanent: memory.permanent,
    longTerm: memory.longTerm,
    shortTerm: memory.shortTerm,
    instant: memory.instant,
    isMemoryLoaded,
    evaluateMessageMemory,
    updatePermanent,
    addDream,
    addWeeklyMission,
    addImportantRelationship,
    clearMemory,
    // Layer helpers
    hasConsentedToLgpd: memory.permanent.privacyPreferences.lgpdConsented,
    isCloudBackupEnabled: memory.permanent.privacyPreferences.allowCloudBackup
  };
};
