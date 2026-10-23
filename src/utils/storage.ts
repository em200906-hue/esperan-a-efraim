import { AppSettings, PrayerRequest, Visitor } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  churchName: 'Comunhão Cristã Efraim',
  churchTagline: 'Um lugar de acolhimento, fé e novos começos',
  churchCity: 'Ponta Grossa - PR',
  churchAddress: 'Ponta Grossa, Paraná',
  whatsappNumber: '(42) 99968-3585',
  obreirosWhatsAppNumber: '(42) 99968-3585',
  whatsappWelcomeMessage: 'A paz do Senhor! Seja muito bem-vindo(a) à Comunhão Cristã Efraim em Ponta Grossa. Como podemos abençoar a sua vida hoje?',
  pixKey: '27389825000104',
  pixReceiver: 'Comunhão Cristã Efraim',
  pixBank: 'Banco Inter / Chave CNPJ',
  pixDescription: 'Dízimos, Ofertas e Missões Efraim',
  serviceSchedules: [
    {
      id: 'sch-1',
      day: 'Quarta-feira',
      time: '20:00',
      name: 'Culto da Fé e Milagres',
      description: 'Clamor de intercessão, ministração da Palavra e cura'
    },
    {
      id: 'sch-2',
      day: 'Domingo',
      time: '19:00',
      name: 'Culto da Família e Celebração',
      description: 'Celebração com louvor, Ceia e acolhimento de visitantes'
    },
    {
      id: 'sch-3',
      day: 'Terça-feira',
      time: '20:00',
      name: 'Culto Mulheres Preciosas',
      description: 'Reunião do ministério feminino de fortalecimento espiritual'
    },
    {
      id: 'sch-4',
      day: 'Sábado',
      time: '18:00',
      name: 'Juventude Conectados Efraim',
      description: 'Encontro dos jovens e adolescentes com dinâmicas e Palavra'
    }
  ],
  adminLogin: 'efraim2026@',
  adminPassword: '1982185'
};

export const INITIAL_PRAYERS: PrayerRequest[] = [
  {
    id: 'pray-1',
    title: 'Restauração e Paz no Lar de Família em Crise',
    description: 'Peço clamor pelo meu casamento e pela saúde emocional dos nossos filhos. Cremos que Deus é o autor da família e fará um milagre de reconciliação.',
    author: 'Irmã Ana Paula',
    isAnonymous: false,
    category: 'Família & Casamento',
    prayingCount: 28,
    isAnswered: false,
    createdAt: 'Hoje às 09:30',
    createdAtTimestamp: Date.now() - 7200000,
    devotional: {
      verse: 'Josué 24:15',
      scripture: 'Porém eu e a minha casa serviremos ao Senhor.',
      devotionalWord: 'Querida irmã Ana Paula, o Senhor é o alicerce inabalável da sua família. Nenhuma tempestade tem poder para destruir o que Deus edifica na Rocha. Permaneça firme em oração; o Espírito Santo está trabalhando nos corações.',
      prayerDeclaration: 'Declaramos a paz de Cristo reinando em cada cômodo da sua casa e o amor sendo renovado a cada amanhecer!'
    }
  },
  {
    id: 'pray-2',
    title: 'Vitória: Cirurgia do meu pai foi um sucesso e laudo limpo!',
    description: 'Glória a Deus congregação! O meu pai passou pela cirurgia no Hospital de Ponta Grossa e os médicos confirmaram cura total. Obrigado a todos que oraram no mural!',
    author: 'Carlos Eduardo',
    isAnonymous: false,
    category: 'Cura & Saúde',
    prayingCount: 45,
    isAnswered: true,
    testimony: 'O Senhor agiu através das mãos dos médicos e ouviu o clamor da igreja Efraim. Um verdadeiro milagre de cura!',
    createdAt: 'Ontem',
    createdAtTimestamp: Date.now() - 86400000,
    devotional: {
      verse: 'Salmos 103:2-3',
      scripture: 'Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios. É ele que perdoa todas as tuas iniquidades e sara todas as tuas enfermidades.',
      devotionalWord: 'Celebramos com júbilo o milagre operado na vida do seu pai! Que este testemunho fortifique a fé de toda a igreja.',
      prayerDeclaration: 'Senhor, nós te rendemos louvor e gratidão perpétua pela restauração total deste irmão!'
    }
  },
  {
    id: 'pray-3',
    title: 'Porta de Trabalho e Direção para Novo Empreendimento',
    description: 'Estou participando de uma entrevista decisiva nesta semana e preciso de sabedoria e graça de Deus para suprir minha casa.',
    author: 'Anônimo',
    isAnonymous: true,
    category: 'Finanças & Trabalho',
    prayingCount: 19,
    isAnswered: false,
    createdAt: 'Há 2 dias',
    createdAtTimestamp: Date.now() - 172800000,
    devotional: {
      verse: 'Filipenses 4:19',
      scripture: 'O meu Deus suprirá todas as necessidades de vocês, de acordo com as suas gloriosas riquezas em Cristo Jesus.',
      devotionalWord: 'O Senhor que abre portas que ninguém pode fechar já está indo à sua frente. Não tema a incerteza: Ele é o Deus da providência e do renovo.',
      prayerDeclaration: 'Profetizamos favor divino sobre o seu currículo e a provisão sobrenatural da parte de Deus!'
    }
  }
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'vis-1',
    name: 'Mateus Henrique Silva',
    phone: '(42) 99876-1234',
    neighborhood: 'Uvaranas',
    serviceAttended: 'Culto da Família - Domingo 19h',
    prayerRequest: 'Oração pela saúde da minha esposa e bênção nos estudos',
    status: 'novo',
    createdAt: 'Domingo passado',
    notes: 'Primeira vez na igreja com a esposa. Muito receptivo.'
  },
  {
    id: 'vis-2',
    name: 'Cleusa dos Santos Andrade',
    phone: '(42) 99123-4567',
    neighborhood: 'Nova Rússia',
    serviceAttended: 'Culto da Fé - Quarta 20h',
    prayerRequest: 'Clamor pela cura de dor crônica na coluna',
    status: 'em_contato',
    createdAt: 'Há 3 dias',
    notes: 'Gostou muito do momento de clamor da quarta-feira.'
  }
];

