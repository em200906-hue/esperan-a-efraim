import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Clock,
  Heart,
  Home,
  CreditCard,
  Send,
  ExternalLink,
  QrCode as QrIcon,
  Check,
  CheckCheck,
  Copy,
  ChevronRight,
  ShieldCheck,
  Phone,
  Sparkles
} from 'lucide-react';
import { AppSettings } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/storage';
import { WhatsAppQrModal } from './WhatsAppQrModal';

interface WhatsAppChatProps {
  settings: AppSettings;
  onOpenPixModal: () => void;
  onNavigateToPrayer: () => void;
  onNavigateToPastoralAI: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'church';
  text: string;
  time: string;
  isQuickReplyAction?: boolean;
  pixPayload?: boolean;
  schedulePayload?: boolean;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  settings,
  onOpenPixModal,
  onNavigateToPrayer,
  onNavigateToPastoralAI
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'church',
      text: settings.whatsappWelcomeMessage,
      time: 'Agora'
    },
    {
      id: 'msg-init-2',
      sender: 'church',
      text: 'Selecione uma das opções rápidas abaixo ou digite sua mensagem para atendimento pastoral imediato:',
      time: 'Agora'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const cleanPhone = cleanPhoneForWhatsApp(settings.whatsappNumber) || '5542999683585';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  // Actions for Quick Replies
  const handleSelectQuickReply = (action: 'schedules' | 'prayer' | 'home_visit' | 'pix') => {
    const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (action === 'schedules') {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: '⏰ Gostaria de saber os Horários dos Cultos da Comunhão Cristã Efraim.',
        time: timeNow
      };

      const schedulesText = settings.serviceSchedules
        .map((s) => `• *${s.day} às ${s.time}* - ${s.name}${s.description ? ` (${s.description})` : ''}`)
        .join('\n');

      const churchMsg: ChatMessage = {
        id: `church-${Date.now() + 1}`,
        sender: 'church',
        text: `🕊️ *Horários Oficiais de Nossos Cultos:*\n\n${schedulesText}\n\n📍 *Endereço:* ${settings.churchAddress} (${settings.churchCity})\n\nSerá uma honra imensa receber você e sua família!`,
        time: timeNow,
        schedulePayload: true
      };

      setMessages((prev) => [...prev, userMsg, churchMsg]);
    } else if (action === 'prayer') {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: '🙏 Paz do Senhor! Gostaria de pedir oração e intercessão.',
        time: timeNow
      };

      const churchMsg: ChatMessage = {
        id: `church-${Date.now() + 1}`,
        sender: 'church',
        text: `Amado(a), estamos prontos para clamar com você!\n\nVocê pode:\n1. Digitar seu clamor aqui e te responderemos com apoio pastoral.\n2. Inserir no nosso *Mural de Oração Ao Vivo*, onde toda a congregação intercede e aperta "Estou Orando Agora".\n\nQue a paz de Deus reine no seu coração!`,
        time: timeNow
      };

      setMessages((prev) => [...prev, userMsg, churchMsg]);
    } else if (action === 'home_visit') {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: '🏡 Olá! Gostaria de solicitar uma visita de oração e bênção pastoral no meu lar.',
        time: timeNow
      };

      const churchMsg: ChatMessage = {
        id: `church-${Date.now() + 1}`,
        sender: 'church',
        text: `Que bênção! Nossa liderança pastoral tem grande alegria em ir até a sua casa levar uma oração de paz e bênção sobre a sua família.\n\nPor favor, digite seu *Nome*, *Bairro em Ponta Grossa* e o *melhor dia/horário* que entraremos em contato direto!`,
        time: timeNow
      };

      setMessages((prev) => [...prev, userMsg, churchMsg]);
    } else if (action === 'pix') {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: '💳 Gostaria da chave Pix para dízimos, ofertas e missões da igreja.',
        time: timeNow
      };

      const churchMsg: ChatMessage = {
        id: `church-${Date.now() + 1}`,
        sender: 'church',
        text: `🕊️ *Chave Pix Oficial da Comunhão Cristã Efraim*\n\nChave (CNPJ): *${settings.pixKey}*\nFavorecido: *${settings.pixReceiver}*\nInstituição: *${settings.pixBank}*\n\n_"Cada um dê conforme determinou em seu coração, pois Deus ama quem dá com alegria." (2 Co 9:7)*\n\nQue o Senhor multiplique e abençoe ricamente a sua vida!`,
        time: timeNow,
        pixPayload: true
      };

      setMessages((prev) => [...prev, userMsg, churchMsg]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userText = inputMessage.trim();

    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: timeNow
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Church simulated reply
    setTimeout(() => {
      const churchReply: ChatMessage = {
        id: `church-${Date.now()}`,
        sender: 'church',
        text: `Recebemos sua mensagem: "${userText}". Nossa equipe de pastores e acolhimento da Comunhão Cristã Efraim já está atenta. Para conversar imediatamente pelo aplicativo oficial do WhatsApp no seu telefone, basta clicar no botão abaixo!`,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, churchReply]);
    }, 700);
  };

  // Open direct WhatsApp
  const handleOpenDirectWhatsApp = (customText?: string) => {
    const textToSend = customText || inputMessage || 'Olá! Gostaria de falar com a Comunhão Cristã Efraim.';
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* WhatsApp Window Frame */}
      <div className="bg-[#0b141a] border border-[#222e35] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[780px]">
        {/* WhatsApp Header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#222e35] text-white">
          <div className="flex items-center gap-3">
            {/* Avatar Efraim */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-700 to-amber-500 flex items-center justify-center text-white font-black text-lg border-2 border-emerald-400/40 shadow-inner">
                CE
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#202c33]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm tracking-wide text-white">
                  {settings.churchName}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span>Online</span>
                <span className="text-slate-400">• {settings.whatsappNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão QR Code WhatsApp */}
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111b21] hover:bg-slate-800 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all shadow-sm"
              title="Abrir QR Code para escanear no celular"
            >
              <QrIcon className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            {/* Botão Abrir WhatsApp Real */}
            <button
              onClick={() => handleOpenDirectWhatsApp()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/40"
              title="Abrir no app oficial do WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp Real</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body with WhatsApp pattern background */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] bg-opacity-95 relative">
          <div className="text-center my-2">
            <span className="px-3 py-1 rounded-lg bg-[#182229] text-[10px] text-slate-400 font-medium border border-slate-800">
              🔒 As mensagens são diretas com a equipe da Comunhão Cristã Efraim
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow text-sm relative ${
                  msg.sender === 'user'
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                    : 'bg-[#202c33] text-[#d1d7db] rounded-tl-none border border-[#2a3942]'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                  {msg.text}
                </div>

                {/* Se a mensagem for sobre Pix: Exibe botão de copiar na hora */}
                {msg.pixPayload && (
                  <div className="mt-3 pt-2.5 border-t border-[#374248] space-y-2">
                    <div className="bg-[#111b21] p-2.5 rounded-xl flex items-center justify-between gap-2 border border-amber-500/30">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Chave Pix CNPJ:</span>
                        <code className="text-amber-300 font-mono font-bold text-xs select-all">
                          {settings.pixKey}
                        </code>
                      </div>
                      <button
                        onClick={handleCopyPix}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors"
                      >
                        {copiedPix ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Pix</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={onOpenPixModal}
                      className="w-full text-center text-[11px] text-amber-300/80 hover:text-amber-200 underline pt-1"
                    >
                      Ver detalhes bancários e QR Code Pix completo
                    </button>
                  </div>
                )}

                {/* Se a mensagem for sobre Cultos: Botão de ação */}
                {msg.schedulePayload && (
                  <div className="mt-2.5 pt-2 border-t border-[#374248] flex gap-2">
                    <button
                      onClick={() => handleOpenDirectWhatsApp('Paz do Senhor! Gostaria de saber como chegar no culto da Efraim.')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <span>Como Chegar / Localização</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] mt-1">
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && (
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Interactive Buttons (Horizontal Grid) */}
        <div className="bg-[#111b21] border-t border-[#222e35] p-2.5">
          <div className="text-[11px] text-slate-400 font-semibold mb-2 px-1 flex items-center justify-between">
            <span>Perguntas e Respostas Rápidas:</span>
            <span className="text-[10px] text-amber-400 font-normal">Toque para consultar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleSelectQuickReply('schedules')}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors text-left"
            >
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold">Horários</span>
                <span className="text-[10px] text-slate-400 block truncate">Qua, Dom, Ter, Sáb</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectQuickReply('prayer')}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors text-left"
            >
              <Heart className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold">Pedir Oração</span>
                <span className="text-[10px] text-slate-400 block truncate">Intercessão viva</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectQuickReply('home_visit')}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors text-left"
            >
              <Home className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold">Visita no Lar</span>
                <span className="text-[10px] text-slate-400 block truncate">Bênção na família</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectQuickReply('pix')}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors text-left"
            >
              <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold text-amber-400">Chave Pix</span>
                <span className="text-[10px] text-amber-300/80 block truncate">Dízimos & Ofertas</span>
              </div>
            </button>
          </div>
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="bg-[#202c33] px-3 py-2.5 flex items-center gap-2 border-t border-[#222e35]"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite uma mensagem para o WhatsApp Efraim..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#2a3942] text-white text-xs sm:text-sm placeholder-slate-400 outline-none border border-transparent focus:border-emerald-500 transition-all"
          />

          {inputMessage.trim() ? (
            <div className="flex items-center gap-1">
              <button
                type="submit"
                className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow"
                title="Enviar mensagem na simulação"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenDirectWhatsApp(inputMessage)}
                className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow"
                title="Disparar diretamente para o app do WhatsApp oficial"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenDirectWhatsApp()}
              className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow flex items-center gap-1 px-3.5"
              title="Abrir conversa no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Conversar</span>
            </button>
          )}
        </form>
      </div>

      {/* Modal QR Code */}
      <WhatsAppQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        phone={settings.whatsappNumber}
        defaultMessage={settings.whatsappWelcomeMessage}
        churchName={settings.churchName}
      />
    </div>
  );
};
