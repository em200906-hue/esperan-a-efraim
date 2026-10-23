import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  MessageCircle,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Home,
  Check,
  Edit2,
  X,
  Save
} from 'lucide-react';
import { Visitor, VisitorStatus, AppSettings } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/storage';

interface VisitorRegistrationProps {
  visitors: Visitor[];
  settings: AppSettings;
  onAddVisitor: (visitor: Omit<Visitor, 'id' | 'createdAt'>) => void;
  onUpdateVisitorStatus: (id: string, status: VisitorStatus) => void;
  onSelectVisitorForAI: (visitorId: string) => void;
  onUpdateVisitor?: (visitor: Visitor) => void;
}

// Bairros populares de Ponta Grossa para preenchimento com 1 clique
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

export const VisitorRegistration: React.FC<VisitorRegistrationProps> = ({
  visitors,
  settings,
  onAddVisitor,
  onUpdateVisitorStatus,
  onSelectVisitorForAI,
  onUpdateVisitor
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [serviceAttended, setServiceAttended] = useState(
    settings.serviceSchedules[1]?.name
      ? `${settings.serviceSchedules[1].name} (${settings.serviceSchedules[1].day} ${settings.serviceSchedules[1].time})`
      : 'Culto da Família - Domingo 19h'
  );
  const [prayerRequest, setPrayerRequest] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Edit visitor modal
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);

  // Phone input formatting
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length <= 10) {
      formatted = raw.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      formatted = raw.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    setPhone(formatted.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddVisitor({
      name: name.trim(),
      phone: phone.trim() || '(42) 99999-9999',
      neighborhood: neighborhood.trim() || 'Ponta Grossa',
      serviceAttended,
      prayerRequest: prayerRequest.trim(),
      status: 'novo',
      notes: notes.trim()
    });

    // Reset form
    setName('');
    setPhone('');
    setNeighborhood('');
    setPrayerRequest('');
    setNotes('');

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisitor || !onUpdateVisitor) return;
    onUpdateVisitor(editingVisitor);
    setEditingVisitor(null);
  };

  const handleOpenDirectWhatsApp = (visitor: Visitor) => {
    const cleanNumber = cleanPhoneForWhatsApp(visitor.phone);
    const welcomeText = `Paz do Senhor, ${visitor.name}! 🕊️\n\nA Comunhão Cristã Efraim ficou muito honrada e feliz com a sua presença em nosso culto! Saiba que você e sua família são muito bem-vindos em nossa casa.\n\nSe precisar de qualquer apoio, oração ou visita, estamos aqui!\n\n_Com amor em Cristo,_\n*Comunhão Cristã Efraim*`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(welcomeText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredVisitors = visitors.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.neighborhood.toLowerCase().includes(q) ||
      v.phone.includes(q) ||
      (v.prayerRequest && v.prayerRequest.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>Ministério de Integração & Acolhimento</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Cadastro de Visitante
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Cadastre rapidamente os novos visitantes da Comunhão Cristã Efraim para acompanhamento pastoral e envio de mensagens acolhedoras via WhatsApp.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-teal-500/30 rounded-2xl p-4 text-center shrink-0">
            <span className="block text-3xl font-black text-teal-400">{visitors.length}</span>
            <span className="text-xs text-slate-400 font-medium">Visitantes Cadastrados</span>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Visitante cadastrado com sucesso!</span>
          </div>
          <span className="text-emerald-400 text-xs">Pronto para acolhimento pastoral</span>
        </div>
      )}

      {/* Quick Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-400" />
            <span>Formulário Rápido de Recepção</span>
          </h3>
          <span className="text-xs text-slate-400">Campos ágeis para o momento do culto</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome Completo do Visitante: <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mateus Henrique da Silva"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              WhatsApp com DDD: <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(42) 99999-9999"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-white outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Bairro em Ponta Grossa:
          </label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Ex: Uvaranas, Oficinas, Centro..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-500 text-sm text-white outline-none mb-2"
          />

          {/* Quick neighborhood tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Sugestões PG:</span>
            {PONTA_GROSSA_NEIGHBORHOODS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setNeighborhood(b)}
                className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                  neighborhood === b
                    ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Culto de Entrada:
            </label>
            <select
              value={serviceAttended}
              onChange={(e) => setServiceAttended(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-500 text-sm text-white outline-none"
            >
              {settings.serviceSchedules.map((s) => (
                <option key={s.id} value={`${s.name} - ${s.day} ${s.time}`}>
                  {s.name} ({s.day} às {s.time})
                </option>
              ))}
              <option value="Culto Geral / Especial">Outro Culto ou Evento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pedido de Oração / Observações:
            </label>
            <input
              type="text"
              value={prayerRequest}
              onChange={(e) => setPrayerRequest(e.target.value)}
              placeholder="Ex: Clamor pela família, saúde, libertação..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-500 text-sm text-white outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-teal-600/30 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Visitante</span>
          </button>
        </div>
      </form>

      {/* Lista dos Visitantes Cadastrados com botões de 1 clique */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base text-white">
              Visitantes Registrados ({filteredVisitors.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, bairro..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredVisitors.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Nenhum visitante encontrado com os termos de busca.
            </div>
          ) : (
            filteredVisitors.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{v.name}</h4>
                    <span className="text-[11px] font-semibold text-teal-300 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                      {v.neighborhood || 'Ponta Grossa'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {v.createdAt}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-slate-300">{v.phone}</span>
                    <span>•</span>
                    <span>{v.serviceAttended}</span>
                  </div>

                  {v.prayerRequest && (
                    <p className="text-xs text-amber-300/90 italic pt-0.5">
                      🙏 Pedido: "{v.prayerRequest}"
                    </p>
                  )}
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={v.status}
                    onChange={(e) => onUpdateVisitorStatus(v.id, e.target.value as VisitorStatus)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300 outline-none"
                  >
                    <option value="novo">🆕 Novo</option>
                    <option value="em_contato">💬 Em Contato</option>
                    <option value="acolhido">✅ Acolhido</option>
                    <option value="visita_agendada">🏡 Visita Marcada</option>
                  </select>

                  {/* Editar Visitante */}
                  {onUpdateVisitor && (
                    <button
                      onClick={() => setEditingVisitor({ ...v })}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors"
                      title="Editar dados deste visitante"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}

                  {/* 1 Clique: WhatsApp */}
                  <button
                    onClick={() => handleOpenDirectWhatsApp(v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30"
                    title="Abrir WhatsApp com mensagem de boas-vindas"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </button>

                  {/* 1 Clique: Gerar IA */}
                  <button
                    onClick={() => onSelectVisitorForAI(v.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-900/30"
                    title="Gerar mensagem pastoral com IA para este visitante"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Gerar IA</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Visitor Modal */}
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

            <form onSubmit={handleSaveEdit} className="space-y-4">
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
                    Status:
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
                  placeholder="Ex: Uvaranas, Oficinas..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-teal-500 mb-1.5"
                />
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
                  {settings.serviceSchedules.map((s) => (
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
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
