import React from 'react';
import {
  Heart,
  MessageCircle,
  Sparkles,
  UserPlus,
  ShieldCheck,
  Flame
} from 'lucide-react';

export type TabId = 'prayer' | 'whatsapp' | 'pastoral_ai' | 'visitors' | 'admin';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isAdminLoggedIn: boolean;
  prayerCount: number;
  visitorCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  isAdminLoggedIn,
  prayerCount,
  visitorCount
}) => {
  const tabs = [
    {
      id: 'prayer' as TabId,
      label: 'Mural de Oração',
      icon: Heart,
      badge: prayerCount > 0 ? prayerCount : undefined,
      color: 'text-rose-400'
    },
    {
      id: 'whatsapp' as TabId,
      label: 'WhatsApp Efraim',
      icon: MessageCircle,
      badge: 'Oficial',
      color: 'text-emerald-400'
    },
    {
      id: 'pastoral_ai' as TabId,
      label: 'Assistente IA Pastoral',
      icon: Sparkles,
      badge: 'Gemini 3.8',
      color: 'text-indigo-400'
    },
    {
      id: 'visitors' as TabId,
      label: 'Cadastro de Visitante',
      icon: UserPlus,
      badge: visitorCount > 0 ? visitorCount : undefined,
      color: 'text-teal-400'
    }
  ];

  if (isAdminLoggedIn) {
    tabs.push({
      id: 'admin' as TabId,
      label: 'Painel ADM',
      icon: ShieldCheck,
      badge: 'Ativo',
      color: 'text-amber-400'
    });
  }

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 sticky top-[61px] z-30 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-slate-950' : tab.color}`}
                />
                <span>{tab.label}</span>

                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
