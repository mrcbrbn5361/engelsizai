/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vercel Proxy for OpenRouter API with Streaming Support
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders).end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...corsHeaders, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const { messages, model, temperature, max_tokens, stream } = req.body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY not configured');
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Server configuration error' }));
    }

    if (stream) {
      res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://engelsizai.vercel.app',
          'X-Title': 'EngelsizAI',
        },
        body: JSON.stringify({
          model: model || 'stepfun/step-3.5-flash:free',
          messages: messages || [],
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 2048,
          stream: true,
        }),
      });

      if (!openrouterResponse.ok || !openrouterResponse.body) {
        const errorData = await openrouterResponse.json().catch(() => ({}));
        res.write(`data: ${JSON.stringify({ error: errorData.error || `HTTP ${openrouterResponse.status}` })}\n\n`);
        res.end();
        return;
      }

      const reader = openrouterResponse.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith(' ')) {
            res.write(`${line}\n`);
          }
        }
      }

      res.end();
      return;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://engelsizai.vercel.app',
        'X-Title': 'EngelsizAI',
      },
      body: JSON.stringify({        model: model || 'stepfun/step-3.5-flash:free',
        messages: messages || [],
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2048,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      res.writeHead(response.status, { ...corsHeaders, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: data.error?.message || 'OpenRouter API error' }));
    }

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(data));

  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
