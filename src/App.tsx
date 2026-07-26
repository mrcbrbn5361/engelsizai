import { useState, FormEvent, useEffect, useRef } from 'react';
import packageJson from '../package.json';
import { createChat, NVIDIA_MODELS } from './services/geminiService';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Volume2, 
  Square, 
  Mic, 
  MicOff, 
  Eye, 
  Type, 
  Copy, 
  Check, 
  Trash2, 
  Info, 
  Bot,
  Cpu,
  Zap,
  BookOpen,
  MapPin,
  Users,
  ShieldCheck,
  Radio,
  ChevronDown,
  Activity,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Analytics } from "@vercel/analytics/react";

interface Message { 
  id: string; 
  role: 'user' | 'assistant'; 
  text: string; 
}

const SUGGESTIONS = [
  { 
    title: 'Eğitimler & Kurslar', 
    desc: 'Atölyeler, Kodlama, EKPSS ve Sanat Kursları',
    icon: BookOpen,
    query: 'Feyzullah Kıyıklık Engelliler Sarayında hangi kurslar ve eğitimler veriliyor?' 
  },
  { 
    title: 'Kayıt & Başvuru', 
    desc: 'Gerekli Belgeler, Şartlar ve Başvuru Süreci',
    icon: ShieldCheck,
    query: 'Eğitimlere ve hizmetlere kayıt/başvuru nasıl yapılır, hangi belgeler gereklidir?' 
  },
  { 
    title: 'Konum & Ulaşım', 
    desc: 'Adres, Yol Tarifi, Otobüs ve Metro Rotaları',
    icon: MapPin,
    query: 'Feyzullah Kıyıklık Engelliler Sarayı nerede, toplu taşıma ile nasıl giderim?' 
  },
  { 
    title: 'Sosyal Hizmetler', 
    desc: 'Ergoterapi, Duyu Bütünleme ve Terapiler',
    icon: Users,
    query: 'Engelliler Sarayının sunduğu destek, rehabilitasyon ve terapi hizmetleri nelerdir?' 
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('engelsiz_chat_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Fallback to default
        }
      }
    }
    return [{ 
      id: '1', 
      role: 'assistant', 
      text: 'Merhaba! Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi **Miraç Birben** tarafından geliştirilen **EngelsizAI Yapay Zeka Asistanıyım**.\n\nBağcılar Belediyesi ve Feyzullah Kıyıklık Engelliler Sarayı bünyesindeki tüm kurslar, rehabilitasyon hizmetleri, etkinlikler ve başvuru süreçleri hakkında size anında rehberlik edebilirim.\n\nAşağıdaki hızlı konu başlıklarından birini seçebilir veya sorunuzu sesli / yazılı olarak sorabilirsiniz.' 
    }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // NVIDIA Model State
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nvidia_selected_model') || 'meta/llama-3.3-70b-instruct';
    }
    return 'meta/llama-3.3-70b-instruct';
  });
  
  // Accessibility States
  const [isHighContrast, setIsHighContrast] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isHighContrast') === 'true';
    }
    return false;
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('fontSize') as any) || 'normal';
    }
    return 'normal';
  });

  // Speech States
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('engelsiz_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('nvidia_selected_model', selectedModel);
  }, [selectedModel]);

  // Audio setup and auto-scroll
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = 'tr-TR';
        rec.interimResults = false;

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => (prev + ' ' + transcript).trim());
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleHighContrast = () => {
    setIsHighContrast(prev => {
      const next = !prev;
      localStorage.setItem('isHighContrast', String(next));
      return next;
    });
  };

  const cycleFontSize = () => {
    setFontSize(prev => {
      let next: 'normal' | 'large' | 'huge' = 'normal';
      if (prev === 'normal') next = 'large';
      else if (prev === 'large') next = 'huge';
      localStorage.setItem('fontSize', next);
      return next;
    });
  };

  // Text-To-Speech (Sesli Okuma)
  const speakText = (text: string, id: string) => {
    if (!synthRef.current) return;

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    synthRef.current.cancel();
    
    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*#_`~-]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    
    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setSpeakingId(null);
  };

  // Speech-To-Text (Sesli Giriş)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome, Edge veya güncel bir mobil tarayıcı kullanın.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const clearChat = () => {
    if (window.confirm('Tüm konuşma geçmişini silmek istediğinize emin misiniz?')) {
      stopSpeaking();
      const defaultMsg: Message = { 
        id: '1', 
        role: 'assistant', 
        text: 'Konuşma geçmişi temizlendi. Size nasıl yardımcı olabilirim?' 
      };
      setMessages([defaultMsg]);
      localStorage.setItem('engelsiz_chat_history', JSON.stringify([defaultMsg]));
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    stopSpeaking();

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = createChat();
      const currentMessages = [...messages, userMessage];
      const streamResponse = await chat.sendMessageStream({ messages: currentMessages, model: selectedModel });
      
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', text: '' }]);

      let accumulatedText = "";
      for await (const chunk of streamResponse) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          setMessages(prev => prev.map(m => 
            m.id === assistantId ? { ...m, text: accumulatedText } : m
          ));
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', text: `Hata: ${error.message || 'Yanıt alınamadı.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
  };

  // Typography Class Dynamic Adjustments
  const getBodyTextClass = () => {
    if (fontSize === 'huge') return 'text-lg md:text-xl leading-relaxed';
    if (fontSize === 'large') return 'text-base md:text-lg leading-relaxed';
    return 'text-sm md:text-base leading-normal';
  };

  const getTitleTextClass = () => {
    if (fontSize === 'huge') return 'text-2xl md:text-3xl font-display font-bold tracking-tight';
    if (fontSize === 'large') return 'text-xl md:text-2xl font-display font-bold tracking-tight';
    return 'text-lg md:text-xl font-display font-bold tracking-tight';
  };

  const getButtonTextClass = () => {
    if (fontSize === 'huge') return 'text-base font-bold';
    if (fontSize === 'large') return 'text-sm font-bold';
    return 'text-xs font-bold';
  };

  return (
    <div className={`flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden ai-grid-bg transition-colors duration-200 ${isHighContrast ? 'high-contrast' : ''}`}>
      <Analytics />
      
      {/* HIGH-TECH AI HEADER */}
      <header className="flex-none p-3.5 md:p-4 ai-glass-panel border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between z-20 sticky top-0 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Animated AI Core Emblem */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-custom bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent border border-teal-500/30 text-teal-400 shadow-inner group">
            <div className="absolute inset-0 rounded-custom bg-teal-500/10 animate-ping opacity-25"></div>
            <Bot size={22} className="text-teal-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className={`${getTitleTextClass()} bg-gradient-to-r from-foreground via-teal-200 to-cyan-400 bg-clip-text text-transparent`}>
                EngelsizAI
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                <Radio size={10} className="animate-pulse text-teal-400" />
                <span>ASİSTAN</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-custom border border-border/40">
                Geliştirici: Miraç Birben
              </span>
              <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded-custom border border-teal-500/30 flex items-center gap-1">
                <Cpu size={10} />
                <span>NVIDIA NIM</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-custom border border-border/40">
                v{packageJson.version}
              </span>
            </div>
          </div>
        </div>

        {/* Action & Accessibility Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* NVIDIA Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              aria-label="NVIDIA Model Seçin"
              className="appearance-none bg-slate-950 text-teal-300 text-xs font-mono font-bold py-1.5 pl-3 pr-8 rounded-custom border border-teal-500/40 hover:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer shadow-md"
            >
              {NVIDIA_MODELS.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-foreground py-1">
                  [{m.category}] {m.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none" />
          </div>

          {/* High Contrast Toggle */}
          <button 
            onClick={toggleHighContrast}
            aria-label="Yüksek Kontrast Modunu Aç/Kapat"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border/60 rounded-custom transition-all active:scale-95 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <Eye size={14} className="text-teal-400" />
            <span className="hidden md:inline">Kontrast</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${isHighContrast ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
              {isHighContrast ? 'AAA' : 'STD'}
            </span>
          </button>

          {/* Font Size Selector */}
          <button 
            onClick={cycleFontSize}
            aria-label="Yazı Boyutunu Değiştir"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border/60 rounded-custom transition-all active:scale-95 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <Type size={14} className="text-teal-400" />
            <span className="hidden md:inline">Boyut</span>
            <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-mono">
              {fontSize === 'normal' && '1X'}
              {fontSize === 'large' && '1.2X'}
              {fontSize === 'huge' && '1.5X'}
            </span>
          </button>

          {/* Help Panel */}
          <button 
            onClick={() => setShowHelp(!showHelp)}
            aria-label="Bilgi ve Yardım"
            className="p-2 bg-muted hover:bg-muted/80 text-foreground border border-border/60 rounded-custom transition-all active:scale-95 cursor-pointer"
          >
            <Info size={15} />
          </button>

          {/* Clear History */}
          <button 
            onClick={clearChat}
            aria-label="Sohbeti Temizle"
            className="p-2 bg-muted hover:bg-red-500/20 text-red-400 border border-border/60 hover:border-red-500/40 rounded-custom transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </header>

      {/* ACCESSIBILITY & SYSTEM HELP CARD */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-slate-900/90 border-b border-teal-500/30 z-10 backdrop-blur-md"
          >
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex items-center gap-2 text-teal-400">
                <HelpCircle size={18} />
                <h2 className="font-display font-bold text-sm uppercase tracking-wider">
                  Erişilebilirlik ve Engelsiz Kullanım Kılavuzu
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="p-3 bg-slate-950/60 rounded-custom border border-border/40 space-y-1">
                  <span className="font-bold text-teal-300 block">♿ Yüksek Kontrast & Tipografi:</span>
                  <p className="leading-relaxed">Az gören bireyler için tam WCAG AAA siyah-sarı uyumlu kontrast modu ve 3 kademeli metin büyütme desteği mevcuttur.</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-custom border border-border/40 space-y-1">
                  <span className="font-bold text-teal-300 block">🎙️ Sesli Çift Yönlü İletişim:</span>
                  <p className="leading-relaxed">Mikrofon düğmesine tıklayarak sesli soru sorabilir, asistan yanıtlarının yanındaki hoparlör simgesiyle sesli dinleyebilirsiniz.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CHAT CONTAINER */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          
          {/* WELCOME AI HERO CARD (If only 1 default message) */}
          {messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="ai-glass-panel p-5 sm:p-7 space-y-6 border border-teal-500/30 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Central Glowing Orb & Intro */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/30 via-cyan-500/20 to-slate-900 border border-teal-400/40 text-teal-300 shadow-2xl flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-teal-400/10 animate-pulse"></div>
                  <Sparkles size={36} className="text-teal-300 animate-spin-slow" />
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-[10px] font-mono font-bold border border-teal-500/30 uppercase tracking-widest flex items-center gap-1">
                      <Zap size={11} /> Resmi Yapay Zeka Rehberi
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-700">
                      Bağcılar Belediyesi
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">
                    Feyzullah Kıyıklık Engelliler Sarayı Akıllı Asistanı
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    Kurumumuz bünyesinde sunulan tüm eğitim atölyeleri, rehabilitasyon servisleri, başvuru belgeleri, ulaşım hatları ve engelli hakları konusunda 7/24 kesintisiz bilgi alabilirsiniz.
                  </p>
                </div>
              </div>

              {/* System Capabilities Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/40">
                <div className="p-2.5 rounded-custom bg-muted/40 border border-border/40 flex items-center gap-2">
                  <Zap size={14} className="text-teal-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground">Anında Akışlı Yanıt</span>
                </div>
                <div className="p-2.5 rounded-custom bg-muted/40 border border-border/40 flex items-center gap-2">
                  <Volume2 size={14} className="text-teal-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground">Türkçe Sesli Okuma</span>
                </div>
                <div className="p-2.5 rounded-custom bg-muted/40 border border-border/40 flex items-center gap-2">
                  <Mic size={14} className="text-teal-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground">Sesle Komut Verme</span>
                </div>
                <div className="p-2.5 rounded-custom bg-muted/40 border border-border/40 flex items-center gap-2">
                  <Eye size={14} className="text-teal-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground">WCAG AAA Erişilebilir</span>
                </div>
              </div>

              {/* Quick Prompt Cards */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  <Activity size={14} className="text-teal-400" />
                  <span>Sık Sorulan Konular ve Hızlı Başlangıç</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTIONS.map((s, idx) => {
                    const IconComp = s.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendMessage(s.query)}
                        className="text-left p-3.5 ai-glass-panel hover:bg-teal-500/10 hover:border-teal-500/50 transition-all active:scale-[0.98] cursor-pointer group flex items-start gap-3 border border-border/60"
                      >
                        <div className="p-2 rounded-custom bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors flex-shrink-0 mt-0.5">
                          <IconComp size={16} />
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground group-hover:text-teal-300 transition-colors truncate">
                              {s.title}
                            </span>
                            <Sparkles size={12} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {s.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* CHAT MESSAGES DISPLAY */}
          <AnimatePresence initial={false}>
            {messages.map(m => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 12, scale: 0.99 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ duration: 0.2 }}
                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`p-4 md:p-5 max-w-[95%] sm:max-w-[88%] md:max-w-[82%] space-y-3.5 shadow-xl transition-all ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 text-white border border-teal-400/30 rounded-2xl rounded-tr-none' 
                      : 'ai-glass-panel text-foreground border-l-4 border-l-teal-400 border-border/60 rounded-2xl rounded-tl-none'
                  }`}
                >
                  {/* Message Header Identity Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-2">
                    <div className="flex items-center gap-2">
                      {m.role === 'user' ? (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-100 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
                          <span>MİSAFİR KULLANICI</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                          <Bot size={13} className="text-teal-400" />
                          <span>ENGELSİZAI // YAPAY ZEKA</span>
                        </span>
                      )}
                    </div>

                    {m.role === 'assistant' && (
                      <span className="text-[9px] font-mono text-muted-foreground/80 bg-muted/60 px-1.5 py-0.5 rounded border border-border/30">
                        GEMINI 3.1 FLASH LITE
                      </span>
                    )}
                  </div>

                  {/* Markdown Text Body */}
                  <div className={`prose max-w-none break-words w-full overflow-x-auto ${getBodyTextClass()}`}>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {m.text.replace(/<br\s*\/?>/gi, '\n')}
                    </Markdown>
                  </div>

                  {/* Message Action Bar (Speak & Copy) */}
                  <div className="flex items-center justify-between gap-4 border-t border-border/20 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Audio visualizer spectrum when speaking */}
                      {speakingId === m.id && (
                        <div className="flex items-center gap-0.5 h-3 px-1">
                          <div className="w-1 bg-teal-400 rounded-full audio-bar" style={{ animationDelay: '0s' }}></div>
                          <div className="w-1 bg-teal-400 rounded-full audio-bar" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 bg-teal-400 rounded-full audio-bar" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Read out loud button */}
                      {m.role === 'assistant' && (
                        <button
                          onClick={() => speakText(m.text, m.id)}
                          aria-label={speakingId === m.id ? "Okumayı Durdur" : "Sesli Oku"}
                          className="px-2.5 py-1 rounded-custom hover:bg-teal-500/20 text-teal-300 transition-colors flex items-center gap-1.5 border border-teal-500/30 cursor-pointer"
                        >
                          {speakingId === m.id ? (
                            <>
                              <Square size={13} className="text-red-400 animate-pulse" />
                              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-red-400">DURDUR</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} className="text-teal-400" />
                              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">SESLİ OKU</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Copy message button */}
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        aria-label="Mesajı Kopyala"
                        className="px-2.5 py-1 rounded-custom hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 border border-border/40 cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-400">KOPYALANDI</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} className="opacity-70" />
                            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">KOPYALA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* MISSING API KEY WARNING CARD */}
          {/* LOADING STATE INDICATOR */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="ai-glass-panel p-4 text-foreground border-l-4 border-l-teal-400 border-border/60 flex flex-col gap-2 min-w-[220px] rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold tracking-wider text-teal-400 uppercase flex items-center gap-1.5">
                    <Cpu size={14} className="animate-spin-slow" />
                    <span>Nöral Yanıt Üretiliyor</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <motion.span 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="h-2 w-2 rounded-full bg-teal-400"
                  />
                  <motion.span 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                    className="h-2 w-2 rounded-full bg-teal-400"
                  />
                  <motion.span 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                    className="h-2 w-2 rounded-full bg-teal-400"
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* FOOTER COMMAND DOCK */}
      <footer className="flex-none p-3.5 sm:p-4 ai-glass-panel border-t border-border shadow-2xl z-20">
        {/* Dynamic Voice Recording Equalizer Banner */}
        {isListening && (
          <div className="max-w-4xl mx-auto mb-2 px-3.5 py-2 bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-2 rounded-custom animate-pulse">
            <div className="flex items-center gap-2">
              <Mic size={15} className="text-teal-400 animate-bounce" />
              <span>Mikrofon Dinliyor: Sorunuzu Söyleyin...</span>
            </div>
            <div className="flex items-center gap-1 h-3">
              <div className="w-1 bg-teal-400 rounded-full audio-bar" style={{ animationDelay: '0s' }}></div>
              <div className="w-1 bg-teal-400 rounded-full audio-bar" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-1 bg-teal-400 rounded-full audio-bar" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-1 bg-teal-400 rounded-full audio-bar" style={{ animationDelay: '0.45s' }}></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto items-stretch">
          {/* Speech-to-Text Button */}
          <button
            type="button"
            onClick={toggleListening}
            aria-label={isListening ? "Sesli Girişi Kapat" : "Sesli Giriş Yap (Mikrofon)"}
            className={`px-3.5 flex items-center justify-center border transition-all active:scale-95 rounded-custom h-12 min-w-[48px] cursor-pointer ${
              isListening 
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 animate-pulse' 
                : 'bg-muted/80 text-foreground hover:bg-teal-500/15 hover:border-teal-500/40 border-border/60'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} className="text-teal-400" />}
          </button>

          {/* Text Input Control */}
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Mesajınızı buraya yazın veya mikrofonla seslendirin..."
            aria-label="Mesaj Giriş Kutusu"
            className={`flex-1 px-4 py-3 bg-slate-950/80 border border-border/80 text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 h-12 ${getBodyTextClass()}`}
            style={{ borderRadius: 'var(--radius)' }}
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            aria-label="Mesajı Gönder"
            className="px-5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 h-12 min-w-[52px] shadow-lg shadow-teal-500/20 cursor-pointer"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {isLoading ? <Loader2 className="animate-spin text-slate-950" size={20} /> : <Send size={20} className="text-slate-950" />}
            <span className={`hidden sm:inline font-mono ${getButtonTextClass()}`}>GÖNDER</span>
          </button>
        </form>
      </footer>
    </div>
  );
}

