import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import ollama from 'ollama';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // New Chat Route for Ollama Tunnel (Streaming)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://regulations-draw-police-cult.trycloudflare.com';

      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:70b',
          messages: [
            {
              role: 'system',
              content: 'Sen "EngelsizAI" asistanısın. Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirildin. Bağcılar Belediyesi hizmetleri hakkında bilgi verirsin. ADIN KESİNLİKLE "EngelsizAI"DIR. "engelliai" deme. 380GB RAMli sunucuda çalışıyorsun. Türkçe ve Markdown kullan.'
            },
            ...messages
          ],
          stream: true,
        }),
      });

      console.log(`Ollama Bağlantısı: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama Hata Yanıtı:', errorText);
        throw new Error(`Ollama Hatası (${response.status}): ${errorText}`);
      }

      if (!response.body) throw new Error('Ollama yanıt vermedi (body boş).');

      // Akış başlıkları
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Nginx tamponlamayı engelle

      const reader = response.body.getReader();

      try {
        console.log("Ollama akışı başladı...");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Veriyi olduğu gibi (Uint8Array) gönder, tip dönüşümüyle uğraşma
          res.write(value);
        }
      } catch (streamError) {
        console.error('Akış Sırasında Proxy Hatası:', streamError);
      } finally {
        console.log("Ollama akışı tamamlandı.");
        res.end();
      }

    } catch (error: any) {
      console.error('Ollama Proxy Hatası:', error);
      res.status(500).json({ error: error.message });
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

startServer();`,Overwrite:true,TargetFile:
