import React, { useState } from 'react';
import { Locale } from '../types';

interface TrustEcosystemProps {
  currentLocale: Locale;
  speak: (text: string) => void;
}

export const TrustEcosystem: React.FC<TrustEcosystemProps> = ({ currentLocale, speak }) => {
  const isBR = currentLocale === 'pt-BR';

  // State for Weekly Missions
  const [missions, setMissions] = useState([
    { id: 1, textBr: 'Organizar documentos importantes', textEn: 'Organize important documents', completed: false, icon: 'fa-file-invoice' },
    { id: 2, textBr: 'Economizar R$ 100 de gastos invisíveis', textEn: 'Save $100 from invisible expenses', completed: false, icon: 'fa-piggy-bank' },
    { id: 3, textBr: 'Dormir melhor (pelo menos 7h30)', textEn: 'Sleep better (at least 7h30m)', completed: false, icon: 'fa-moon' },
    { id: 4, textBr: 'Ligar para alguém importante da família', textEn: 'Call an important family member', completed: false, icon: 'fa-phone' },
    { id: 5, textBr: 'Concluir uma meta prioritária da semana', textEn: 'Complete one high-priority weekly goal', completed: false, icon: 'fa-bullseye' },
    { id: 6, textBr: 'Fazer backup seguro de fotos e arquivos', textEn: 'Securely backup photos and files', completed: false, icon: 'fa-database' },
    { id: 7, textBr: 'Registrar um sonho ou ideia estratégica', textEn: 'Record a dream or strategic idea', completed: false, icon: 'fa-brain' },
  ]);

  const toggleMission = (id: number) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.completed;
        if (nextState) {
          speak(isBR ? "Missão concluída. Menos uma preocupação na sua mente." : "Mission completed. One less worry on your mind.");
        }
        return { ...m, completed: nextState };
      }
      return m;
    }));
  };

  // Translations
  const t = {
    tranquilityTitle: isBR ? 'Índice de Tranquilidade' : 'Tranquility Index',
    tranquilitySubtitle: isBR ? 'Indicador executivo consolidado de bem-estar e organização.' : 'Consolidated executive indicator of well-being and organization.',
    missionsTitle: isBR ? 'Missões da Semana' : 'Weekly Missions',
    missionsSubtitle: isBR ? 'Foco prático para reduzir sua carga mental diária.' : 'Practical focus to reduce your daily mental load.',
    sharedLifeTitle: isBR ? 'Vida Compartilhada' : 'Shared Life',
    sharedLifeSubtitle: isBR ? 'Cuidado estendido para quem você ama.' : 'Extended care for the ones you love.',
    sharedLifeText: isBR 
      ? 'Em breve será possível compartilhar o cuidado inteligente diretamente com seu cônjuge, filhos, pais e irmãos. Uma única assinatura para proteger toda a estrutura familiar.' 
      : 'Soon, you will be able to share intelligent care directly with your spouse, children, parents, and siblings. A single subscription to protect the entire family structure.',
    marketplaceTitle: isBR ? 'Marketplace de Confiança' : 'Trust Marketplace',
    marketplaceSubtitle: isBR ? 'Parceiros rigorosamente selecionados para atender suas necessidades.' : 'Rigorously vetted partners selected to meet your needs.',
    marketplaceDesc: isBR
      ? 'Quando o Mordomo detectar uma necessidade de cuidado ou proteção na sua rotina, ele poderá sugerir profissionais e serviços credenciados de alta confiabilidade.'
      : 'When the Mordomo detects a need for care or protection in your routine, it can suggest highly reliable credentialed professionals and services.',
    marketplaceDisclaimer: isBR
      ? 'As recomendações são baseadas exclusivamente na real necessidade de cuidado do usuário. Nunca apenas em comissões.'
      : 'Recommendations are based exclusively on the user’s actual care needs. Never solely on commissions.',
    socialTitle: isBR ? 'Impacto Coletivo' : 'Collective Impact',
    socialSubtitle: isBR ? 'Métricas reais de um sistema construído para durar gerações.' : 'Real metrics of a system built to last generations.',
    mainMetricLabel: isBR ? 'Horas de tranquilidade devolvidas às pessoas' : 'Hours of tranquility returned to people',
    foundersTitle: isBR ? 'Founders (Exclusivo)' : 'Founders (Exclusive)',
    foundersText: isBR
      ? 'Você faz parte dos primeiros usuários do Mordomo. Os fundadores ajudarão a construir o futuro da plataforma e terão privilégios vitalícios.'
      : 'You are part of the first wave of Mordomo users. Founders will help build the future of the platform and enjoy lifetime privileges.',
    foundersBadge: isBR ? 'Membro Fundador' : 'Founder Member',
    foundersBenefits: [
      { textBr: 'Preço vitalício garantido', textEn: 'Lifetime price guarantee' },
      { textBr: 'Selo exclusivo Founder no perfil', textEn: 'Exclusive Founder badge on profile' },
      { textBr: 'Acesso antecipado a novas funcionalidades', textEn: 'Early access to new features' },
      { textBr: 'Participação na comunidade privada', textEn: 'Private community membership' },
      { textBr: 'Poder de voto no roadmap de produto', textEn: 'Voting power on product roadmap' }
    ],
    categories: [
      { nameBr: 'Família', nameEn: 'Family', val: 90, icon: 'fa-house-user', color: 'text-emerald-400' },
      { nameBr: 'Saúde', nameEn: 'Health', val: 80, icon: 'fa-heart-pulse', color: 'text-rose-400' },
      { nameBr: 'Finanças', nameEn: 'Finances', val: 75, icon: 'fa-vault', color: 'text-amber-400' },
      { nameBr: 'Objetivos', nameEn: 'Goals', val: 85, icon: 'fa-circle-check', color: 'text-blue-400' },
      { nameBr: 'Documentos', nameEn: 'Documents', val: 95, icon: 'fa-passport', color: 'text-cyan-400' },
      { nameBr: 'Relacionamentos', nameEn: 'Relationships', val: 80, icon: 'fa-people-arrows', color: 'text-indigo-400' },
      { nameBr: 'Tempo', nameEn: 'Time', val: 82, icon: 'fa-clock', color: 'text-purple-400' }
    ],
    partners: [
      { nameBr: 'Seguro', nameEn: 'Insurance', icon: 'fa-shield-halved' },
      { nameBr: 'Advogado', nameEn: 'Lawyer', icon: 'fa-scale-balanced' },
      { nameBr: 'Contador', nameEn: 'Accountant', icon: 'fa-calculator' },
      { nameBr: 'Psicólogo', nameEn: 'Psychologist', icon: 'fa-brain' },
      { nameBr: 'Médico', nameEn: 'Doctor', icon: 'fa-stethoscope' },
      { nameBr: 'Curso', nameEn: 'Course', icon: 'fa-graduation-cap' },
      { nameBr: 'Viagem', nameEn: 'Travel', icon: 'fa-plane' },
      { nameBr: 'Nutricionista', nameEn: 'Nutritionist', icon: 'fa-apple-whole' },
      { nameBr: 'Consultoria', nameEn: 'Consulting', icon: 'fa-briefcase' }
    ]
  };

  return (
    <div className="space-y-24">
      {/* 1. SECTION: EXECUTIVE WELLBEING DASHBOARD */}
      <section className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-[0.2em]">
            <i className="fas fa-chart-line"></i>
            {isBR ? 'MÉTRICAS EXECUTIVAS' : 'EXECUTIVE METRICS'}
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-white text-center">
            {isBR ? 'Painel de Tranquilidade e Cuidado' : 'Tranquility & Care Dashboard'}
          </h2>
          <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto font-medium">
            {isBR ? 'Indicadores gerenciais e rotina de foco para sustentar sua clareza de longo prazo.' : 'Managerial indicators and focus routines to sustain your long-term clarity.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* A. TRANQUILITY INDEX CARD */}
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-amber-500/20 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display text-white">{t.tranquilityTitle}</h3>
                  <p className="text-gray-500 text-xs mt-1 font-light">{t.tranquilitySubtitle}</p>
                </div>
                {/* Executive Score badge */}
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block">{isBR ? 'INDICE GLOBAL' : 'GLOBAL INDEX'}</span>
                  <span className="text-4xl md:text-5xl font-black text-amber-400 font-display block mt-1">85<span className="text-sm font-light text-gray-500">/100</span></span>
                </div>
              </div>

              <div className="h-px bg-white/[0.05]"></div>

              {/* Category rows */}
              <div className="space-y-4">
                {t.categories.map((cat, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2.5 text-gray-300">
                        <i className={`fas ${cat.icon} text-[11px] ${cat.color}`}></i>
                        <span className="font-light">{isBR ? cat.nameBr : cat.nameEn}</span>
                      </div>
                      <span className="font-bold text-gray-400">{cat.val}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500/40 to-amber-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${cat.val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.05] flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {isBR ? 'Status: ÓTIMO ESTADO' : 'Status: OPTIMAL CONDITION'}
              </span>
              <span className="text-[9px] text-amber-500/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <i className="fas fa-circle-check text-[7px] animate-pulse"></i>
                {isBR ? 'Monitorado em Tempo Real' : 'Real-time Monitored'}
              </span>
            </div>
          </div>

          {/* B. WEEKLY MISSIONS CARD */}
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-blue-500/10 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display text-white">{t.missionsTitle}</h3>
                  <p className="text-gray-500 text-xs mt-1 font-light">{t.missionsSubtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block">{isBR ? 'COMPLETAS' : 'COMPLETED'}</span>
                  <span className="text-2xl font-black text-blue-400 font-display block mt-1">
                    {missions.filter(m => m.completed).length}<span className="text-xs font-light text-gray-500">/7</span>
                  </span>
                </div>
              </div>

              <div className="h-px bg-white/[0.05]"></div>

              {/* Missions checklist */}
              <div className="space-y-3.5">
                {missions.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMission(m.id)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl text-left border transition-all duration-300 ${
                      m.completed 
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' 
                        : 'bg-white/[0.01] border-white/[0.04] text-gray-400 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      m.completed ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-white/20'
                    }`}>
                      {m.completed && <i className="fas fa-check text-[10px] font-black"></i>}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <i className={`fas ${m.icon} text-xs shrink-0 opacity-60`}></i>
                      <span className={`text-xs md:text-sm font-light ${m.completed ? 'line-through opacity-60' : ''}`}>
                        {isBR ? m.textBr : m.textEn}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black">
                {isBR ? '* Clique em cada missão para marcar como feita' : '* Click on each mission to mark as completed'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION: SHARED LIFE & TRUST MARKETPLACE */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
        {/* A. SHARED LIFE CARD */}
        <div className="bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden group hover:border-purple-500/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-52 h-52 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-sm mb-8 border border-purple-500/20">
            <i className="fas fa-people-roof text-base"></i>
          </div>

          <span className="text-[9px] font-black bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-4">
            {isBR ? 'EM BREVE' : 'COMING SOON'}
          </span>

          <h3 className="text-2xl font-black font-display text-white mb-4">
            {t.sharedLifeTitle}
          </h3>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light mb-8">
            {t.sharedLifeText}
          </p>

          <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-wrap gap-3 items-center">
            <span className="text-[10px] font-black uppercase text-gray-500 mr-2">{isBR ? 'Compartilhe com:' : 'Share with:'}</span>
            {['cônjuge', 'filhos', 'pais', 'irmãos'].map((member, mIdx) => (
              <span key={mIdx} className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-3 py-1.5 rounded-xl font-medium">
                {isBR ? member : member === 'cônjuge' ? 'spouse' : member === 'filhos' ? 'children' : member === 'pais' ? 'parents' : 'siblings'}
              </span>
            ))}
          </div>
        </div>

        {/* B. TRUST MARKETPLACE CARD */}
        <div className="bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-sm mb-8 border border-emerald-500/20">
            <i className="fas fa-handshake-simple text-base"></i>
          </div>

          <span className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-4">
            {isBR ? 'RELAÇÕES DE CONFIANÇA' : 'TRUST RELATIONS'}
          </span>

          <h3 className="text-2xl font-black font-display text-white mb-4">
            {t.marketplaceTitle}
          </h3>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light mb-8">
            {t.marketplaceDesc}
          </p>

          {/* Grid of categories */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {t.partners.map((partner, pIdx) => (
              <div key={pIdx} className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <i className={`fas ${partner.icon} text-gray-500 text-xs mb-2 group-hover:text-amber-500 transition-colors`}></i>
                <span className="text-[10px] text-gray-400 font-light truncate w-full">
                  {isBR ? partner.nameBr : partner.nameEn}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <p className="text-[11px] text-amber-500 font-bold leading-relaxed italic">
              " {t.marketplaceDisclaimer} "
            </p>
          </div>
        </div>
      </section>

      {/* 3. SECTION: SOCIAL PROOF & MAIN METRIC */}
      <section className="max-w-6xl mx-auto py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-amber-500/5 to-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
            {isBR ? 'IMPACTO ATUAL' : 'CURRENT IMPACT'}
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-white">
            {isBR ? 'Nossa Métrica Principal' : 'Our Primary Metric'}
          </h2>
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-amber-500/20 border border-amber-500/30 p-8 rounded-[2.5rem] max-w-3xl mx-auto my-6">
            <span className="text-4xl md:text-6xl font-black text-white font-display block tracking-tight">38.000.000+</span>
            <span className="text-xs md:text-lg text-amber-400 font-bold uppercase tracking-widest block mt-3">
              {t.mainMetricLabel}
            </span>
          </div>
        </div>

        {/* Prova social metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {[
            { metric: '12M+', labelBr: 'Lembretes úteis enviados', labelEn: 'Useful reminders sent', icon: 'fa-bell' },
            { metric: '380k+', labelBr: 'Objetivos concluídos', labelEn: 'Goals completed', icon: 'fa-circle-check' },
            { metric: '92k+', labelBr: 'Famílias organizadas', labelEn: 'Families organized', icon: 'fa-people-roof' },
            { metric: '38M+', labelBr: 'Horas de preocupação poupadas', labelEn: 'Hours of worry saved', icon: 'fa-clock' }
          ].map((stat, sIdx) => (
            <div key={sIdx} className="bg-white/[0.01] border border-white/[0.05] rounded-[2rem] p-8 text-center flex flex-col justify-between hover:border-white/10 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-gray-500">
                <i className={`fas ${stat.icon} text-sm`}></i>
              </div>
              <div className="space-y-2">
                <span className="text-3xl font-black text-white font-display block">{stat.metric}</span>
                <span className="text-xs text-gray-400 font-light block leading-relaxed">
                  {isBR ? stat.labelBr : stat.labelEn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTION: FOUNDERS ZONE */}
      <section className="max-w-4xl mx-auto py-12">
        <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 rounded-[3rem] p-8 md:p-14 relative overflow-hidden text-center">
          <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-black uppercase text-[8px] tracking-widest px-4 py-1.5 rounded-full">
            {t.foundersBadge}
          </div>

          <h3 className="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-tight mb-4">
            FOUNDERS
          </h3>
          <p className="text-gray-300 text-sm md:text-lg leading-relaxed font-light max-w-2xl mx-auto mb-10">
            {t.foundersText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {t.foundersBenefits.map((benefit, bIdx) => (
              <div key={bIdx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3 text-left">
                <i className="fas fa-check-circle text-amber-500 text-sm shrink-0"></i>
                <span className="text-xs text-gray-300 font-light">
                  {isBR ? benefit.textBr : benefit.textEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
