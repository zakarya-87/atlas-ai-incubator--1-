import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FinanceTool } from '../types';

interface FinanceSubNavProps {
  activeTool: FinanceTool;
  onToolChange: (tool: FinanceTool) => void;
}

// ⚡ Bolt Performance Optimization:
// Wrapped in React.memo() because this sub-navigation component receives stable props
// (activeTool string and handleToolChange callback from App.tsx).
// This prevents unnecessary re-renders of the navigation bar on every keystroke
// when the user types in the business description textarea in the parent AppContent.
const FinanceSubNav: React.FC<FinanceSubNavProps> = React.memo(({
  activeTool,
  onToolChange,
}) => {
  const { t } = useLanguage();

  const navItems: { key: FinanceTool; label: string }[] = [
    { key: 'budgetGenerator', label: t('financeNavBudgetGenerator') },
    { key: 'financialForecast', label: t('financeNavFinancialForecast') },
    { key: 'cashFlowForecast', label: t('financeNavCashFlowForecast') },
    { key: 'kpiDashboards', label: t('financeNavKpiDashboards') },
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
});

export default FinanceSubNav;
