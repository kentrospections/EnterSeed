import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/apiClient';
import {
  Bot,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: Array<{ label: string; url: string; lastLinkChecked?: string; reviewNote?: string }>;
  mode?: string;
}

export const BossNanaView: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: t('chatbot.welcome'),
      sources: [
        { label: 'DTI Business Name Registration System', url: 'https://bnrs.dti.gov.ph/' },
        { label: 'Bureau of Internal Revenue (BIR)', url: 'https://www.bir.gov.ph/' },
        { label: 'DOST Regional Office 12', url: 'https://www.dost.gov.ph/' },
        { label: 'South Cotabato Provincial Services', url: 'https://southcotabato.gov.ph/services/' }
      ]
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const promptSuggestions = [
    'How do I register a business name with DTI BNRS?',
    'What are the requirements for a Mayor’s permit in Koronadal?',
    'How much cash runway buffer should an MSME keep in reserve?',
    'Where can I apply for DOST SETUP innovation grants in South Cotabato?',
    'Paano magparehistro ng sole proprietorship sa BIR Form 1901?'
  ];

  const handleSubmit = async (textToSend: string) => {
    const query = textToSend.trim();
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

      if (!res.ok) throw new Error('Failed to retrieve response');
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.answer || 'I am unable to verify that answer from current references.',
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
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Workspace Header */}
      <div className="bg-gradient-to-r from-[#2C154F] via-[#4A1D8F] to-[#FF8A3D] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold text-[#FFD166] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded MSME AI Advisor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('bossNana.heroTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-[#E9D9EF] max-w-2xl mt-1 leading-relaxed">
              {t('bossNana.heroLead')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-2xl backdrop-blur-xs self-start md:self-auto border border-white/10">
            <span className="text-xs text-[#E9D9EF] px-2 font-medium">Language:</span>
            {(['en', 'fil', 'hil'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`text-xs px-2.5 py-1 rounded-xl font-bold uppercase transition-all ${
                  language === l ? 'bg-[#FF8A3D] text-white shadow' : 'text-[#E9D9EF] hover:bg-white/10'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestion Prompts */}
      <div className="flex flex-wrap gap-2">
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmit(prompt)}
            className="text-xs bg-white hover:bg-[#F1EAF8] text-[#4A1D8F] border border-[#E9D9EF] px-3.5 py-2 rounded-xl transition-all font-medium text-left shadow-2xs hover:border-[#4A1D8F]"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-white rounded-3xl border border-[#E9D9EF] shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Chat Disclaimer Banner */}
        <div className="bg-[#FFF0E4] border-b border-[#FF8A3D]/20 px-6 py-3 text-xs text-[#2B1C33] flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#F26430] flex-shrink-0" />
          <span>
            <strong>Informational Guidance:</strong> Responses are grounded in local business practices and official signposts. Always confirm legal, tax, or lending policies directly with DTI, BIR, or DOST.
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-9 h-9 rounded-2xl bg-[#4A1D8F] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm mt-1">
                  BN
                </div>
              )}

              <div
                className={`max-w-[85%] text-xs sm:text-sm leading-relaxed p-4 rounded-3xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] text-white rounded-tr-xs shadow-md'
                    : 'bg-[#FCFAFE] text-[#2B1C33] border border-[#E9D9EF] rounded-tl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#E9D9EF]/70 space-y-2">
                    <strong className="block text-xs font-bold text-[#4A1D8F]">
                      Official Verification Links:
                    </strong>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D8C6F0] text-[#4A1D8F] hover:bg-[#4A1D8F] hover:text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
                        >
                          <span>{src.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-[#6F5B77]">
              <div className="w-9 h-9 rounded-2xl bg-[#4A1D8F] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                BN
              </div>
              <div className="bg-[#FCFAFE] p-4 rounded-2xl border border-[#E9D9EF] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-[#6F5B77] ml-2">{t('chatbot.waiting')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input);
          }}
          className="p-4 bg-white border-t border-[#E9D9EF] flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbot.placeholder')}
            maxLength={1200}
            className="flex-1 bg-[#FFF7F1] border border-[#E9D9EF] focus:border-[#4A1D8F] focus:outline-none rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#2B1C33]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-[#FF8A3D] hover:bg-[#F26430] disabled:opacity-40 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm"
          >
            <span>{t('chatbot.send')}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
