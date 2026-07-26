import { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `Sen "EngelsizAI" adlı yapay zeka asistanısın.

Kurum Adı:
Feyzullah Kıyıklık Engelliler Sarayı

Bağlı Olduğu Kurum:
Bağcılar Belediyesi

Geliştirici:
Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben

Altyapı & Modeller:
NVIDIA NIM (NVIDIA Inference Microservices) yüksek performanslı yapay zeka altyapısı ve NVIDIA tarafından sağlanan açık kaynaklı yapay zeka modelleri (Meta Llama 3.3 70B, NVIDIA Nemotron, Mistral vb.).
Kendi model adını sorduklarında seçilen NVIDIA NIM modelini veya EngelsizAI olduğunu söyle. ASLA Gemini, OpenAI, GPT veya Claude kullandığını söyleme.

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, message, model } = req.body;
    const selectedModel = model || "meta/llama-3.3-70b-instruct";
    const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY || process.env.NV_API_KEY;

    let formattedMessages = [];
    if (messages && Array.isArray(messages)) {
      formattedMessages = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content || m.text || ''
      }));
    } else if (message) {
      formattedMessages = [{
        role: 'user',
        content: message
      }];
    }

    const payloadMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...formattedMessages
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!nvidiaApiKey) {
      const responseText = "Merhaba! Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi **Miraç Birben** tarafından geliştirilen **EngelsizAI Yapay Zeka Asistanıyım** (NVIDIA NIM). Sorularınızı yanıtlamaya hazırım!";
      res.write(JSON.stringify({ message: { content: responseText }, done: true }) + '\n');
      res.end();
      return;
    }

    const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${nvidiaApiKey}`,
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: payloadMessages,
        temperature: 0.6,
        top_p: 0.7,
        max_tokens: 2048,
        stream: true
      })
    });

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text().catch(() => '');
      throw new Error(`NVIDIA NIM API yanıt hatası (${nvidiaResponse.status}): ${errorText.substring(0, 100)}`);
    }

    const body: any = nvidiaResponse.body;
    if (!body) {
      throw new Error("NVIDIA API yanıt akışı boş döndü.");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const processChunk = (chunk: Uint8Array | string) => {
      const decoded = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      buffer += decoded;
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
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    };

    if (typeof body.getReader === 'function') {
      const reader = body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) processChunk(value);
      }
    } else if (typeof body[Symbol.asyncIterator] === 'function') {
      for await (const chunk of body) {
        processChunk(chunk);
      }
    }

    res.write(JSON.stringify({ done: true }) + '\n');
    res.end();

  } catch (error: any) {
    console.error('[Vercel Serverless] NVIDIA NIM Error:', error);
    res.write(JSON.stringify({ 
      message: { content: `⚠️ **Yapay Zeka Servisi:** ${error.message || 'Yanıt alınırken hata oluştu.'}` },
      done: true 
    }) + '\n');
    res.end();
  }
}
