import React from 'react';
import { motion, Variants } from 'framer-motion';
import type {
  BudgetGeneratorData,
  AnalysisPoint,
  BudgetScenario,
  BudgetCategory,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import DataStructureDebugger from './DataStructureDebugger';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const formatCurrency = (amount: number, language: string) => {
  return new Intl.NumberFormat(
    language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
    {
      style: 'currency',
      currency: 'USD', // This could be made dynamic in a future version
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(amount);
};

const ScenarioTable: React.FC<{
  scenarios: BudgetScenario[];
  language: string;
}> = ({ scenarios, language }) => {
  const { t } = useLanguage();
  return (
    <motion.div variants={itemVariants} className="overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-brand-light">
        <thead className="text-xs text-brand-text uppercase bg-brand-accent/30">
          <tr>
            <th scope="col" className="px-6 py-3">
              {t('budgetGeneratorScenario')}
            </th>
            <th scope="col" className="px-6 py-3">
              {t('budgetGeneratorTotalRevenue')}
            </th>
            <th scope="col" className="px-6 py-3">
              {t('budgetGeneratorTotalExpenses')}
            </th>
            <th scope="col" className="px-6 py-3">
              {t('budgetGeneratorNetProfitLoss')}
            </th>
          </tr>
        </thead>
        <tbody>
          {(scenarios || []).map((s) => (
            <tr
              key={s.scenarioName}
              className="border-b border-brand-accent/50 hover:bg-brand-accent/20"
            >
              <th
                scope="row"
                className="px-6 py-4 font-bold text-brand-text whitespace-nowrap"
              >
                {s.scenarioName}
              </th>
              <td className="px-6 py-4 text-green-400">
                {formatCurrency(s.summary.totalRevenue, language)}
              </td>
              <td className="px-6 py-4 text-red-400">
                {formatCurrency(s.summary.totalExpenses, language)}
              </td>
              <td
                className={`px-6 py-4 font-bold ${s.summary.netProfitOrLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {formatCurrency(s.summary.netProfitOrLoss, language)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

const BreakdownTable: React.FC<{
  breakdown: BudgetCategory[];
  language: string;
}> = ({ breakdown, language }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      {(breakdown || []).map((category) => (
        <div
          key={category.categoryName}
          className="rounded-lg bg-brand-secondary/30 overflow-hidden"
        >
          <h4 className="text-lg font-bold text-brand-light bg-brand-secondary/50 p-3">
            {category.categoryName}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-brand-light">
              <thead className="text-xs text-brand-text uppercase bg-brand-accent/30">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    {t('budgetGeneratorItem')}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t('budgetGeneratorType')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right rtl:text-left"
                  >
                    {t('budgetGeneratorAmount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(category.items || []).map((item, index) => (
                  <tr key={index} className="border-t border-brand-accent/30">
                    <td className="px-6 py-3 font-medium text-brand-text/90">
                      {item.name}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.type === 'Fixed' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right rtl:text-left font-mono">
                      {formatCurrency(item.amount, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

const BudgetGeneratorDisplay: React.FC<{ data: BudgetGeneratorData }> = ({
  data,
}) => {
  const { language, t } = useLanguage();

  const normalizeList = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') {
      if (Array.isArray((value as any).items)) return (value as any).items;
      if (Array.isArray((value as any).list)) return (value as any).list;
      return Object.values(value).filter(Boolean);
    }
    return [value];
  };

  const getItemText = (item: any) => {
    if (item == null) return 'N/A';
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    if (typeof item === 'object') {
      return (
        (item as any).point ||
        (item as any).title ||
        (item as any).description ||
        (item as any).summary ||
        JSON.stringify(item)
      );
    }
    return String(item);
  };

  const getItemDetails = (item: any) => {
    if (item && typeof item === 'object') {
      return (item as any).explanation || (item as any).details || null;
    }
    return null;
  };

  const budgetData =
    (data as any)?.scenarios
      ? (data as any)
      : (data as any)?.budget_generator ||
        (data as any)?.budget ||
        (data as any)?.budget_plan ||
        (data as any)?.plan ||
        (data as any)?.data;

  // Handle undefined, null, non-object, or array data gracefully
  if (!budgetData || typeof budgetData !== 'object' || Array.isArray(budgetData) || !('scenarios' in budgetData)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No budget data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }
  const realisticScenario =
    (budgetData?.scenarios || []).find((s: any) => s.scenarioName === 'Realistic') ||
    (budgetData?.scenarios || [])[0];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      <DataStructureDebugger data={data} label="Budget Generator Data" />
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal mb-4">
          {t('budgetGeneratorSummary')}
        </h3>
        <div className="rounded-lg p-4 bg-brand-secondary/30 overflow-hidden">
          <h4 className="text-lg font-bold text-brand-light mb-2">
            {t('budgetGeneratorScenarios')}
          </h4>
          <ScenarioTable scenarios={budgetData.scenarios || []} language={language} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-brand-teal mb-4">
              {t('budgetGeneratorBreakdown')} (Realistic)
            </h3>
            <BreakdownTable
              breakdown={realisticScenario?.breakdown || []}
              language={language}
            />
          </motion.div>
        </div>
        <div className="lg:col-span-1">
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-brand-teal mb-4">
              {t('budgetGeneratorRecommendations')}
            </h3>
            <div className="space-y-3">
              {normalizeList((budgetData as any)?.recommendations).map((rec, index) => (
                <div key={index} className="rounded-lg p-4 bg-blue-500/5">
                  <strong className="font-semibold text-blue-300 text-sm display-block">
                    {getItemText(rec)}
                  </strong>
                  {getItemDetails(rec) && (
                    <p className="text-brand-text/80 text-sm mt-1">
                      {getItemDetails(rec)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetGeneratorDisplay;
