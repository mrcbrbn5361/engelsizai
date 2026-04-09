/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel Proxy for OpenRouter API
 * Rate Limit: 725K users optimized
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limit configuration - 725K users optimized
// 20 requests per minute per IP (comfortable usage)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 dakika
const RATE_LIMIT_MAX_REQUESTS = 20;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function getClientIP(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? (typeof forwarded === 'string' ? forwarded : forwarded[0]) : req.socket.remoteAddress;
  return ip || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Yeni pencere başlat
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetTime: entry.resetTime };
}

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

  // Rate limit kontrolü
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    const waitSeconds = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
    res.writeHead(429, {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000))
    });
    return res.end(JSON.stringify({
      error: `Çok fazla istek gönderildi. Lütfen ${waitSeconds} saniye bekleyip tekrar deneyin.`,
      retryAfter: waitSeconds
    }));
  }

  try {
    const { messages, model, temperature, max_tokens } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY || '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';
    
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
        model: model || 'minimax/minimax-m2.5:free',
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

    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000))
    });
    return res.end(JSON.stringify(data));

  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
