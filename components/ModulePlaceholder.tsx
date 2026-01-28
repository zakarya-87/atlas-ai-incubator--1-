import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { ModuleType } from '../types';
import { TranslationKey } from '../locales';

interface ModulePlaceholderProps {
  module: ModuleType;
  onExplore: () => void;
}

const icons = {
  dashboard: <div />, // Placeholder icon
  finance: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-16 h-16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m16.5 0h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m0 0a1.125 1.125 0 0 0-1.125 1.125v.375m0 0a1.125 1.125 0 0 1-1.125 1.125H3.75a1.125 1.125 0 0 1-1.125-1.125v-.375a1.125 1.125 0 0 0-1.125-1.125m0 0H2.25"
      />
    </svg>
  ),
  growth: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-16 h-16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
      />
    </svg>
  ),
  funding: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-16 h-16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.554-.413 1.278-.659 2.003-.659c.768 0 1.536.219 2.232.659l.879.659m0-2.219-2.232.659m2.232-.659L12 6.75l-2.232 2.219"
      />
    </svg>
  ),
  productivity: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-16 h-16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
      />
    </svg>
  ),
  strategy: <div />, // Should not be used
  fundamentals: <div />, // Should not be used
  architecture: <div />,
  audit: <div />,
  integrations: <div />,
  marketAnalysis: <div />,
};

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  module,
  onExplore,
}) => {
  const { t } = useLanguage();

  const titleKey = `${module}ModuleTitle` as TranslationKey;
  const descriptionKey = `${module}ModuleDescription` as TranslationKey;
  const icon = icons[module];

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 text-brand-light">
      <div className="mx-auto h-16 w-16 text-brand-accent mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-brand-text">{t(titleKey)}</h2>
      <p className="mt-2 max-w-md mx-auto">{t(descriptionKey)}</p>
      <button
        onClick={onExplore}
        className="mt-6 px-6 py-2 bg-brand-accent hover:bg-brand-light text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
      >
        {t('buttonExplore')}
      </button>
    </div>
  );
};

export default ModulePlaceholder;
