import React from 'react';
import { Bell, Heart, MessageCircle, X, ChevronRight, Flame } from 'lucide-react';
import { PrayerRequest } from '../types';
import { getObreirosNotificationWhatsAppUrl } from '../utils/storage';

interface NotificationBannerProps {
  prayer: PrayerRequest | null;
  obreirosPhone: string;
  churchName: string;
  onViewPrayer: () => void;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  prayer,
  obreirosPhone,
  churchName,
  onViewPrayer,
  onDismiss
}) => {
  if (!prayer) return null;

  const obreirosWaUrl = getObreirosNotificationWhatsAppUrl(prayer, obreirosPhone, churchName);

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 pointer-events-none animate-bounce-short">
      <div className="max-w-xl mx-auto bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border-2 border-amber-500/70 shadow-2xl rounded-2xl p-4 text-white pointer-events-auto backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                  <Flame className="w-3 h-3 text-amber-400" /> Novo Clamor Recebido
                </span>
                <span className="text-[11px] text-slate-400">• {prayer.category}</span>
              </div>

              <h4 className="text-sm font-extrabold text-white leading-snug line-clamp-1">
                {prayer.title}
              </h4>
              <p className="text-xs text-slate-300">
                Enviado por <strong className="text-amber-300">{prayer.author}</strong>. Toda a igreja está convidada a interceder!
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={onViewPrayer}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            <Heart className="w-3.5 h-3.5 fill-slate-950" />
            <span>Clamar no Mural</span>
          </button>

          <a
            href={obreirosWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDismiss}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-900/30"
            title="Disparar aviso para o WhatsApp da equipe de obreiros"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Avisar Obreiros</span>
          </a>
        </div>
      </div>
    </div>
  );
};
