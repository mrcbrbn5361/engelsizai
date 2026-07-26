import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // CORS middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

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

  // NVIDIA NIM Endpoint for Chat Completions
  app.post("/api/chat", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      const { messages, model } = req.body;
      const selectedModel = model || "meta/llama-3.3-70b-instruct";
      const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY || process.env.NV_API_KEY;

      const formattedMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...(messages || []).map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content || m.text || ''
        }))
      ];

      console.log(`[NVIDIA NIM] Requesting model: ${selectedModel}`);

      if (!nvidiaApiKey) {
        // Fallback simulated intelligence response if no API key is provided in environment
        console.warn("[NVIDIA NIM] NVIDIA_API_KEY environment variable is missing. Running smart default responder.");
        const userMsg = messages?.[messages.length - 1]?.content || messages?.[messages.length - 1]?.text || "";
        
        let responseText = "Merhaba! ben **Feyzullah Kıyıklık Engelliler Sarayı** öğrencisi **Miraç Birben** tarafından geliştirilen **EngelsizAI Yapay Zeka Asistanıyım**.\n\n";
        if (userMsg.toLowerCase().includes("kurs") || borderContains(userMsg, ["eğitim", "atölye"])) {
          responseText += "### Feyzullah Kıyıklık Engelliler Sarayı Kurslarımız:\n\n1. **Yazılım & Yapay Zeka Atölyesi:** Kodlama, robotik ve yapay zeka eğitimleri.\n2. **Sanat & Müzik Kursları:** Resim, ahşap yakma, ritim ve enstrüman dersleri.\n3. **EKPSS Hazırlık:** Engelli Kamu Personeli Seçme Sınavı hızlandırılmış eğitim programları.\n4. **Meslek Edindirme:** Halı dokuma, seramik, pastacılık ve bilgisayar işletmenliği.\n\nKayıt için **0212 410 06 00** numarasından merkezimize ulaşabilirsiniz.";
        } else if (userMsg.toLowerCase().includes("konum") || borderContains(userMsg, ["ulaşım", "nerede", "adres"])) {
          responseText += "### Konum ve Ulaşım Bilgileri:\n\n- **Adres:** Barbaros Mahallesi, Hoca Ahmet Yesevi Caddesi No:151, Bağcılar / İstanbul\n- **Telefon:** 0212 410 06 00\n- **WhatsApp:** 0552 410 06 00\n- **Toplu Taşıma:** M1B Yenikapı-Kirazlı metro hattı ve Bağcılar Belediyesi otobüs durakları ile doğrudan ulaşabilirsiniz.";
        } else {
          responseText += "Bağcılar Belediyesi Feyzullah Kıyıklık Engelliler Sarayı bünyesindeki tüm kurslar, ergoterapi, duyu bütünleme, psikolojik danışmanlık ve başvuru süreçleri hakkında size yardımcı olmak için buradayım. Sormak istediğiniz konuyu detaylandırabilirsiniz!";
        }

        // Stream fallback text word by word
        const words = responseText.split(' ');
        for (const word of words) {
          res.write(JSON.stringify({ message: { content: word + ' ' }, done: false }) + '\n');
          await new Promise(r => setTimeout(r, 20));
        }
        res.write(JSON.stringify({ done: true }) + '\n');
        res.end();
        return;
      }

      // Call NVIDIA NIM API
      const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nvidiaApiKey}`,
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: formattedMessages,
          temperature: 0.6,
          top_p: 0.7,
          max_tokens: 2048,
          stream: true
        })
      });

      if (!nvidiaResponse.ok) {
        const errorText = await nvidiaResponse.text();
        console.error("[NVIDIA NIM Error]", nvidiaResponse.status, errorText);
        throw new Error(`NVIDIA API yanıt hatası (${nvidiaResponse.status}): ${errorText.substring(0, 150)}`);
      }

      if (!nvidiaResponse.body) {
        throw new Error("NVIDIA API yanıt akışı boş döndü.");
      }

      const reader = nvidiaResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const deltaText = json.choices?.[0]?.delta?.content || "";
              if (deltaText) {
                res.write(JSON.stringify({ message: { content: deltaText }, done: false }) + '\n');
              }
            } catch (e) {
              // Ignore invalid chunk
            }
          }
        }
      }

      res.write(JSON.stringify({ done: true }) + '\n');
      res.end();

    } catch (error: any) {
      console.error('[NVIDIA Chat Proxy Error]', error.message || error);
      res.write(JSON.stringify({ 
        message: { content: `⚠️ **Yapay Zeka Servisi Bilgisi:** ${error.message || 'Geçici bir tünel/sunucu yoğunluğu oluştu. Lütfen tekrar deneyin.'}` },
        done: true 
      }) + '\n');
      res.end();
    }
  });

  // Auxiliary Translation Endpoint using NVIDIA Riva Translate
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLang } = req.body;
      const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY || process.env.NV_API_KEY;

      if (!nvidiaApiKey) {
        return res.json({ translatedText: text });
      }

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nvidiaApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "nvidia/riva-translate-4b-instruct-v1_1",
          messages: [
            { role: "system", content: `Translate the following text to ${targetLang || 'Turkish'}. Only output the translated text.` },
            { role: "user", content: text }
          ]
        })
      });

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || text;
      res.json({ translatedText: result });
    } catch (err: any) {
      res.json({ translatedText: req.body.text || "" });
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function borderContains(str: string, arr: string[]): boolean {
  return arr.some(item => str.toLowerCase().includes(item));
}

startServer();
