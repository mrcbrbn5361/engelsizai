# EngelsizAI - Kapsamlı Proje Dokümantasyonu

## 1. Proje Özeti
**Proje Adı:** EngelsizAI  
**Geliştirici:** Miraç Birben (Feyzullah Kıyıklık Engelliler Sarayı Öğrencisi)  
**Bağlı Kurum:** Bağcılar Belediyesi - Feyzullah Kıyıklık Engelliler Sarayı  
**Proje Türü:** Yapay Zeka Destekli Kurumsal Rehber ve Asistan Uygulaması (Web & Mobil)  
**Sürüm:** v1.0.6  

EngelsizAI, engelli bireylerin, ailelerinin ve bakım verenlerin Feyzullah Kıyıklık Engelliler Sarayı'nın sunduğu hizmetlere, kurslara ve sosyal imkanlara en hızlı, doğru ve empatik şekilde ulaşmasını sağlamak amacıyla geliştirilmiş yapay zeka tabanlı bir sohbet asistanıdır.

---

## 2. Projenin Amacı ve Hedef Kitlesi

### 2.1. Amaç
* Engelli bireylerin bağımsız yaşam becerilerini desteklemek.
* Kurumun sunduğu eğitim, rehabilitasyon ve istihdam hizmetleri hakkında 7/24 kesintisiz ve doğru bilgi sağlamak.
* EKPSS, engelli hakları ve başvuru süreçleri gibi karmaşık konularda kullanıcılara adım adım rehberlik etmek.
* Kullanıcı dostu, erişilebilir ve empatik bir dijital asistan deneyimi sunmak.

### 2.2. Hedef Kitle
* Fiziksel, zihinsel, görme, işitme, otizm, down sendromu ve diğer özel gereksinimli bireyler.
* Engelli bireylerin aileleri ve bakım verenleri.
* Kuruma başvurmak isteyen yeni kursiyer adayları.
* Kurum personeli ve gönüllüler.

---

## 3. Teknik Altyapı ve Kullanılan Teknolojiler

Proje, modern web teknolojileri kullanılarak hem web tarayıcılarında hem de mobil cihazlarda (Android/iOS) sorunsuz çalışacak şekilde "Full-Stack" (Tam Yığın) mimarisiyle tasarlanmıştır.

### 3.1. Frontend (Ön Yüz)
* **React (v19):** Kullanıcı arayüzünün oluşturulması için kullanılan temel kütüphane.
* **Vite:** Hızlı geliştirme ve derleme (build) aracı.
* **TypeScript:** Tip güvenliği sağlayarak hata oranını minimize eden programlama dili.
* **Tailwind CSS (v4):** Hızlı ve duyarlı (responsive) tasarım için kullanılan utility-first CSS framework'ü. `@tailwindcss/typography` eklentisi ile Markdown metinleri özel olarak stillendirilmiştir.
* **Motion (Framer Motion):** Mesaj balonlarındaki akıcı giriş ve çıkış animasyonları için kullanıldı.
* **React Markdown & Remark GFM:** Yapay zekanın ürettiği Markdown formatındaki (kalın yazı, liste, tablo vb.) yanıtları HTML'e çevirip güvenli bir şekilde ekranda göstermek için kullanıldı.
* **Lucide React:** Modern ve hafif ikon kütüphanesi.

### 3.2. Backend & API (Arka Yüz)
* **Vercel Serverless Functions (`api/openrouter.ts`):** Uygulamanın canlı ortamdaki API uç noktası. İstemciden gelen mesajları alır, yapay zeka sağlayıcısına iletir ve sonucu döndürür.
* **Express.js (`server.ts`):** Yerel geliştirme ortamında (Localhost) API isteklerini karşılamak ve Vite ile entegre çalışmak için kurulan yerel sunucu.
* **OpenRouter API:** Yapay zeka modeline erişim sağlayan ağ geçidi.
* **Yapay Zeka Modeli:** `openai/gpt-oss-120b:free` (Hızlı, güvenilir ve yüksek kapasiteli açık kaynaklı model).

### 3.3. Mobil Entegrasyon
* **Capacitor (v6):** Web uygulamasını yerel (native) Android ve iOS uygulamasına dönüştürmek için kullanılan köprü teknolojisi.

---

## 4. Mimari ve Çalışma Mantığı

