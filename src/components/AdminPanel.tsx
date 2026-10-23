import React, { useState } from 'react';
import {
  ShieldCheck,
  Save,
  RotateCcw,
  LogOut,
  CreditCard,
  Phone,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Users,
  Heart,
  QrCode as QrIcon,
  Download,
  Check,
  Building,
  Key,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  X,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { AppSettings, PrayerRequest, ServiceSchedule, Visitor, VisitorStatus } from '../types';
import { DEFAULT_SETTINGS, cleanPhoneForWhatsApp } from '../utils/storage';
import { WhatsAppQrModal } from './WhatsAppQrModal';

interface AdminPanelProps {
  settings: AppSettings;
  prayers: PrayerRequest[];
  visitors: Visitor[];
  onSaveSettings: (settings: AppSettings) => void;
  onUpdatePrayers: (prayers: PrayerRequest[]) => void;
  onUpdateVisitors: (visitors: Visitor[]) => void;
  onLogout: () => void;
}

const PONTA_GROSSA_NEIGHBORHOODS = [
  'Uvaranas',
  'Oficinas',
  'Nova Rússia',
  'Jardim Carvalho',
  'Centro',
  'Olarias',
  'Contorno',
  'Ronda',
  'Estrela',
  'Chapada',
  'Neves',
  'Boa Vista'
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  prayers,
  visitors,
  onSaveSettings,
  onUpdatePrayers,
  onUpdateVisitors,
  onLogout
}) => {
  // Local form state for settings
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'general' | 'pix' | 'whatsapp' | 'schedules' | 'prayers' | 'visitors' | 'security'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // New Service Schedule inputs
  const [newDay, setNewDay] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Editing existing schedule state
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editScheduleDay, setEditScheduleDay] = useState('');
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editScheduleName, setEditScheduleName] = useState('');
  const [editScheduleDesc, setEditScheduleDesc] = useState('');

  // Prayers moderation local copy
  const [prayerList, setPrayerList] = useState<PrayerRequest[]>([...prayers]);
  const [visitorList, setVisitorList] = useState<Visitor[]>([...visitors]);

  // Editing Visitor Modal state
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);

  // Deletion confirmation state (in-app modal to avoid blocked window.confirm)
  const [visitorToDelete, setVisitorToDelete] = useState<Visitor | null>(null);
  const [prayerToDelete, setPrayerToDelete] = useState<PrayerRequest | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const handleSave = () => {
    onSaveSettings(formData);
    onUpdatePrayers(prayerList);
    onUpdateVisitors(visitorList);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmResetDefaults = () => {
    setFormData({ ...DEFAULT_SETTINGS });
    onSaveSettings(DEFAULT_SETTINGS);
    setShowResetConfirmModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // --- SCHEDULE HANDLERS ---
  const handleAddSchedule = () => {
    if (!newDay || !newTime || !newName) return;
    const newSch: ServiceSchedule = {
      id: `sch-${Date.now()}`,
      day: newDay.trim(),
      time: newTime.trim(),
      name: newName.trim(),
      description: newDesc.trim()
    };
    const updated = {
      ...formData,
      serviceSchedules: [...formData.serviceSchedules, newSch]
    };
    setFormData(updated);
    onSaveSettings(updated);
    setNewDay('');
    setNewTime('');
    setNewName('');
    setNewDesc('');
  };

  const handleStartEditSchedule = (sch: ServiceSchedule) => {
    setEditingScheduleId(sch.id);
    setEditScheduleDay(sch.day);
    setEditScheduleTime(sch.time);
    setEditScheduleName(sch.name);
    setEditScheduleDesc(sch.description || '');
  };

  const handleSaveEditSchedule = () => {
    if (!editingScheduleId || !editScheduleDay || !editScheduleTime || !editScheduleName) return;
    const updatedSchedules = formData.serviceSchedules.map((s) =>
      s.id === editingScheduleId
        ? {
            ...s,
            day: editScheduleDay.trim(),
            time: editScheduleTime.trim(),
            name: editScheduleName.trim(),
            description: editScheduleDesc.trim()
          }
        : s
    );
    const updatedSettings = {
      ...formData,
      serviceSchedules: updatedSchedules
    };
    setFormData(updatedSettings);
    onSaveSettings(updatedSettings);
    setEditingScheduleId(null);
  };

  const handleCancelEditSchedule = () => {
    setEditingScheduleId(null);
  };

  const handleRemoveSchedule = (id: string) => {
    const updatedSchedules = formData.serviceSchedules.filter((s) => s.id !== id);
    const updatedSettings = {
      ...formData,
      serviceSchedules: updatedSchedules
    };
    setFormData(updatedSettings);
    onSaveSettings(updatedSettings);
  };

  // --- VISITOR HANDLERS ---
  const handleStartEditVisitor = (visitor: Visitor) => {
    setEditingVisitor({ ...visitor });
  };

  const handleSaveEditVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisitor) return;

    const updated = visitorList.map((v) =>
      v.id === editingVisitor.id ? editingVisitor : v
    );
    setVisitorList(updated);
    onUpdateVisitors(updated);
    setEditingVisitor(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleConfirmDeleteVisitor = () => {
    if (!visitorToDelete) return;
    const updated = visitorList.filter((v) => v.id !== visitorToDelete.id);
    setVisitorList(updated);
    onUpdateVisitors(updated);
    setVisitorToDelete(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportVisitorsCSV = () => {
    const headers = ['Nome', 'WhatsApp', 'Bairro', 'Culto', 'Status', 'Pedido de Oração', 'Notas'];
    const rows = visitorList.map((v) => [
      `"${v.name}"`,
      `"${v.phone}"`,
      `"${v.neighborhood}"`,
      `"${v.serviceAttended}"`,
      `"${v.status}"`,
      `"${v.prayerRequest || ''}"`,
      `"${v.notes || ''}"`
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visitantes_efraim_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PRAYER HANDLERS ---
  const handleConfirmDeletePrayer = () => {
    if (!prayerToDelete) return;
    const updated = prayerList.filter((p) => p.id !== prayerToDelete.id);
    setPrayerList(updated);
    onUpdatePrayers(updated);
    setPrayerToDelete(null);
  };

  const handleToggleAnswered = (id: string) => {
    const updated = prayerList.map((p) =>
      p.id === id ? { ...p, isAnswered: !p.isAnswered } : p
    );
    setPrayerList(updated);
    onUpdatePrayers(updated);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Admin Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-2 border-amber-500/50 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-1 border border-amber-500/30">
                <span>Modo Administrador Ativo</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Painel Administrativo Efraim
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-0.5">
                Edite horários dos cultos, gerencie e exclua visitantes, altere chave Pix, WhatsApp e orações.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/30"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              title="Encerrar sessão de administrador"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Alterações salvas com sucesso no aplicativo!</span>
          </div>
        )}
      </div>

      {/* Tabs of the Admin Panel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'schedules'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Horários dos Cultos ({formData.serviceSchedules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visitors')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'visitors'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Gerenciar Visitantes ({visitorList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pix')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'pix'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Chave Pix Oficial</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'whatsapp'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>WhatsApp & QR Code</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Igreja & Endereço</span>
        </button>

        <button
          onClick={() => setActiveTab('prayers')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'prayers'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Moderar Orações ({prayerList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Login & Senha ADM</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB CONTENT: HORÁRIOS DOS CULTOS (EDITÁVEL & ADICIONÁVEL) */}
      {/* ======================================================== */}
      {activeTab === 'schedules' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Horários dos Cultos da Comunhão Cristã Efraim</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edite os horários existentes, dias da semana, títulos dos cultos e descrições.
              </p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              {formData.serviceSchedules.length} cultos cadastrados
            </span>
          </div>

          {/* Lista de Cultos Existentes com Modo de Edição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.serviceSchedules.map((sch) => {
              const isEditingThis = editingScheduleId === sch.id;

              if (isEditingThis) {
                return (
                  <div
                    key={sch.id}
                    className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-500 shadow-xl space-y-3 animate-fade-in"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Edit2 className="w-3.5 h-3.5" /> Editando Culto
                      </span>
                      <button
                        onClick={handleCancelEditSchedule}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Dia da Semana:
                        </label>
                        <input
                          type="text"
                          value={editScheduleDay}
                          onChange={(e) => setEditScheduleDay(e.target.value)}
                          placeholder="Ex: Quarta-feira"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Horário:
                        </label>
                        <input
                          type="text"
                          value={editScheduleTime}
                          onChange={(e) => setEditScheduleTime(e.target.value)}
                          placeholder="Ex: 20:00"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Nome do Culto:
                      </label>
                      <input
                        type="text"
                        value={editScheduleName}
                        onChange={(e) => setEditScheduleName(e.target.value)}
                        placeholder="Ex: Culto da Fé e Milagres"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Descrição / Detalhes:
                      </label>
                      <input
                        type="text"
                        value={editScheduleDesc}
                        onChange={(e) => setEditScheduleDesc(e.target.value)}
                        placeholder="Ex: Clamor de intercessão e cura"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveEditSchedule}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvar Horário</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditSchedule}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={sch.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 relative group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        {sch.day} às {sch.time}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditSchedule(sch)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                          title="Editar este horário de culto"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(sch.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remover este horário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-base text-white mt-2.5">{sch.name}</h4>
                    {sch.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sch.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Adicionar Novo Culto */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-3">
            <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Culto / Reunião:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <input
                  type="text"
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  placeholder="Dia (ex: Sexta-feira)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="Horário (ex: 19:30)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do Culto (ex: Vigília)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  disabled={!newDay || !newTime || !newName}
                  className="w-full px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
                >
                  Adicionar Culto
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descrição opcional (ex: Encontro especial de oração e louvor)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: GERENCIAR VISITANTES (EDITÁVEL & EXCLUIR OK) */}
      {/* ======================================================== */}
      {activeTab === 'visitors' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <span>Base de Visitantes Cadastrados</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edite os dados completos do visitante ou exclua registros com confirmação.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportVisitorsCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {visitorList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Nenhum visitante cadastrado no momento.
              </div>
            ) : (
              visitorList.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{v.name}</h4>
                      <span className="text-[11px] text-teal-300 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 font-medium">
                        {v.neighborhood || 'Ponta Grossa'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'acolhido'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : v.status === 'em_contato'
                          ? 'bg-amber-500/20 text-amber-300'
                          : v.status === 'visita_agendada'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {v.status === 'novo' ? 'Novo' : v.status === 'em_contato' ? 'Em Contato' : v.status === 'acolhido' ? 'Acolhido' : 'Visita Agendada'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {v.createdAt}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span className="text-slate-200 font-mono font-semibold">{v.phone}</span>
                      <span>•</span>
                      <span>Culto: <strong className="text-slate-300">{v.serviceAttended}</strong></span>
                    </div>

                    {v.prayerRequest && (
                      <p className="text-xs text-amber-300/90 italic pt-0.5">
                        🙏 Pedido: "{v.prayerRequest}"
                      </p>
                    )}

                    {v.notes && (
                      <p className="text-[11px] text-slate-400">
                        Observação: {v.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Botão Editar Visitante */}
                    <button
                      onClick={() => handleStartEditVisitor(v)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors"
                      title="Editar dados completos do visitante"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    {/* Botão Excluir Visitante com confirmação in-app */}
                    <button
                      onClick={() => setVisitorToDelete(v)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                      title="Excluir visitante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: CHAVE PIX OFICIAL */}
      {/* ======================================================== */}
      {activeTab === 'pix' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span>Configuração da Chave Pix de Dízimos e Ofertas</span>
            </h3>
            <span className="text-xs text-amber-400 font-mono font-bold">
              CNPJ: {formData.pixKey}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chave Pix (CNPJ / Telefone / E-mail):
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Chave oficial configurada: <strong>27389825000104</strong> (Comunhão Cristã Efraim)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Titular / Favorecido:
              </label>
              <input
                type="text"
                value={formData.pixReceiver}
                onChange={(e) => setFormData({ ...formData, pixReceiver: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Banco / Instituição Financeira:
              </label>
              <input
                type="text"
                value={formData.pixBank}
                onChange={(e) => setFormData({ ...formData, pixBank: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Finalidade / Descrição:
              </label>
              <input
                type="text"
                value={formData.pixDescription}
                onChange={(e) => setFormData({ ...formData, pixDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: WHATSAPP & QR CODE */}
      {/* ======================================================== */}
      {activeTab === 'whatsapp' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-400" />
              <span>WhatsApp Oficial & QR Code da Igreja</span>
            </h3>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
            >
              <QrIcon className="w-3.5 h-3.5" />
              <span>Ver QR Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp da Igreja:
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="(42) 99968-3585"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Atendimento geral: <strong>(42) 99968-3585</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp dos Obreiros / Intercessão:
              </label>
              <input
                type="text"
                value={formData.obreirosWhatsAppNumber || ''}
                onChange={(e) => setFormData({ ...formData, obreirosWhatsAppNumber: e.target.value })}
                placeholder="(42) 99968-3585"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-emerald-400 font-mono outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Recebe as notificações dos novos pedidos de oração.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mensagem Padrão de Boas-Vindas:
              </label>
              <textarea
                rows={3}
                value={formData.whatsappWelcomeMessage}
                onChange={(e) => setFormData({ ...formData, whatsappWelcomeMessage: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: INFORMAÇÕES DA IGREJA & ENDEREÇO */}
      {/* ======================================================== */}
      {activeTab === 'general' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="w-5 h-5 text-amber-400" />
            <span>Dados Oficiais da Comunhão Cristã Efraim</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome da Congregação / Igreja:
              </label>
              <input
                type="text"
                value={formData.churchName}
                onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Slogan / Mensagem Temática:
              </label>
              <input
                type="text"
                value={formData.churchTagline}
                onChange={(e) => setFormData({ ...formData, churchTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cidade & Estado:
              </label>
              <input
                type="text"
                value={formData.churchCity}
                onChange={(e) => setFormData({ ...formData, churchCity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Endereço da Igreja:
              </label>
              <input
                type="text"
                value={formData.churchAddress}
                onChange={(e) => setFormData({ ...formData, churchAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: MODERAR ORAÇÕES */}
      {/* ======================================================== */}
      {activeTab === 'prayers' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <span>Moderação de Clamores do Mural</span>
            </h3>
            <span className="text-xs text-slate-400">
              Total: {prayerList.length} pedidos
            </span>
          </div>

          <div className="space-y-3">
            {prayerList.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">
                      {p.category}
                    </span>
                    <span className="text-xs text-slate-400">• por {p.author}</span>
                    {p.isAnswered && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Vitória
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">{p.title}</h4>
                  {p.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  )}
                  <span className="text-[11px] text-amber-400">
                    {p.prayingCount} irmãos oraram
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleAnswered(p.id)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                      p.isAnswered
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {p.isAnswered ? 'Desmarcar Vitória' : 'Marcar Vitória'}
                  </button>

                  <button
                    onClick={() => setPrayerToDelete(p)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Excluir pedido de oração"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT: SEGURANÇA & CREDENCIAIS */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Key className="w-5 h-5 text-amber-400" />
            <span>Credenciais de Acesso Administrativo</span>
          </h3>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Credenciais oficiais solicitadas: Login: <strong className="font-mono">efraim2026@</strong> e Senha: <strong className="font-mono">1982185</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Login do Administrador:
              </label>
              <input
                type="text"
                value={formData.adminLogin}
                onChange={(e) => setFormData({ ...formData, adminLogin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Senha de Acesso:
              </label>
              <input
                type="text"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowResetConfirmModal(true)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Valores Padrão de Fábrica</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/25"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Alterações</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: EDITAR VISITANTE COMPLETO */}
      {/* ======================================================== */}
      {editingVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingVisitor(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Edit2 className="w-4 h-4" />
                <span>Edição de Visitante</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Editar Dados de {editingVisitor.name}
              </h3>
            </div>

            <form onSubmit={handleSaveEditVisitor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  value={editingVisitor.name}
                  onChange={(e) => setEditingVisitor({ ...editingVisitor, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp (com DDD):
                  </label>
                  <input
                    type="text"
                    value={editingVisitor.phone}
                    onChange={(e) => setEditingVisitor({ ...editingVisitor, phone: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status de Acolhimento:
                  </label>
                  <select
                    value={editingVisitor.status}
                    onChange={(e) => setEditingVisitor({ ...editingVisitor, status: e.target.value as VisitorStatus })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-teal-500"
                  >
                    <option value="novo">🆕 Novo</option>
                    <option value="em_contato">💬 Em Contato</option>
                    <option value="acolhido">✅ Acolhido</option>
                    <option value="visita_agendada">🏡 Visita Marcada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bairro em Ponta Grossa:
                </label>
                <input
                  type="text"
                  value={editingVisitor.neighborhood}
                  onChange={(e) => setEditingVisitor({ ...editingVisitor, neighborhood: e.target.value })}
                  placeholder="Ex: Uvaranas, Oficinas, Centro..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-teal-500 mb-1.5"
                />

                <div className="flex flex-wrap gap-1">
                  {PONTA_GROSSA_NEIGHBORHOODS.slice(0, 8).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setEditingVisitor({ ...editingVisitor, neighborhood: b })}
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        editingVisitor.neighborhood === b
                          ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Culto de Entrada:
                </label>
                <select
                  value={editingVisitor.serviceAttended}
                  onChange={(e) => setEditingVisitor({ ...editingVisitor, serviceAttended: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-teal-500"
                >
                  {formData.serviceSchedules.map((s) => (
                    <option key={s.id} value={`${s.name} - ${s.day} ${s.time}`}>
                      {s.name} ({s.day} {s.time})
                    </option>
                  ))}
                  <option value="Culto Geral / Outro">Outro Culto ou Evento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pedido de Oração:
                </label>
                <textarea
                  rows={2}
                  value={editingVisitor.prayerRequest || ''}
                  onChange={(e) => setEditingVisitor({ ...editingVisitor, prayerRequest: e.target.value })}
                  placeholder="Ex: Oração pela saúde, família..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observações Pastorais / Acompanhamento:
                </label>
                <textarea
                  rows={2}
                  value={editingVisitor.notes || ''}
                  onChange={(e) => setEditingVisitor({ ...editingVisitor, notes: e.target.value })}
                  placeholder="Ex: Família muito receptiva, visita combinada para sexta..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVisitor(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-lg shadow-teal-900/40"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Visitante</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE VISITANTE (IN-APP) */}
      {/* ======================================================== */}
      {visitorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto mb-3 flex items-center justify-center border border-rose-500/40">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Excluir Visitante?
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Tem certeza que deseja remover o registro de <strong className="text-white">{visitorToDelete.name}</strong> ({visitorToDelete.phone})?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisitorToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVisitor}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-950"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE ORAÇÃO (IN-APP) */}
      {/* ======================================================== */}
      {prayerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto mb-3 flex items-center justify-center border border-rose-500/40">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Excluir Pedido de Oração?
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Deseja remover do mural: <strong className="text-white">"{prayerToDelete.title}"</strong>?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrayerToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePrayer}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR RESTAURAÇÃO DE PADRÕES */}
      {/* ======================================================== */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto mb-3 flex items-center justify-center border border-amber-500/40">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Restaurar Padrões?
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Isso redefinirá os cultos, chave Pix oficial (27389825000104) e WhatsApp para as configurações padrão da Comunhão Cristã Efraim.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResetDefaults}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Confirmar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal preview */}
      <WhatsAppQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        phone={formData.whatsappNumber}
        defaultMessage={formData.whatsappWelcomeMessage}
        churchName={formData.churchName}
      />
    </div>
  );
};
