import React, { useState } from 'react';
import {
  Heart,
  Send,
  Sparkles,
  Trophy,
  Filter,
  Search,
  BookOpen,
  Share2,
  Check,
  Flame,
  UserCheck,
  UserX,
  Volume2,
  MessageCircle,
  HelpCircle,
  Loader2,
  Bell,
  ExternalLink,
  ShieldAlert,
  Radio,
  X
} from 'lucide-react';
import { PrayerCategory, PrayerRequest } from '../types';
import { playHarmonicPrayerChime } from '../utils/audio';
import { getObreirosNotificationWhatsAppUrl } from '../utils/storage';

interface PrayerWallProps {
  prayers: PrayerRequest[];
  onAddPrayer: (prayer: Omit<PrayerRequest, 'id' | 'createdAt' | 'prayingCount' | 'isAnswered'>) => Promise<PrayerRequest | void> | void;
  onPrayForRequest: (id: string) => void;
  onMarkAnswered: (id: string, testimony: string) => void;
  onUpdatePrayerDevotional: (id: string, devotional: any) => void;
  churchName: string;
  obreirosPhone?: string;
}

const CATEGORIES: PrayerCategory[] = [
  'Cura & Saúde',
  'Família & Casamento',
  'Finanças & Trabalho',
  'Vida Espiritual',
  'Causas Impossíveis',
  'Agradecimento & Louvor'
];

