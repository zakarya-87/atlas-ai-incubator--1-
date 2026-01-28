import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MarketAnalysisTool } from '../types';

interface MarketAnalysisSubNavProps {
  activeTool: MarketAnalysisTool;
  onToolChange: (tool: MarketAnalysisTool) => void;
}

const MarketAnalysisSubNav: React.FC<MarketAnalysisSubNavProps> = ({
  activeTool,
  onToolChange,
}) => {
  const { t } = useLanguage();

  const navItems: { key: MarketAnalysisTool; label: string }[] = [
    { key: 'overview', label: t('marketAnalysisNavOverview') },
    { key: 'research', label: t('marketAnalysisNavResearch') },
  ];

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 rounded-full bg-black/20 p-1 max-w-4xl mx-auto">
      {navItems.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onToolChange(key)}
          className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 focus:ring-offset-black/20 ${
            activeTool === key
              ? 'bg-brand-teal text-white shadow-md'
              : 'text-brand-light hover:bg-brand-accent/50'
          }`}
          aria-pressed={activeTool === key}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default MarketAnalysisSubNav;
