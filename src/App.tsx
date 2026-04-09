import { useState, FormEvent } from 'react';
import { createChat } from './services/geminiService';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Analytics } from "@vercel/analytics/react";

interface Message { id: string; role: 'user' | 'assistant'; text: string; }

export default function App() {
  const [messages, setMessages] = useState<Message[]>([{ id: '1', role: 'assistant', text: 'Merhaba! Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirilen bir Yapay Zeka Projesiyim. Size nasıl yardımcı olabilirim?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = createChat();
      const streamResponse = await chat.sendMessageStream({ message: input });
      let assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: '' };
      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of streamResponse) {
        assistantMessage = { ...assistantMessage, text: assistantMessage.text + chunk.text };
        setMessages(prev => prev.map(m => m.id === assistantMessage.id ? assistantMessage : m));
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', text: `Hata: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Analytics />
      <header className="p-4 bg-white border-b flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <div className="p-2 bg-blue-600 text-white rounded-lg">
          <Sparkles size={20} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">EngelsizAI</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence>
          {messages.map(m => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[90%] md:max-w-[70%] shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>
                <div className="prose prose-sm md:prose-base max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]}>{m.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
      <footer className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Mesajınızı yazın..."
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
          />
          <button type="submit" disabled={isLoading} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </footer>
    </div>
  );
}
