/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SYSTEM_PROMPT } from "../constants/systemPrompt";

// ✅ Sabit Production URL - Capacitor/Web için güvenli
const API_BASE = 'https://engelsizai.vercel.app';

export const createChat = () => {
  // AbortController referansı (stream'i durdurmak için)
  let abortController: AbortController | null = null;

  const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const systemInstruction = `${SYSTEM_PROMPT}\n\nŞu anki saat: ${currentTime}`;

  return {
    sendMessageStream: async ({ message }: { message: string }) => {
      // Önceki isteği iptal et (varsa)
      if (abortController) {
        abortController.abort();
      }
      // Yeni AbortController oluştur
      abortController = new AbortController();

      try {
        console.log('🔗 Fetching:', `${API_BASE}/api/openrouter`);
        
        const response = await fetch(`${API_BASE}/api/openrouter`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
          },
          body: JSON.stringify({
            // ✅ YENİ MODEL
            model: "stepfun/step-3.5-flash:free",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: message }
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 2048
          }),
          mode: 'cors',
          credentials: 'omit',
          // ✅ AbortController sinyali ekle
          signal: abortController.signal        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(`Proxy API error: ${response.status} - ${errorBody.error || response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('ReadableStream not supported');
        
        const decoder = new TextDecoder();

        // Streaming iterator (orijinal arayüzle aynı)
        return {
          [Symbol.asyncIterator]: async function* () {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");
                
                for (const line of lines) {
                  // OpenRouter SSE format: " data: {...}"
                  if (line.trim().startsWith("data:")) {
                    const data = line.trim().slice(5).trim();
                    if (data === "[DONE]" || !data) continue;
                    
                    try {
                      const json = JSON.parse(data);
                      const content = json.choices?.[0]?.delta?.content || "";
                      if (content) yield { text: content };
                    } catch (e) {
                      // Parse error'u ignore et, stream devam etsin
                      continue;
                    }
                  }
                }
              }
            } catch (err: any) {
              // ✅ Abort hatasını yakala ve sessizce dön
              if (err.name === 'AbortError') {
                console.log('🛑 Stream aborted by user');
                return;
              }
              console.error('Stream read error:', err);
              throw err;
            }
          }        };
      } catch (error: any) {
        // ✅ Fetch aşamasında abort hatası
        if (error.name === 'AbortError') {
          console.log('🛑 Fetch aborted');
          throw new Error('Request cancelled');
        }
        console.error('Fetch error:', error);
        // Network hatası için kullanıcı dostu mesaj
        if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
          throw new Error('Network error: Check internet connection');
        }
        throw error;
      }
    },

    // ✅ YENİ: Stream'i manuel iptal etme metodu
    abort: () => {
      if (abortController) {
        abortController.abort();
        abortController = null;
        console.log('🛑 Chat aborted manually');
      }
    }
  };
};