1. **Kullanıcı Etkileşimi:** Kullanıcı arayüzdeki metin kutusuna sorusunu yazar ve gönderir.
2. **İstek Gönderimi:** `geminiService.ts` dosyası, kullanıcının mesajını alır ve yapılandırılmış API adresine (`https://engelsizai.vercel.app/api/openrouter`) POST isteği atar.
3. **Sistem Promptu (Kişilik Yüklemesi):** Backend, kullanıcının mesajını alıp OpenRouter'a iletmeden önce, yapay zekaya devasa bir "Sistem Promptu" ekler. Bu prompt; kurumun adresini, telefonunu, kurslarını, misyonunu ve asistanın nasıl davranması gerektiğini (empatik, HTML kullanmadan, Markdown ile) dikte eder.
4. **Yapay Zeka Yanıtı:** Model, kendisine verilen kurallar çerçevesinde bir yanıt üretir.
5. **Arayüzde Gösterim:** Gelen yanıt, React state'ine eklenir. `react-markdown` kütüphanesi ile formatlanır, `<br>` gibi istenmeyen HTML etiketleri temizlenir ve `motion` ile animasyonlu bir şekilde ekranda belirir.

---

## 5. Yapay Zeka Asistanının Özellikleri ve Kuralları

Asistanın beyni, `api/openrouter.ts` dosyasında tanımlanan sistem kurallarına dayanır.

* **Kurumsal Kimlik:** Kendisini daima "Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirilen bir Yapay Zeka Projesi" olarak tanıtır.
* **Bilgi Dağarcığı:** Kurumun çalışma saatleri, iletişim bilgileri, sosyal medya hesapları ve sunduğu 20'den fazla hizmet (Sanat atölyeleri, EKPSS, Robotik Kodlama, Duyu Bütünleme vb.) hafızasına kazınmıştır.
* **Davranış Kuralları:**
  * İnsan onurunu merkeze alan, kapsayıcı ve güçlendirici bir dil kullanır.
  * Bilmediği konularda tahmin yürütmez, dürüstçe bilmediğini belirtir.
  * Tıbbi teşhis koymaz, hukuki kesin kararlar vermez.
  * Acil durumlarda (intihar, şiddet vb.) doğrudan 112 veya 183'e yönlendirir.
* **Format Kuralları:** Asla HTML etiketi (örn: `<br>`) kullanmaz. Sadece Markdown formatında, okunaklı, maddeler halinde ve başlıklar kullanarak yanıt verir.

---

## 6. Kullanıcı Arayüzü (UI/UX) Tasarımı

* **Duyarlı (Responsive) Tasarım:** Mobil cihazlarda mesaj genişliği ekranın %95'ini, bilgisayarlarda ise %75'ini kaplayacak şekilde optimize edilmiştir.
* **Taşma Kontrolü:** Uzun kelimeler veya bağlantılar (`break-words`, `overflow-x-auto`) ekranı bozmayacak şekilde sınırlandırılmıştır.
* **Renk Paleti:** Güven veren mavi tonları (Blue-600) ve okunabilirliği artıran gri/beyaz arka planlar kullanılmıştır.
* **Yükleme Durumu:** Asistan düşünürken gönder butonunda dönen bir yükleme ikonu (Loader) çıkar ve çift gönderim engellenir.

---

## 7. Kurulum ve Geliştirme Ortamı

Projeyi yerel bilgisayarınızda çalıştırmak için:

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Geliştirme sunucusunu başlatın (Express + Vite):
   ```bash
   npm run dev
   ```
3. Tarayıcıda `http://localhost:3000` adresine gidin.

---

## 8. Dağıtım (Deployment) Süreci

* **Web Sürümü:** Proje Vercel üzerine dağıtılmaktadır. `api/` klasörü altındaki dosyalar Vercel tarafından otomatik olarak Serverless Function (Sunucusuz Fonksiyon) olarak algılanır ve çalıştırılır.
* **Mobil Sürüm:** Capacitor kullanılarak Android projesi oluşturulmuştur. Herhangi bir frontend güncellemesinde `npm run build` komutu çalıştırıldıktan sonra `npx cap sync android` komutu ile güncel kodlar mobil projeye aktarılır.

---

## 9. Gelecek Geliştirmeler (Yol Haritası)

* **Sesli Komut Entegrasyonu:** Görme engelli kullanıcılar için Speech-to-Text (Sesten Metne) ve Text-to-Speech (Metinden Sese) özelliklerinin eklenmesi.
* **Çoklu Dil Desteği:** Yabancı uyruklu engelli bireyler veya turistler için İngilizce ve Arapça dil seçenekleri.
* **Randevu Sistemi Entegrasyonu:** Kullanıcıların asistan üzerinden doğrudan kuruma randevu talebi oluşturabilmesi.
* **Kişiselleştirilmiş Deneyim:** Kullanıcıların ilgi alanlarına (örn: sadece müzik kursları veya EKPSS) göre özel bildirimler alabilmesi.
