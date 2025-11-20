import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { ModuleType } from '../types';
import { TranslationKey } from '../locales';

interface HeroProps {
  activeModule: ModuleType;
}

const Hero: React.FC<HeroProps> = ({ activeModule }) => {
  const { t } = useLanguage();

  const titleKey = `${activeModule}HeroTitle` as TranslationKey;
  const subtitleKey = `${activeModule}HeroSubtitle` as TranslationKey;

  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-text tracking-tight animate-fade-in-down">
        {t(titleKey)}
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-brand-light animate-fade-in-up animation-delay-300">
        {t(subtitleKey)}
      </p>
    </div>
  );
};

export default Hero;