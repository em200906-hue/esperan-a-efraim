import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent shared database file
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'church_store.json');

const INITIAL_DEFAULT_SETTINGS = {
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

const INITIAL_DEFAULT_PRAYERS = [
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
    createdAtTimestamp: Date.now() - 3600000 * 2,
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
    createdAtTimestamp: Date.now() - 3600000 * 24,
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
    createdAtTimestamp: Date.now() - 3600000 * 48,
    devotional: {
      verse: 'Filipenses 4:19',
      scripture: 'O meu Deus suprirá todas as necessidades de vocês, de acordo com as suas gloriosas riquezas em Cristo Jesus.',
      devotionalWord: 'O Senhor que abre portas que ninguém pode fechar já está indo à sua frente. Não tema a incerteza: Ele é o Deus da providência e do renovo.',
      prayerDeclaration: 'Profetizamos favor divino sobre o seu currículo e a provisão sobrenatural da parte de Deus!'
    }
  }
];

const INITIAL_DEFAULT_VISITORS = [
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

interface ChurchDB {
  prayers: any[];
  visitors: any[];
  settings: any;
}

function loadDatabase(): ChurchDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        prayers: parsed.prayers || INITIAL_DEFAULT_PRAYERS,
        visitors: parsed.visitors || INITIAL_DEFAULT_VISITORS,
        settings: { ...INITIAL_DEFAULT_SETTINGS, ...(parsed.settings || {}) }
      };
    }
  } catch (err) {
    console.error('Erro lendo DB:', err);
  }

  // Initial creation
  const initialData: ChurchDB = {
    prayers: INITIAL_DEFAULT_PRAYERS,
    visitors: INITIAL_DEFAULT_VISITORS,
    settings: INITIAL_DEFAULT_SETTINGS
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: ChurchDB): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro salvando DB:', err);
  }
}

// In-memory cache synced with disk
let db = loadDatabase();

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// CENTRAL PRAYER API ENDPOINTS (Shared Across All Devices)
// ==========================================

// GET all prayers
app.get('/api/prayers', (_req, res) => {
  res.json(db.prayers);
});

// POST new prayer from any device / cellphone
app.post('/api/prayers', (req, res) => {
  const { title, description, author, isAnonymous, category } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Título do pedido é obrigatório' });
  }

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const newPrayer = {
    id: `pray-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title.trim(),
    description: (description || '').trim(),
    author: isAnonymous ? 'Anônimo' : (author || 'Irmão(ã) em Cristo').trim(),
    isAnonymous: !!isAnonymous,
    category: category || 'Vida Espiritual',
    prayingCount: 1,
    isAnswered: false,
    createdAt: `Hoje às ${timeFormatted}`,
    createdAtTimestamp: Date.now()
  };

  db.prayers.unshift(newPrayer);
  saveDatabase(db);

  res.status(201).json(newPrayer);
});

// POST increment intercession "Estou Orando Agora"
app.post('/api/prayers/:id/pray', (req, res) => {
  const { id } = req.params;
  const prayer = db.prayers.find((p) => p.id === id);
  if (!prayer) {
    return res.status(404).json({ error: 'Pedido de oração não encontrado' });
  }

  prayer.prayingCount = (prayer.prayingCount || 0) + 1;
  saveDatabase(db);
  res.json(prayer);
});

// POST mark as victory / answered
app.post('/api/prayers/:id/answered', (req, res) => {
  const { id } = req.params;
  const { testimony } = req.body;
  const prayer = db.prayers.find((p) => p.id === id);
  if (!prayer) {
    return res.status(404).json({ error: 'Pedido de oração não encontrado' });
  }

  prayer.isAnswered = true;
  prayer.testimony = testimony || 'Oração respondida para a glória de Deus!';
  saveDatabase(db);
  res.json(prayer);
});

// POST save devotional for prayer
app.post('/api/prayers/:id/devotional', (req, res) => {
  const { id } = req.params;
  const { devotional } = req.body;
  const prayer = db.prayers.find((p) => p.id === id);
  if (!prayer) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  prayer.devotional = devotional;
  saveDatabase(db);
  res.json(prayer);
});

// DELETE prayer
app.delete('/api/prayers/:id', (req, res) => {
  const { id } = req.params;
  db.prayers = db.prayers.filter((p) => p.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// PUT bulk update prayers (from admin)
app.put('/api/prayers', (req, res) => {
  if (Array.isArray(req.body)) {
    db.prayers = req.body;
    saveDatabase(db);
    return res.json(db.prayers);
  }
  res.status(400).json({ error: 'Dados inválidos' });
});

// ==========================================
// CENTRAL VISITORS API ENDPOINTS
// ==========================================

// GET all visitors
app.get('/api/visitors', (_req, res) => {
  res.json(db.visitors);
});

// POST new visitor from any device
app.post('/api/visitors', (req, res) => {
  const { name, phone, neighborhood, serviceAttended, prayerRequest, status, notes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome do visitante é obrigatório' });
  }

  const newVisitor = {
    id: `vis-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    phone: (phone || '').trim(),
    neighborhood: (neighborhood || 'Ponta Grossa').trim(),
    serviceAttended: serviceAttended || 'Culto Efraim',
    prayerRequest: (prayerRequest || '').trim(),
    status: status || 'novo',
    createdAt: 'Hoje',
    notes: (notes || '').trim()
  };

  db.visitors.unshift(newVisitor);
  saveDatabase(db);
  res.status(201).json(newVisitor);
});

