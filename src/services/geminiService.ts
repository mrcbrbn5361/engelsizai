/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SYSTEM_PROMPT } from "../constants/systemPrompt";

// ✅ Sabit Production URL - Capacitor/Web için güvenli
const API_BASE = 'https://engelsizai.vercel.app';

export const createChat = () => {
  const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const systemInstruction = `${SYSTEM_PROMPT}\n\nŞu anki saat: ${currentTime}`;

  return {
    sendMessageStream: async ({ message }: { message: string }) => {
      try {
        console.log('🔗 Fetching:', `${API_BASE}/api/openrouter`);
        
        const response = await fetch(`${API_BASE}/api/openrouter`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
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
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(`Proxy API error: ${response.status} - ${errorBody.error || response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('ReadableStream not supported');
        
        const decoder = new TextDecoder();

        return {
          [Symbol.asyncIterator]: async function* () {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");
                
                for (const line of lines) {
                  if (line.trim().startsWith("data:")) {
                    const data = line.trim().slice(5).trim();
                    if (data === "[DONE]" || !data) continue;
                    
                    try {
                      const json = JSON.parse(data);
                      const content = json.choices?.[0]?.delta?.content || "";
                      if (content) yield { text: content };
                    } catch (e) { continue; }
                  }
                }
              }
            } catch (err) {
              console.error('Stream read error:', err);
              throw err;
            }
          }
        };
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
          throw new Error('Network error: Check internet connection & CORS');
        }
        throw error;
      }
    }
  };
};
