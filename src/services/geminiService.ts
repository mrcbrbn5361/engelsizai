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
        // ✅ Doğrudan Fetch (Rate Limit / Retry Mantığı Kaldırıldı)
        const response = await fetch(`${API_BASE}/api/openrouter`, {
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
          throw new Error(`API error: ${response.status} - ${errorBody.error || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'No response';
        
        // ✅ Async Iterator Dönüşü
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
