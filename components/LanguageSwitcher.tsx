import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../locales';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2 rounded-full bg-brand-secondary p-1">
      {languages.map(({ key, name }) => (
        <button
          key={key}
          onClick={() => setLanguage(key)}
          className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 focus:ring-offset-brand-secondary ${
            language === key
              ? 'bg-brand-teal text-white shadow-sm'
              : 'text-brand-light hover:bg-brand-accent/50'
          }`}
          aria-pressed={language === key}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
