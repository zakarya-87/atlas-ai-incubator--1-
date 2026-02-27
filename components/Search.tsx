import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';
import type { ModuleType, AnyTool } from '../types';

interface SearchableItem {
  moduleKey: ModuleType;
  moduleNameKey: TranslationKey;
  toolKey: AnyTool;
  toolNameKey: TranslationKey;
}

const searchableTools: SearchableItem[] = [
  // Fundamentals
  {
    moduleKey: 'fundamentals',
    moduleNameKey: 'sidebarFundamentals',
    toolKey: 'ideaValidation',
    toolNameKey: 'fundamentalsNavIdeaValidation',
  },
  {
    moduleKey: 'fundamentals',
    moduleNameKey: 'sidebarFundamentals',
    toolKey: 'problemValidation',
    toolNameKey: 'fundamentalsNavProblemValidation',
  },
  {
    moduleKey: 'fundamentals',
    moduleNameKey: 'sidebarFundamentals',
    toolKey: 'competitorAnalysis',
    toolNameKey: 'fundamentalsNavCompetitorAnalysis',
  },
  {
    moduleKey: 'fundamentals',
    moduleNameKey: 'sidebarFundamentals',
    toolKey: 'customerValidation',
    toolNameKey: 'fundamentalsNavCustomerValidation',
  },
  {
    moduleKey: 'fundamentals',
    moduleNameKey: 'sidebarFundamentals',
    toolKey: 'riskFeasibility',
    toolNameKey: 'fundamentalsNavRiskFeasibility',
  },
  {
    moduleKey: 'fundamentals',
    moduleNameKey: 'sidebarFundamentals',
    toolKey: 'validationTracker',
    toolNameKey: 'fundamentalsNavValidationTracker',
  },
  // Strategy
  {
    moduleKey: 'strategy',
    moduleNameKey: 'sidebarStrategy',
    toolKey: 'swot',
    toolNameKey: 'strategyNavSwot',
  },
  {
    moduleKey: 'strategy',
    moduleNameKey: 'sidebarStrategy',
    toolKey: 'pestel',
    toolNameKey: 'strategyNavPestel',
  },
  {
    moduleKey: 'strategy',
    moduleNameKey: 'sidebarStrategy',
    toolKey: 'roadmap',
    toolNameKey: 'strategyNavRoadmap',
  },
  {
    moduleKey: 'strategy',
    moduleNameKey: 'sidebarStrategy',
    toolKey: 'leanCanvas',
    toolNameKey: 'strategyNavLeanCanvas',
  },
  {
    moduleKey: 'strategy',
    moduleNameKey: 'sidebarStrategy',
    toolKey: 'okrWorkflow',
    toolNameKey: 'strategyNavOkrWorkflow',
  },
  // Market Analysis
  {
    moduleKey: 'marketAnalysis',
    moduleNameKey: 'sidebarMarketAnalysis',
    toolKey: 'overview',
    toolNameKey: 'marketAnalysisNavOverview',
  },
  {
    moduleKey: 'marketAnalysis',
    moduleNameKey: 'sidebarMarketAnalysis',
    toolKey: 'research',
    toolNameKey: 'marketAnalysisNavResearch',
  },
  // Finance
  {
    moduleKey: 'finance',
    moduleNameKey: 'sidebarFinance',
    toolKey: 'budgetGenerator',
    toolNameKey: 'financeNavBudgetGenerator',
  },
  {
    moduleKey: 'finance',
    moduleNameKey: 'sidebarFinance',
    toolKey: 'financialForecast',
    toolNameKey: 'financeNavFinancialForecast',
  },
  {
    moduleKey: 'finance',
    moduleNameKey: 'sidebarFinance',
    toolKey: 'cashFlowForecast',
    toolNameKey: 'financeNavCashFlowForecast',
  },
  {
    moduleKey: 'finance',
    moduleNameKey: 'sidebarFinance',
    toolKey: 'kpiDashboards',
    toolNameKey: 'financeNavKpiDashboards',
  },
  // Growth
  {
    moduleKey: 'growth',
    moduleNameKey: 'sidebarGrowth',
    toolKey: 'milestones',
    toolNameKey: 'growthNavMilestones',
  },
  {
    moduleKey: 'growth',
    moduleNameKey: 'sidebarGrowth',
    toolKey: 'expansionStrategy',
    toolNameKey: 'growthNavExpansionStrategy',
  },
  // Funding
  {
    moduleKey: 'funding',
    moduleNameKey: 'sidebarFunding',
    toolKey: 'pitchDeckGenerator',
    toolNameKey: 'fundingNavPitchDeckGenerator',
  },
  {
    moduleKey: 'funding',
    moduleNameKey: 'sidebarFunding',
    toolKey: 'investorDatabase',
    toolNameKey: 'fundingNavInvestorDatabase',
  },
  {
    moduleKey: 'funding',
    moduleNameKey: 'sidebarFunding',
    toolKey: 'fundraisingRoadmap',
    toolNameKey: 'fundingNavFundraisingRoadmap',
  },
  // Integrations
  {
    moduleKey: 'integrations',
    moduleNameKey: 'sidebarIntegrations',
    toolKey: 'connectors',
    toolNameKey: 'sidebarIntegrations',
  },
  // Architecture
  {
    moduleKey: 'architecture',
    moduleNameKey: 'sidebarArchitecture',
    toolKey: 'systemDesign',
    toolNameKey: 'sidebarArchitecture',
  },
  // Productivity
  {
    moduleKey: 'productivity',
    moduleNameKey: 'sidebarProductivity',
    toolKey: 'taskManager',
    toolNameKey: 'productivityNavTaskManager',
  },
];

interface SearchProps {
  onNavigate: (module: ModuleType, tool: AnyTool) => void;
}

const Search: React.FC<SearchProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const lowerCaseQuery = query.toLowerCase();
      const filteredResults = searchableTools.filter(
        (item) =>
          t(item.toolNameKey).toLowerCase().includes(lowerCaseQuery) ||
          t(item.moduleNameKey).toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filteredResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, t]);

  const handleSelect = (item: SearchableItem) => {
    onNavigate(item.moduleKey, item.toolKey);
    setQuery('');
    setIsOpen(false);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        searchRef.current?.querySelector('input')?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm" ref={searchRef}>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3">
          <svg
            className="h-5 w-5 text-brand-light"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          id="search-bar"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 1 && setIsOpen(true)}
          placeholder={t('searchPlaceholder')}
          className="w-full py-2 pl-10 pr-10 rtl:pl-4 rtl:pr-10 bg-brand-secondary/50 border-2 border-brand-accent rounded-full focus:ring-2 focus:ring-brand-teal focus:outline-none transition-all duration-300 text-brand-text placeholder-brand-accent"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 rtl:right-auto rtl:left-0 rtl:pl-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-brand-light hover:text-brand-text"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-brand-secondary border border-brand-accent rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {results.map((item, index) => (
              <li
                key={`${item.moduleKey}-${item.toolKey}-${index}`}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 hover:bg-brand-accent/50 cursor-pointer"
              >
                <p className="font-semibold text-brand-text">
                  {t(item.toolNameKey)}
                </p>
                <p className="text-sm text-brand-light">
                  {t(item.moduleNameKey)}
                </p>
              </li>
            ))}
          </motion.ul>
        )}
        {isOpen && results.length === 0 && query.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 p-4 bg-brand-secondary border border-brand-accent rounded-lg shadow-lg text-center text-brand-light"
          >
            {t('searchNoResults')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
