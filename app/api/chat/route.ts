import { StreamingTextResponse, Message } from 'ai';

export const runtime = 'edge'; // Vercel'de daha hızlı yanıt için edge runtime

export async function POST(req: Request) {
  const { messages } = await req.json();
  // const lastMessage = messages[messages.length - 1]; // Deleted as per original request code usage but it was defined in provided snippet

  // Cloudflare Tünel Adresin (Vercel Dashboard'dan OLLAMA_HOST olarak ekle)
  const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://regulations-draw-police-cult.trycloudflare.com';

  try {
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
        stream: true, // Vercel timeoutunu aşmak için kritik!
      }),
    });

    // Ollama'dan gelen akışı Vercel üzerinden kullanıcıya ilet
    return new StreamingTextResponse(response.body as ReadableStream);

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Sunucuya bağlanılamadı. Tüneli kontrol et!' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
