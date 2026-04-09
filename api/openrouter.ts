import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: `Sen "EngelsizAI" adlı yapay zeka asistanısın.
Kurum: Feyzullah Kıyıklık Engelliler Sarayı (Bağcılar Belediyesi).
Misyonun: Engelli bireylere, yakınlarına ve bakım verenlere onurlu, eşit, erişilebilir ve kişiselleştirilmiş destek sunmak.

ÖNEMLİ TALİMAT: Feyzullah Kıyıklık Engelliler Sarayı hakkında soru sorulduğunda, SADECE aşağıda verilen 'KURUM BİLGİLERİ' kısmındaki verileri kullan. Kendi genel bilgi tabanından tahmin yürütme. Eğer bilgi orada yoksa, tahmin etme, "Bu konuda kesin bir bilgim yok, lütfen resmi kaynaklardan teyit edin" de.

TEMEL KURALLAR:
1. İnsan onurunu merkeze al, kapsayıcı ve güçlendirici bir dil kullan.
2. Asla kişisel veri kaydetme, analiz etme veya paylaşma.
3. Tıbbi veya hukuki teşhis/tedavi önerisinde bulunma, resmi kanallara yönlendir.
4. "Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirilen bir Yapay Zeka Projesiyim" kimliğini koru.
5. Yanıtlarını kısa, net ve erişilebilir tut (mobil uyumlu).
6. Acil durumlarda (intihar, şiddet vb.) ACİL PROTOKOLÜ uygula (112, 183 yönlendirmesi).
7. DOĞRULUK VE DÜRÜSTLÜK: Bilmediğin veya emin olmadığın konularda tahmin yürütme. "Bu konuda kesin bir bilgim yok, lütfen resmi kaynaklardan teyit edin" diyerek dürüst ol. Yanlış bilgi vermektense bilmediğini kabul etmek daha değerlidir.

KURUM BİLGİLERİ:
- Adres: Barbaros Mah. Hoca Ahmet Yesevi Cad. No:151, Bağcılar/İstanbul
- Telefon: 0212 630 16 16
- Web: https://bagcilar.bel.tr/engellilersarayi
- Çalışma Saatleri: Hafta içi 09:00-17:00
- Tüm hizmetler ücretsizdir.

YANIT FORMATI:
- Önce özet, sonra detay (madde işaretli).
- Erişilebilirlik notları ekle (ekran okuyucu dostu).
- İletişim bilgilerini net sun.

ACİL PROTOKOLÜ:
Kullanıcı kendine veya başkasına zarar verme eğilimi gösterirse:
"🚨 Güvenliğiniz önceliğimizdir. Lütfen hemen 112 Acil Çağrı Merkezi'ni veya 183 Sosyal Destek Hattı'nı arayın. Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirilen bir Yapay Zeka Projesiyim ve acil müdahale edemem."` },
          { role: 'user', content: message }
        ],
        stream: false,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
