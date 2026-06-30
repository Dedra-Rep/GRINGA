import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Locale } from '../types';

interface OnboardingFlowProps {
  currentLocale: Locale;
  speak: (text: string) => void;
  onClose: () => void;
  onDirectLogin?: () => void;
  onComplete: (data: {
    firstName: string;
    mostImportant: string;
    keyReminder: string;
    someoneToNeverForget: string;
    dreamToProtect: string;
    communicationStyle: string;
  }, skipAuth?: boolean) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  currentLocale,
  speak,
  onClose,
  onDirectLogin,
  onComplete
}) => {
  const isBR = currentLocale === 'pt-BR';
  const [step, setStep] = useState(1);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [mostImportant, setMostImportant] = useState('');
  const [customMostImportant, setCustomMostImportant] = useState('');
  const [keyReminder, setKeyReminder] = useState('');
  const [someoneToNeverForget, setSomeoneToNeverForget] = useState('');
  const [customSomeone, setCustomSomeone] = useState('');
  const [dreamToProtect, setDreamToProtect] = useState('');
  const [customDream, setCustomDream] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [consent, setConsent] = useState<boolean | null>(null);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Predefined Options
  const mostImportantOptions = isBR
    ? ['Minha família', 'Meu trabalho', 'Minha saúde', 'Meu dinheiro', 'Meus estudos', 'Minha empresa', 'Outro']
    : ['My family', 'My work', 'My health', 'My money', 'My studies', 'My business', 'Other'];

  const someoneToNeverForgetOptions = isBR
    ? ['Filho', 'Esposa', 'Mãe', 'Pai', 'Cliente importante', 'Sócio', 'Pet', 'Outro']
    : ['Son/Daughter', 'Wife/Husband', 'Mother', 'Father', 'Important client', 'Partner', 'Pet', 'Other'];

  const dreamExamples = isBR
    ? ['Comprar uma casa', 'Viajar', 'Abrir empresa', 'Quitar dívidas', 'Passar mais tempo com a família', 'Outro']
    : ['Buy a house', 'Travel the world', 'Start a business', 'Pay off debts', 'Spend more time with family', 'Other'];

  const communicationStyles = isBR
    ? [
        { key: 'direto', label: 'Mais direto', desc: 'Respostas rápidas e focadas em eficiência.' },
        { key: 'acolhedor', label: 'Mais acolhedor', desc: 'Tons gentis, empáticos e focados no cuidado.' },
        { key: 'tecnico', label: 'Mais técnico', desc: 'Linguagem estruturada, precisa e baseada em dados.' },
        { key: 'motivador', label: 'Mais motivador', desc: 'Inspirador, energético e orientado ao progresso.' },
        { key: 'discreto', label: 'Mais discreto', desc: 'Sóbrio, polido e altamente focado na privacidade.' }
      ]
    : [
        { key: 'direct', label: 'More direct', desc: 'Quick responses focused purely on efficiency.' },
        { key: 'warm', label: 'More welcoming', desc: 'Gentle, empathetic tones focused on care.' },
        { key: 'technical', label: 'More technical', desc: 'Structured, precise, and data-driven language.' },
        { key: 'motivational', label: 'More motivating', desc: 'Inspiring, high-energy, and progress-oriented.' },
        { key: 'discreet', label: 'More discreet', desc: 'Sober, polished, and highly privacy-focused.' }
      ];

  // Speech triggers for each step
  const handleNext = () => {
    if (step === 1) {
      const speech = isBR 
        ? "Prazer em conhecer você. Para começar, como você gostaria que eu chamasse você?" 
        : "Pleasure to meet you. To begin, how would you like me to call you?";
      speak(speech);
      setStep(2);
    } else if (step === 2) {
      if (!firstName.trim()) return;
      const speech = isBR
        ? `Tudo bem, ${firstName}. E o que é mais importante para você hoje?`
        : `Understood, ${firstName}. And what is most important to you today?`;
      speak(speech);
      setStep(3);
    } else if (step === 3) {
      const selected = mostImportant === 'Outro' || mostImportant === 'Other' ? customMostImportant : mostImportant;
      if (!selected.trim()) return;
      const speech = isBR
        ? "Entendido. Se eu pudesse lembrar apenas uma coisa para você durante o próximo ano, o que seria?"
        : "Got it. If I could remind you of only one thing during the next year, what would it be?";
      speak(speech);
      setStep(4);
    } else if (step === 4) {
      if (!keyReminder.trim()) return;
      const speech = isBR
        ? "Excelente. Existe alguém que você nunca gostaria de esquecer?"
        : "Excellent. Is there someone you would never want to forget?";
      speak(speech);
      setStep(5);
    } else if (step === 5) {
      const selected = someoneToNeverForget === 'Outro' || someoneToNeverForget === 'Other' ? customSomeone : someoneToNeverForget;
      if (!selected.trim()) return;
      const speech = isBR
        ? "Importante registrar isso. Qual sonho você quer proteger?"
        : "Important to record that. What dream do you want to protect?";
      speak(speech);
      setStep(6);
    } else if (step === 6) {
      const selected = dreamToProtect === 'Outro' || dreamToProtect === 'Other' ? customDream : dreamToProtect;
      if (!selected.trim()) return;
      const speech = isBR
        ? "Cada sonho é sagrado. Como você prefere que eu converse com você?"
        : "Every dream is sacred. How do you prefer that I speak with you?";
      speak(speech);
      setStep(7);
    } else if (step === 7) {
      if (!communicationStyle) return;
      const speech = isBR
        ? "Sua preferência foi registrada. Posso lembrar dessas informações de forma segura para cuidar melhor de você?"
        : "Your preference is saved. May I securely remember this information to better care for you?";
      speak(speech);
      setStep(8);
    } else if (step === 8) {
      if (consent === null) return;
      const speech = isBR
        ? `Pronto, ${firstName}. Preparei seu plano de cuidado personalizado.`
        : `Ready, ${firstName}. I have prepared your personalized care plan.`;
      speak(speech);
      setStep(9);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const triggerAuthSignUp = (providerType: 'google' | 'apple' | 'email') => {
    // Collect the gathered data
    const finalMostImportant = mostImportant === 'Outro' || mostImportant === 'Other' ? customMostImportant : mostImportant;
    const finalSomeone = someoneToNeverForget === 'Outro' || someoneToNeverForget === 'Other' ? customSomeone : someoneToNeverForget;
    const finalDream = dreamToProtect === 'Outro' || dreamToProtect === 'Other' ? customDream : dreamToProtect;

    onComplete({
      firstName,
      mostImportant: finalMostImportant,
      keyReminder,
      someoneToNeverForget: finalSomeone,
      dreamToProtect: finalDream,
      communicationStyle
    });
  };

  return (
    <div className="fixed inset-0 z-[250] flex flex-col justify-between bg-slate-950 text-white font-sans overflow-hidden p-6 md:p-12">
      {/* Absolute ambient lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 to-transparent blur-[150px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <div className="flex justify-between items-center relative z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <i className="fas fa-crown text-amber-500 text-xs animate-pulse"></i>
          </div>
          <span className="font-display font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">Mordomo.AI</span>
        </div>
        <div className="flex items-center gap-2">
          {onDirectLogin && (
            <button 
              onClick={onDirectLogin} 
              className="text-xs text-amber-400 hover:text-amber-300 uppercase font-black tracking-widest bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full transition-all"
            >
              {isBR ? 'Já tenho conta' : 'Log In'}
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-xs text-gray-500 hover:text-white uppercase font-black tracking-widest bg-white/5 border border-white/5 px-4 py-2 rounded-full transition-all"
          >
            {isBR ? 'Pular' : 'Skip'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative z-10 py-8">
        <AnimatePresence mode="wait">
          {/* TELA 1 — BOAS-VINDAS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center space-y-8"
            >
              {/* Mascot representation */}
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-b from-amber-500/20 to-transparent border border-amber-500/30 flex items-center justify-center mx-auto shadow-2xl relative">
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </span>
                <i className="fas fa-hat-cowboy text-amber-500 text-4xl"></i>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-white leading-tight">
                  {isBR ? 'Prazer em conhecer você.' : 'Pleasure to meet you.'}
                </h2>
                <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-md mx-auto">
                  {isBR
                    ? 'Antes de cuidar da sua rotina... quero entender o que realmente importa.'
                    : 'Before caring for your routine... I want to understand what truly matters.'}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-12 py-5 rounded-full text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all w-full md:w-auto"
              >
                {isBR ? 'Vamos começar' : 'Let\'s get started'}
              </button>
            </motion.div>
          )}

          {/* TELA 2 — COMO CHAMAR */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-8 text-center"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] block">TELA 02 / 08</span>
                <h3 className="text-2xl md:text-4xl font-black font-display text-white uppercase leading-tight">
                  {isBR ? 'Como você gostaria que eu chamasse você?' : 'How would you like me to call you?'}
                </h3>
              </div>

              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && firstName.trim() && handleNext()}
                  placeholder={isBR ? 'Seu primeiro nome apenas' : 'Your first name only'}
                  autoFocus
                  className="w-full bg-white/5 border-b-2 border-white/20 focus:border-amber-500 py-4 text-center text-xl md:text-3xl font-light text-white outline-none transition-all placeholder-gray-600"
                />
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {isBR ? 'Voltar' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!firstName.trim()}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  {isBR ? 'Continuar' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TELA 3 — O QUE É MAIS IMPORTANTE HOJE */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] block">TELA 03 / 08</span>
                <h3 className="text-2xl md:text-4xl font-black font-display text-white uppercase leading-tight">
                  {isBR ? 'O que é mais importante para você hoje?' : 'What is most important to you today?'}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl mx-auto">
                {mostImportantOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setMostImportant(opt);
                      if (opt !== 'Outro' && opt !== 'Other') {
                        setCustomMostImportant('');
                      }
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      mostImportant === opt
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-light">{opt}</span>
                  </button>
                ))}
              </div>

              {(mostImportant === 'Outro' || mostImportant === 'Other') && (
                <div className="max-w-md mx-auto animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    value={customMostImportant}
                    onChange={(e) => setCustomMostImportant(e.target.value)}
                    placeholder={isBR ? 'Escreva aqui...' : 'Specify here...'}
                    autoFocus
                    className="w-full bg-white/5 border-b border-amber-500 py-3 text-center text-sm md:text-base font-light text-white outline-none"
                  />
                </div>
              )}

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {isBR ? 'Voltar' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!mostImportant || ((mostImportant === 'Outro' || mostImportant === 'Other') && !customMostImportant.trim())}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  {isBR ? 'Continuar' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TELA 4 — LEMBRAR APENAS UMA COISA */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-8 text-center"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] block">TELA 04 / 08</span>
                <h3 className="text-2xl md:text-3xl font-black font-display text-white uppercase leading-tight max-w-xl mx-auto">
                  {isBR
                    ? 'Se eu pudesse lembrar apenas UMA coisa para você durante o próximo ano... o que seria?'
                    : 'If I could remind you of only ONE thing during the next year... what would it be?'}
                </h3>
              </div>

              <div className="max-w-md mx-auto">
                <textarea
                  value={keyReminder}
                  onChange={(e) => setKeyReminder(e.target.value)}
                  placeholder={isBR ? 'Ex: Ligar para os meus pais todos os domingos' : 'e.g., Call my parents every Sunday'}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-sm md:text-base font-light text-white outline-none focus:border-amber-500/50 resize-none h-24"
                />
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {isBR ? 'Voltar' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!keyReminder.trim()}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  {isBR ? 'Continuar' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TELA 5 — ALGUÉM IMPORTANTE */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] block">TELA 05 / 08</span>
                <h3 className="text-2xl md:text-4xl font-black font-display text-white uppercase leading-tight">
                  {isBR ? 'Existe alguém que você nunca gostaria de esquecer?' : 'Is there someone you would never want to forget?'}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto">
                {someoneToNeverForgetOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSomeoneToNeverForget(opt);
                      if (opt !== 'Outro' && opt !== 'Other') {
                        setCustomSomeone('');
                      }
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      someoneToNeverForget === opt
                        ? 'bg-amber-50/10 border-amber-500 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-light">{opt}</span>
                  </button>
                ))}
              </div>

              {(someoneToNeverForget === 'Outro' || someoneToNeverForget === 'Other') && (
                <div className="max-w-md mx-auto animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    value={customSomeone}
                    onChange={(e) => setCustomSomeone(e.target.value)}
                    placeholder={isBR ? 'Nome ou papel (Ex: Meu sócio Thiago)...' : 'Name or role (e.g., My partner John)...'}
                    autoFocus
                    className="w-full bg-white/5 border-b border-amber-500 py-3 text-center text-sm md:text-base font-light text-white outline-none"
                  />
                </div>
              )}

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {isBR ? 'Voltar' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!someoneToNeverForget || ((someoneToNeverForget === 'Outro' || someoneToNeverForget === 'Other') && !customSomeone.trim())}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  {isBR ? 'Continuar' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TELA 6 — QUAL SONHO PROTEGER */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] block">TELA 06 / 08</span>
                <h3 className="text-2xl md:text-4xl font-black font-display text-white uppercase leading-tight">
                  {isBR ? 'Qual sonho você quer proteger?' : 'Which dream do you want to protect?'}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl mx-auto">
                {dreamExamples.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDreamToProtect(opt);
                      if (opt !== 'Outro' && opt !== 'Other') {
                        setCustomDream('');
                      }
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      dreamToProtect === opt
                        ? 'bg-amber-50/10 border-amber-500 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-light">{opt}</span>
                  </button>
                ))}
              </div>

              {(dreamToProtect === 'Outro' || dreamToProtect === 'Other') && (
                <div className="max-w-md mx-auto animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    value={customDream}
                    onChange={(e) => setCustomDream(e.target.value)}
                    placeholder={isBR ? 'Descreva o sonho...' : 'Describe the dream...'}
                    autoFocus
                    className="w-full bg-white/5 border-b border-amber-500 py-3 text-center text-sm md:text-base font-light text-white outline-none"
                  />
                </div>
              )}

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {isBR ? 'Voltar' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!dreamToProtect || ((dreamToProtect === 'Outro' || dreamToProtect === 'Other') && !customDream.trim())}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  {isBR ? 'Continuar' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TELA 7 — TOM DE CONVERSA */}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] block">TELA 07 / 08</span>
                <h3 className="text-2xl md:text-4xl font-black font-display text-white uppercase leading-tight">
                  {isBR ? 'Como você prefere que eu converse com você?' : 'How do you prefer that I talk to you?'}
                </h3>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                {communicationStyles.map((style) => (
                  <button
                    key={style.key}
                    onClick={() => setCommunicationStyle(style.key)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      communicationStyle === style.key
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs md:text-sm font-bold block">{style.label}</span>
                      <span className="text-[10px] text-gray-400 font-light block mt-1">{style.desc}</span>
                    </div>
                    {communicationStyle === style.key && <i className="fas fa-check text-amber-500 text-xs"></i>}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {isBR ? 'Voltar' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!communicationStyle}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  {isBR ? 'Continuar' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TELA 8 — PRIVACIDADE E CONSENTIMENTO */}
          {step === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-8 text-center"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] block">TELA 08 / 08</span>
                <h3 className="text-2xl md:text-4xl font-black font-display text-white uppercase leading-tight">
                  {isBR
                    ? 'Posso lembrar dessas informações para cuidar melhor de você?'
                    : 'Can I remember this information to take better care of you?'}
                </h3>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-left text-xs text-gray-400 leading-relaxed font-light space-y-4">
                  <p>
                    {isBR
                      ? 'No Mordomo.AI, sua privacidade é o pilar mais importante. Suas respostas serão armazenadas criptografadas e utilizadas unicamente para personalizar seu painel e as sugestões de cuidado de inteligência.'
                      : 'At Mordomo.AI, your privacy is our most vital pillar. Your responses will be stored encrypted and used solely to personalize your dashboard and intelligent care suggestions.'}
                  </p>
                  <p>
                    {isBR
                      ? 'Atendemos rigorosamente à LGPD (Lei Geral de Proteção de Dados). Suas informações nunca serão compartilhadas sem sua autorização explícita.'
                      : 'We strictly adhere to GDPR and key data protection acts. Your information will never be shared without your explicit authorization.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setConsent(true);
                      setTimeout(() => handleNext(), 300);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg"
                  >
                    {isBR ? 'Sim, concordo' : 'Yes, I agree'}
                  </button>
                  <button
                    onClick={() => setShowPrivacyDetail(true)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest"
                  >
                    {isBR ? 'Quero entender melhor' : 'I want to understand more'}
                  </button>
                </div>
              </div>

              {showPrivacyDetail && (
                <div className="fixed inset-0 z-[260] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] max-w-md text-left space-y-6">
                    <h4 className="text-lg font-black font-display text-white uppercase">{isBR ? 'Política de Cuidado e Confiança' : 'Trust & Care Policy'}</h4>
                    <div className="text-xs text-gray-400 leading-relaxed space-y-3 font-light">
                      <p><strong>1. {isBR ? 'Criptografia Ponta-a-Ponta' : 'End-to-End Encryption'}</strong><br/>{isBR ? 'Todos os dados de sonhos, nomes de familiares e focos diários são encriptados na nossa infraestrutura.' : 'All data regarding dreams, family names, and focus logs are securely encrypted.'}</p>
                      <p><strong>2. {isBR ? 'Sem Anúncios de Terceiros' : 'No Third-Party Ads'}</strong><br/>{isBR ? 'Não comercializamos perfis para publicidade. O ecossistema de recomendação sugere parceiros de confiança baseando-se apenas na sua real necessidade.' : 'We do not sell profile analytics. Recommendations suggest trusted partners only based on your actual needs.'}</p>
                      <p><strong>3. {isBR ? 'Exclusão Automática' : 'Automatic Erasure'}</strong><br/>{isBR ? 'Você pode requisitar a exclusão total e permanente de todos os seus registros de inteligência a qualquer momento.' : 'You can request total, permanent deletion of your intelligence logs at any time.'}</p>
                    </div>
                    <button
                      onClick={() => setShowPrivacyDetail(false)}
                      className="w-full bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-widest"
                    >
                      {isBR ? 'Entendido' : 'Understood'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white"
                >
                  {isBR ? 'Voltar' : 'Back'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TELA FINAL — PLANO GERADO */}
          {step === 9 && (
            <motion.div
              key="step9"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full space-y-8 text-center"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl mb-4">
                  <i className="fas fa-circle-check"></i>
                </div>
                <h3 className="text-3xl md:text-5xl font-black font-display text-white uppercase leading-tight">
                  {isBR ? `Prazer, ${firstName}.` : `Pleasure, ${firstName}.`}
                </h3>
                <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-md mx-auto">
                  {isBR
                    ? 'A partir de hoje vou ajudar você a cuidar de:'
                    : 'From this day forward, I will help you care for:'}
                </p>
              </div>

              {/* Personalized plan summary list */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 max-w-md mx-auto text-left space-y-3.5">
                <div className="flex items-center gap-3">
                  <i className="fas fa-check text-emerald-400 text-sm"></i>
                  <span className="text-sm text-gray-200">
                    {someoneToNeverForget === 'Outro' || someoneToNeverForget === 'Other' ? customSomeone : someoneToNeverForget}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-check text-emerald-400 text-sm"></i>
                  <span className="text-sm text-gray-200">
                    {dreamToProtect === 'Outro' || dreamToProtect === 'Other' ? customDream : dreamToProtect}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-check text-emerald-400 text-sm"></i>
                  <span className="text-sm text-gray-200">
                    {keyReminder}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-check text-emerald-400 text-sm"></i>
                  <span className="text-sm text-gray-200">
                    {isBR ? 'Priorizar sua família e valores' : 'Prioritize family and values'}
                  </span>
                </div>
                
                <div className="h-px bg-white/10 my-4"></div>

                <p className="text-[10px] text-gray-500 text-center italic font-light leading-relaxed">
                  {isBR
                    ? '✔ Sempre respeitando sua privacidade e as diretrizes de proteção de dados.'
                    : '✔ Always respecting your privacy and data protection guidelines.'}
                </p>
              </div>

              <div className="pt-6 max-w-md mx-auto">
                <button
                  onClick={() => setShowAuthGate(true)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-5 rounded-2xl text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                >
                  {isBR ? 'Entrar no meu Mordomo' : 'Enter my Mordomo'}
                </button>
              </div>

              {/* Authenticate Account Gate (After showing value) */}
              {showAuthGate && (
                <div className="fixed inset-0 z-[270] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-white/10 p-8 md:p-12 rounded-[3.5rem] max-w-md text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none"></div>

                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500">
                        <i className="fas fa-passport"></i>
                      </div>
                      <h4 className="text-2xl font-black font-display text-white uppercase tracking-tight">
                        {isBR ? 'Criar sua conta' : 'Create your account'}
                      </h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        {isBR 
                          ? 'Vincule seu perfil de cuidado de forma segura para acessar de qualquer dispositivo.' 
                          : 'Link your care profile securely to access it from any device.'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => triggerAuthSignUp('google')}
                        className="w-full bg-white text-slate-950 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-gray-100 transition-all"
                      >
                        <i className="fab fa-google text-xs"></i>
                        {isBR ? 'Criar com Google' : 'Create with Google'}
                      </button>
                      
                      <button
                        onClick={() => triggerAuthSignUp('apple')}
                        className="w-full bg-black border border-white/20 text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
                      >
                        <i className="fab fa-apple text-xs"></i>
                        {isBR ? 'Criar com Apple' : 'Create with Apple'}
                      </button>

                      <div className="flex items-center gap-3 my-4">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{isBR ? 'OU' : 'OR'}</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                      </div>

                      <button
                        onClick={() => triggerAuthSignUp('email')}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                      >
                        <i className="fas fa-envelope text-xs"></i>
                        {isBR ? 'Criar com Email' : 'Create with Email'}
                      </button>

                      <button
                        onClick={() => {
                          const finalMostImportant = mostImportant === 'Outro' || mostImportant === 'Other' ? customMostImportant : mostImportant;
                          const finalSomeone = someoneToNeverForget === 'Outro' || someoneToNeverForget === 'Other' ? customSomeone : someoneToNeverForget;
                          const finalDream = dreamToProtect === 'Outro' || dreamToProtect === 'Other' ? customDream : dreamToProtect;

                          onComplete({
                            firstName,
                            mostImportant: finalMostImportant,
                            keyReminder,
                            someoneToNeverForget: finalSomeone,
                            dreamToProtect: finalDream,
                            communicationStyle
                          }, true); // skipAuth = true
                        }}
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                      >
                        <i className="fas fa-user-secret text-xs"></i>
                        {isBR ? 'Continuar sem Conta (Convidado)' : 'Continue without Account (Guest)'}
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-500 leading-normal">
                      {isBR
                        ? 'Ao prosseguir, você concorda em guardar suas informações sob custódia de segurança do Mordomo.AI.'
                        : 'By proceeding, you agree to store your information under the security custody of Mordomo.AI.'}
                    </p>

                    <button
                      onClick={() => setShowAuthGate(false)}
                      className="text-xs text-gray-400 hover:text-white uppercase tracking-widest font-bold block mx-auto mt-4"
                    >
                      {isBR ? 'Voltar' : 'Back'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Footer indicator */}
      <div className="flex justify-between items-center max-w-md mx-auto w-full border-t border-white/5 pt-6 relative z-10">
        <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">
          {isBR ? 'Foco do Cuidado' : 'Care Focus'}
        </span>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step 
                  ? 'w-6 bg-amber-500' 
                  : s < step 
                    ? 'w-2 bg-amber-500/40' 
                    : 'w-2 bg-white/10'
              }`}
            ></div>
          ))}
        </div>
        <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">
          {step === 9 ? 'Pronto' : `${Math.round((step / 8) * 100)}%`}
        </span>
      </div>
    </div>
  );
};
