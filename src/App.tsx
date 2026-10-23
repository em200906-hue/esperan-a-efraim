import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { PrayerWall } from './components/PrayerWall';
import { WhatsAppChat } from './components/WhatsAppChat';
import { PastoralAI } from './components/PastoralAI';
import { VisitorRegistration } from './components/VisitorRegistration';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PixModal } from './components/PixModal';
import { WhatsAppQrModal } from './components/WhatsAppQrModal';
import { NotificationBanner } from './components/NotificationBanner';
import {
  AppSettings,
  PrayerRequest,
  Visitor,
  VisitorStatus,
  DevotionalWord
} from './types';
import {
  loadSettings,
  saveSettings,
  loadPrayers,
  savePrayers,
  loadVisitors,
  saveVisitors,
  fetchPrayersFromServer,
  createPrayerOnServer,
  prayOnServer,
  markAnsweredOnServer,
  saveDevotionalOnServer,
  deletePrayerOnServer,
  bulkUpdatePrayersOnServer,
  fetchVisitorsFromServer,
  createVisitorOnServer,
  updateVisitorOnServer,
  bulkUpdateVisitorsOnServer,
  fetchSettingsFromServer,
  saveSettingsToServer
} from './utils/storage';
import { playHarmonicPrayerChime } from './utils/audio';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [prayers, setPrayers] = useState<PrayerRequest[]>(loadPrayers);
  const [visitors, setVisitors] = useState<Visitor[]>(loadVisitors);

  const [activeTab, setActiveTab] = useState<TabId>('prayer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('efraim_admin_logged_in') === 'true';
  });

  // Modals state
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Link between Visitor and AI Assistant
  const [aiTargetVisitorId, setAiTargetVisitorId] = useState<string | null>(null);

  // In-app Alert for new incoming prayer from other phones
  const [incomingPrayerAlert, setIncomingPrayerAlert] = useState<PrayerRequest | null>(null);
  const [unreadPrayersCount, setUnreadPrayersCount] = useState<number>(0);

  // Tracking locally created prayer IDs to avoid self-alerting
  const localCreatedPrayerIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  // 1. Initial load from central server (cross-device sync)
  useEffect(() => {
    async function initData() {
      try {
        const [serverSettings, serverPrayers, serverVisitors] = await Promise.allSettled([
          fetchSettingsFromServer(),
          fetchPrayersFromServer(),
          fetchVisitorsFromServer()
        ]);

        if (serverSettings.status === 'fulfilled' && serverSettings.value) {
          setSettings(serverSettings.value);
          saveSettings(serverSettings.value);
        }

        if (serverPrayers.status === 'fulfilled' && Array.isArray(serverPrayers.value)) {
          setPrayers(serverPrayers.value);
          savePrayers(serverPrayers.value);
        }

        if (serverVisitors.status === 'fulfilled' && Array.isArray(serverVisitors.value)) {
          setVisitors(serverVisitors.value);
          saveVisitors(serverVisitors.value);
        }
      } catch (err) {
        console.warn('Usando armazenamento local offline:', err);
      } finally {
        initialLoadDone.current = true;
      }
    }

    initData();
  }, []);

  // 2. Real-time polling from central server every 4 seconds to sync all cellphones
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!initialLoadDone.current) return;

      try {
        const remotePrayers = await fetchPrayersFromServer();
        if (Array.isArray(remotePrayers) && remotePrayers.length > 0) {
          setPrayers((prevPrayers) => {
            const prevIds = new Set(prevPrayers.map((p) => p.id));
            const newIncomingPrayers = remotePrayers.filter(
              (rp) => !prevIds.has(rp.id) && !localCreatedPrayerIds.current.has(rp.id)
            );

            // If another cellphone submitted a prayer
            if (newIncomingPrayers.length > 0) {
              const latestPrayer = newIncomingPrayers[0];
              setIncomingPrayerAlert(latestPrayer);
              setUnreadPrayersCount((cnt) => cnt + newIncomingPrayers.length);
              playHarmonicPrayerChime();
            }

            savePrayers(remotePrayers);
            return remotePrayers;
          });
        }
      } catch (e) {
        // Silent fail on network blips
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    savePrayers(prayers);
  }, [prayers]);

  useEffect(() => {
    saveVisitors(visitors);
  }, [visitors]);

  useEffect(() => {
    localStorage.setItem('efraim_admin_logged_in', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  // Prayer handlers (syncing centrally to server so all cellphones receive it)
  const handleAddPrayer = async (
    newPrayerData: Omit<PrayerRequest, 'id' | 'createdAt' | 'prayingCount' | 'isAnswered'>
  ): Promise<PrayerRequest | void> => {
    try {
      const createdOnServer = await createPrayerOnServer(newPrayerData);
      localCreatedPrayerIds.current.add(createdOnServer.id);

      setPrayers((prev) => [
        { ...createdOnServer, userPrayed: true },
        ...prev.filter((p) => p.id !== createdOnServer.id)
      ]);
      return createdOnServer;
    } catch (err) {
      console.warn('Salvando offline:', err);
      const fallbackPrayer: PrayerRequest = {
        ...newPrayerData,
        id: `pray-${Date.now()}`,
        prayingCount: 1,
        userPrayed: true,
        isAnswered: false,
        createdAt: 'Agora mesmo',
        createdAtTimestamp: Date.now()
      };
      localCreatedPrayerIds.current.add(fallbackPrayer.id);
      setPrayers((prev) => [fallbackPrayer, ...prev]);
      return fallbackPrayer;
    }
  };

  const handlePrayForRequest = async (id: string) => {
    setPrayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const alreadyPrayed = !!p.userPrayed;
          return {
            ...p,
            prayingCount: alreadyPrayed ? p.prayingCount : p.prayingCount + 1,
            userPrayed: true
          };
        }
        return p;
      })
    );

    try {
      await prayOnServer(id);
    } catch (e) {
      console.warn('Erro ao atualizar no servidor:', e);
    }
  };

  const handleMarkAnswered = async (id: string, testimony: string) => {
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAnswered: true, testimony } : p))
    );

    try {
      await markAnsweredOnServer(id, testimony);
    } catch (e) {
      console.warn('Erro ao atualizar vitória no servidor:', e);
    }
  };

  const handleUpdatePrayerDevotional = async (id: string, devotional: DevotionalWord) => {
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, devotional } : p))
    );

    try {
      await saveDevotionalOnServer(id, devotional);
    } catch (e) {
      console.warn('Erro ao salvar devocional no servidor:', e);
    }
  };

  // Visitor handlers (syncing centrally to server)
  const handleAddVisitor = async (visitorData: Omit<Visitor, 'id' | 'createdAt'>) => {
    try {
      const created = await createVisitorOnServer(visitorData);
      setVisitors((prev) => [created, ...prev.filter((v) => v.id !== created.id)]);
    } catch (err) {
      const fallbackVis: Visitor = {
        ...visitorData,
        id: `vis-${Date.now()}`,
        createdAt: 'Recém-chegado'
      };
      setVisitors((prev) => [fallbackVis, ...prev]);
    }
  };

  const handleUpdateVisitorStatus = async (id: string, status: VisitorStatus) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
    try {
      await updateVisitorOnServer(id, { status });
    } catch (e) {
      console.warn('Erro ao atualizar status:', e);
    }
  };

  const handleUpdateSingleVisitor = async (updatedVisitor: Visitor) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === updatedVisitor.id ? updatedVisitor : v))
    );
    try {
      await updateVisitorOnServer(updatedVisitor.id, updatedVisitor);
    } catch (e) {
      console.warn('Erro ao atualizar visitante:', e);
    }
  };

  const handleSelectVisitorForAI = (visitorId: string) => {
    setAiTargetVisitorId(visitorId);
    setActiveTab('pastoral_ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin handlers
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setActiveTab('admin');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveTab('prayer');
  };

  const handleSaveAllSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      await saveSettingsToServer(newSettings);
    } catch (e) {
      console.warn('Erro ao salvar configurações no servidor:', e);
    }
  };

  const handleUpdateAllPrayers = async (newPrayers: PrayerRequest[]) => {
    setPrayers(newPrayers);
    try {
      await bulkUpdatePrayersOnServer(newPrayers);
    } catch (e) {
      console.warn('Erro ao atualizar orações no servidor:', e);
    }
  };

  const handleUpdateAllVisitors = async (newVisitors: Visitor[]) => {
    setVisitors(newVisitors);
    try {
      await bulkUpdateVisitorsOnServer(newVisitors);
    } catch (e) {
      console.warn('Erro ao atualizar visitantes no servidor:', e);
    }
  };

  const handleViewIncomingPrayer = () => {
    setActiveTab('prayer');
    setIncomingPrayerAlert(null);
    setUnreadPrayersCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        settings={settings}
        isAdminLoggedIn={isAdminLoggedIn}
        unreadCount={unreadPrayersCount}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onNavigateToAdmin={() => setActiveTab('admin')}
        onNavigateToPrayer={() => {
          setActiveTab('prayer');
          setUnreadPrayersCount(0);
        }}
        onOpenPixModal={() => setShowPixModal(true)}
        onOpenQrModal={() => setShowQrModal(true)}
      />

      {/* 4 Core Tabs Navigation + Admin Tab */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'prayer') setUnreadPrayersCount(0);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        prayerCount={prayers.length}
        visitorCount={visitors.length}
      />

      {/* In-App Live Alert Notification Banner (When prayer arrives from other cellphones) */}
      <NotificationBanner
        prayer={incomingPrayerAlert}
        obreirosPhone={settings.obreirosWhatsAppNumber || settings.whatsappNumber}
        churchName={settings.churchName}
        onViewPrayer={handleViewIncomingPrayer}
        onDismiss={() => setIncomingPrayerAlert(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'prayer' && (
          <PrayerWall
            prayers={prayers}
            onAddPrayer={handleAddPrayer}
            onPrayForRequest={handlePrayForRequest}
            onMarkAnswered={handleMarkAnswered}
            onUpdatePrayerDevotional={handleUpdatePrayerDevotional}
            churchName={settings.churchName}
            obreirosPhone={settings.obreirosWhatsAppNumber || settings.whatsappNumber}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppChat
            settings={settings}
            onOpenPixModal={() => setShowPixModal(true)}
            onNavigateToPrayer={() => setActiveTab('prayer')}
            onNavigateToPastoralAI={() => setActiveTab('pastoral_ai')}
          />
        )}

        {activeTab === 'pastoral_ai' && (
          <PastoralAI
            visitors={visitors}
            settings={settings}
            selectedVisitorId={aiTargetVisitorId}
            onClearSelectedVisitor={() => setAiTargetVisitorId(null)}
          />
        )}

        {activeTab === 'visitors' && (
          <VisitorRegistration
            visitors={visitors}
            settings={settings}
            onAddVisitor={handleAddVisitor}
            onUpdateVisitorStatus={handleUpdateVisitorStatus}
            onSelectVisitorForAI={handleSelectVisitorForAI}
            onUpdateVisitor={handleUpdateSingleVisitor}
          />
        )}

        {activeTab === 'admin' && isAdminLoggedIn && (
          <AdminPanel
            settings={settings}
            prayers={prayers}
            visitors={visitors}
            onSaveSettings={handleSaveAllSettings}
            onUpdatePrayers={handleUpdateAllPrayers}
            onUpdateVisitors={handleUpdateAllVisitors}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-medium text-slate-400">
            {settings.churchName} • {settings.churchTagline}
          </p>
          <p className="text-[11px] text-slate-600">
            {settings.churchAddress} ({settings.churchCity}) • WhatsApp: {settings.whatsappNumber} • Obreiros: {settings.obreirosWhatsAppNumber || settings.whatsappNumber} • Chave Pix: {settings.pixKey}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3 text-[11px]">
            <button
              onClick={() => setShowPixModal(true)}
              className="text-amber-400/90 hover:underline"
            >
              Dízimos e Ofertas (Pix: {settings.pixKey})
            </button>
            <span>•</span>
            <button
              onClick={() => setShowQrModal(true)}
              className="text-emerald-400/90 hover:underline"
            >
              QR Code WhatsApp
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setActiveTab('admin');
                } else {
                  setShowAdminLoginModal(true);
                }
              }}
              className="text-slate-400 hover:text-white hover:underline"
            >
              {isAdminLoggedIn ? 'Painel ADM Ativo' : 'Acesso ADM'}
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        expectedLogin={settings.adminLogin}
        expectedPass={settings.adminPassword}
      />

      <PixModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        pixKey={settings.pixKey}
        pixReceiver={settings.pixReceiver}
        pixBank={settings.pixBank}
        pixDescription={settings.pixDescription}
      />

      <WhatsAppQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        phone={settings.whatsappNumber}
        defaultMessage={settings.whatsappWelcomeMessage}
        churchName={settings.churchName}
      />
    </div>
  );
}
