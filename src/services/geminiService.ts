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
              
              // Ollama delivers objects followed by a newline
              let boundary = buffer.indexOf('\n');
              while (boundary !== -1) {
                const line = buffer.slice(0, boundary).trim();
                buffer = buffer.slice(boundary + 1);
                
                if (line) {
                  try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                      yield { text: json.message.content };
                    }
                  } catch (e) {
                    console.warn('JSON Ayrıştırma Hatası:', e, line);
                  }
                }
                boundary = buffer.indexOf('\n');
              }
            }

            if (done) {
              if (buffer.trim()) {
                try {
                  const json = JSON.parse(buffer.trim());
                  if (json.message?.content) {
                    yield { text: json.message.content };
                  }
                } catch (e) {
                  // Son parça tam olmayabilir
                }
              }
              break;
            }
          }
        }
      };
    }
  };
};
