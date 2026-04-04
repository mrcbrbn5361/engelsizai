import { SYSTEM_PROMPT } from "../constants/systemPrompt";

export const createChat = () => {
  const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const systemInstruction = `${SYSTEM_PROMPT}\n\nŞu anki saat: ${currentTime}`;
  
  // NOTE: This is a client-side implementation for demonstration purposes.
  // API keys exposed in client-side code can be stolen.
  // In production, use a server-side proxy to keep the key hidden.
  const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY;

  return {
    sendMessageStream: async ({ message, signal }: { message: string, signal?: AbortSignal }) => {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "EngelsizAI",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-plus:free",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: message }
          ],
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      return {
        [Symbol.asyncIterator]: async function* () {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const json = JSON.parse(data);
                  yield { text: json.choices[0].delta.content || "" };
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }
      };
    }
  };
};
