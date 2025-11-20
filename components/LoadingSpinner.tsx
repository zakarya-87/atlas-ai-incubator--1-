import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LoadingSpinner: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center text-center text-brand-light">
      <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold">{t('loadingTitle')}</p>
      <p className="text-sm">{t('loadingText')}</p>
    </div>
  );
};

export default LoadingSpinner;