import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/apiClient';
import { MessageSquare, X, Send, ExternalLink, Bot, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: Array<{ label: string; url: string; lastLinkChecked?: string; reviewNote?: string }>;
  mode?: string;
}

export const BossNarraWidget: React.FC<{ isOpenByDefault?: boolean; onClose?: () => void }> = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: 'model',
      text: t('chatbot.welcome'),
      sources: [
        { label: 'DTI BNRS Portal', url: 'https://bnrs.dti.gov.ph/' },
        { label: 'Bureau of Internal Revenue', url: 'https://www.bir.gov.ph/' },
        { label: 'DOST Regional Office', url: 'https://www.dost.gov.ph/' }
      ]
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Allow other components to trigger opening Boss Narra
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-boss-nana', handleOpen);
    return () => window.removeEventListener('open-boss-nana', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: query };
    const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const endpoint = token ? '/api/boss-nana' : '/api/assistant';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question: query, history, language })
      });

      if (!res.ok) throw new Error('Failed to get answer');
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.answer || 'I could not retrieve an answer at this time.',
          sources: data.sources || [],
          mode: data.mode
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: t('chatbot.unavailable'),
          sources: [
            { label: 'DTI Business Name Registration', url: 'https://bnrs.dti.gov.ph/' },
            { label: 'Bureau of Internal Revenue', url: 'https://www.bir.gov.ph/' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-[#D8C6F0]/40"
          aria-label={t('chatbot.label')}
        >
          <span className="w-8 h-8 rounded-full bg-[#FF8A3D] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-inner group-hover:rotate-12 transition-transform">
            BN
          </span>
          <span className="font-semibold text-sm tracking-wide">{t('chatbot.label')}</span>
          <Sparkles className="w-4 h-4 text-[#FFD166] animate-pulse" />
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <section
          className="w-[360px] sm:w-[420px] h-[550px] max-h-[85vh] bg-[#FCFAFE] rounded-2xl shadow-2xl border border-[#E4D7EF] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
          aria-label="Boss Narra Assistant"
        >
          {/* Header */}
          <header className="bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] text-white px-5 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FF8A3D] text-white font-extrabold flex items-center justify-center text-sm shadow">
                BN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm leading-tight text-white">{t('chatbot.name')}</h3>
                  <span className="inline-block w-2 h-2 rounded-full bg-[#76A13C]" title="Online" />
                </div>
                <p className="text-xs text-[#E9D9EF]/90">{t('chatbot.status')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#E9D9EF] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={t('chatbot.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-[#FFF0E4] border border-[#FF8A3D]/30 text-[#2B1C33] text-xs p-3 rounded-xl leading-relaxed">
              <span className="font-bold text-[#F26430]">ℹ {t('chatbot.status')}: </span>
              {t('chatbot.disclaimer')}
            </div>

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-full bg-[#4A1D8F] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                    BN
                  </div>
                )}
                <div
                  className={`max-w-[85%] text-xs leading-relaxed p-3.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] text-white rounded-tr-xs shadow'
                      : 'bg-white text-[#2B1C33] border border-[#E9D9EF] rounded-tl-xs shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#E9D9EF] space-y-1">
                      <strong className="block text-[11px] text-[#4A1D8F] font-semibold">
                        {t('chatbot.sources')}:
                      </strong>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F1EAF8] text-[#4A1D8F] hover:bg-[#4A1D8F] hover:text-white rounded-md text-[10px] font-medium transition-colors"
                          >
                            <span>{src.label}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-[#6F5B77]">
                <div className="w-7 h-7 rounded-full bg-[#4A1D8F] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  BN
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#E9D9EF] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-[#6F5B77]">{t('chatbot.waiting')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#E9D9EF] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbot.placeholder')}
              className="flex-1 bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-xl px-3.5 py-2 text-xs text-[#2B1C33] placeholder:text-[#6F5B77]/70"
              maxLength={1200}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#FF8A3D] hover:bg-[#F26430] disabled:opacity-40 text-white px-3.5 py-2 rounded-xl flex items-center justify-center transition-colors shadow-sm"
              aria-label={t('chatbot.send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
};
