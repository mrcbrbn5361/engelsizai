/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { chat } from './services/geminiService';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Analytics } from "@vercel/analytics/react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Merhaba! EngelsizAI burada. Feyzullah Kıyıklık Engelliler Sarayı ile ilgili size nasıl yardımcı olabilirim? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const streamResponse = await chat.sendMessageStream({ message: input });
      let assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: '' };
      
      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of streamResponse) {
        assistantMessage = { ...assistantMessage, text: assistantMessage.text + (chunk.text || '') };
        setMessages(prev => prev.map(m => m.id === assistantMessage.id ? assistantMessage : m));
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', text: `Üzgünüm, bir hata oluştu: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--bg-warm)] text-[var(--text-stone)] font-sans">
      <Analytics />
      <header className="p-4 md:p-6 bg-white/50 backdrop-blur-md border-b border-stone-200/50 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-700 text-white rounded-2xl">
            <Sparkles size={20} />
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-semibold tracking-tight text-emerald-950">EngelsizAI</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8" aria-live="polite">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] md:max-w-[75%] p-5 rounded-3xl shadow-sm ${message.role === 'user' ? 'bg-emerald-700 text-white rounded-br-lg' : 'bg-white border border-stone-200/60 rounded-bl-lg'}`}>
                <div className="flex items-center gap-2 mb-2 opacity-60 text-xs font-medium uppercase tracking-wider">
                  {message.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                  {message.role === 'assistant' ? 'EngelsizAI' : 'Siz'}
                </div>
                <div className="text-base leading-relaxed prose prose-stone prose-sm max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-stone-200/60 p-5 rounded-3xl rounded-bl-lg shadow-sm">
              <Loader2 className="animate-spin text-emerald-700" size={24} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 md:p-6 bg-white border-t border-stone-200/50">
        <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Size nasıl destek olabilirim?..."
            className="flex-1 p-3 md:p-4 bg-stone-100 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all placeholder:text-stone-400"
            aria-label="Mesaj girişi"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-3 md:p-4 bg-emerald-700 text-white rounded-2xl hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
            aria-label="Gönder"
          >
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
}
