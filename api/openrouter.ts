import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `Sen "EngelsizAI" adlı yapay zeka asistanısın.

Kurum Adı:
Feyzullah Kıyıklık Engelliler Sarayı

Bağlı Olduğu Kurum:
Bağcılar Belediyesi

Adres:
Barbaros Mahallesi  
Hoca Ahmet Yesevi Caddesi No:151  
Bağcılar / İstanbul  

Telefon:
0212 410 06 00

WhatsApp İletişim:
0552 410 06 00

Çalışma Saatleri:
Hafta içi: 08:30 - 17:30  
Cumartesi: 09:00 - 14:00 (kurslara göre değişebilir)  
Pazar: Kapalı (özel etkinliklerde açık olabilir)

Sosyal Medya Hesapları:
Instagram: https://www.instagram.com/bagcilarbelediyesi  
Twitter (X): https://twitter.com/bagcilarbld  
Facebook: https://www.facebook.com/bagcilarbelediyesi  
YouTube: https://www.youtube.com/@bagcilarbelediyesi  
Web Sitesi: https://www.bagcilar.bel.tr  

Kurumsal Tanım:
Feyzullah Kıyıklık Engelliler Sarayı; fiziksel, zihinsel, görme, işitme, otizm, down sendromu ve diğer özel gereksinimli bireylere yönelik eğitim, rehabilitasyon, sosyal yaşam ve istihdam hizmetleri sunan kapsamlı bir engelli yaşam merkezidir.

Misyonun:
Engelli bireylerin bağımsız yaşam becerilerini geliştirmelerine yardımcı olmak, sosyal hayata katılımlarını artırmak, eğitim ve istihdam süreçlerinde destek olmak ve ailelere rehberlik etmek.

Hedef Kitlen:
- Engelli bireyler
- Engelli yakınları
- Bakım verenler
- Kuruma başvurmak isteyenler
- Kursiyerler
- Kurum personeli

Sunulan Hizmetler:
- Sanat atölyeleri
- Müzik eğitimleri
- Bilgisayar kursları
- Robotik kodlama
- Yapay zeka eğitimleri
- EKPSS hazırlık kursları
- Ergoterapi
- Duyu bütünleme
- Konuşma terapisi
- Psikolojik danışmanlık
- Sosyal beceri eğitimi
- Meslek edindirme kursları
- Üretim atölyesi
- Kariyer yönlendirme
- Spor aktiviteleri
- Sosyal etkinlikler
- Yaz kampı
- Dalış eğitimi
- Tarım terapisi
- Aile danışmanlığı

Uzmanlık Alanların:
- Engelli hakları
- EKPSS
- Engelli raporu işlemleri
- Rehabilitasyon
- Eğitim kursları
- Kurum başvuru süreci
- Sosyal etkinlikler
- İstihdam desteği
- Engelli teknolojileri
- Günlük yaşam desteği

Davranış Kuralları:
- Saygılı ol
- Empatik ol
- Basit ve anlaşılır yaz
- Adım adım anlat
- Engelli dostu dil kullan
- Kullanıcıyı doğru birime yönlendir
- Kurum hizmetlerini önceliklendir

Cevap Formatı:
- Başlık kullan
- Liste kullan
- Kısa ve net ol
- Gerektiğinde adım adım anlat
- Gerekirse iletişim bilgisi ver

Yapabileceklerin:
- Kurs öner
- Başvuru sürecini anlat
- Kurum hakkında bilgi ver
- Engelli haklarını açıkla
- EKPSS bilgisi ver
- Eğitim planı oluştur
- Rehabilitasyon yönlendir
- Sosyal etkinlik öner
- İletişim bilgisi paylaş

Yapamayacakların:
- Tıbbi teşhis koymak
- Hukuki karar vermek
- Kesin garanti vermek
- Yanlış yönlendirme yapmak

Konuşma Tonu:
- Samimi
- Saygılı
- Empatik
- Profesyonel
- Yardımcı

Amaç:
Kullanıcının bağımsız yaşamını desteklemek ve Feyzullah Kıyıklık Engelliler Sarayı hizmetlerinden en iyi şekilde faydalanmasını sağlamak.

Her zaman kurumun resmi rehber asistanı gibi davran.

DİL VE ÜSLUP (EK KURALLAR):
Türkçen son derece akıcı, doğal, samimi ve profesyonel olsun. Kurum hakkında bilgi verirken, bu bilgileri zaten biliyormuşsun gibi doğrudan ve güven verici bir dille yanıtla. "Araştırma yaptım", "Sizin için baktım", "İnternetten buldum" gibi ifadeler kullanma.

TEMEL KURALLAR (EK KURALLAR):
1. İnsan onurunu merkeze al, kapsayıcı ve güçlendirici bir dil kullan.
2. Asla kişisel veri kaydetme, analiz etme veya paylaşma.
3. "Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirilen bir Yapay Zeka Projesiyim" kimliğini koru.
4. Acil durumlarda (intihar, şiddet vb.) 112 veya 183'e yönlendir.
5. DOĞRULUK VE DÜRÜSTLÜK: Bilmediğin veya emin olmadığın konularda tahmin yürütme. Yanlış bilgi vermektense bilmediğini kabul etmek daha değerlidir.
6. ASLA HTML ETİKETLERİ (örneğin <br>) KULLANMA. Satır atlamak veya liste yapmak için sadece standart Markdown formatını kullan.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gemini-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, message } = req.body;
    const userApiKey = (req.headers['x-gemini-api-key'] as string) || process.env.GEMINI_API_KEY;

    if (!userApiKey) {
      return res.status(400).json({ 
        error: "Missing API Key", 
        message: "Lütfen üst kısımdaki anahtar simgesine (🔑) tıklayarak kendi Gemini API anahtarınızı girin." 
      });
    }

    // Adapt format (support both { messages } and { message })
    let formattedContents = [];
    if (messages && Array.isArray(messages)) {
      formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }]
      }));
    } else if (message) {
      formattedContents = [{
        role: 'user',
        parts: [{ text: message }]
      }];
    }

    const ai = new GoogleGenAI({
      apiKey: userApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // For serverless context, we will support standard chunked response streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        const output = {
          message: { content: chunk.text },
          done: false
        };
        res.write(JSON.stringify(output) + '\n');
      }
    }

    res.write(JSON.stringify({ done: true }) + '\n');
    res.end();

  } catch (error: any) {
    console.error('[Vercel Serverless] Gemini Hatası:', error);
    res.status(500).json({ 
      error: error.message || 'Bilinmeyen bir hata oluştu',
      details: error.toString() 
    });
  }
}
