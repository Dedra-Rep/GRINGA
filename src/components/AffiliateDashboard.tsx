import React, { useState, useEffect } from 'react';
import { UserProfile, ImportantThing } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../services/errorHandlers';
import { 
  saveImportantThing, 
  getImportantThings, 
  deleteImportantThing 
} from '../services/firebaseService';

interface AffiliateDashboardProps {
  userProfile: UserProfile;
  onClose: () => void;
  onSignOut: () => void;
  speak: (text: string) => void;
  ui: any;
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ userProfile, onClose, onSignOut, speak, ui }) => {
  const [amazonIdBR, setAmazonIdBR] = useState(userProfile.amazonIdBR || '');
  const [amazonIdUS, setAmazonIdUS] = useState(userProfile.amazonIdUS || '');
  const [firstName, setFirstName] = useState(userProfile.firstName || '');
  const [mainGoal, setMainGoal] = useState(userProfile.mainGoal || '');
  const [importantPeople, setImportantPeople] = useState(userProfile.importantPeople?.join(', ') || '');
  const [preferredTone, setPreferredTone] = useState(userProfile.preferredTone || 'natural');
  const [dailyCareFocus, setDailyCareFocus] = useState(userProfile.dailyCareFocus?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'trustCircle' | 'importantThings' | 'founders'>('profile');

  // "O Que Importa" CRUD states
  const [importantThings, setImportantThings] = useState<ImportantThing[]>([]);
  const [loadingThings, setLoadingThings] = useState(false);
  const [thingType, setThingType] = useState('person');
  const [thingTitle, setThingTitle] = useState('');
  const [thingDesc, setThingDesc] = useState('');
  const [thingPriority, setThingPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [thingRelatedPerson, setThingRelatedPerson] = useState('');
  const [isSavingThing, setIsSavingThing] = useState(false);
  const [editingThingId, setEditingThingId] = useState<string | null>(null);

  const loadThings = async () => {
    setLoadingThings(true);
    const res = await getImportantThings(userProfile.uid || userProfile.id);
    if (res.success && res.data) {
      setImportantThings(res.data);
    }
    setLoadingThings(false);
  };

  useEffect(() => {
    if (activeTab === 'importantThings') {
      loadThings();
    }
  }, [activeTab]);

  const handleSaveThing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thingTitle.trim()) return;
    setIsSavingThing(true);
    const res = await saveImportantThing({
      id: editingThingId || undefined,
      type: thingType,
      title: thingTitle,
      description: thingDesc,
      priority: thingPriority,
      relatedPerson: thingRelatedPerson || undefined
    });
    if (res.success) {
      speak(isBR ? 'Guardado com sucesso.' : 'Successfully saved.');
      setThingTitle('');
      setThingDesc('');
      setThingRelatedPerson('');
      setThingPriority('medium');
      setEditingThingId(null);
      await loadThings();
    } else {
      speak(res.error || 'Erro ao salvar.');
    }
    setIsSavingThing(false);
  };

  const handleDeleteThing = async (id: string) => {
    const res = await deleteImportantThing(id);
    if (res.success) {
      speak(isBR ? 'Item excluído.' : 'Item deleted.');
      await loadThings();
    } else {
      speak(res.error || 'Erro ao excluir.');
    }
  };

  useEffect(() => {
    // Speak intro when dashboard opens
    speak(ui.dashboardIntro);
    
    // If locked, explain why
    if (userProfile.subscriptionLevel === 'free') {
      setTimeout(() => speak(ui.lockedExplanation), 4000);
    } else if (userProfile.subscriptionLevel === 'elite') {
      setTimeout(() => speak(ui.eliteIntro), 4000);
    } else {
      setTimeout(() => speak(ui.unlockedExplanation), 4000);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const activeId = userProfile.uid || userProfile.id;
    try {
      const userRef = doc(db, 'userProfiles', activeId);
      await updateDoc(userRef, {
        amazonIdBR,
        amazonIdUS,
        firstName,
        mainGoal,
        importantPeople: importantPeople.split(',').map(s => s.trim()).filter(Boolean),
        preferredTone,
        dailyCareFocus: dailyCareFocus.split(',').map(s => s.trim()).filter(Boolean)
      });
      speak(ui.saveSuccess);
    } catch (error) {
      console.error('Error saving profile:', error);
      speak(ui.saveError);
      handleFirestoreError(error, OperationType.UPDATE, `userProfiles/${activeId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isLocked = userProfile.subscriptionLevel === 'free';
  const isBR = ui.consultBtn?.toLowerCase().includes('guardar');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="bg-[#150a1d] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-transparent">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter font-display">
              {isBR ? 'Painel do Usuário' : 'User Control Panel'}
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{userProfile.email}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex border-b border-white/5 px-8 bg-black/20">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'profile' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {isBR ? 'Perfil & IDs' : 'Profile & IDs'}
          </button>
          <button 
            onClick={() => setActiveTab('trustCircle')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'trustCircle' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {isBR ? 'Círculo de Confiança' : 'Trust Circle'}
          </button>
          <button 
            onClick={() => setActiveTab('importantThings')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'importantThings' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {isBR ? 'O Que Importa' : 'What Matters'}
          </button>
          <button 
            onClick={() => setActiveTab('founders')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'founders' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Founders
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <>
              {/* Subscription Status */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Plano Atual</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        userProfile.subscriptionLevel === 'elite' ? 'bg-amber-500 text-slate-950' : 
                        userProfile.subscriptionLevel === 'standard' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {userProfile.subscriptionLevel === 'free' ? 'Aguardando Assinatura' : userProfile.subscriptionLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status da IA</span>
                    <div className={`text-xs font-black uppercase tracking-widest mt-1 ${isLocked ? 'text-amber-500/50' : 'text-emerald-400'}`}>
                      {isLocked ? 'Modo Demonstração' : 'Operação Total'}
                    </div>
                  </div>
                </div>

                {isLocked && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <a 
                      href="https://buy.stripe.com/aFa00cC3ny7lS5tJ4gS08g00" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => speak(ui.paymentRedirect)}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all group animate-pulse"
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Plano Standard</div>
                      <div className="text-lg font-black">$20<span className="text-xs opacity-50">/mês</span></div>
                      <div className="text-[9px] font-bold uppercase mt-2 group-hover:translate-x-1 transition-transform">Liberar Configurações →</div>
                    </a>
                    <a 
                      href="https://buy.stripe.com/9B65kw4rCgWs64jaFg08g01" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => speak(ui.paymentRedirect)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-4 rounded-2xl transition-all group"
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Plano Elite</div>
                      <div className="text-lg font-black">$50<span className="text-xs opacity-50">/mês</span></div>
                      <div className="text-[9px] font-bold uppercase mt-2 group-hover:translate-x-1 transition-transform">IDs + Treinamento →</div>
                    </a>
                  </div>
                )}
              </div>

              {/* Personalization Details */}
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500/60">Seu Perfil de Cuidado</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Como quer ser chamado?</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Seu primeiro nome"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Tom de Voz da IA</label>
                    <select 
                      value={preferredTone}
                      onChange={(e) => setPreferredTone(e.target.value)}
                      className="w-full bg-[#1c1126] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all"
                    >
                      <option value="natural">Natural e Próximo (Recomendado)</option>
                      <option value="discreto">Discreto e Direto</option>
                      <option value="acolhedor">Acolhedor e Cuidadoso</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Principal Objetivo Atual</label>
                    <input 
                      type="text" 
                      value={mainGoal}
                      onChange={(e) => setMainGoal(e.target.value)}
                      placeholder="Ex: passar mais tempo em família, focar na saúde, organizar finanças"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Pessoas Importantes (separadas por vírgula)</label>
                    <input 
                      type="text" 
                      value={importantPeople}
                      onChange={(e) => setImportantPeople(e.target.value)}
                      placeholder="Ex: Maria, Noah, Alice"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Foco do Cuidado Diário (separados por vírgula)</label>
                    <input 
                      type="text" 
                      value={dailyCareFocus}
                      onChange={(e) => setDailyCareFocus(e.target.value)}
                      placeholder="Ex: saúde, finanças, compras"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Amazon IDs */}
              <div className={`space-y-6 transition-all ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500/60">Configurações de Afiliado</h3>
                  {isLocked && (
                    <div className="flex items-center gap-2 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                      <i className="fas fa-lock"></i>
                      Bloqueado
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Amazon ID Brasil</label>
                    <input 
                      type="text" 
                      value={amazonIdBR}
                      onChange={(e) => setAmazonIdBR(e.target.value)}
                      disabled={isLocked}
                      placeholder={isLocked ? "Assine para liberar" : "ex: seuid-20"}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Amazon ID EUA</label>
                    <input 
                      type="text" 
                      value={amazonIdUS}
                      onChange={(e) => setAmazonIdUS(e.target.value)}
                      disabled={isLocked}
                      placeholder={isLocked ? "Assine para liberar" : "ex: yourid-20"}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Elite Content */}
              {userProfile.subscriptionLevel === 'elite' ? (
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/20 rounded-3xl p-8 border border-amber-500/30 mt-6">
                  <h3 className="text-amber-500 font-black uppercase tracking-[0.3em] text-xs mb-4 flex items-center gap-3">
                    <i className="fas fa-graduation-cap"></i>
                    Treinamento de Escala
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Acesse suas aulas exclusivas sobre como escalar suas recomendações e ajudar mais pessoas a organizarem suas vidas.
                  </p>
                  <button 
                    onClick={() => speak(ui.trainingAccess)}
                    className="bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all"
                  >
                    Acessar Treinamento
                  </button>
                </div>
              ) : userProfile.subscriptionLevel === 'standard' && (
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center mt-6">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Quer aprender a fazer anúncios?</p>
                  <a 
                    href="https://buy.stripe.com/9B65kw4rCgWs64jaFg08g01" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => speak(ui.paymentRedirect)}
                    className="inline-block text-amber-500 border border-amber-500/30 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all"
                  >
                    Upgrade para Elite ($50)
                  </a>
                </div>
              )}
            </>
          )}

          {activeTab === 'trustCircle' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-6">
                <h3 className="text-lg font-black font-display text-white uppercase tracking-tight flex items-center gap-3">
                  <i className="fas fa-circle-nodes text-amber-400"></i>
                  {isBR ? 'Círculo de Confiança Mordomo' : 'Mordomo Trust Circle'}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-2 font-light">
                  {isBR 
                    ? 'Este é o nosso ecossistema mundial de reconhecimento por valor compartilhado. O usuário nunca ganha por indicar apenas cadastros; ele é reconhecido e premiado quando gera valor real e duradouro de cuidado.' 
                    : 'This is our global ecosystem for value-based recognition. You never earn just from registrations or spam invitations; you are recognized and rewarded for generating genuine, long-term care value.'}
                </p>
              </div>

              {/* Princípios de Geração de Valor */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {isBR ? 'Como funciona a geração de valor' : 'How value generation works'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { titleBr: 'Assinatura Ativa', titleEn: 'Active Subscription', descBr: 'Uma pessoa indicada assina e usa o Mordomo diário.', descEn: 'A referred user subscribes and uses Mordomo daily.' },
                    { titleBr: 'Contrato Corporativo', titleEn: 'Enterprise Contract', descBr: 'Uma empresa contrata para cuidar dos seus colaboradores.', descEn: 'A business contracts Mordomo to care for its employees.' },
                    { titleBr: 'Retenção Ativa', titleEn: 'Active Retention', descBr: 'A assinatura permanece ativa e protegendo vidas.', descEn: 'The subscription remains active and protecting lives.' }
                  ].map((val, idx) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-heart text-xs"></i>
                      </div>
                      <h5 className="text-xs font-bold text-white mb-1">{isBR ? val.titleBr : val.titleEn}</h5>
                      <p className="text-[10px] text-gray-400 font-light leading-relaxed">{isBR ? val.descBr : val.descEn}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Níveis do Programa */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {isBR ? 'Níveis de Reconhecimento' : 'Recognition Levels'}
                </h4>
                <div className="space-y-4">
                  {[
                    { level: 'Explorador', icon: 'fa-compass', color: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/5', descBr: 'Fase inicial do cuidado de rotina.', descEn: 'Beginning stage of routine care.', benefitBr: '10% de comissão recorrente em assinaturas ativas indicadas.', benefitEn: '10% recurring commission on referred active subscriptions.' },
                    { level: 'Guardião', icon: 'fa-shield-halved', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', descBr: 'Reconhecimento para quem mantém 5 ou mais vidas sob cuidado.', descEn: 'Recognition for keeping 5+ active lives under care.', benefitBr: 'Selo Guardião, suporte prioritário, 15% de recorrência ativa.', benefitEn: 'Guardian badge, priority support, 15% recurring reward.' },
                    { level: 'Mentor', icon: 'fa-user-tie', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', descBr: 'Líderes comunitários e consultores de bem-estar.', descEn: 'Community leaders and wellness advisors.', benefitBr: 'Acesso ao conselho de produto, comissão de 20% em assinaturas.', benefitEn: 'Product board seat, 20% active recurring reward.' },
                    { level: 'Embaixador', icon: 'fa-crown', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', descBr: 'Parceiros de grande porte corporativo.', descEn: 'Enterprise enterprise-level partners.', benefitBr: 'Conselho consultivo estratégico anual, 25% de recorrência ativa.', benefitEn: 'Annual strategic advisory seat, 25% recurring reward.' }
                  ].map((lvl, idx) => (
                    <div key={idx} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border ${lvl.border} ${lvl.bg} gap-4`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${lvl.color}`}>
                          <i className={`fas ${lvl.icon} text-sm`}></i>
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-white">{lvl.level}</h5>
                          <p className="text-[10px] text-gray-400 font-light">{isBR ? lvl.descBr : lvl.descEn}</p>
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-right max-w-xs">
                        <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider block">{isBR ? 'BENEFÍCIO' : 'BENEFIT'}</span>
                        <span className="text-[11px] text-gray-200 font-medium leading-normal block mt-0.5">{isBR ? lvl.benefitBr : lvl.benefitEn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'importantThings' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Form Card */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                  {editingThingId 
                    ? (isBR ? 'Editar O Que Importa' : 'Edit What Matters') 
                    : (isBR ? 'Adicionar O Que Importa' : 'Add What Matters')}
                </h3>
                
                <form onSubmit={handleSaveThing} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                        {isBR ? 'Tipo / Categoria' : 'Type / Category'}
                      </label>
                      <select
                        value={thingType}
                        onChange={(e) => setThingType(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/50"
                      >
                        <option value="person">{isBR ? 'Pessoa (Família, Sócio etc.)' : 'Person (Family, Partner etc.)'}</option>
                        <option value="compromise">{isBR ? 'Compromisso / Lembrete' : 'Compromise / Reminder'}</option>
                        <option value="goal">{isBR ? 'Sonho / Objetivo' : 'Dream / Goal'}</option>
                        <option value="document">{isBR ? 'Documento / Registro' : 'Document / Record'}</option>
                        <option value="other">{isBR ? 'Outro' : 'Other'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                        {isBR ? 'Título Principal' : 'Main Title'}
                      </label>
                      <input
                        type="text"
                        required
                        value={thingTitle}
                        onChange={(e) => setThingTitle(e.target.value)}
                        placeholder={isBR ? 'Ex: Aniversário da Mãe, Passaporte' : 'e.g., Mom\'s Birthday, Passport'}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                        {isBR ? 'Prioridade' : 'Priority'}
                      </label>
                      <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setThingPriority(p)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                              thingPriority === p
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                                : 'bg-slate-950 border-white/5 text-gray-500 hover:text-white'
                            }`}
                          >
                            {isBR 
                              ? (p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta')
                              : p.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                        {isBR ? 'Pessoa Relacionada (Opcional)' : 'Related Person (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={thingRelatedPerson}
                        onChange={(e) => setThingRelatedPerson(e.target.value)}
                        placeholder={isBR ? 'Ex: Mariana, Thiago' : 'e.g., Mariana, Thiago'}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      {isBR ? 'Descrição / Detalhes' : 'Description / Details'}
                    </label>
                    <textarea
                      value={thingDesc}
                      onChange={(e) => setThingDesc(e.target.value)}
                      placeholder={isBR ? 'Algum detalhe ou informação complementar que a IA deve lembrar' : 'Any details or additional info the AI should remember'}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/50 resize-none h-20"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <p className="text-[9px] text-gray-500 italic leading-relaxed max-w-sm">
                      {isBR 
                        ? '✔ Vou guardar isso apenas para ajudar você a lembrar depois. Você poderá apagar ou editar essas informações no futuro.'
                        : '✔ I will keep this only to help you remember later. You can delete or edit this information in the future.'}
                    </p>
                    <div className="flex gap-2">
                      {editingThingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingThingId(null);
                            setThingTitle('');
                            setThingDesc('');
                            setThingRelatedPerson('');
                            setThingPriority('medium');
                          }}
                          className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all bg-white/5"
                        >
                          {isBR ? 'Cancelar' : 'Cancel'}
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingThing}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        {isSavingThing 
                          ? (isBR ? 'Salvando...' : 'Saving...') 
                          : (editingThingId ? (isBR ? 'Atualizar' : 'Update') : (isBR ? 'Guardar' : 'Save'))}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* List of items */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {isBR ? 'O Que Está Guardado' : 'What is Saved'}
                </h4>

                {loadingThings ? (
                  <div className="text-center py-8 text-gray-500 text-xs animate-pulse">
                    {isBR ? 'Carregando itens seguros...' : 'Loading secure items...'}
                  </div>
                ) : importantThings.length === 0 ? (
                  <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-10 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-600">
                      <i className="fas fa-box-open text-sm"></i>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      {isBR ? 'Comece guardando algo que você não quer esquecer.' : 'Start by saving something you do not want to forget.'}
                    </p>
                    <p className="text-[10px] text-gray-600">
                      {isBR ? 'Use o formulário acima para adicionar registros.' : 'Use the form above to add records.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {importantThings.map((thing) => (
                      <div 
                        key={thing.id}
                        className="bg-white/5 rounded-2xl border border-white/5 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              thing.type === 'person' ? 'bg-blue-500/10 text-blue-400' :
                              thing.type === 'compromise' ? 'bg-purple-500/10 text-purple-400' :
                              thing.type === 'goal' ? 'bg-emerald-500/10 text-emerald-400' :
                              thing.type === 'document' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'
                            }`}>
                              {isBR ? (
                                thing.type === 'person' ? 'Pessoa' :
                                thing.type === 'compromise' ? 'Compromisso' :
                                thing.type === 'goal' ? 'Sonho' :
                                thing.type === 'document' ? 'Documento' : 'Outro'
                              ) : thing.type.toUpperCase()}
                            </span>
                            
                            {thing.priority === 'high' && (
                              <span className="bg-rose-500/10 text-rose-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                                {isBR ? 'ALTA' : 'HIGH'}
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-black text-white">{thing.title}</h4>
                            {thing.relatedPerson && (
                              <p className="text-[10px] text-amber-500/70 mt-0.5 font-medium">
                                <i className="fas fa-user text-[8px] mr-1"></i> {isBR ? `Relacionado a: ${thing.relatedPerson}` : `Related to: ${thing.relatedPerson}`}
                              </p>
                            )}
                            {thing.description && (
                              <p className="text-xs text-gray-400 font-light leading-relaxed mt-2 max-w-lg">
                                {thing.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-center">
                          <button
                            onClick={() => {
                              setEditingThingId(thing.id);
                              setThingType(thing.type);
                              setThingTitle(thing.title);
                              setThingDesc(thing.description || '');
                              setThingPriority(thing.priority || 'medium');
                              setThingRelatedPerson(thing.relatedPerson || '');
                            }}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteThing(thing.id)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'founders' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400">
                  <i className="fas fa-crown text-base animate-pulse"></i>
                </div>
                <h3 className="text-xl font-black font-display text-white uppercase tracking-tight">FOUNDERS CLUB</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-light max-w-md mx-auto">
                  {isBR 
                    ? 'Você faz parte dos primeiros usuários do Mordomo. Os fundadores ajudarão a construir o futuro da plataforma e terão privilégios de longo prazo.' 
                    : 'You are part of the early wave of Mordomo users. Founders will shape the product roadmap and retain lifetime privileges.'}
                </p>
              </div>

              {/* Benefícios Simulados */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {isBR ? 'Seus privilégios vitalícios' : 'Your lifetime privileges'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { titleBr: 'Preço Vitalício', titleEn: 'Lifetime Pricing', descBr: 'Garantia de manter sempre o valor de adesão do lançamento.', descEn: 'Guaranteed lock on early member pricing forever.' },
                    { titleBr: 'Selo de Fundador', titleEn: 'Founder Badge', descBr: 'Selo exclusivo para autenticar sua conta prioritária no ecossistema.', descEn: 'Exclusive profile badge to authenticate priority account status.' },
                    { titleBr: 'Novidades Antecipadas', titleEn: 'Early Access', descBr: 'Teste novos recursos de IA e canais de integração em primeira mão.', descEn: 'First-look testing for upcoming AI algorithms & integration channels.' },
                    { titleBr: 'Canal de Votação', titleEn: 'Roadmap Voting', descBr: 'Poder de veto e voto ativo na escolha do plano de funcionalidades.', descEn: 'Direct voting power to determine feature priority logs.' }
                  ].map((priv, idx) => (
                    <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <i className="fas fa-circle-check text-xs"></i>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white mb-1">{isBR ? priv.titleBr : priv.titleEn}</h5>
                        <p className="text-[10px] text-gray-400 font-light leading-relaxed">{isBR ? priv.descBr : priv.descEn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>



        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <button 
            onClick={onSignOut}
            className="text-gray-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Sair da Conta
          </button>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-white text-slate-950 font-black px-10 py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
