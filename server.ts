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
              content: 'Sen EngelsizAI asistanısın. 380GB RAMli güçlü bir sunucuda çalışıyorsun. Yazılımcı dostu, teknik bilgisi yüksek ve yardımsever bir dil kullan. Türkçe cevap ver.'
            },
            ...messages
          ],
          stream: true,
        }),
      });

      if (!response.body) throw new Error('No response body');

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

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

  // API Route (Original)
  app.post("/api/openrouter", async (req, res) => {
    try {
      const { message } = req.body;
      const response = await ollama.chat({
        model: 'MiracReyiz53/engelsizai:1.5b',
        messages: [{ role: 'user', content: message }],
      });

      // Map to expected structure
      const formattedResponse = {
        choices: [{
          message: {
            content: response.message.content
          }
        }]
      };

      res.status(200).json(formattedResponse);
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
