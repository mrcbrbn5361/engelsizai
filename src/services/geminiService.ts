/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SYSTEM_PROMPT } from "../constants/systemPrompt";

// ✅ Sabit Production URL
const API_BASE = 'https://engelsizai.vercel.app';

export const createChat = () => {
  let abortController: AbortController | null = null;

  const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const systemInstruction = `${SYSTEM_PROMPT}\n\nŞu anki saat: ${currentTime}`;

  return {
    sendMessageStream: async ({ message }: { message: string }) => {
      // Önceki isteği iptal et
      if (abortController) abortController.abort();
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
          signal: abortController.signal
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
            let buffer = '';
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // Chunk'ı decode et ve buffer'a ekle
                buffer += decoder.decode(value, { stream: true });
                
                // Satırlara ayır
                const lines = buffer.split('\n');
                // Son satırı buffer'da tut (yarım gelebilir)
                buffer = lines.pop() || '';
                
                for (const rawLine of lines) {
                  const line = rawLine.trim();
                  
                  // OpenRouter SSE format: "data: {...}"
                  if (!line.startsWith('data:')) continue;
                  
                  const data = line.slice(5).trim(); // "data: " kısmını at
                  if (data === '[DONE]' || !data) continue;
                  
                  try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.delta?.content || '';
                    if (content) {
                      console.log('✨ Yield:', content.substring(0, 50));
                      yield { text: content };
                    }
                  } catch (e) {
                    console.error('❌ JSON parse error:', e, 'Data:', data);
                    continue;
                  }
                }
              }
              
              // Buffer'da kalan son veriyi işle
              if (buffer.trim()) {
                const line = buffer.trim();
                if (line.startsWith('data:')) {                  const data = line.slice(5).trim();
                  if (data && data !== '[DONE]') {
                    try {
                      const json = JSON.parse(data);
                      const content = json.choices?.[0]?.delta?.content || '';
                      if (content) yield { text: content };
                    } catch (e) { /* ignore */ }
                  }
                }
              }
              
            } catch (err: any) {
              if (err.name === 'AbortError') {
                console.log('🛑 Stream aborted');
                return;
              }
              console.error('Stream error:', err);
              throw err;
            }
          }
        };
        
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('🛑 Fetch aborted');
          throw new Error('Request cancelled');
        }
        console.error('Fetch error:', error);
        if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
          throw new Error('Network error: Check internet connection');
        }
        throw error;
      }
    },

    abort: () => {
      if (abortController) {
        abortController.abort();
        abortController = null;
        console.log('🛑 Chat aborted');
      }
    }
  };
};
