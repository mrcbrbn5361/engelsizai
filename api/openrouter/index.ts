/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel Proxy for OpenRouter API
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
    const { messages, model, temperature, max_tokens } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY not configured');
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Server configuration error' }));
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://engelsizai.vercel.app',
        'X-Title': 'EngelsizAI',
      },
      body: JSON.stringify({
        // ✅ GÜNCEL MODEL
        model: model || 'google/gemma-3-27b-it:free',
        messages: messages || [],
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2048,
        stream: false,
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
