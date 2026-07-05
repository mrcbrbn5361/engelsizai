import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

Yapamayacaklerin:
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
Türkçen son derece akıcı, doğal, samimi ve profesyonel olsun. Kurum hakkında bilgi verirken, bu bilgileri zaten biliyormuşsun gibi doğrudan ogüven verici bir dille yanıtla. "Araştırma yaptım", "Sizin için baktım", "İnternetten buldum" gibi ifadeler kullanma.

TEMEL KURALLAR (EK KURALLAR):
1. İnsan onurunu merkeze al, kapsayıcı ve güçlendirici bir dil kullan.
2. Asla kişisel veri kaydetme, analiz etme veya paylaşma.
3. "Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirilen bir Yapay Zeka Projesiyim" kimliğini koru.
4. Acil durumlarda (intihar, şiddet vb.) 112 veya 183'e yönlendir.
5. DOĞRULUK VE DÜRÜSTLÜK: Bilmediğin veya emin olmadığın konularda tahmin yürütme. Yanlış bilgi vermektense bilmediğini kabul etmek daha değerlidir.
6. ASLA HTML ETİKETLERİ (örneğin <br>) KULLANMA. Satır atlamak veya liste yapmak için sadece standart Markdown formatını kullan.`;

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      const userApiKey = (req.headers['x-gemini-api-key'] as string) || process.env.GEMINI_API_KEY;

      if (!userApiKey) {
        console.warn("[Proxy] Gemini API Key bulunamadı!");
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        
        const output = {
          message: { content: "⚠️ **Gemini API Anahtarı Eksik:** Lütfen üst kısımdaki anahtar simgesine (🔑) tıklayarak kendi Gemini API anahtarınızı girin." },
          done: true
        };
        res.write(JSON.stringify(output) + '\n');
        res.end();
        return;
      }

      // Format messages for @google/genai (assistant role should be 'model')
      const formattedContents = (messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }]
      }));

      // Initialize the official Google GenAI client
      const ai = new GoogleGenAI({
        apiKey: userApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      console.log("[Proxy] Gemini 3.1 Flash Lite ile bağlantı kuruluyor...");

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
      console.error('[Proxy] Gemini Hatası:', error.message || error);
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const output = {
        message: { content: `⚠️ **Gemini API Hatası:** ${error.message || 'API anahtarınız geçersiz olabilir veya istek kotası aşılmış olabilir.'}` },
        done: true
      };
      res.write(JSON.stringify(output) + '\n');
      res.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
