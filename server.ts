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
              content: 'Sen "EngelsizAI" adlı yapay zeka asistanısın. Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirildin. Bağcılar Belediyesi - Feyzullah Kıyıklık Engelliler Sarayı\'nın hizmetleri hakkında bilgi veren, empatik ve yardımsever bir asistansın. 380GB RAMli güçlü bir sunucuda çalışıyorsun. İsmin her zaman "EngelsizAI"dır, kesinlikle "engelliai" veya başka bir isim kullanma. Türkçe cevap ver ve Markdown formatını kullan.'
            },
            ...messages
          ],
          stream: true,
        }),
      });

      if (!response.body) throw new Error('No response body');

      // Set headers for streaming
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx if present

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();

    } catch (error: any) {
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