export const PrayerWall: React.FC<PrayerWallProps> = ({
  prayers,
  onAddPrayer,
  onPrayForRequest,
  onMarkAnswered,
  onUpdatePrayerDevotional,
  churchName,
  obreirosPhone = '(42) 99968-3585'
}) => {
  // New Prayer Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState<PrayerCategory>('Cura & Saúde');

  // Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'answered' | 'top'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Victory / Answered Modal
  const [answeringPrayerId, setAnsweringPrayerId] = useState<string | null>(null);
  const [testimonyInput, setTestimonyInput] = useState('');

  // Post-submission Obreiros Alert Modal
  const [recentlySubmittedPrayer, setRecentlySubmittedPrayer] = useState<{
    title: string;
    description: string;
    author: string;
    category: string;
  } | null>(null);

  // Loading devotional state per prayer ID
  const [loadingDevotionalId, setLoadingDevotionalId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      author: isAnonymous ? 'Anônimo' : (author.trim() || 'Irmão(ã) em Cristo'),
      isAnonymous,
      category
    };

    try {
      await onAddPrayer(payload);
      setRecentlySubmittedPrayer(payload);
    } catch (err) {
      console.error('Erro ao adicionar oração:', err);
    }

    setTitle('');
    setDescription('');
    setAuthor('');
    setIsAnonymous(false);
    setShowForm(false);
    playHarmonicPrayerChime();
  };

  const handlePray = (id: string) => {
    onPrayForRequest(id);
    playHarmonicPrayerChime();
  };

  const handleOpenAnswerModal = (prayer: PrayerRequest) => {
    setAnsweringPrayerId(prayer.id);
    setTestimonyInput(prayer.testimony || '');
  };

  const handleConfirmAnswered = () => {
    if (!answeringPrayerId) return;
    onMarkAnswered(answeringPrayerId, testimonyInput.trim() || 'Oração respondida para a glória do Senhor!');
    setAnsweringPrayerId(null);
    setTestimonyInput('');
    playHarmonicPrayerChime();
  };

  const handleGenerateDevotional = async (prayer: PrayerRequest) => {
    setLoadingDevotionalId(prayer.id);
    try {
      const res = await fetch('/api/gemini/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prayerTitle: prayer.title,
          prayerDescription: prayer.description,
          category: prayer.category
        })
      });
      const data = await res.json();
      onUpdatePrayerDevotional(prayer.id, data);
    } catch (err) {
      console.error('Erro ao gerar devocional:', err);
    } finally {
      setLoadingDevotionalId(null);
    }
  };

  const handleCopyDevotional = (prayer: PrayerRequest) => {
    if (!prayer.devotional) return;
    const text = `🕊️ *Palavra Pastoral Efraim* 🕊️\n\n📖 *${prayer.devotional.verse}*\n"${prayer.devotional.scripture}"\n\n${prayer.devotional.devotionalWord}\n\n🙏 *Oração:* ${prayer.devotional.prayerDeclaration}\n\n*${churchName}*`;
    navigator.clipboard.writeText(text);
    setCopiedId(prayer.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered prayers logic
  const filteredPrayers = prayers.filter((prayer) => {
    if (selectedCategory !== 'all' && prayer.category !== selectedCategory) return false;
    if (filterType === 'active' && prayer.isAnswered) return false;
    if (filterType === 'answered' && !prayer.isAnswered) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prayer.title.toLowerCase().includes(q);
      const matchDesc = prayer.description.toLowerCase().includes(q);
      const matchAuthor = prayer.author.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAuthor) return false;
    }
    return true;
  }).sort((a, b) => {
    if (filterType === 'top') {
      return b.prayingCount - a.prayingCount;
    }
    return 0; // retain chronological
  });

  const totalIntercessions = prayers.reduce((acc, p) => acc + p.prayingCount, 0);
  const totalAnswered = prayers.filter((p) => p.isAnswered).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Clamor & Intercessão Efraim */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Intercessão Viva da Congregação</span>
              </div>

              {/* Status de Sincronização entre Celulares */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Sincronizado entre Todos os Celulares</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Mural de Oração Efraim
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Apresente suas petições. Cada clamor é compartilhado em tempo real com todos os irmãos e obreiros da igreja.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{showForm ? 'Fechar Formulário' : 'Enviar Pedido de Oração'}</span>
            </button>
          </div>
        </div>

        {/* Estatísticas Rápidas de Fé */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
            <span className="block text-2xl font-black text-amber-400">{prayers.length}</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Clamores no Mural</span>
          </div>
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
            <span className="block text-2xl font-black text-emerald-400">{totalAnswered}</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Vitórias Alcançadas 🏆</span>
          </div>
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
            <span className="block text-2xl font-black text-amber-300">{totalIntercessions}</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Vezes Orado 🙏</span>
          </div>
        </div>
      </div>

      {/* Formulário Ágil de Pedido de Oração */}
      {showForm && (
        <form
          onSubmit={handleSubmitPrayer}
          className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h3 className="font-bold text-lg text-white">Novo Clamor de Oração</h3>
            </div>
            <span className="text-xs text-amber-400">Enviado para todos os celulares e obreiros</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo / Título do Clamor: <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Clamor pela saúde de familiar, porta de emprego..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PrayerCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 text-sm text-white outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detalhes do Pedido (Opcional):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conte brevemente a sua necessidade para direcionar a oração dos irmãos e da liderança..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white outline-none resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span className="flex items-center gap-1 font-medium">
                  {isAnonymous ? <UserX className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-slate-400" />}
                  Manter pedido anônimo
                </span>
              </label>

              {!isAnonymous && (
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Seu nome (ex: Irmã Maria)"
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none w-44"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar & Avisar Igreja</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por palavras-chave, nome ou enfermidade..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white outline-none"
            />
          </div>

          {/* Abas de Filtro de Status */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({prayers.length})
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'active' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Em Clamor
            </button>
            <button
              onClick={() => setFilterType('answered')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterType === 'answered' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Trophy className="w-3 h-3" />
              Vitórias ({totalAnswered})
            </button>
            <button
              onClick={() => setFilterType('top')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'top' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mais Orados
            </button>
          </div>
        </div>

        {/* Categorias Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0">Categorias:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pedidos de Oração */}
      <div className="space-y-4">
        {filteredPrayers.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">Nenhum pedido de oração encontrado</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Seja o primeiro a colocar um clamor ou ajuste os filtros acima para ver mais orações da comunidade.
            </p>
          </div>
        ) : (
          filteredPrayers.map((prayer) => {
            const obreirosWaUrl = getObreirosNotificationWhatsAppUrl(prayer, obreirosPhone, churchName);

            return (
              <div
                key={prayer.id}
                id={`prayer-${prayer.id}`}
                className={`rounded-2xl transition-all border p-5 md:p-6 shadow-xl relative ${
                  prayer.isAnswered
                    ? 'bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/40'
                    : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/30'
                }`}
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {prayer.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        por <strong className="text-slate-200">{prayer.author}</strong> • {prayer.createdAt}
                      </span>
                      {prayer.isAnswered && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                          <Trophy className="w-3 h-3 text-emerald-400" />
                          Vitória / Oração Respondida! 🙌
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {prayer.title}
                    </h3>
                  </div>

                  {/* Botão de Vitória */}
                  {!prayer.isAnswered ? (
                    <button
                      onClick={() => handleOpenAnswerModal(prayer)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-300 text-slate-300 border border-slate-700 hover:border-emerald-500/40 transition-colors shrink-0 flex items-center gap-1.5"
                      title="Registrar que Deus respondeu essa oração"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Marcar Vitória</span>
                    </button>
                  ) : (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        Deus Operou Milagre
                      </span>
                    </div>
                  )}
                </div>

                {/* Descrição */}
                {prayer.description && (
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {prayer.description}
                  </p>
                )}

                {/* Seção de Testemunho de Vitória */}
                {prayer.isAnswered && prayer.testimony && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                      <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Testemunho de Vitória:</span>
                    </div>
                    <p className="text-slate-200 italic">"{prayer.testimony}"</p>
                  </div>
                )}

                {/* Card da Palavra Devocional Bíblica Gerada por IA */}
                {prayer.devotional ? (
                  <div className="mb-4 rounded-xl bg-gradient-to-br from-amber-950/30 to-slate-950 border border-amber-500/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>Palavra Pastoral Efraim • {prayer.devotional.verse}</span>
                      </div>
                      <button
                        onClick={() => handleCopyDevotional(prayer)}
                        className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        {copiedId === prayer.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3 h-3" />
                            <span>Copiar Bênção</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-amber-100 font-serif italic border-l-2 border-amber-400 pl-3 py-0.5">
                      "{prayer.devotional.scripture}"
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {prayer.devotional.devotionalWord}
                    </p>

                    {prayer.devotional.prayerDeclaration && (
                      <div className="pt-1.5 border-t border-amber-500/20 text-[11px] text-amber-300 font-medium flex items-center gap-1">
                        <span>🙏</span>
                        <span>{prayer.devotional.prayerDeclaration}</span>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Ações Inferiores: Estou Orando Agora & Avisar Obreiros & Gerar IA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botão Estou Orando Agora */}
                    <button
                      onClick={() => handlePray(prayer.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
                        prayer.userPrayed
                          ? 'bg-amber-500 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/50'
                          : 'bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <span className="text-base">🙏</span>
                      <span>Estou Orando Agora</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-950/40 text-[11px]">
                        {prayer.prayingCount}
                      </span>
                    </button>

                    {/* Botão Avisar Obreiros no WhatsApp */}
                    <a
                      href={obreirosWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all shadow-sm"
                      title="Enviar este pedido direto para o WhatsApp da equipe de obreiros e intercessores"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Avisar Obreiros</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {!prayer.devotional && (
                      <button
                        onClick={() => handleGenerateDevotional(prayer)}
                        disabled={loadingDevotionalId === prayer.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
                      >
                        {loadingDevotionalId === prayer.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            <span>Recebendo Palavra...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Receber Palavra Bíblica (IA)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Confirmação de Envio com Notificação para Obreiros */}
      {recentlySubmittedPrayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 text-center">
            <button
              onClick={() => setRecentlySubmittedPrayer(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto mb-3 flex items-center justify-center border border-amber-500/40">
              <Flame className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Clamor Publicado no Mural! 🕊️
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Seu pedido já está visível para toda a congregação Efraim em todos os celulares.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left text-xs mb-4">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Motivo do Clamor:</span>
              <p className="font-semibold text-white">{recentlySubmittedPrayer.title}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Solicitante: {recentlySubmittedPrayer.author}</p>
            </div>

            <p className="text-xs text-emerald-300 font-medium mb-4">
              Deseja acionar imediatamente a <strong>Equipe de Obreiros e Intercessores</strong> no WhatsApp?
            </p>

            <div className="flex flex-col gap-2">
              <a
                href={getObreirosNotificationWhatsAppUrl(recentlySubmittedPrayer, obreirosPhone, churchName)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setRecentlySubmittedPrayer(null)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-emerald-900/40"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notificar Obreiros no WhatsApp Agora</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              <button
                onClick={() => setRecentlySubmittedPrayer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Continuar no Aplicativo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Registrar Vitória e Testemunho */}
      {answeringPrayerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-2 border border-emerald-500/40">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Celebrar Vitória no Mural! 🙌
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Deus ouviu o clamor da igreja! Conte o testemunho para edificar a fé de todos os irmãos.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seu Testemunho de Vitória / Como Deus Agiu:
              </label>
              <textarea
                rows={4}
                value={testimonyInput}
                onChange={(e) => setTestimonyInput(e.target.value)}
                placeholder="Ex: O Senhor abriu as portas, os exames foram curados, houve reconciliação..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white outline-none resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAnsweringPrayerId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAnswered}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-900/50"
              >
                <Trophy className="w-4 h-4" />
                <span>Confirmar Vitória</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
