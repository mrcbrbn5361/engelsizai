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
      const maxRetries = 2; // Maksimum 2 kez tekrar dene
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          const response = await fetch(`${API_BASE}/api/openrouter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "stepfun/step-3.5-flash:free",
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

          // Eğer 429 hatası (Too Many Requests) aldıysak bekle ve tekrar dene
          if (response.status === 429) {
            attempt++;
            if (attempt <= maxRetries) {
              // 3 saniye bekle
              await new Promise(resolve => setTimeout(resolve, 3000));
              continue;
            }
          }

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`API error: ${response.status} - ${errorBody.error?.message || response.statusText}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || 'Üzgünüm, şu an cevap veremiyorum.';
          
          return {
            async *[Symbol.asyncIterator]() {
              yield { text: content };
            }
          };
          
        } catch (error: any) {
          if (attempt >= maxRetries) {
            console.error('Fetch error:', error);
            throw error;
          }
          attempt++;
          // Hata durumunda da kısa bir bekleme ekleyelim
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      throw new Error('Sunucu çok yoğun, lütfen birazdan tekrar deneyin.');
    }
  };
};
