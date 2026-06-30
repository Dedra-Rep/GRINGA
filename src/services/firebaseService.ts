import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errorHandlers';
import { FounderLead, UserProfile, ImportantThing, FirebaseResult } from '../types';

/**
 * Ensures a persistent local session ID exists in localStorage.
 */
export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('mordomo_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    localStorage.setItem('mordomo_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Saves a new lead/founder interested in the product launch to founderLeads.
 */
export async function saveFounderLead(data: {
  name?: string;
  email: string;
  source: string;
  locale: string;
  consentAccepted: boolean;
}): Promise<FirebaseResult<FounderLead>> {
  try {
    const emailStr = (data.email || '').trim();
    if (!emailStr || !emailStr.includes('@')) {
      return { success: false, error: 'Por favor, insira um e-mail válido.' };
    }
    if (!data.consentAccepted) {
      return { success: false, error: 'Você precisa aceitar os termos de consentimento para continuar.' };
    }

    const colRef = collection(db, 'founderLeads');
    const newDocRef = doc(colRef);
    const lead: FounderLead = {
      id: newDocRef.id,
      name: (data.name || '').trim(),
      email: emailStr,
      source: data.source || 'web',
      locale: data.locale || 'pt-BR',
      createdAt: new Date().toISOString(),
      consentAccepted: data.consentAccepted
    };

    await setDoc(newDocRef, lead);
    return { success: true, data: lead };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, 'founderLeads');
    } catch (e) {
      console.error('Error reporting to firestore error handler:', e);
    }
    return {
      success: false,
      error: 'Não consegui registrar seu e-mail no momento. Por favor, tente novamente mais tarde.'
    };
  }
}

/**
 * Saves or updates a user profile. If user is logged in, uses uid. Otherwise, uses local sessionId.
 */
export async function saveUserProfile(data: Partial<UserProfile> & { uid?: string }): Promise<FirebaseResult<UserProfile>> {
  try {
    const activeId = auth.currentUser?.uid || data.uid || getOrCreateSessionId();
    if (!activeId) {
      return { success: false, error: 'Nenhuma sessão ativa encontrada.' };
    }

    const docRef = doc(db, 'userProfiles', activeId);
    const existingDoc = await getDoc(docRef);
    const now = new Date().toISOString();

    const profileData: any = {
      id: activeId,
      firstName: (data.firstName || '').trim(),
      email: data.email || auth.currentUser?.email || '',
      locale: data.locale || 'pt-BR',
      preferredTone: data.preferredTone || 'mordomo',
      mainGoal: data.mainGoal || '',
      dailyCareFocus: data.dailyCareFocus || [],
      updatedAt: now
    };

    if (!existingDoc.exists()) {
      profileData.createdAt = now;
    } else {
      const existingData = existingDoc.data();
      profileData.createdAt = existingData?.createdAt || now;
    }

    await setDoc(docRef, profileData, { merge: true });
    return { success: true, data: profileData as UserProfile };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, `userProfiles`);
    } catch (e) {
      console.error('Error reporting to firestore error handler:', e);
    }
    return {
      success: false,
      error: 'Não consegui salvar o seu perfil de cuidado no momento.'
    };
  }
}

/**
 * Saves a single ImportantThing item (add or edit).
 */
export async function saveImportantThing(data: {
  id?: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedPerson?: string;
}): Promise<FirebaseResult<ImportantThing>> {
  try {
    const titleStr = (data.title || '').trim();
    if (!titleStr) {
      return { success: false, error: 'O título do que importa é obrigatório.' };
    }
    if (!data.type) {
      return { success: false, error: 'Selecione uma categoria válida.' };
    }

    const colRef = collection(db, 'importantThings');
    const docId = data.id || doc(colRef).id;
    const docRef = doc(db, 'importantThings', docId);

    const userId = auth.currentUser?.uid || undefined;
    const sessionId = getOrCreateSessionId();
    const now = new Date().toISOString();

    const importantThing: ImportantThing = {
      id: docId,
      userId,
      sessionId,
      type: data.type,
      title: titleStr,
      description: (data.description || '').trim(),
      priority: data.priority || 'medium',
      relatedPerson: (data.relatedPerson || '').trim(),
      createdAt: now,
      updatedAt: now
    };

    const existingDoc = await getDoc(docRef);
    if (existingDoc.exists()) {
      const existingData = existingDoc.data();
      importantThing.createdAt = existingData.createdAt || now;
    }

    await setDoc(docRef, importantThing, { merge: true });
    return { success: true, data: importantThing };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, 'importantThings');
    } catch (e) {
      console.error('Error reporting to firestore error handler:', e);
    }
    return {
      success: false,
      error: 'Não consegui guardar essa informação em O Que Importa no momento.'
    };
  }
}

/**
 * Loads all items for a given sessionId or userId.
 */
export async function getImportantThings(sessionIdOrUserId?: string): Promise<FirebaseResult<ImportantThing[]>> {
  try {
    const targetId = sessionIdOrUserId || auth.currentUser?.uid || getOrCreateSessionId();
    if (!targetId) {
      return { success: true, data: [] };
    }

    const colRef = collection(db, 'importantThings');
    
    // Check if we are searching by logged-in user or session ID
    let q;
    if (auth.currentUser && targetId === auth.currentUser.uid) {
      q = query(colRef, where('userId', '==', targetId));
    } else {
      q = query(colRef, where('sessionId', '==', targetId));
    }

    const snapshot = await getDocs(q);
    const items: ImportantThing[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as ImportantThing);
    });

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, data: items };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, 'importantThings');
    } catch (e) {
      console.error('Error reporting to firestore error handler:', e);
    }
    return {
      success: false,
      error: 'Não consegui carregar as suas coisas importantes no momento.',
      data: []
    };
  }
}

/**
 * Deletes an item from O Que Importa.
 */
export async function deleteImportantThing(id: string): Promise<FirebaseResult<void>> {
  try {
    const docRef = doc(db, 'importantThings', id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, `importantThings/${id}`);
    } catch (e) {
      console.error('Error reporting to firestore error handler:', e);
    }
    return {
      success: false,
      error: 'Não consegui excluir este item no momento.'
    };
  }
}
