const API_BASE = '';

export const createChat = () => {
  return {
    sendMessageStream: async ({ messages }: { messages: { id: string; role: 'user' | 'assistant'; text: string; }[] }) => {
      const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Provider error details:', errorData);
        throw new Error(typeof errorData === 'object' ? JSON.stringify(errorData) : String(errorData));
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      return {
        [Symbol.asyncIterator]: async function* () {
          if (!reader) return;
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              
              // Satır satır ayır (Ollama NDJSON formatındadır)
              let lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Tamamlanmamış son satırı sakla

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                try {
                  const json = JSON.parse(trimmed);
                  // Ollama formatı: { "message": { "content": "..." } }
                  if (json.message?.content) {
                    yield { text: json.message.content };
                  } else if (json.response) { // Alternatif Ollama formatı
                    yield { text: json.response };
                  }
                  
                  if (json.done) return;
                } catch (e) {
                  // Eğer JSON başında/sonunda garip karakterler varsa temizlemeyi dene
                  try {
                    const cleanJson = trimmed.substring(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);
                    const json = JSON.parse(cleanJson);
                    if (json.message?.content) yield { text: json.message.content };
                  } catch (innerError) {
                    // Hala hatalıysa bu parçayı atla
                  }
                }
              }
            }

            if (done) {
              if (buffer.trim()) {
                try {
                  const json = JSON.parse(buffer.trim());
                  if (json.message?.content) yield { text: json.message.content };
                } catch (e) {}
              }
              break;
            }
          }
        }
      };
    }
  };
};
