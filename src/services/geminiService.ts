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
        // ✅ DOĞRUDAN İSTEK (Rate Limit Retry Kaldırıldı)
        const response = await fetch(`${API_BASE}/api/openrouter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // ✅ YENİ MODEL: OpenChat 7B (Free) - Daha Stabil ve Az Kısıtlı
            model: "openchat/openchat-7:free",
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
          // 429 dahil tüm hataları fırlat (App.tsx'te gösterilecek)
          throw new Error(`API error: ${response.status} - ${errorBody.error || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'No response';
        
        // ✅ Async Iterator Dönüşü (App.tsx'teki for await...of ile uyumlu)
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
