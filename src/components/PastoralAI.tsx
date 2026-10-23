import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  User,
  MapPin,
  Calendar,
  BookOpen,
  MessageSquare,
  FileText,
  HeartHandshake,
  Home,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Visitor, AppSettings } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/storage';

interface PastoralAIProps {
  visitors: Visitor[];
  settings: AppSettings;
  selectedVisitorId?: string | null;
  onClearSelectedVisitor?: () => void;
}

type PastoralMessageType =
  | 'welcome_post_service'
  | 'third_day_followup'
  | 'biblical_encouragement'
  | 'home_visit_guide'
  | 'prayer_reply';

export const PastoralAI: React.FC<PastoralAIProps> = ({
  visitors,
  settings,
  selectedVisitorId,
  onClearSelectedVisitor
}) => {
  const [selectedType, setSelectedType] = useState<PastoralMessageType>('welcome_post_service');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [serviceAttended, setServiceAttended] = useState('Culto da Família - Domingo 19h');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [tone, setTone] = useState('caloroso, pastoral e encorajador');

  // Result state
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // If a visitor was passed in or selected from dropdown
  useEffect(() => {
    if (selectedVisitorId) {
      const found = visitors.find((v) => v.id === selectedVisitorId);
      if (found) {
        setVisitorName(found.name);
        setVisitorPhone(found.phone);
        setNeighborhood(found.neighborhood);
        setServiceAttended(found.serviceAttended);
        setPrayerRequest(found.prayerRequest || '');
      }
    }
  }, [selectedVisitorId, visitors]);

  const handleSelectVisitorDropdown = (id: string) => {
    if (!id) {
      setVisitorName('');
      setVisitorPhone('');
      setNeighborhood('');
      setPrayerRequest('');
      return;
    }
    const found = visitors.find((v) => v.id === id);
    if (found) {
      setVisitorName(found.name);
      setVisitorPhone(found.phone);
      setNeighborhood(found.neighborhood);
      setServiceAttended(found.serviceAttended);
      setPrayerRequest(found.prayerRequest || '');
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!visitorName.trim()) return;

    setIsLoading(true);
    setCopied(false);

    try {
      const response = await fetch('/api/gemini/pastoral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          visitorName: visitorName.trim(),
          serviceAttended,
          neighborhood,
          prayerRequest,
          customNotes,
          pastorName: 'Liderança Pastoral Efraim',
          tone
        })
      });

      const data = await response.json();
      setGeneratedMessage(data.message || '');
      setGeneratedSubject(data.subject || 'Mensagem Pastoral');
    } catch (err) {
      console.error('Erro gerando mensagem pastoral:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedMessage) return;
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToWhatsApp = () => {
    if (!generatedMessage) return;
    const cleanNumber = cleanPhoneForWhatsApp(visitorPhone);
    const textEncoded = encodeURIComponent(generatedMessage);

    let url = '';
    if (cleanNumber) {
      url = `https://wa.me/${cleanNumber}?text=${textEncoded}`;
    } else {
      url = `https://wa.me/?text=${textEncoded}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Inteligência Artificial Pastoral com Gemini 3.8 Flash</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Assistente IA Pastoral
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Gere mensagens bíblicas de acolhimento para visitantes pós-culto, acompanhamento de 3º dia, encorajamento na fé e agendamento de visitas no lar com 1 clique para o WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 space-y-5">
          <form
            onSubmit={handleGenerate}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>1. Escolha o Objetivo da Mensagem</span>
              </h3>
            </div>

            {/* Template Selector Buttons */}
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('welcome_post_service')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedType === 'welcome_post_service'
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-100 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <HeartHandshake className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-white">Acolhimento Pós-Culto</span>
                  <span className="text-[11px] text-slate-400">
                    Agradecer a presença no culto recente e abrir as portas da igreja.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('third_day_followup')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedType === 'third_day_followup'
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-100 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-white">Acompanhamento do 3º Dia</span>
                  <span className="text-[11px] text-slate-400">
                    Sondar como está a semana do visitante e oferecer intercessão.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('biblical_encouragement')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedType === 'biblical_encouragement'
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-100 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <BookOpen className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-white">Encorajamento Bíblico na Luta</span>
                  <span className="text-[11px] text-slate-400">
                    Palavra profética de consolo, cura e fé adaptada à necessidade.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('home_visit_guide')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedType === 'home_visit_guide'
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-100 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Home className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-white">Agendamento de Visita no Lar</span>
                  <span className="text-[11px] text-slate-400">
                    Proposta cordial para visita rápida de bênção pastoral na residência.
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Visitor Selection */}
            {visitors.length > 0 && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Selecionar Visitante Cadastrado:</span>
                  <span className="text-[10px] text-indigo-400 font-normal">Preenche dados automático</span>
                </label>
                <select
                  onChange={(e) => handleSelectVisitorDropdown(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="">-- Ou digite os dados manualmente abaixo --</option>
                  {visitors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.neighborhood || 'Ponta Grossa'}) - {v.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Personalized Fields */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                2. Informações do Destinatário
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Nome do Visitante / Irmão(ã): <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Ex: Mateus Silva"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    WhatsApp (com DDD):
                  </label>
                  <input
                    type="text"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="(42) 99999-9999"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Bairro em Ponta Grossa:
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Uvaranas, Oficinas..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Culto de Entrada:
                  </label>
                  <select
                    value={serviceAttended}
                    onChange={(e) => setServiceAttended(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {settings.serviceSchedules.map((s) => (
                      <option key={s.id} value={`${s.name} - ${s.day} ${s.time}`}>
                        {s.name} ({s.day} {s.time})
                      </option>
                    ))}
                    <option value="Culto Geral Efraim">Outro Culto / Evento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Pedido de Oração / Situação Específica:
                </label>
                <input
                  type="text"
                  value={prayerRequest}
                  onChange={(e) => setPrayerRequest(e.target.value)}
                  placeholder="Ex: Família em restauração, saúde da mãe, novo emprego..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !visitorName.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando com Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Gerar Mensagem Pastoral com IA</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview and Send Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b141a] border border-[#222e35] rounded-2xl p-5 shadow-2xl flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between border-b border-[#222e35] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-xs text-[#e9edef] uppercase tracking-wider">
                  Pré-visualização para WhatsApp
                </h3>
              </div>

              {generatedMessage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Simulated WhatsApp Balloon */}
            <div className="flex-1 flex flex-col justify-center">
              {generatedMessage ? (
                <div className="space-y-4">
                  <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-none p-4 shadow text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans border border-emerald-600/30">
                    {generatedMessage}
                    <div className="text-right text-[10px] text-[#8696a0] mt-2">
                      Agora • Enviado por Liderança Efraim
                    </div>
                  </div>

                  {/* Actions to Dispatch */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleSendToWhatsApp}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/50"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {visitorPhone
                          ? `Disparar para o WhatsApp de ${visitorName} (${visitorPhone})`
                          : 'Disparar para o WhatsApp'}
                      </span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </button>

                    <p className="text-center text-[11px] text-slate-400">
                      Abre instantaneamente a conversa com o texto pré-carregado no WhatsApp.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 px-4 text-slate-400">
                  <Sparkles className="w-10 h-10 text-indigo-400/50 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-slate-300">
                    Nenhuma mensagem gerada ainda
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Preencha o nome do visitante à esquerda e clique em "Gerar Mensagem Pastoral com IA" para criar o texto com Gemini 3.8 Flash.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
