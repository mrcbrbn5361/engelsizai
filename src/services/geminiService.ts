/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SYSTEM_PROMPT } from "../constants/systemPrompt";

// API Base: Production'da Vercel, development'ta localhost
const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://engelsizai.vercel.app'
  : 'http://localhost:5173';

export const createChat = () => {
  const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const systemInstruction = `${SYSTEM_PROMPT}\n\nŞu anki saat: ${currentTime}`;

  // ⚠️ API key artık frontend'de DEĞİL, Vercel proxy'de gizli

  return {
    sendMessageStream: async ({ message }: { message: string }) => {
      // Vercel Proxy API'ye istek
      const response = await fetch(`${API_BASE}/api/openrouter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: message }
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 2048
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Proxy API error: ${response.status} - ${errorBody.error || 'Unknown error'}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // Streaming iterator (orijinal kodla aynı arayüz)
      return {
        [Symbol.asyncIterator]: async function* () {
          if (!reader) return;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") return;
                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content || "";
                  if (content) yield { text: content };
                } catch (e) {
                  // Parse error'u ignore et, stream devam etsin
                }
              }
            }
          }
        }
      };
    }
  };
};
