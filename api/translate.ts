import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, targetLang } = req.body;
    const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY || process.env.NV_API_KEY;

    if (!nvidiaApiKey) {
      return res.json({ translatedText: text });
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${nvidiaApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/riva-translate-4b-instruct-v1_1",
        messages: [
          { role: "system", content: `Translate the following text to ${targetLang || 'Turkish'}. Only output the translated text.` },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || text;
    res.json({ translatedText: result });
  } catch (err: any) {
    res.json({ translatedText: req.body.text || "" });
  }
}
