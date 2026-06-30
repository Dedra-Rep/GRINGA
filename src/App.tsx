import React, { useState, useRef, useEffect } from 'react';
import { ButlerMascot } from './components/ButlerMascot';
import ProductCard from './components/ProductCard';
import AffiliateDashboard from './components/AffiliateDashboard';
import { TrustEcosystem } from './components/TrustEcosystem';
import { OnboardingFlow } from './components/OnboardingFlow';
import { MascotState, ChatMessage, UserRole, InputContext, Locale, UserProfile } from './types';
import { geminiService } from './services/geminiService';
import { REGION_CONFIGS, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './constants';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './services/errorHandlers';
import { 
  saveUserProfile, 
  saveImportantThing, 
  getOrCreateSessionId, 
  saveFounderLead,
  getImportantThings
} from './services/firebaseService';
const UI_TEXTS = {
  'en-US': {
    brandName: 'Mordomo.AI',
    brandBadge: 'New category: Intelligent Care',
    title: 'Mordomo.AI',
    subtitle: 'An AI that remembers, organizes, and cares for what truly matters to you.',
    emotionalPhrase: '“Less forgetting. More clarity. More time to live.”',
    ctaPrimary: 'Start my daily care',
    ctaSecondary: 'See how it works',
    
    // Problem Section
    problemTitle: 'The Care You Deserve',
    problemText: 'You do not need more notifications. You need clarity. The Mordomo organizes appointments, documents, goals, family, health, and important memories in a simple, human experience.',
    
    // Areas Section
    areasTitle: 'What the Mordomo Cares For',
    areasSubtitle: 'Complete management of your life dimensions in a single stream of attention.',
    areas: [
      { title: 'Intelligent Memory', desc: 'Remembers promises, dates, important people, and forgotten goals.' },
      { title: 'Daily Briefing', desc: 'Shows what needs your immediate attention today.' },
      { title: 'Documents', desc: 'IDs, driver’s licenses, contracts, warranties, and expiration alerts.' },
      { title: 'Family', desc: 'Children’s routines, appointments, school dates, and general care.' },
      { title: 'Finances', desc: 'Bills, subscriptions, potential savings, and intelligent alerts.' },
      { title: 'Health', desc: 'Doctor visits, exams, medications, and healthy habit suggestions.' },
      { title: 'Goals', desc: 'Helps you resume dreams and strategic milestones.' },
      { title: 'Smart Shopping', desc: 'Compares options and assists in making verified, better purchases.' }
    ],

    // Briefing Mockup
    briefingTitle: 'The Daily Briefing Experience',
    briefingGreeting: 'Good morning, Marcos.',
    briefingIntro: 'Today there are 5 things that deserve your attention:',
    briefingItems: [
      'Your document expires in 18 days.',
      'It has been 42 days since you last spoke with an important client.',
      'You mentioned you wanted to spend more time with Noah.',
      'There is a subscription you might no longer use.',
      'I have selected 3 priorities for today.'
    ],

    // Philosophy
    philosophyTitle: 'It is not about AI. It is about care.',
    philosophyText: 'The Mordomo does not exist to impress with technology. It exists to reduce your mental load, protect your goals, and remember what a busy life makes you forget.',
    
    // Privacy
    privacyTitle: 'Your data is yours.',
    privacyText: 'The Mordomo only remembers what you allow. Your data can be deleted, exported, and controlled by you. Privacy is not a detail. It is a foundation.',

    // Plans
    plansTitle: 'Care Plans',
    plansSubtitle: 'Choose the ideal level of care for your routine.',
    plans: [
      { name: 'Free', price: '$0', desc: 'To start organizing your life and goals.' },
      { name: 'Founders', price: '$4.90/mo', desc: 'For the first users who want to build the Mordomo from the very beginning.' },
      { name: 'Premium', price: '$9.90/mo', desc: 'Complete daily care, intelligent memory, and proactive, supportive AI.' },
      { name: 'Family', price: '$19.90/mo', desc: 'Shared complete care for up to 6 members of your household.' }
    ],

    // CTA Final
    ctaFinalTitle: 'The world forgets. The Mordomo remembers.',
    ctaFinalText: 'Start with a simple daily briefing. Then let the Mordomo learn, protect, and care for what truly matters.',
    ctaFinalBtn: 'Join the Founders List',

    // Interactive Widget
    consoleTitle: 'Intelligent Care Console',
    consoleSubtitle: 'Simulate or request care directly from your assistant',
    placeholder: 'What is it you don\'t want to forget?',
    consultBtn: 'Save in Mordomo',
    greeting: 'Tell me something important. I will help you turn it into a reminder, priority, or plan.',
    selectionTitle: 'Resources Selected by Mordomo:',
    sourcesTitle: 'Verified Market Intelligence & Sources:',
    error: 'I encountered a minor issue with the care flow. Let\'s try again.',
    status: 'Care Index Active',
    switchRegion: 'Mudar para o Brasil',
    dashboardIntro: 'Welcome to your settings. Let\'s make sure your care parameters are set up.',
    lockedExplanation: 'Your access is currently in demonstration mode. After registering your affiliate IDs, the system will prioritize your tags in all recommended care products.',
    unlockedExplanation: 'Your credentials are now active. The system will prioritize your tags in all care recommendations.',
    eliteIntro: 'You have full access to your settings. Let\'s begin.',
    loginPrompt: 'To customize your experience, please sign in.',
    regionSwitchExplanation: 'Switching market focus. One moment.',
    signOutSpeech: 'Session closed. Let me know when you need to store anything else.',
    errorSpeech: 'I encountered a minor issue in the care data stream.',
    saveSuccess: 'Settings updated successfully.',
    saveError: 'I was unable to save the changes to the database.',
    trainingAccess: 'Initializing strategy modules.',
    paymentRedirect: 'Opening our secure payment gateway. I will await your return.',
    productRedirect: 'Opening the details of the suggested resource.'
  },
  'pt-BR': {
    brandName: 'Mordomo.AI',
    brandBadge: 'Nova categoria: Cuidado Inteligente',
    title: 'Mordomo.AI',
    subtitle: 'Uma IA que lembra, organiza e cuida do que realmente importa para você.',
    emotionalPhrase: '“Menos esquecimento. Mais clareza. Mais tempo para viver.”',
    ctaPrimary: 'Começar meu cuidado diário',
    ctaSecondary: 'Ver como funciona',
    
    // Problem Section
    problemTitle: 'O Cuidado que Você Merece',
    problemText: 'Você não precisa de mais notificações. Precisa de clareza. O Mordomo organiza compromissos, documentos, objetivos, família, saúde, dinheiro e memórias importantes em uma experiência simples e humana.',
    
    // Areas Section
    areasTitle: 'O que o Mordomo Cuida',
    areasSubtitle: 'Gerenciamento completo das dimensões da sua vida em um único fluxo de atenção.',
    areas: [
      { title: 'Memória Inteligente', desc: 'Lembra promessas, datas, pessoas importantes e objetivos esquecidos.' },
      { title: 'Briefing Diário', desc: 'Mostra exatamente o que precisa da sua atenção hoje.' },
      { title: 'Documentos', desc: 'CNH, RG, contratos, garantias, vencimentos e arquivos importantes.' },
      { title: 'Família', desc: 'Rotina dos filhos, consultas médicas, escola, aniversários e vacinas.' },
      { title: 'Finanças', desc: 'Contas, assinaturas de serviços, economia possível e alertas úteis.' },
      { title: 'Saúde', desc: 'Consultas, exames periódicos, medicamentos e hábitos saudáveis.' },
      { title: 'Objetivos', desc: 'Ajuda você a retomar seus sonhos e metas importantes da vida corrida.' },
      { title: 'Compras Inteligentes', desc: 'Compara opções e ajuda a comprar melhor os recursos que você precisa.' }
    ],

    // Briefing Mockup
    briefingTitle: 'Experiência do Briefing',
    briefingGreeting: 'Bom dia, Marcos.',
    briefingIntro: 'Hoje existem 5 coisas que merecem sua atenção:',
    briefingItems: [
      'Seu documento vence em 18 dias.',
      'Faz 42 dias que você não fala com um cliente importante.',
      'Você comentou que queria passar mais tempo com o Noah.',
      'Há uma assinatura que talvez você não use mais.',
      'Separei 3 prioridades para hoje.'
    ],

    // Philosophy
    philosophyTitle: 'Não é sobre inteligência artificial. É sobre cuidado.',
    philosophyText: 'O Mordomo não existe para impressionar com tecnologia. Ele existe para reduzir sua carga mental, proteger seus objetivos e lembrar aquilo que a vida corrida faz você esquecer.',
    
    // Privacy
    privacyTitle: 'Seus dados são seus.',
    privacyText: 'O Mordomo só lembra aquilo que você permitir. Seus dados devem poder ser apagados, exportados e controlados por você. Privacidade não é detalhe. É fundamento.',

    // Plans
    plansTitle: 'Planos de Cuidado',
    plansSubtitle: 'Escolha o nível de cuidado ideal para a sua rotina diária.',
    plans: [
      { name: 'Gratuito', price: 'R$ 0', desc: 'Para começar a organizar a vida e as metas básicas.' },
      { name: 'Fundadores', price: 'R$ 19,90/mês', desc: 'Para os primeiros usuários que querem construir o Mordomo desde o início.' },
      { name: 'Premium', price: 'R$ 39,90/mês', desc: 'Cuidado diário completo, memória inteligente e IA proativa integrada.' },
      { name: 'Família', price: 'R$ 79,90/mês', desc: 'Cuidado compartilhado para até 6 pessoas do seu círculo familiar.' }
    ],

    // CTA Final
    ctaFinalTitle: 'O mundo esquece. O Mordomo lembra.',
    ctaFinalText: 'Comece com um briefing diário simples. Depois deixe o Mordomo aprender, proteger e cuidar do que realmente importa.',
    ctaFinalBtn: 'Entrar na lista de fundadores',

    // Interactive Widget
    consoleTitle: 'Painel de Cuidado do Mordomo',
    consoleSubtitle: 'Simule ou envie solicitações de cuidado em tempo real',
    placeholder: 'O que você não quer esquecer?',
    consultBtn: 'Guardar no Mordomo',
    greeting: 'Me diga algo importante. Eu ajudo você a transformar isso em lembrete, prioridade ou plano.',
    selectionTitle: 'Recursos Curados pelo Mordomo:',
    sourcesTitle: 'Fontes de Inteligência de Mercado:',
    error: 'Encontrei uma pequena instabilidade no fluxo de cuidado. Vamos tentar novamente?',
    status: 'Sistema Ativo',
    switchRegion: 'Switch to United States',
    dashboardIntro: 'Bem-vindo às suas configurações. Vamos garantir que seus parâmetros de cuidado estejam definidos.',
    lockedExplanation: 'Seu acesso está atualmente em modo de demonstração. Após o cadastro de seus IDs de afiliado, o sistema priorizará suas tags em todas as recomendações.',
    unlockedExplanation: 'Suas credenciais profissionais estão ativas. O sistema agora priorizará suas tags de afiliado em todas as recomendações.',
    eliteIntro: 'Você tem acesso total às suas configurações. Vamos iniciar?',
    loginPrompt: 'Para personalizar seu cuidado, por favor, identifique-se através de nosso portal.',
    regionSwitchExplanation: 'Alterando o foco de mercado. Um momento.',
    signOutSpeech: 'Sessão encerrada. Estarei pronto para quando precisar guardar algo novo.',
    errorSpeech: 'Encontrei uma pequena instabilidade no fluxo de dados de cuidado.',
    saveSuccess: 'Configurações atualizadas com sucesso.',
    saveError: 'Não consegui registrar as alterações no banco de dados seguro.',
    trainingAccess: 'Iniciando módulos de treinamento.',
    paymentRedirect: 'Redirecionando para o portal de pagamento. Aguardo seu retorno.',
    productRedirect: 'Estou abrindo os detalhes do recurso para sua consideração.'
  }
};

const App: React.FC = () => {
  const [currentLocale, setCurrentLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mascotState, setMascotState] = useState<MascotState>(MascotState.IDLE);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMascotVisible, setIsMascotVisible] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pendingOnboardingProfileRef = useRef<{
    firstName: string;
    mostImportant: string;
    keyReminder: string;
    someoneToNeverForget: string;
    dreamToProtect: string;
    communicationStyle: string;
  } | null>(null);
  
  // Newsletter / founders list states
  const [founderEmail, setFounderEmail] = useState('');
  const [showFounderModal, setShowFounderModal] = useState(false);
  const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);

  const region = REGION_CONFIGS[currentLocale];
  const ui = UI_TEXTS[currentLocale];

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.info("Firebase client is in offline mode. Local operations are enabled.");
        }
      }
    };
    testConnection();
  }, []);

  const createInitialImportantThings = async (
    userId: string | null,
    sessionId: string | null,
    pendingProfile: {
      firstName: string;
      mostImportant: string;
      keyReminder: string;
      someoneToNeverForget: string;
      dreamToProtect: string;
      communicationStyle: string;
    }
  ) => {
    try {
      const isBR = currentLocale === 'pt-BR';
      // 1. "O Que Importa" - Someone to never forget
      if (pendingProfile.someoneToNeverForget) {
        await saveImportantThing({
          type: 'person',
          title: pendingProfile.someoneToNeverForget,
          description: isBR 
            ? `Alguém importante para o(a) ${pendingProfile.firstName} nunca esquecer.` 
            : `Someone important for ${pendingProfile.firstName} to never forget.`,
          priority: 'high',
          relatedPerson: pendingProfile.someoneToNeverForget
        });
      }

      // 2. "O Que Importa" - Dream to protect
      if (pendingProfile.dreamToProtect) {
        await saveImportantThing({
          type: 'goal',
          title: pendingProfile.dreamToProtect,
          description: isBR 
            ? `Sonho a proteger: ${pendingProfile.dreamToProtect}.` 
            : `Dream to protect: ${pendingProfile.dreamToProtect}.`,
          priority: 'high'
        });
      }

      // 3. "O Que Importa" - Key reminder / compromisso
      if (pendingProfile.keyReminder) {
        await saveImportantThing({
          type: 'compromise',
          title: pendingProfile.keyReminder,
          description: isBR 
            ? `Lembrete anual principal: ${pendingProfile.keyReminder}` 
            : `Main yearly reminder: ${pendingProfile.keyReminder}`,
          priority: 'high'
        });
      }
    } catch (err) {
      console.error('Error creating initial important things:', err);
    }
  };

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'userProfiles', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            const pendingProfile = pendingOnboardingProfileRef.current;
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              subscriptionLevel: 'free',
              createdAt: new Date().toISOString(),
              firstName: pendingProfile?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
              mainGoal: pendingProfile?.mostImportant || '',
              importantPeople: pendingProfile?.someoneToNeverForget ? [pendingProfile.someoneToNeverForget] : [],
              dailyCareFocus: pendingProfile?.mostImportant ? [pendingProfile.mostImportant] : [],
              preferredTone: pendingProfile?.communicationStyle || 'mordomo'
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);

            if (pendingProfile) {
              await createInitialImportantThings(firebaseUser.uid, null, pendingProfile);
            }
            // Clear pending ref
            pendingOnboardingProfileRef.current = null;
          }

          profileUnsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              setUserProfile(doc.data() as UserProfile);
            }
          }, (error) => {
            if (auth.currentUser && auth.currentUser.uid === firebaseUser.uid) {
              handleFirestoreError(error, OperationType.GET, `userProfiles/${firebaseUser.uid}`);
            }
          });
        } catch (error) {
          if (auth.currentUser && auth.currentUser.uid === firebaseUser.uid) {
            handleFirestoreError(error, OperationType.GET, `userProfiles/${firebaseUser.uid}`);
          }
        }
      } else {
        // Guest / Local persistence fallback
        const sessionId = localStorage.getItem('mordomo_session_id');
        if (sessionId) {
          const guestRef = doc(db, 'userProfiles', sessionId);
          try {
            const guestSnap = await getDoc(guestRef);
            if (guestSnap.exists()) {
              setUserProfile(guestSnap.data() as UserProfile);
            } else {
              setUserProfile(null);
            }

            profileUnsubscribe = onSnapshot(guestRef, (docSnap) => {
              if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
              } else {
                setUserProfile(null);
              }
            }, (error) => {
              console.warn("Guest profile snapshot error:", error);
            });
          } catch (error) {
            console.log("No active guest profile found yet for session", sessionId);
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
    });
    return () => {
      unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, [currentLocale]);

  useEffect(() => {
    const firstName = userProfile?.firstName || user?.displayName?.split(' ')[0] || '';
    const text = firstName
      ? (currentLocale === 'pt-BR'
          ? `${firstName}, hoje vou te ajudar a cuidar do que realmente importa.`
          : `${firstName}, today I will help you care for what truly matters.`)
      : ui.greeting;
    
    setMessages([{ role: 'model', text }]);
    speak(text);
  }, [currentLocale, user?.uid, userProfile?.firstName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const stopAudio = () => {
    if (currentAudioSource.current) {
      currentAudioSource.current.stop();
      currentAudioSource.current = null;
    }
    setMascotState(MascotState.IDLE);
  };

  const playAudio = (buffer: AudioBuffer) => {
    stopAudio();
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => { setMascotState(MascotState.IDLE); currentAudioSource.current = null; };
    currentAudioSource.current = source;
    source.start(0);
    setMascotState(MascotState.SPEAKING);
  };

  const speak = async (text: string) => {
    if (!text) return;
    stopAudio();
    setMascotState(MascotState.SPEAKING);
    if (!isMuted) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioBuffer = await geminiService.speak(text, currentLocale, audioContextRef.current);
      if (audioBuffer) playAudio(audioBuffer);
    } else {
      setTimeout(() => setMascotState(MascotState.IDLE), 3000);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const query = input;
    const userMsg: ChatMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setMascotState(MascotState.THINKING);

    try {
      const ctx: InputContext = {
        query,
        tenant: "mordomo",
        user_id: "anon",
        source: "site",
        locale: currentLocale,
        market: region.market,
        currency: region.currency
      };

      const result = await geminiService.getRecommendations(ctx);
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: result.text, 
        recommendations: result.OUTPUT?.recommendations,
        sources: result.sources
      };
      
      setMessages(prev => [...prev, modelMsg]);
      
      if (modelMsg.text) {
        await speak(modelMsg.text);
      } else {
        setMascotState(MascotState.IDLE);
      }
    } catch (error) {
      // Elegant simulated fallback matching requested tone
      const fallbackText = currentLocale === 'pt-BR'
        ? "Entendi. Vou tratar isso como prioridade. Para hoje, sugiro três passos simples: registrar o compromisso, definir um lembrete e reservar um horário protegido. Posso te ajudar a transformar isso em um plano diário."
        : "Understood. I will treat this as a priority. For today, I suggest three simple steps: document the commitment, establish a reminder, and reserve a protected block of time. I am ready to convert this into a daily plan.";
      
      const modelMsg: ChatMessage = {
        role: 'model',
        text: fallbackText
      };
      setMessages(prev => [...prev, modelMsg]);
      speak(fallbackText);
    } finally {
      setIsTyping(false);
    }
  };



  const handleLogin = async () => {
    speak(ui.loginPrompt);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSignOut = async () => {
    speak(ui.signOutSpeech);
    await signOut(auth);
    setShowDashboard(false);
  };

  const handleFounderSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!founderEmail.trim()) return;

    try {
      const res = await saveFounderLead({
        email: founderEmail,
        source: 'landing_page_newsletter',
        locale: currentLocale,
        consentAccepted: true
      });

      if (res.success) {
        const confirmMessage = currentLocale === 'pt-BR'
          ? `Sua vaga na lista de fundadores foi reservada com sucesso para o e-mail ${founderEmail}.`
          : `Your spot on the founders list has been successfully reserved for ${founderEmail}.`;
        
        speak(confirmMessage);
        setShowFounderModal(true);
      } else {
        const errorMessage = res.error || (currentLocale === 'pt-BR'
          ? "Desculpe, ocorreu um erro ao registrar seu e-mail. Por favor, tente novamente."
          : "Sorry, an error occurred while registering your email. Please try again.");
        speak(errorMessage);
      }
    } catch (err) {
      console.error('Error handling founder signup:', err);
    }
  };

  const scrollInto = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentAmazonId = currentLocale === 'pt-BR' ? userProfile?.amazonIdBR : userProfile?.amazonIdUS;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0210] text-gray-100 selection:bg-amber-500/30 overflow-x-hidden selection:text-white">
      {/* Premium Header */}
      <header className="fixed top-0 w-full z-[100] bg-[#0b0210]/80 backdrop-blur-3xl border-b border-white/[0.05] px-6 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-slate-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-110">M</div>
          <div className="flex flex-col -gap-1">
            <span className="text-xl font-black tracking-tighter uppercase italic leading-none font-display">Mordomo<span className="text-amber-500">.AI</span></span>
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.3em] uppercase">{ui.brandBadge}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-3 bg-emerald-500/10 text-emerald-400 px-5 py-2 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {ui.status}
          </div>

          {/* Idioma e região Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLocaleMenuOpen(!isLocaleMenuOpen)}
              className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/5 hover:bg-white/10 transition-all shadow-lg active:scale-95 group"
            >
              <div className="w-6 h-4 overflow-hidden rounded-[2px] shadow-sm border border-white/10 transition-transform group-hover:scale-110">
                <img 
                  src={SUPPORTED_LOCALES.find(l => l.code === currentLocale)?.flagUrl} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-200">
                  {SUPPORTED_LOCALES.find(l => l.code === currentLocale)?.label}
                </span>
                <span className="text-[7px] font-bold uppercase text-amber-500/60 tracking-widest mt-0.5">
                  {currentLocale === 'pt-BR' ? 'Idioma e região' : 'Language & Region'}
                </span>
              </div>
              <i className={`fas fa-chevron-down text-[8px] text-gray-400 transition-transform duration-200 ${isLocaleMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isLocaleMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLocaleMenuOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-64 bg-[#14081e] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-white/5 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                      {currentLocale === 'pt-BR' ? 'Selecione o idioma' : 'Select language'}
                    </span>
                  </div>
                  {SUPPORTED_LOCALES.map((loc) => (
                    <button
                      key={loc.code}
                      disabled={!loc.isActive}
                      onClick={() => {
                        if (loc.isActive) {
                          setCurrentLocale(loc.code);
                          setMessages([]);
                          const welcomeText = loc.code === 'pt-BR'
                            ? "Me diga algo importante. Eu ajudo você a transformar isso em lembrete, prioridade ou plano."
                            : "Tell me something important. I will help you turn it into a reminder, priority, or plan.";
                          speak(welcomeText);
                          setIsLocaleMenuOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                        !loc.isActive 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'hover:bg-white/5 active:scale-[0.98]'
                      } ${loc.code === currentLocale ? 'bg-amber-500/10 border border-amber-500/20' : 'border border-transparent'}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={loc.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded-[1px] border border-white/10" />
                        <span className={`text-xs ${loc.code === currentLocale ? 'text-amber-400 font-bold' : 'text-gray-300 font-light'}`}>
                          {loc.label}
                        </span>
                      </div>
                      {!loc.isActive && (
                        <span className="text-[7px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded text-gray-500">
                          {currentLocale === 'pt-BR' ? 'Em breve' : 'Soon'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Auth Section */}
          {user ? (
            <button 
              onClick={() => setShowDashboard(true)}
              className="flex items-center gap-3 bg-amber-500/10 hover:bg-amber-500/20 px-5 py-2.5 rounded-full border border-amber-500/30 transition-all group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/50">
                <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 hidden md:block">Configurações</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowOnboarding(true)}
              className="bg-white text-slate-950 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all active:scale-95 shadow-xl"
            >
              Acesso Premium
            </button>
          )}
        </div>
      </header>

      {/* Persistent Butler Mascot Helper */}
      <ButlerMascot 
        state={mascotState}
        role={UserRole.CUSTOMER}
        isMuted={isMuted}
        isVisible={isMascotVisible}
        onStop={stopAudio}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onDismiss={() => setIsMascotVisible(false)}
        onOpen={() => setIsMascotVisible(true)}
      />

      {/* Landing Content Container */}
      <div className="flex-1 pt-32 pb-24 px-4 md:px-8 space-y-32">
        
        {/* HERO SECTION */}
        <section className="text-center max-w-6xl mx-auto py-16 md:py-24 flex flex-col items-center animate-in fade-in duration-1000">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500/20 to-amber-700/10 border border-amber-500/30 rounded-full text-amber-400 text-[11px] font-black uppercase tracking-[0.3em] mb-10 shadow-lg">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            {ui.brandBadge}
          </div>
          
          {/* Main Titles */}
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-10 tracking-tight leading-[0.95] font-display">
            {ui.title}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-700">
              Cuidado Inteligente
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed mb-8">
            {ui.subtitle}
          </p>

          {/* Emotional phrase */}
          <p className="text-amber-500/70 text-sm md:text-lg max-w-2xl mx-auto font-bold tracking-wide italic mb-14">
            {ui.emotionalPhrase}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg">
            <button 
              onClick={() => {
                if (user) {
                  scrollInto(consoleRef);
                } else {
                  setShowOnboarding(true);
                }
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-5 px-8 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] active:scale-95 uppercase text-xs tracking-widest font-display shadow-2xl"
            >
              {ui.ctaPrimary}
            </button>
            <button 
              onClick={() => scrollInto(featuresRef)}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-5 px-8 rounded-full transition-all duration-300 active:scale-95 uppercase text-xs tracking-widest font-display"
            >
              {ui.ctaSecondary}
            </button>
          </div>
        </section>

        {/* SEÇÃO 1 — O PROBLEMA */}
        <section ref={featuresRef} className="max-w-4xl mx-auto text-center py-12 border-y border-white/[0.05] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 blur-3xl pointer-events-none"></div>
          <h2 className="text-2xl md:text-4xl font-black font-display uppercase tracking-tight text-white mb-6">
            {ui.problemTitle}
          </h2>
          <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto">
            {ui.problemText}
          </p>
        </section>

        {/* SEÇÃO 2 — O QUE O MORDOMO CUIDA */}
        <section className="max-w-6xl mx-auto space-y-16 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-white">
              {ui.areasTitle}
            </h2>
            <p className="text-gray-500 text-sm md:text-lg font-medium max-w-2xl mx-auto">
              {ui.areasSubtitle}
            </p>
          </div>

          {/* Beautiful Grid of 8 Life areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ui.areas.map((area, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-amber-500/30 rounded-[2rem] p-8 transition-all duration-300 shadow-xl hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-sm mb-6 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                  {idx + 1}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 font-display tracking-tight group-hover:text-amber-400 transition-colors">
                  {area.title}
                </h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-light">
                  {area.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ECOSSISTEMA DE CONFIANÇA GERAL */}
        <TrustEcosystem currentLocale={currentLocale} speak={speak} />

        {/* SEÇÃO 3 — EXPERIÊNCIA DO BRIEFING */}
        <section className="max-w-4xl mx-auto py-12">
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] rounded-[3.5rem] p-8 md:p-14 shadow-3xl relative backdrop-blur-3xl overflow-hidden group hover:border-amber-500/20 transition-all duration-500">
            {/* Visual background lights */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <h3 className="text-amber-500/50 font-black uppercase tracking-[0.4em] text-[10px] md:text-[11px] mb-10 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              {ui.briefingTitle}
            </h3>

            {/* Simulated briefing mockup */}
            <div className="space-y-8 text-left relative z-10">
              <div className="space-y-2">
                <h4 className="text-2xl md:text-4xl font-black font-display text-white">{ui.briefingGreeting}</h4>
                <p className="text-gray-500 text-sm md:text-lg font-medium">{ui.briefingIntro}</p>
              </div>

              <div className="h-px bg-white/[0.05]"></div>

              <ul className="space-y-6">
                {ui.briefingItems.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex gap-4 items-start text-gray-300 text-sm md:text-lg font-light leading-relaxed hover:text-white transition-colors duration-200">
                    <span className="text-amber-500 font-bold shrink-0 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* INTERACTIVE CARE CONSOLE (MVP) */}
        <section ref={consoleRef} className="max-w-4xl mx-auto py-12 scroll-mt-28">
          <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-[3.5rem] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative">
            <div className="absolute top-0 right-10 w-52 h-52 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-block px-4 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                {currentLocale === 'en-US' ? 'Secure Assistant Endpoint' : 'Ponto de Assistência Seguro'}
              </div>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white font-display">
                {ui.consoleTitle}
              </h2>
              <p className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-wider mt-2">
                {ui.consoleSubtitle}
              </p>
            </div>

            {/* Conversation Window */}
            <div className="space-y-8 max-h-[500px] overflow-y-auto mb-10 pr-2 scrollbar-thin" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {msg.role === 'user' ? (userProfile?.firstName?.toUpperCase() || (currentLocale === 'pt-BR' ? 'VOCÊ' : 'YOU')) : 'MORDOMO'}
                  </span>
                  <div className={`p-6 md:p-8 rounded-[2.5rem] max-w-[90%] md:max-w-2xl shadow-xl leading-relaxed text-sm md:text-lg font-light ${
                    msg.role === 'user' 
                      ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none' 
                      : 'bg-white/[0.02] border border-white/10 text-gray-200 backdrop-blur-md rounded-tl-none ring-1 ring-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Recommendations under this message */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="w-full mt-6 space-y-10">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                        <h4 className="text-amber-500/40 font-black uppercase tracking-[0.4em] text-[10px] whitespace-nowrap">
                          {ui.selectionTitle}
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {msg.recommendations.map((rec, idx) => (
                          <ProductCard 
                            key={idx} 
                            recommendation={rec} 
                            amazonId={currentAmazonId} 
                            onRedirect={() => speak(ui.productRedirect)}
                          />
                        ))}
                      </div>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="p-8 bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] mt-10">
                          <h5 className="text-gray-500 font-black uppercase tracking-[0.3em] text-[9px] mb-4">
                            {ui.sourcesTitle}
                          </h5>
                          <div className="flex flex-wrap gap-3">
                            {msg.sources.map((source, sIdx) => (
                              <a 
                                key={sIdx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[9px] bg-white/5 hover:bg-white text-gray-400 hover:text-slate-950 px-4 py-2 rounded-xl border border-white/5 transition-all font-bold uppercase tracking-widest"
                              >
                                {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-4 p-5 bg-white/[0.03] w-fit rounded-full px-8 border border-white/5 animate-pulse shadow-xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                    {currentLocale === 'en-US' ? 'Preparing care report' : 'Preparando relatório de cuidado'}
                  </span>
                </div>
              )}
            </div>

            {/* Input Bar inside Console */}
            <div className="relative group mt-6">
              <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-2 flex items-center gap-3 shadow-lg focus-within:border-amber-500/50 transition-all focus-within:ring-4 ring-amber-500/5">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={ui.placeholder}
                  className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-white font-medium placeholder:text-gray-600 text-base md:text-lg"
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 disabled:text-gray-600 text-slate-950 font-black px-8 py-4 rounded-[1.8rem] transition-all active:scale-95 uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-lg"
                >
                  {ui.consultBtn}
                  <i className="fas fa-paper-plane text-[9px]"></i>
                </button>
              </div>

              {/* Suggestions Panel */}
              <div className="flex flex-wrap gap-2.5 mt-4 justify-center md:justify-start px-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider self-center mr-1">Sugestões:</span>
                {[
                  currentLocale === 'pt-BR' ? 'Estou muito cansado hoje' : 'I am very tired today',
                  currentLocale === 'pt-BR' ? 'Preciso focar nos estudos' : 'I need to focus on studying',
                  currentLocale === 'pt-BR' ? 'Planejar presente do meu filho' : 'Plan a gift for my son',
                ].map((sug, sIdx) => (
                  <button 
                    key={sIdx}
                    onClick={() => setInput(sug)}
                    className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/20 text-gray-400 hover:text-white px-4 py-2 rounded-full transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4 — FILOSOFIA */}
        <section className="max-w-4xl mx-auto py-12 text-center space-y-6 relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black mx-auto shadow-lg mb-4">
            <i className="fas fa-heart text-sm"></i>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white font-display">
            {ui.philosophyTitle}
          </h2>
          <p className="text-gray-400 text-base md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            {ui.philosophyText}
          </p>
        </section>

        {/* SEÇÃO 5 — PRIVACIDADE */}
        <section className="max-w-4xl mx-auto py-12 text-center bg-white/[0.01] border border-white/[0.05] rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 pointer-events-none"></div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-black mx-auto shadow-lg mb-6 border border-blue-500/20">
            <i className="fas fa-shield-halved text-sm"></i>
          </div>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white font-display mb-4">
            {ui.privacyTitle}
          </h2>
          <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            {ui.privacyText}
          </p>
        </section>

        {/* SEÇÃO 6 — PLANOS */}
        <section className="max-w-6xl mx-auto space-y-16 py-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-white">
              {ui.plansTitle}
            </h2>
            <p className="text-gray-500 text-sm md:text-lg font-medium">
              {ui.plansSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ui.plans.map((plan, pIdx) => {
              const isFounder = plan.name === 'Founders' || plan.name === 'Fundadores';
              const isPremium = plan.name === 'Premium';
              return (
                <div 
                  key={pIdx}
                  className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 shadow-xl overflow-hidden ${
                    isFounder 
                      ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30 hover:border-amber-500' 
                      : isPremium 
                        ? 'bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500/30 hover:border-blue-500'
                        : 'bg-white/[0.01] border-white/[0.05] hover:border-white/20'
                  }`}
                >
                  {isFounder && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-black uppercase text-[7px] tracking-widest px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white font-display mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl md:text-4xl font-black text-white font-display">{plan.price}</span>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-light mb-8 flex-1">
                    {plan.desc}
                  </p>
                  
                  <button 
                    onClick={() => {
                      if (isFounder) {
                        scrollInto(consoleRef);
                        speak(currentLocale === 'pt-BR' ? 'Preencha o formulário abaixo para entrar na lista de fundadores.' : 'Please enter your email below to request access.');
                      } else {
                        speak(ui.paymentRedirect);
                      }
                    }}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      isFounder 
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                        : isPremium 
                          ? 'bg-blue-600 text-white hover:bg-blue-500'
                          : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    {isFounder ? (currentLocale === 'pt-BR' ? 'Quero Ser Fundador' : 'Become a Founder') : (currentLocale === 'pt-BR' ? 'Assinar Plano' : 'Subscribe')}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEÇÃO 7 — CTA FINAL / NEWSLETTER */}
        <section className="max-w-4xl mx-auto text-center py-16 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white font-display mb-6">
            {ui.ctaFinalTitle}
          </h2>
          <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10">
            {ui.ctaFinalText}
          </p>

          <form onSubmit={handleFounderSignup} className="flex flex-col gap-4 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email"
                required
                value={founderEmail}
                onChange={(e) => setFounderEmail(e.target.value)}
                placeholder={currentLocale === 'pt-BR' ? 'Seu melhor e-mail' : 'Your best email'}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-amber-500/50 transition-all text-sm"
              />
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl hover:shadow-amber-500/10"
              >
                {ui.ctaFinalBtn}
              </button>
            </div>
            
            <div className="flex items-start gap-3 text-left mt-2">
              <input
                type="checkbox"
                required
                id="consentCheckbox"
                defaultChecked={true}
                className="mt-1 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="consentCheckbox" className="text-gray-400 text-xs font-light leading-normal select-none cursor-pointer">
                {currentLocale === 'pt-BR' ? (
                  <>
                    Quero entrar para a lista prioritária de fundadores. <span className="block text-[10px] text-gray-500 mt-1">Vou guardar isso apenas para ajudar você a lembrar depois. Você poderá apagar ou editar essas informações no futuro.</span>
                  </>
                ) : (
                  <>
                    I want to join the priority founders list. <span className="block text-[10px] text-gray-500 mt-1">I will keep this only to help you remember later. You can delete or edit this information in the future.</span>
                  </>
                )}
              </label>
            </div>
          </form>
        </section>

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.05] py-12 text-center text-gray-600 text-xs mt-24">
        <p className="font-display uppercase tracking-[0.2em] mb-2 font-bold text-[10px] text-gray-500">Mordomo.AI — {currentLocale === 'pt-BR' ? 'Sistema de Cuidado Inteligente' : 'Intelligent Care System'}</p>
        <p className="text-gray-500 font-light mb-4 text-[11px] italic">
          {currentLocale === 'pt-BR' 
            ? "Nascido no Brasil. Criado para cuidar de vidas no mundo inteiro." 
            : "Born in Brazil. Built to care for lives around the world."}
        </p>
        <p className="font-medium">© 2026 {currentLocale === 'pt-BR' ? 'Todos os direitos reservados.' : 'All rights reserved.'}</p>
      </footer>

      {/* Founders Confirm Modal */}
      {showFounderModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#12051c] border border-amber-500/30 rounded-[3rem] p-10 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in zoom-in duration-300">
            <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center mx-auto text-xl font-black">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-2xl font-black uppercase font-display text-white">
              {currentLocale === 'pt-BR' ? 'Solicitação Aceita' : 'Request Accepted'}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              {currentLocale === 'pt-BR' 
                ? `Muito obrigado. Registrei o endereço ${founderEmail} em nossa lista prioritária de Fundadores. Entraremos em contato assim que o próximo lote for liberado.`
                : `Thank you very much. I have registered the address ${founderEmail} on our priority Founders List. We will contact you as soon as the next slot is released.`}
            </p>
            <button 
              onClick={() => {
                setShowFounderModal(false);
                setFounderEmail('');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black w-full py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all"
            >
              {currentLocale === 'pt-BR' ? 'Entendido, Mordomo' : 'Understood, Butler'}
            </button>
          </div>
        </div>
      )}

      {/* Settings / Dashboard Modal */}
      {showDashboard && userProfile && (
        <AffiliateDashboard 
          userProfile={userProfile} 
          onClose={() => setShowDashboard(false)} 
          onSignOut={handleSignOut}
          speak={speak}
          ui={ui}
        />
      )}

      {showOnboarding && (
        <OnboardingFlow 
          currentLocale={currentLocale}
          speak={speak}
          onClose={() => setShowOnboarding(false)}
          onDirectLogin={async () => {
            setShowOnboarding(false);
            await handleLogin();
          }}
          onComplete={async (data, skipAuth) => {
            pendingOnboardingProfileRef.current = data;
            
            if (skipAuth) {
              const sessionId = getOrCreateSessionId();
              const guestProfile: Partial<UserProfile> = {
                uid: sessionId,
                id: sessionId,
                firstName: data.firstName,
                preferredTone: data.communicationStyle,
                mainGoal: data.mostImportant,
                dailyCareFocus: data.mostImportant ? [data.mostImportant] : [],
                importantPeople: data.someoneToNeverForget ? [data.someoneToNeverForget] : []
              };
              
              const res = await saveUserProfile(guestProfile);
              if (res.success && res.data) {
                setUserProfile(res.data);
                await createInitialImportantThings(null, sessionId, data);
              }
              setShowOnboarding(false);
              pendingOnboardingProfileRef.current = null;
            } else {
              const provider = new GoogleAuthProvider();
              try {
                await signInWithPopup(auth, provider);
                setShowOnboarding(false);
              } catch (error) {
                console.error('Google Sign In Error on Onboarding:', error);
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
