const API_BASE = '';

export const createChat = () => {
  return {
    sendMessageStream: async ({ message }: { message: string }) => {
      const response = await fetch(`${API_BASE}/api/openrouter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Provider error:', errorData);
        throw new Error(errorData.error?.message || errorData.message || errorData.error || `Hata: ${response.status}`);
      }
      const data = await response.json();
      
      return {
        [Symbol.asyncIterator]: async function* () {
          yield { text: data.choices[0].message.content };
        }
      };
    }
  };
};
