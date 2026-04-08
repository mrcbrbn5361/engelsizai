/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { createChat } from './services/geminiService';
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
    { id: '1', role: 'assistant', text: 'Merhaba! Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirilen bir Yapay Zeka Projesiyim. Feyzullah Kıyıklık Engelliler Sarayı ile ilgili size nasıl yardımcı olabilirim? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatRef.current = createChat(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const streamResponse = await chatRef.current.sendMessageStream({ message: input });
      let assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: '' };
      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of streamResponse) {
        assistantMessage = { ...assistantMessage, text: assistantMessage.text + (chunk.text || '') };
        setMessages(prev => prev.map(m => m.id === assistantMessage.id ? assistantMessage : m));
      }
    } catch (error) {      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      let displayMessage = `Üzgünüm, bir hata oluştu: ${errorMessage}`;
      if (errorMessage.includes('429') || errorMessage.includes('Çok fazla istek')) {
        displayMessage = '⏳ Çok fazla istek gönderildi. Lütfen 30 saniye bekleyip tekrar deneyin.';
      }
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', text: displayMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--bg-app)] text-[var(--text-main)] font-sans">
      <Analytics />
      <header className="p-4 md:p-6 bg-[var(--bg-card)]/90 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--primary)] text-white rounded-3xl shadow-md"><Sparkles size={24} /></div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-[var(--text-main)]">EngelsizAI</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 max-w-4xl mx-auto w-full" aria-live="polite">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[80%] p-6 rounded-3xl shadow-[var(--shadow-soft)] break-words ${message.role === 'user' ? 'bg-[var(--primary)] text-white rounded-br-none' : 'bg-[var(--bg-card)] border border-[var(--border)] rounded-bl-none'}`}>
                <div className="flex items-center gap-3 mb-3 opacity-80 text-xs font-bold uppercase tracking-widest">
                  {message.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                  {message.role === 'assistant' ? 'EngelsizAI' : 'Siz'}
                </div>
                <div className={`text-lg leading-relaxed prose prose-slate prose-lg max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                  <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-3xl rounded-bl-none shadow-[var(--shadow-soft)]">
              <Loader2 className="animate-spin text-[var(--primary)]" size={24} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-6 bg-[var(--bg-card)] border-t border-[var(--border)]">        <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto items-center">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Size nasıl destek olabilirim?..."
            className="flex-1 p-5 bg-[var(--bg-app)] rounded-3xl border border-[var(--border)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 transition-all placeholder:text-slate-400 font-medium text-lg"
            aria-label="Mesaj girişi" />
          <button type="submit" disabled={isLoading}
            className="p-5 bg-[var(--primary)] text-white rounded-3xl hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            aria-label="Gönder">
            <Send size={24} />
          </button>
        </form>
      </footer>
    </div>
  );
}
