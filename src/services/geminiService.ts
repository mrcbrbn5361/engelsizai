/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SYSTEM_PROMPT } from "../constants/systemPrompt";

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
          [Symbol.asyncIterator]: async function* () {            let buffer = '';
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // Chunk'ı decode et ve buffer'a ekle
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                
                console.log('📥 Raw chunk:', chunk.substring(0, 100));
                
                // Satırlara ayır
                const lines = buffer.split('\n');
                // Son satırı buffer'da tut (yarım gelebilir)
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  const trimmedLine = line.trim();
                  
                  // OpenRouter format: "data: {...}" veya " {...}"
                  if (!trimmedLine.startsWith('data:') && !trimmedLine.startsWith('')) {
                    continue;
                  }
                  
                  // "data: " kısmını at
                  let data = trimmedLine;
                  if (data.startsWith('data:')) {
                    data = data.slice(5).trim();
                  } else if (data.startsWith('')) {
                    data = data.slice(5).trim();
                  }
                  
                  if (data === '[DONE]' || !data) continue;
                  
                  try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.delta?.content || '';
                    
                    console.log('✨ Parsed content:', content.substring(0, 50));
                    
                    if (content) {
                      yield { text: content };
                    }
                  } catch (e) {
                    console.error('❌ JSON parse error:', e, 'Data:', data.substring(0, 100));
                    continue;
                  }
                }              }
              
              // Buffer'da kalan son veriyi işle
              if (buffer.trim()) {
                const trimmedLine = buffer.trim();
                if (trimmedLine.startsWith('data:') || trimmedLine.startsWith('')) {
                  let data = trimmedLine;
                  if (data.startsWith('data:')) {
                    data = data.slice(5).trim();
                  } else if (data.startsWith('')) {
                    data = data.slice(5).trim();
                  }
                  
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
              console.error('Stream error:', err);
              throw err;
            }
          }
        };
        
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
          throw new Error('Network error: Check internet connection');
        }
        throw error;
      }
    }
  };
};
