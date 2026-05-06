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
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                      yield { text: json.message.content };
                    }
                  } catch (e) {
                    console.warn('Failed to parse chunk:', line);
                  }
                }
              }
            }

            if (done) {
              // Process any remaining data in the buffer
              if (buffer.trim()) {
                try {
                  const json = JSON.parse(buffer);
                  if (json.message?.content) {
                    yield { text: json.message.content };
                  }
                } catch (e) {
                  // Final buffer might not be a complete JSON if stream was interrupted
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
