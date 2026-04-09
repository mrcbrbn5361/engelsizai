const API_BASE = 'https://ais-dev-yof3rumf6tznvw5hlktspf-91223103933.europe-west2.run.app';

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
        console.error('Provider error details:', errorData);
        throw new Error(typeof errorData === 'object' ? JSON.stringify(errorData) : String(errorData));
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
