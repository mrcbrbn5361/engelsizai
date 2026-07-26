import React, { useState } from 'react';
import { Copy, Check, Code as CodeIcon, Download, Sparkles, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';

export const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && (match || codeText.includes('\n'))) {
    return (
      <div className="relative my-3.5 rounded-xl overflow-hidden border border-teal-500/30 bg-slate-950 font-mono text-xs shadow-2xl">
        {/* Code Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-teal-500/20 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CodeIcon size={13} className="text-teal-400" /> 
              {language || 'KOD'}
            </span>
          </div>
          <button 
            onClick={handleCopy} 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950/80 hover:bg-teal-900 border border-teal-500/30 text-[11px] text-teal-200 hover:text-white transition shadow-sm"
            title="Kodu Panoya Kopyala"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />} 
            <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
          </button>
        </div>
        {/* Code Content */}
        <pre className="p-4 overflow-x-auto text-slate-100 font-mono text-[12px] leading-relaxed selection:bg-teal-900 selection:text-white">
          <code>{codeText}</code>
        </pre>
      </div>
    );
  }

  return (
    <code className="bg-slate-800/90 text-teal-300 px-1.5 py-0.5 rounded text-[12px] font-mono border border-teal-500/20" {...props}>
      {children}
    </code>
  );
};

export const ImageWithLoader = ({ src, alt, ...props }: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engelsizai-gorsel-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      window.open(src, '_blank');
    }
  };

  return (
    <div className="my-4 my-3.5 space-y-2">
      <div className="relative rounded-2xl overflow-hidden border-2 border-teal-500/40 bg-slate-950 shadow-2xl min-h-[280px] max-w-lg mx-auto flex items-center justify-center group">
        
        {/* Loading Animation Placeholder */}
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-center space-y-3 z-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin flex items-center justify-center"></div>
              <Sparkles className="absolute inset-0 m-auto text-teal-300 animate-pulse" size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-teal-300 tracking-wider uppercase block flex items-center justify-center gap-1.5">
                <ImageIcon size={14} /> Yapay Zeka Görseli Oluşturuluyor...
              </span>
              <p className="text-[11px] text-slate-400 max-w-xs">
                EngelsizAI görsel motoru piksel çözünürlüğünü işliyor ve PNG formatına dönüştürüyor.
              </p>
            </div>
          </div>
        )}

        {/* Error Fallback */}
        {error && (
          <div className="p-6 text-center text-rose-400 text-xs font-mono space-y-2">
            <p>⚠️ Görsel yüklenirken bir sorun oluştu.</p>
            <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline text-teal-300">
              Görseli Harici Aç <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Image Element */}
        <img
          src={src}
          alt={alt || 'EngelsizAI Oluşturulan Görsel'}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          className={`w-full h-auto object-cover transition-all duration-500 ${
            loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
          {...props}
        />

        {/* Action Overlay Bar */}
        {!loading && !error && (
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded border border-teal-500/30 truncate max-w-[200px]">
              {alt || 'PNG Görsel'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-lg transition"
              >
                <Download size={13} />
                <span>PNG İndir</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Caption & Download Link beneath image */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span className="flex items-center gap-1 text-teal-400 font-semibold">
            <Sparkles size={12} /> Yüksek Çözünürlüklü PNG Görseli
          </span>
          <button
            onClick={handleDownload}
            className="hover:text-teal-300 underline flex items-center gap-1"
          >
            <Download size={11} /> İndir (.png)
          </button>
        </div>
      )}
    </div>
  );
};
