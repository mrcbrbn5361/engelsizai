import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

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
      
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        console.warn("[Proxy] OPENROUTER_API_KEY veya VITE_OPENROUTER_API_KEY bulunamadı!");
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        
        const output = {
          message: { content: "⚠️ **Sistem Yapılandırma Hatası:** Lütfen AI Studio ayarlarınızın (Secrets) altında **OPENROUTER_API_KEY** değerini tanımladığınızdan emin olun." },
          done: true
        };
        res.write(JSON.stringify(output) + '\n');
        res.end();
        return;
      }

      // Convert format for OpenRouter
      const formattedMessages = (messages || []).map((m: any) => ({
        role: m.role || 'user',
        content: m.content || m.text || ''
      }));

      // Prepend system prompt to guide the assistant identity
      const openRouterMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...formattedMessages
      ];

      const MODELS_TO_TRY = [
        'meta-llama/llama-3.2-3b-instruct:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'gryphe/mythomax-l2-13b:free',
        'microsoft/phi-3-medium-128k-instruct:free',
        'openchat/openchat-7b:free'
      ];

      let openRouterResponse: any = null;
      let selectedModel = '';

      for (let i = 0; i < MODELS_TO_TRY.length; i++) {
        const model = MODELS_TO_TRY[i];
        const isLastModel = i === MODELS_TO_TRY.length - 1;
        try {
          console.log(`[Proxy] OpenRouter bağlantısı kuruluyor (${model})...`);

          openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://github.com/miracbirben/engelsizai', 
              'X-Title': 'EngelsizAI'
            },
            body: JSON.stringify({
              model: model,
              messages: openRouterMessages,
              stream: true
            })
          });

          console.log(`[Proxy] OpenRouter Yanıt Durumu (${model}): ${openRouterResponse.status} ${openRouterResponse.statusText}`);

          if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text();
            console.error(`[Proxy] OpenRouter Model (${model}) Hata Yanıtı:`, errorText);
            
            if (!isLastModel) {
              console.warn(`[Proxy] Model ${model} hata verdi, sıradaki modele geçiliyor...`);
              continue;
            }
            throw new Error(`OpenRouter Hatası (${openRouterResponse.status}): ${errorText}`);
          }

          selectedModel = model;
          break; // Connected successfully
        } catch (err: any) {
          console.error(`[Proxy] Model ${model} bağlantı/kullanım hatası:`, err.message || err);
          if (isLastModel) throw err;
        }
      }

      if (!openRouterResponse || !openRouterResponse.ok) {
        throw new Error('Tüm ücretsiz yapay zeka modellerinin kotası dolmuş veya şu an erişilemiyor. Lütfen daha sonra tekrar deneyin.');
      }
      
      console.log(`[Proxy] Aktif model olarak "${selectedModel}" başarıyla seçildi.`);

      const reader = openRouterResponse.body?.getReader();
      if (!reader) {
        throw new Error('OpenRouter yanıt akışı okunamadı.');
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (!cleanedLine) continue;

          if (cleanedLine.startsWith('data: ')) {
            const dataStr = cleanedLine.slice(6).trim();

            if (dataStr === '[DONE]') {
              res.write(JSON.stringify({ done: true }) + '\n');
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                const output = {
                  message: { content },
                  done: false
                };
                res.write(JSON.stringify(output) + '\n');
              }
            } catch (err) {
              // Ignore partial chunk syntax errors gracefully
            }
          }
        }
      }

      // Final closure signal for the NDJSON parser
      res.write(JSON.stringify({ done: true }) + '\n');
      res.end();

    } catch (error: any) {
      console.error('[Proxy] Hata:', error.message);
      // Send error using target message format so UI displays it cleanly
      const output = {
        message: { content: `⚠️ **Entegrasyon Hatası:** ${error.message}` },
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
