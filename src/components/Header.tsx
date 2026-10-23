import React from 'react';
import {
  Heart,
  QrCode as QrIcon,
  CreditCard,
  Lock,
  ShieldCheck,
  Flame,
  MessageCircle,
  Bell,
  Radio
} from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  isAdminLoggedIn: boolean;
  unreadCount?: number;
  onOpenAdminLogin: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToPrayer?: () => void;
  onOpenPixModal: () => void;
  onOpenQrModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAdminLoggedIn,
  unreadCount = 0,
  onOpenAdminLogin,
  onNavigateToAdmin,
  onNavigateToPrayer,
  onOpenPixModal,
  onOpenQrModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Church Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400 font-serif font-black text-lg">
              ✝
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-widest text-lg font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                ESPERANÇA
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                Comunhão Cristã Efraim
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{settings.churchCity}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Multi-celular Ao Vivo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Access Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell if unread prayers */}
          {unreadCount > 0 && onNavigateToPrayer && (
            <button
              onClick={onNavigateToPrayer}
              className="relative p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all animate-pulse"
              title={`${unreadCount} novos pedidos de oração!`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                {unreadCount}
              </span>
            </button>
          )}

          {/* Quick Pix Button */}
          <button
            onClick={onOpenPixModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Dízimos, Ofertas e Chave Pix"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Pix Ofertas</span>
          </button>

          {/* Quick QR Code WhatsApp */}
          <button
            onClick={onOpenQrModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Escanear QR Code para WhatsApp"
          >
            <QrIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">QR WhatsApp</span>
          </button>

          {/* Admin Access Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={onNavigateToAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
              title="Acessar Painel de Administrador"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel ADM</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
              title="Acesso da Liderança / ADM"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400/80" />
              <span className="hidden sm:inline">ADM</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
