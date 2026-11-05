import React from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Check, Globe, Sparkles } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { needsLanguageSelection, updateLanguagePreference } = useAuth();

  if (!needsLanguageSelection) return null;

  const languages: { code: Language; name: string; nativeName: string; desc: string }[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      desc: 'Standard business terms, official filing instructions, and reports.'
    },
    {
      code: 'fil',
      name: 'Filipino (Tagalog)',
      nativeName: 'Wikang Filipino',
      desc: 'Komprehensibong pagsasalin para sa mga lokal na negosyante.'
    },
    {
      code: 'hil',
      name: 'Hiligaynon',
      nativeName: 'Hiligaynon (Ilonggo)',
      desc: 'Lokal nga pinulongan sa South Cotabato kag kasikbit nga komunidad.'
    }
  ];

  const handleSelect = (lang: Language) => {
    updateLanguagePreference(lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1C33]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF7F1] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D8C6F0] relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-[#FF8A3D]/20 to-[#4A1D8F]/10 rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-2.5 text-[#4A1D8F] font-bold text-xs uppercase tracking-wider mb-2">
          <Globe className="w-4 h-4 text-[#FF8A3D]" />
          <span>Language Preference</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1C33] tracking-tight mb-2">
          Welcome to Enterseed
        </h2>
        <p className="text-sm text-[#6F5B77] mb-6 leading-relaxed">
          Please select your preferred language for the Boss Narra workspace, finance checkups, and business recommendations. You can always switch this later.
        </p>

        <div className="space-y-3 mb-8">
          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'bg-white border-[#4A1D8F] shadow-md ring-2 ring-[#4A1D8F]/20'
                    : 'bg-white/60 border-[#E9D9EF] hover:bg-white hover:border-[#D8C6F0]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#2B1C33]">{item.nativeName}</span>
                    <span className="text-xs text-[#6F5B77]">({item.name})</span>
                  </div>
                  <p className="text-xs text-[#6F5B77] mt-1">{item.desc}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? 'bg-[#4A1D8F] text-white' : 'border border-[#E9D9EF] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleSelect(language)}
          className="w-full bg-gradient-to-r from-[#4A1D8F] to-[#2C154F] hover:from-[#2C154F] hover:to-[#4A1D8F] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to Workspace</span>
          <Sparkles className="w-4 h-4 text-[#FFD166]" />
        </button>
      </div>
    </div>
  );
};
