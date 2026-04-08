/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SYSTEM_PROMPT } from "../constants/systemPrompt";

const API_BASE = 'https://engelsizai.vercel.app';

// ✅ Retry fonksiyonu: Hata olursa bekleyip tekrar dener
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<Response> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      const response = await fetch(url, options);
      
      // 429 hatası ise bekle ve tekrar dene
      if (response.status === 429 && attempt < maxRetries) {
        const waitTime = delayMs * attempt;
        console.log(`⏳ Rate limit hit, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
}

export const createChat = () => {
  const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const systemInstruction = `${SYSTEM_PROMPT}\n\nŞu anki saat: ${currentTime}`;

  return {
    sendMessageStream: async ({ message }: { message: string }) => {
      try {
        const response = await fetchWithRetry(`${API_BASE}/api/openrouter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // ✅ MODEL: Google Gemma 4 (Free)
            model: "google/gemma-4-31b-it:free",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: message }
            ],
            stream: false,
            temperature: 0.7,
            max_tokens: 2048
          }),
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          
          if (response.status === 429) {
            throw new Error('Çok fazla istek gönderildi. Lütfen 30 saniye bekleyip tekrar deneyin.');
          }
          
          throw new Error(`API error: ${response.status} - ${errorBody.error || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'No response';
        
        return {
          async *[Symbol.asyncIterator]() {
            yield { text: content };
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
