import { useState, FormEvent, useEffect, useRef } from 'react';
import { createChat } from './services/geminiService';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Volume2, 
  Square, 
  Mic, 
  MicOff, 
  Eye, 
  EyeOff,
  Key, 
  Type, 
  Copy, 
  Check, 
  Trash2, 
  Info, 
  VolumeX
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
  { text: '🎓 Eğitimler & Kurslar', query: 'Engelliler Sarayında hangi kurslar ve eğitimler veriliyor?' },
  { text: '📝 Kayıt & Başvuru', query: 'Eğitimlere ve hizmetlere kayıt/başvuru nasıl yapılır?' },
  { text: '📍 Konum & Ulaşım', query: 'Feyzullah Kıyıklık Engelliler Sarayı nerede, nasıl giderim?' },
  { text: '🤝 Sosyal Hizmetler', query: 'Engelliler Sarayının sunduğu destek ve rehabilitasyon hizmetleri nelerdir?' }
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
      text: 'Merhaba! Ben Feyzullah Kıyıklık Engelliler Sarayı öğrencisi Miraç Birben tarafından geliştirilen bir Yapay Zeka Projesiyim. Bağcılar Belediyesi ve Engelliler Sarayı hizmetleri hakkında sorularınızı yanıtlayabilirim. Size nasıl yardımcı olabilirim?' 
    }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gemini API Key States
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
        text: 'Konuşma temizlendi. Size nasıl yardımcı olabilirim?' 
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
      const streamResponse = await chat.sendMessageStream({ messages: currentMessages });
      
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
    <div className={`flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden transition-colors duration-200 ${isHighContrast ? 'high-contrast' : ''}`}>
      <Analytics />
      
      {/* ACCESS HEADER */}
      <header className="flex-none p-4 bg-card border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-custom">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className={`${getTitleTextClass()}`}>EngelsizAI</h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-custom">
                Miraç Birben
              </span>
              <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-custom flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Gemini 3.1 Flash Lite</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-custom">v1.0.8</span>
            </div>
          </div>
        </div>

        {/* Accessibility Panel Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* API Key Configuration */}
          <button 
            onClick={() => setShowApiKeyModal(true)}
            aria-label="API Anahtarını Yapılandır"
            className={`flex items-center gap-2 px-3 py-2 border rounded-custom transition-all active:scale-95 text-xs font-bold uppercase tracking-wider ${
              apiKey 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 animate-pulse'
            }`}
          >
            <Key size={16} />
            <span>API Anahtarı</span>
            <span className={`px-1.5 py-0.5 rounded-custom text-[10px] ${apiKey ? 'bg-emerald-500 text-white font-mono' : 'bg-amber-500 text-white font-mono'}`}>
              {apiKey ? 'AKTiF' : 'EKSiK'}
            </span>
          </button>

          {/* High Contrast Toggle */}
          <button 
            onClick={toggleHighContrast}
            aria-label="Yüksek Kontrast Modunu Aç/Kapat"
            className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-custom transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
          >
            <Eye size={16} className="text-primary" />
            <span>Kontrast</span>
            <span className={`px-1.5 py-0.5 rounded-custom text-[10px] ${isHighContrast ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}>
              {isHighContrast ? 'WCAG AAA' : 'Standart'}
            </span>
          </button>

          {/* Font Size Toggle */}
          <button 
            onClick={cycleFontSize}
            aria-label="Yazı Boyutunu Değiştir"
            className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-custom transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
          >
            <Type size={16} className="text-primary" />
            <span>Boyut</span>
            <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-custom text-[10px]">
              {fontSize === 'normal' && 'Normal'}
              {fontSize === 'large' && 'Büyük'}
              {fontSize === 'huge' && 'Çok Büyük'}
            </span>
          </button>

          {/* Help Panel Toggle */}
          <button 
            onClick={() => setShowHelp(!showHelp)}
            aria-label="Bilgi ve Yardım"
            className="p-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-custom transition-all active:scale-95"
          >
            <Info size={16} />
          </button>

          {/* Clear Conversations */}
          <button 
            onClick={clearChat}
            aria-label="Sohbeti Temizle"
            className="p-2 bg-muted hover:bg-muted/80 text-red-600 dark:text-red-400 border border-border rounded-custom transition-all active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* DETAILED ACCESSIBILITY HELP BOX */}
      {showHelp && (
        <div className="p-4 bg-muted border-b border-border vibe-container">
          <div className="vibe-card p-4 space-y-2">
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-primary">
              Erişilebilirlik ve Engelsiz Kullanım Rehberi
            </h2>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 font-sans">
              <li><strong>Yüksek Kontrast:</strong> Az gören bireyler için arka planı siyah, metinleri beyaz yapar (WCAG AAA uyumlu).</li>
              <li><strong>Yazı Boyutu:</strong> Okuma güçlüğü çekenler için tüm arayüz metin boyutlarını büyütür.</li>
              <li><strong>Sesli Okuma (Hoparlör):</strong> Asistanın yanıtlarının yanındaki hoparlör simgesine tıklayarak metni sesli dinleyebilirsiniz.</li>
              <li><strong>Sesli Giriş (Mikrofon):</strong> Giriş alanındaki mikrofon simgesine tıklayarak konuşabilir, klavye kullanmadan yazabilirsiniz.</li>
              <li><strong>Geometrik Tasarım:</strong> Tüm düğmeler kolay tıklama için minimum 48px yüksekliğe ve keskin 4px (rounded-custom) köşelere sahiptir.</li>
            </ul>
          </div>
        </div>
      )}

      {/* MAIN CHAT ZONE */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center bg-background">
        <div className="w-full max-w-3xl space-y-6">
          <AnimatePresence initial={false}>
            {messages.map(m => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`vibe-card p-4 max-w-[95%] sm:max-w-[85%] md:max-w-[75%] space-y-3 ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-card text-foreground border-border'
                  }`}
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <div className={`prose max-w-none break-words w-full overflow-x-auto ${getBodyTextClass()}`}>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {m.text.replace(/<br\s*\/?>/gi, '\n')}
                    </Markdown>
                  </div>

                  {/* Message Action Bar (Speak / Copy) */}
                  <div className="flex items-center justify-between gap-4 border-t border-border/20 pt-2 text-xs">
                    <span className="font-mono text-[9px] opacity-60 tracking-wider uppercase font-bold">
                      {m.role === 'user' ? 'MİSAFİR' : 'ENGELSİZASİSTAN'}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Read out loud button */}
                      {m.role === 'assistant' && (
                        <button
                          onClick={() => speakText(m.text, m.id)}
                          aria-label={speakingId === m.id ? "Okumayı Durdur" : "Sesli Oku"}
                          className="p-1.5 rounded-custom hover:bg-muted text-foreground transition-colors flex items-center gap-1"
                        >
                          {speakingId === m.id ? (
                            <>
                              <Square size={14} className="text-red-500 animate-pulse" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">Durdur</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={14} className="text-primary" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">Dinle</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Copy message button */}
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        aria-label="Mesajı Kopyala"
                        className="p-1.5 rounded-custom hover:bg-muted text-foreground transition-colors flex items-center gap-1"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            <span className="text-[10px] uppercase font-bold tracking-wider text-green-500">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="opacity-70" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!apiKey && (
            <div className="vibe-card p-6 bg-amber-500/10 border border-amber-500/20 text-foreground space-y-4 rounded-custom animate-pulse">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-custom mt-0.5 flex-shrink-0">
                  <Key size={18} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Sohbeti Başlatmak İçin API Anahtarı Gerekli
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Bu yapay zeka asistanı doğrudan resmi Google Gemini API altyapısını kullanır. Ücretsiz sohbet etmeye başlamak için lütfen kendinize ait bir API anahtarı girin.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-custom active:scale-95 transition-all cursor-pointer"
                >
                  🔑 ANAHTARI GİRİN
                </button>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px] font-bold uppercase tracking-wider rounded-custom active:scale-95 transition-all border border-border inline-flex items-center gap-1"
                >
                  Ücretsiz Anahtar Al ↗
                </a>
              </div>
            </div>
          )}

          {messages.length === 1 && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(s.query)}
                  className="text-left p-3 vibe-card hover:bg-muted bg-card border border-border transition-all active:scale-95 flex items-center justify-between text-xs font-semibold cursor-pointer group"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <span className="group-hover:text-primary transition-colors">{s.text}</span>
                  <Sparkles size={14} className="text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="vibe-card p-4 bg-card text-foreground border-border flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className={`text-xs font-mono font-bold tracking-wider text-primary uppercase`}>
                    Düşünüyor
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <motion.span 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="h-1.5 w-1.5 rounded-full bg-primary opacity-40"
                  />
                  <motion.span 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                    className="h-1.5 w-1.5 rounded-full bg-primary opacity-70"
                  />
                  <motion.span 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                    className="h-1.5 w-1.5 rounded-full bg-primary opacity-100"
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* FOOTER CONTROLS */}
      <footer className="flex-none p-4 bg-card border-t border-border">
        {/* Voice Input Active Banner */}
        {isListening && (
          <div className="max-w-3xl mx-auto mb-2 px-3 py-1.5 bg-primary/10 border border-primary text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-custom animate-pulse">
            <Mic size={14} className="text-primary animate-bounce" />
            <span>Mikrofon Aktif: Konuşun, sesiniz yazıya dökülüyor...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto items-stretch">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            aria-label={isListening ? "Sesli Girişi Kapat" : "Sesli Giriş Yap (Mikrofon)"}
            className={`px-3 flex items-center justify-center border transition-all active:scale-95 rounded-custom h-12 min-w-[48px] ${
              isListening 
                ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                : 'bg-muted text-foreground hover:bg-muted/80 border-border'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} className="text-primary" />}
          </button>

          {/* Text Input Field */}
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Mesajınızı buraya yazın veya seslendirin..."
            aria-label="Mesaj Giriş Kutusu"
            className={`flex-1 p-3 bg-card border border-border text-foreground outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/10 focus:border-primary h-12 ${getBodyTextClass()}`}
            style={{ borderRadius: 'var(--radius)' }}
          />

          {/* Send Button */}
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            aria-label="Mesajı Gönder"
            className="px-4 bg-primary text-primary-foreground hover:brightness-110 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 h-12 min-w-[48px]"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            <span className={`hidden sm:inline ${getButtonTextClass()}`}>GÖNDER</span>
          </button>
        </form>
      </footer>

      {/* API KEY CONFIGURATION MODAL */}
      <AnimatePresence>
        {showApiKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApiKeyModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-custom shadow-2xl p-6 overflow-hidden z-10"
            >
              <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-custom">
                  <Key size={20} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-foreground tracking-tight uppercase">
                    Gemini API Anahtarı
                  </h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Kişisel Yapay Zeka Altyapısı
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-custom space-y-1.5 border border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Nasıl Ücretsiz Anahtar Alınır?</h3>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4 leading-relaxed">
                    <li><a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Google AI Studio</a> web sitesine gidin.</li>
                    <li>Google hesabınızla ücretsiz giriş yapın.</li>
                    <li><strong>"Get API Key"</strong> düğmesine tıklayın.</li>
                    <li>Oluşturduğunuz anahtarı kopyalayıp aşağıdaki alana yapıştırın.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label htmlFor="api-key-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>API ANAHTARI</span>
                    <span className="text-[10px] lowercase text-emerald-500 font-mono">tarayıcınızda yerel saklanır</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="api-key-input"
                      type={showPassword ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setApiKey(val);
                        localStorage.setItem('gemini_api_key', val);
                      }}
                      placeholder="AIzaSy..."
                      className="w-full p-3 pr-10 bg-muted border border-border text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-xs font-mono rounded-custom"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Anahtarı Gizle" : "Anahtarı Göster"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {apiKey ? (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-custom flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Anahtar başarıyla kaydedildi! Sohbet etmeye başlayabilirsiniz.</span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-custom flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Anahtar henüz girilmedi. Lütfen bir anahtar girin.</span>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px] font-bold uppercase tracking-wider rounded-custom active:scale-95 transition-all cursor-pointer"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => {
                      if (!apiKey) {
                        alert("Lütfen önce geçerli bir API anahtarı yapıştırın.");
                        return;
                      }
                      setShowApiKeyModal(false);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:brightness-110 font-mono text-[11px] font-bold uppercase tracking-wider rounded-custom active:scale-95 transition-all cursor-pointer"
                  >
                    Kaydet ve Başlat
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