const SETTINGS_KEY = 'efraim_esperanca_settings_v1';
const PRAYERS_KEY = 'efraim_esperanca_prayers_v1';
const VISITORS_KEY = 'efraim_esperanca_visitors_v1';

// Local storage fallbacks
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function loadPrayers(): PrayerRequest[] {
  try {
    const raw = localStorage.getItem(PRAYERS_KEY);
    if (!raw) return INITIAL_PRAYERS;
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_PRAYERS;
  }
}

export function savePrayers(prayers: PrayerRequest[]): void {
  try {
    localStorage.setItem(PRAYERS_KEY, JSON.stringify(prayers));
  } catch (err) {
    console.error('Failed to save prayers to localStorage', err);
  }
}

export function loadVisitors(): Visitor[] {
  try {
    const raw = localStorage.getItem(VISITORS_KEY);
    if (!raw) return INITIAL_VISITORS;
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_VISITORS;
  }
}

export function saveVisitors(visitors: Visitor[]): void {
  try {
    localStorage.setItem(VISITORS_KEY, JSON.stringify(visitors));
  } catch (err) {
    console.error('Failed to save visitors to localStorage', err);
  }
}

export function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

// ==========================================
// CENTRAL SERVER API CLIENT (Multi-device synchronization)
// ==========================================

export async function fetchPrayersFromServer(): Promise<PrayerRequest[]> {
  const res = await fetch('/api/prayers');
  if (!res.ok) throw new Error('Falha ao buscar orações do servidor');
  return res.json();
}

export async function createPrayerOnServer(data: {
  title: string;
  description: string;
  author: string;
  isAnonymous: boolean;
  category: string;
}): Promise<PrayerRequest> {
  const res = await fetch('/api/prayers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Falha ao enviar oração para o servidor');
  return res.json();
}

export async function prayOnServer(id: string): Promise<PrayerRequest> {
  const res = await fetch(`/api/prayers/${encodeURIComponent(id)}/pray`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Falha ao registrar clamor no servidor');
  return res.json();
}

export async function markAnsweredOnServer(id: string, testimony: string): Promise<PrayerRequest> {
  const res = await fetch(`/api/prayers/${encodeURIComponent(id)}/answered`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testimony })
  });
  if (!res.ok) throw new Error('Falha ao registrar vitória no servidor');
  return res.json();
}

export async function saveDevotionalOnServer(id: string, devotional: any): Promise<PrayerRequest> {
  const res = await fetch(`/api/prayers/${encodeURIComponent(id)}/devotional`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ devotional })
  });
  if (!res.ok) throw new Error('Falha ao salvar devocional no servidor');
  return res.json();
}

export async function deletePrayerOnServer(id: string): Promise<boolean> {
  const res = await fetch(`/api/prayers/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  return res.ok;
}

export async function bulkUpdatePrayersOnServer(prayers: PrayerRequest[]): Promise<PrayerRequest[]> {
  const res = await fetch('/api/prayers', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prayers)
  });
  return res.json();
}

// Visitors Central API
export async function fetchVisitorsFromServer(): Promise<Visitor[]> {
  const res = await fetch('/api/visitors');
  if (!res.ok) throw new Error('Falha ao buscar visitantes');
  return res.json();
}

export async function createVisitorOnServer(data: any): Promise<Visitor> {
  const res = await fetch('/api/visitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateVisitorOnServer(id: string, data: any): Promise<Visitor> {
  const res = await fetch(`/api/visitors/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteVisitorOnServer(id: string): Promise<boolean> {
  const res = await fetch(`/api/visitors/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  return res.ok;
}

export async function bulkUpdateVisitorsOnServer(visitors: Visitor[]): Promise<Visitor[]> {
  const res = await fetch('/api/visitors', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitors)
  });
  return res.json();
}

// Settings Central API
export async function fetchSettingsFromServer(): Promise<AppSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Falha ao buscar configurações');
  return res.json();
}

export async function saveSettingsToServer(settings: AppSettings): Promise<AppSettings> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return res.json();
}

// Helper to notify obreiros / church workers on WhatsApp
export function getObreirosNotificationWhatsAppUrl(
  prayer: { title: string; category: string; author: string; description?: string },
  obreirosPhone: string,
  churchName: string
): string {
  const cleanPhone = cleanPhoneForWhatsApp(obreirosPhone) || '5542999683585';
  const text = `🕊️ *NOVO PEDIDO DE ORAÇÃO NO MURAL EFRAIM* 🕊️\n\n📢 *Motivo:* ${prayer.title}\n📂 *Categoria:* ${prayer.category}\n👤 *Irmão(ã):* ${prayer.author}\n📝 *Detalhes:* ${prayer.description || 'Clamor sincero ao Senhor'}\n\n🙏 _Atenção Equipe de Obreiros e Intercessão da ${churchName}: clamemos em favor desta vida!_\n\nLink do Mural: ${window.location.origin}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
