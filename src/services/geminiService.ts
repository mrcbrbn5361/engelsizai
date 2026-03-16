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
              model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Daha stabil bir model ile güncellendi
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

          if (response.status === 429) {
            // Eğer limit aşıldıysa (429) bekle ve devam et
            attempt++;
            if (attempt <= maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye bekle
              continue;
            }
          }

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`API error: ${response.status} - ${errorBody.error || response.statusText}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || 'Üzgünüm, şu an cevap veremiyorum.';
          
          return {
            async *[Symbol.asyncIterator]() {
              yield { text: content };
            }
          };
          
        } catch (error: any) {
          if (attempt === maxRetries) {
            console.error('Fetch error:', error);
            if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
              throw new Error('Ağ hatası: İnternet bağlantınızı kontrol edin.');
            }
            throw error;
          }
          attempt++;
        }
      }
      throw new Error('Sunucu çok yoğun, lütfen birazdan tekrar deneyin.');
    }
  };
};
