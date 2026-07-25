const API_BASE = '';

export const NVIDIA_MODELS = [
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', category: 'Genel & Kodlama' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl', name: 'Nemotron Nano 12B VL', category: 'Görsel & Metin' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning', name: 'Nemotron 3 Omni 30B Reasoning', category: 'Akıl Yürütme' },
  { id: 'moonshotai/kimi-k2.6', name: 'Kimi K2.6 (Moonshot AI)', category: 'Çok Modlu & Kod' },
  { id: 'mistralai/ministral-14b-instruct-2512', name: 'Ministral 14B Instruct', category: 'Hızlı Asistan' },
  { id: 'meta/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B', category: 'Yeni Nesil Llama' },
  { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', category: 'Görsel Analiz' },
  { id: 'meta/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', category: 'Büyük Görsel Model' },
  { id: 'meta/llama-3.2-3b-instruct', name: 'Llama 3.2 3B Instruct', category: 'Hafif & Hızlı' },
  { id: 'meta/llama-3.2-1b-instruct', name: 'Llama 3.2 1B Instruct', category: 'Ultra Hafif' },
  { id: 'google/gemma-2-2b-it', name: 'Gemma 2 2B IT', category: 'Google Gemma' },
  { id: 'meta/llama-3_1-70b-instruct', name: 'Llama 3.1 70B Instruct', category: 'Güçlü Llama' },
  { id: 'meta/llama-3_1-8b-instruct', name: 'Llama 3.1 8B Instruct', category: 'Dengeli Llama' },
  { id: 'google/google-paligemma', name: 'Google PaliGemma', category: 'Görsel Tanıma' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B Instruct', category: 'Uzman Ağlar (MoE)' }
];

export const createChat = () => {
  return {
    sendMessageStream: async ({ messages, model }: { messages: { id: string; role: 'user' | 'assistant'; text: string; }[]; model?: string }) => {
      const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: formattedMessages,
          model: model || 'meta/llama-3.3-70b-instruct'
        }),
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
              const decoded = decoder.decode(value, { stream: true });
              buffer += decoded;
              
              let lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                try {
                  const json = JSON.parse(trimmed);
                  
                  if (json.error) {
                    yield { text: `⚠️ Sunucu Hatası: ${json.error}` };
                    return;
                  }

                  if (json.message?.content) {
                    yield { text: json.message.content };
                  } else if (json.response) {
                    yield { text: json.response };
                  }
                  
                  if (json.done) return;
                } catch (e) {
                  try {
                    const cleanJson = trimmed.substring(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);
                    const json = JSON.parse(cleanJson);
                    
                    if (json.error) {
                      yield { text: `⚠️ Sunucu Hatası: ${json.error}` };
                      return;
                    }

                    if (json.message?.content) yield { text: json.message.content };
                  } catch (innerError) {
                    // Skip unparseable line
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
