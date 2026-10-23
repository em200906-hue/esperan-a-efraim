export type PrayerCategory =
  | 'Cura & Saúde'
  | 'Família & Casamento'
  | 'Finanças & Trabalho'
  | 'Vida Espiritual'
  | 'Causas Impossíveis'
  | 'Agradecimento & Louvor';

export interface DevotionalWord {
  verse: string;
  scripture: string;
  devotionalWord: string;
  prayerDeclaration: string;
}

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  author: string;
  isAnonymous: boolean;
  category: PrayerCategory;
  prayingCount: number;
  isAnswered: boolean;
  testimony?: string;
  devotional?: DevotionalWord;
  createdAt: string;
  createdAtTimestamp?: number;
  userPrayed?: boolean;
}

export type VisitorStatus = 'novo' | 'em_contato' | 'acolhido' | 'visita_agendada';

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  neighborhood: string;
  serviceAttended: string;
  prayerRequest?: string;
  status: VisitorStatus;
  createdAt: string;
  notes?: string;
}

export interface ServiceSchedule {
  id: string;
  day: string;
  time: string;
  name: string;
  description?: string;
}

export interface AppSettings {
  churchName: string;
  churchTagline: string;
  churchCity: string;
  churchAddress: string;
  whatsappNumber: string;
  obreirosWhatsAppNumber: string;
  whatsappWelcomeMessage: string;
  pixKey: string;
  pixReceiver: string;
  pixBank: string;
  pixDescription: string;
  serviceSchedules: ServiceSchedule[];
  adminLogin: string;
  adminPassword: string;
}