// PUT update visitor
app.put('/api/visitors/:id', (req, res) => {
  const { id } = req.params;
  const index = db.visitors.findIndex((v) => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Visitante não encontrado' });
  }

  db.visitors[index] = { ...db.visitors[index], ...req.body, id };
  saveDatabase(db);
  res.json(db.visitors[index]);
});

// DELETE visitor
app.delete('/api/visitors/:id', (req, res) => {
  const { id } = req.params;
  db.visitors = db.visitors.filter((v) => v.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// PUT bulk update visitors
app.put('/api/visitors', (req, res) => {
  if (Array.isArray(req.body)) {
    db.visitors = req.body;
    saveDatabase(db);
    return res.json(db.visitors);
  }
  res.status(400).json({ error: 'Dados inválidos' });
});

// ==========================================
// CENTRAL SETTINGS API ENDPOINTS
// ==========================================

app.get('/api/settings', (_req, res) => {
  res.json(db.settings);
});

app.post('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json(db.settings);
});

// ==========================================
// GEMINI AI ENDPOINTS
// ==========================================

// API Route: Gerar Palavra Devocional Bíblica para Pedido de Oração
app.post('/api/gemini/devotional', async (req, res) => {
  try {
    const { prayerTitle, prayerDescription, category } = req.body;

    if (!prayerTitle) {
      return res.status(400).json({ error: 'Título do pedido é obrigatório' });
    }

    if (!ai) {
      const fallbackVerses = [
        {
          verse: 'Filipenses 4:6-7',
          text: 'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus. E a paz de Deus, que excede todo o entendimento, guardará os seus corações e as suas mentes em Cristo Jesus.',
          word: 'Querido(a) irmão(ã), o Senhor ouviu o seu clamor antes mesmo que as palavras saíssem dos seus lábios. Descanse seu coração, pois a congregação Efraim está unida em intercessão por você. A paz do Senhor já está guardando a sua vida.'
        },
        {
          verse: 'Jeremias 29:11-12',
          text: 'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de lhes causar dano, planos de dar-lhes esperança e um futuro. Então vocês clamarão a mim, virão orar a mim, e eu os ouvirei.',
          word: 'Deus nunca perde o controle da sua história. O deserto é lugar de passagem, não de morada. A promessa dEle para a sua vida permanece viva e o Senhor tem um tempo de resposta e milagres preparado para você.'
        },
        {
          verse: 'Salmos 34:17-18',
          text: 'Os justos clamam, o Senhor os ouve e os livra de todas as suas tribulações. Perto está o Senhor dos que têm o coração quebrantado e salva os de espírito abatido.',
          word: 'Sinta o abraço consolador do Pai hoje. Você não está sozinho(a) nessa batalha. A igreja Efraim se levanta em oração e profetiza vitória sobre esta causa.'
        }
      ];
      const selected = fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)];
      return res.json({
        verse: selected.verse,
        scripture: selected.text,
        devotionalWord: selected.word,
        prayerDeclaration: 'Senhor Jesus, nós colocamos esta vida em Teu altar. Que haja livramento, cura, consolo e renovo sobrenatural. Em Teu Santo Nome, amém!'
      });
    }

    const prompt = `Você é o Pastor da Comunhão Cristã Efraim (Ponta Grossa/PR), acolhedor, cheio de graça, fé e amor cristão.
Um membro ou visitante enviou o seguinte pedido de oração:
Título: "${prayerTitle}"
Categoria: "${category || 'Geral'}"
Detalhes: "${prayerDescription || 'Clamor sincero ao Senhor'}"

Gere uma resposta pastoral inspiradora e bíblica contendo exatamente:
1. Uma passagem bíblica apropriada com referência (ex: "Isaías 41:10")
2. O texto bíblico exato do versículo
3. Uma mensagem pastoral curta e calorosa de encorajamento (2 a 3 parágrafos curtos)
4. Uma declaração profética de oração (1 frase de bênção)

Formato de resposta: responda SOMENTE em JSON válido com as chaves:
{
  "verse": "Referência do versículo",
  "scripture": "Texto do versículo",
  "devotionalWord": "Mensagem pastoral acolhedora",
  "prayerDeclaration": "Declaração de oração e bênção"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const jsonResult = JSON.parse(responseText);
    res.json(jsonResult);
  } catch (error: any) {
    console.error('Erro na geração devocional:', error);
    res.status(500).json({
      error: 'Não foi possível gerar a palavra devocional no momento.',
      verse: 'Salmos 46:1',
      scripture: 'Deus é o nosso refúgio e a nossa fortaleza, auxílio sempre presente na adversidade.',
      devotionalWord: 'O Senhor conhece todas as dores e inquietações. Continue firme em oração; a igreja está clamando junto com você!',
      prayerDeclaration: 'Pai celeste, derrama Tua paz e manifesta o Teu socorro nesta situação. Amém.'
    });
  }
});

// API Route: Assistente IA Pastoral (mensagens de acolhimento, 3º dia, encorajamento, visitas)
app.post('/api/gemini/pastoral', async (req, res) => {
  try {
    const {
      type,
      visitorName,
      serviceAttended,
      neighborhood,
      prayerRequest,
      pastorName = 'Pastores e Liderança Efraim',
      tone = 'caloroso e fraternal',
      customNotes
    } = req.body;

    if (!visitorName) {
      return res.status(400).json({ error: 'Nome do destinatário é obrigatório' });
    }

    if (!ai) {
      let messageText = '';
      if (type === 'welcome_post_service') {
        messageText = `Paz do Senhor, ${visitorName}! 🕊️\n\nQue alegria imensa ter você e sua família conosco na *Comunhão Cristã Efraim* no ${serviceAttended || 'nosso culto'}!\n\nQueremos que você saiba que esta casa também é sua. Ficamos muito felizes com a sua presença e já estamos orando para que a Palavra ministrada floresça no seu coração.\n\nSe precisar de oração, apoio ou apenas conversar, estamos sempre à sua disposição por aqui.\n\nNosso próximo culto é nesta quarta às 20h ou domingo às 19h. Esperamos te ver novamente!\n\n_Com carinho e bênçãos,_\n*${pastorName}*\n*Comunhão Cristã Efraim - Ponta Grossa* ✨`;
      } else if (type === 'third_day_followup') {
        messageText = `Olá, querido(a) ${visitorName}! Como está sendo a sua semana? 🌿\n\nPassando aqui da *Comunhão Cristã Efraim* para te lembrar que você tem estado em nossas orações desde aquele momento especial em nosso culto.\n\n_"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e te conceda paz." (Números 6:24-26)_\n\nComo podemos orar por você hoje? Estamos aqui para caminhar juntos!\n\n*${pastorName}*`;
      } else if (type === 'home_visit_guide') {
        messageText = `Paz do Senhor, ${visitorName}! 🏡\n\nSeria uma honra imensa para a nossa equipe pastoral fazer uma rápida visita de oração e bênção na sua casa no bairro ${neighborhood || 'em Ponta Grossa'}.\n\nNosso propósito é apenas levar uma oração pelo seu lar e uma palavra de paz, sem tomar muito o seu tempo.\n\nQual dia e horário desta semana ficaria mais confortável para você receber nossos irmãos?\n\nQue a presença de Deus inunde a sua casa!\n*${pastorName}*`;
      } else {
        messageText = `A paz, ${visitorName}! 📖✨\n\nO Senhor colocou o seu nome no nosso coração. Lembre-se: _"Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça." (Isaías 41:10)_\n\nDeus está cuidando de cada detalhe da sua vida${prayerRequest ? ` e do seu pedido por "${prayerRequest}"` : ''}. Seja renovado(a) nesta hora!\n\n*${pastorName}*`;
      }

      return res.json({
        message: messageText,
        subject: `Mensagem pastoral para ${visitorName}`,
        whatsappEncoded: encodeURIComponent(messageText)
      });
    }

    const typePromptDescriptions: Record<string, string> = {
      welcome_post_service: 'Mensagem de acolhimento caloroso para visitante recém-chegado pós-culto, agradecendo a presença e convidando para os próximos cultos.',
      third_day_followup: 'Mensagem de acompanhamento pastoral do 3º dia, demonstrando cuidado contínuo, perguntando como está a semana e oferecendo oração.',
      biblical_encouragement: 'Mensagem de encorajamento bíblico forte, trazendo esperança, fé e vitória em Cristo, direcionada para a necessidade da pessoa.',
      home_visit_guide: 'Mensagem amigável propondo um agendamento de visita pastoral breve no lar para oração e abençoar a família.',
      prayer_reply: 'Mensagem pastoral respondendo especificamente ao pedido de oração da pessoa com conforto e fé.'
    };

    const typeDesc = typePromptDescriptions[type] || 'Mensagem pastoral acolhedora e edificante.';

    const prompt = `Você é o Pastor da Comunhão Cristã Efraim em Ponta Grossa, PR.
Escreva uma mensagem de WhatsApp para ser enviada diretamente a uma pessoa.

Dados da pessoa:
- Nome: ${visitorName}
- Culto em que esteve: ${serviceAttended || 'Culto da Igreja Efraim'}
- Bairro em Ponta Grossa: ${neighborhood || 'Ponta Grossa'}
- Pedido de oração / contexto: ${prayerRequest || 'Não informado'}
- Notas adicionais: ${customNotes || 'Nenhuma'}
- Assinatura: ${pastorName} (Comunhão Cristã Efraim)
- Tipo de mensagem: ${typeDesc}
- Tom: ${tone}

Requisitos da mensagem:
1. Formate perfeitamente para WhatsApp: use *negrito* para ênfase e nomes, parágrafos limpos e emojis cristãos acolhedores (🕊️, 🙏, 📖, ✨, 🌿, etc.).
2. Inclua um versículo bíblico curto e muito oportuno.
3. Não use linguagem robótica. Seja genuinamente afetuoso, respeitoso, pastoral e acolhedor.
4. Finalize com a assinatura pastoral e Comunhão Cristã Efraim.

Responda SOMENTE em JSON com o formato:
{
  "message": "Texto completo pronto para WhatsApp",
  "subject": "Título resumido da mensagem"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const jsonResult = JSON.parse(responseText);
    res.json({
      ...jsonResult,
      whatsappEncoded: encodeURIComponent(jsonResult.message || '')
    });
  } catch (error: any) {
    console.error('Erro na geração pastoral:', error);
    res.status(500).json({
      error: 'Não foi possível gerar a mensagem com IA no momento.',
      message: `Paz do Senhor, ${req.body.visitorName || 'querido(a)'}! 🕊️\n\nA Comunhão Cristã Efraim tem grande alegria em caminhar com você. Que a graça e o favor do Senhor Jesus estejam sobre a sua vida e sua família hoje e sempre!\n\n_Com carinho e oração,_\n*Comunhão Cristã Efraim*`,
      subject: 'Mensagem de bênção'
    });
  }
});

// Configure Vite middleware for development or serve built files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ESPERANÇA Efraim listening on port ${PORT}`);
  });
}

startServer();
