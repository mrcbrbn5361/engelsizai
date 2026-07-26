const API_BASE = '';

export interface NvidiaModel {
  id: string;
  name: string;
  category: string;
}

export const NVIDIA_MODELS: NvidiaModel[] = [
  // Çoklu Yetenekli (1'den Fazla Görev / Multimodal / Multi-Task)
  { id: 'meta/llama-3.2-90b-vision-instruct', name: 'EngelsizVision-1.0 Pro (Görsel & Metin)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'meta/llama-3.2-11b-vision-instruct', name: 'EngelsizVision-1.0 (Görsel & Metin)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'deepseek-ai/deepseek-v3', name: 'EngelsizChat-1.1 Ultra (Akıl + Kod + Sohbet)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'meta/llama-3.1-405b-instruct', name: 'EngelsizChat-1.0 Max (Devasa Çok Görevli)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning', name: 'EngelsizOmniReasoning-1.0 (Omni + Akıl Yürütme)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'qwen/qwen2-vl-72b-instruct', name: 'EngelsizQwen-Vision Pro (Görsel + Kod + Metin)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'qwen/qwen2-vl-7b-instruct', name: 'EngelsizQwen-Vision (Görsel + Metin)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'mistralai/pixtral-12b', name: 'EngelsizPixtral-Vision (Görsel + Belge)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl', name: 'EngelsizNemotron-Vision (Görsel + Lisan)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'microsoft/phi-3.5-vision-instruct', name: 'EngelsizPhi-Vision (Görsel + Grafik)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'google/paligemma', name: 'EngelsizPaliGemma (Görsel + Metin)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'nvidia/neva-22b', name: 'EngelsizNeva-Vision (Görsel + Diyalog)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'microsoft/phi-3.5-moe-instruct', name: 'EngelsizPhi-MoE (Çok Uzmanlı Lisan & Kod)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'databricks/dbrx-instruct', name: 'EngelsizDBRX (Lisan & Kod & Mantık)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'snowflake/arctic', name: 'EngelsizArctic (SQL + Kod + Kurumsal)', category: 'Çoklu Yetenekli (Çok Görevli)' },
  { id: 'meta/llama-guard-3-11b-vision', name: 'EngelsizGuard-Vision (Görsel & Metin Güvenliği)', category: 'Çoklu Yetenekli (Çok Görevli)' },

  // Genel & Akıllı Asistan
  { id: 'meta/llama-3.3-70b-instruct', name: 'EngelsizChat-1.0 (Ana Model)', category: 'Genel & Akıllı Asistan' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'EngelsizChat-1.0 Pro', category: 'Genel & Akıllı Asistan' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'EngelsizNemotron-1.0 Pro', category: 'Genel & Akıllı Asistan' },
  { id: 'nvidia/llama-3.1-nemotron-51b-instruct', name: 'EngelsizNemotron-1.0 Light', category: 'Genel & Akıllı Asistan' },
  { id: 'nvidia/nemotron-4-340b-instruct', name: 'EngelsizNemotron-340B', category: 'Genel & Akıllı Asistan' },
  { id: 'nvidia/nemotron-4-340b-reward', name: 'EngelsizNemotron-Reward', category: 'Genel & Akıllı Asistan' },
  { id: 'qwen/qwen2.5-72b-instruct', name: 'EngelsizQwen-1.0 Pro', category: 'Genel & Akıllı Asistan' },
  { id: 'meta/llama-3-70b-instruct', name: 'EngelsizChat-1.0 Classic', category: 'Genel & Akıllı Asistan' },
  { id: 'google/gemma-2-27b-it', name: 'EngelsizGemma-1.0 Pro', category: 'Genel & Akıllı Asistan' },
  { id: 'moonshotai/kimi-k2.6', name: 'EngelsizKimi-1.0', category: 'Genel & Akıllı Asistan' },
  { id: '01-ai/yi-large', name: 'EngelsizYi-Large', category: 'Genel & Akıllı Asistan' },
  { id: 'meta/llama-4-maverick-17b-128e-instruct', name: 'EngelsizChat-4.0 Maverick', category: 'Genel & Akıllı Asistan' },
  { id: 'nvidia/canonical-llama-3.1-70b-instruct', name: 'EngelsizCanonical-1.0', category: 'Genel & Akıllı Asistan' },

  // Akıl Yürütme (Reasoning)
  { id: 'deepseek-ai/deepseek-r1', name: 'EngelsizReasoning-1.0 (Derin Akıl Yürütme)', category: 'Akıl Yürütme (Reasoning)' },
  { id: 'qwen/qwq-32b-preview', name: 'EngelsizQwQ-32B Reasoning', category: 'Akıl Yürütme (Reasoning)' },

  // Kodlama & Yazılım (Coding)
  { id: 'qwen/qwen2.5-coder-32b-instruct', name: 'EngelsizCode-1.0 Pro', category: 'Kodlama & Yazılım' },
  { id: 'deepseek-ai/deepseek-coder-33b-instruct', name: 'EngelsizCode-1.0 Deep', category: 'Kodlama & Yazılım' },
  { id: 'mistralai/codestral-22b-instruct-v0.1', name: 'EngelsizCodestral-1.0', category: 'Kodlama & Yazılım' },
  { id: 'mistralai/mamba-codestral-7b-v0.1', name: 'EngelsizMambaCode', category: 'Kodlama & Yazılım' },
  { id: 'nvidia/usdcode-llama3-70b', name: 'EngelsizUSDCode', category: 'Kodlama & Yazılım' },
  { id: 'ibm/granite-34b-code-instruct', name: 'EngelsizGraniteCode', category: 'Kodlama & Yazılım' },
  { id: 'bigcode/starcoder2-15b', name: 'EngelsizStarCoder-15B', category: 'Kodlama & Yazılım' },
  { id: 'bigcode/starcoder2-7b', name: 'EngelsizStarCoder-7B', category: 'Kodlama & Yazılım' },

  // Uzman & Sektörel Modeller
  { id: 'mistralai/mistral-large-2-instruct', name: 'EngelsizExpert-Large', category: 'Uzman & Sektörel' },
  { id: 'mistralai/mixtral-8x22b-instruct', name: 'EngelsizExpert-8x22B', category: 'Uzman & Sektörel' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'EngelsizExpert-8x7B', category: 'Uzman & Sektörel' },
  { id: 'writer/palmyra-med-70b', name: 'EngelsizMed-1.0 (Sağlık & Tıp)', category: 'Uzman & Sektörel' },
  { id: 'writer/palmyra-fin-70b', name: 'EngelsizFin-1.0 (Finans)', category: 'Uzman & Sektörel' },
  { id: 'cohere/command-r-plus', name: 'EngelsizCommand-Plus', category: 'Uzman & Sektörel' },
  { id: 'cohere/command-r', name: 'EngelsizCommand-1.0', category: 'Uzman & Sektörel' },

  // Hızlı & Hafif Modeller
  { id: 'meta/llama-3.1-8b-instruct', name: 'EngelsizMini-1.0 Pro', category: 'Hızlı & Hafif' },
  { id: 'meta/llama-3.2-3b-instruct', name: 'EngelsizMini-1.0', category: 'Hızlı & Hafif' },
  { id: 'meta/llama-3.2-1b-instruct', name: 'EngelsizMini-1.0 Lite', category: 'Hızlı & Hafif' },
  { id: 'meta/llama-3-8b-instruct', name: 'EngelsizMini-Classic', category: 'Hızlı & Hafif' },
  { id: 'mistralai/ministral-14b-instruct-2512', name: 'EngelsizMinistral-14B', category: 'Hızlı & Hafif' },
  { id: 'mistralai/ministral-8b-instruct', name: 'EngelsizMinistral-8B', category: 'Hızlı & Hafif' },
  { id: 'mistralai/mistral-7b-instruct-v0.3', name: 'EngelsizMistral-7B', category: 'Hızlı & Hafif' },
  { id: 'mistralai/mistral-nemo-12b-instruct', name: 'EngelsizNeMo-12B', category: 'Hızlı & Hafif' },
  { id: 'qwen/qwen2.5-14b-instruct', name: 'EngelsizQwen-14B', category: 'Hızlı & Hafif' },
  { id: 'qwen/qwen2.5-7b-instruct', name: 'EngelsizQwen-7B', category: 'Hızlı & Hafif' },
  { id: 'google/gemma-2-9b-it', name: 'EngelsizGemma-9B', category: 'Hızlı & Hafif' },
  { id: 'google/gemma-2-2b-it', name: 'EngelsizGemma-2B', category: 'Hızlı & Hafif' },
  { id: 'google/gemma-7b', name: 'EngelsizGemma-7B', category: 'Hızlı & Hafif' },
  { id: 'google/recurrentgemma-2b', name: 'EngelsizRecurrentGemma', category: 'Hızlı & Hafif' },
  { id: 'microsoft/phi-3.5-mini-instruct', name: 'EngelsizPhi-Mini', category: 'Hızlı & Hafif' },
  { id: 'microsoft/phi-3-medium-128k-instruct', name: 'EngelsizPhi-Medium', category: 'Hızlı & Hafif' },
  { id: 'microsoft/phi-3-small-128k-instruct', name: 'EngelsizPhi-Small', category: 'Hızlı & Hafif' },
  { id: 'microsoft/phi-3-mini-128k-instruct', name: 'EngelsizPhi-128K', category: 'Hızlı & Hafif' },
  { id: 'ibm/granite-3.0-8b-instruct', name: 'EngelsizGranite-8B', category: 'Hızlı & Hafif' },
  { id: 'ibm/granite-3.0-3b-a800m-instruct', name: 'EngelsizGranite-3B', category: 'Hızlı & Hafif' },
  { id: 'baichuan-inc/baichuan2-13b-chat', name: 'EngelsizBaichuan', category: 'Hızlı & Hafif' },
  { id: 'aisingapore/sea-lion-7b-instruct', name: 'EngelsizSeaLion', category: 'Hızlı & Hafif' },
  { id: 'upstage/solar-10.7b-instruct', name: 'EngelsizSolar', category: 'Hızlı & Hafif' },
  { id: 'mediatek/breeze-7b-instruct', name: 'EngelsizBreeze', category: 'Hızlı & Hafif' },
  { id: 'rakuten/rakutenai-7b-instruct', name: 'EngelsizRakuten', category: 'Hızlı & Hafif' },
  { id: 'nvidia/nemotron-4-mini-15b-instruct', name: 'EngelsizNemotron-Mini', category: 'Hızlı & Hafif' },

  // Güvenlik & Denetim
  { id: 'meta/llama-guard-3-8b', name: 'EngelsizGuard-8B', category: 'Güvenlik & Denetim' }
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
        console.error('API Provider error details:', errorData);
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
