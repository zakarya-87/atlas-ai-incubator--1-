import React, { useState, useEffect, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import type {
  FinancialForecastData,
  GenerationRecord,
  AnyAnalysisData,
  AnalysisPoint,
} from '../types';
import { useLanguage } from '../context/LanguageContext';

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
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }
  ).format(amount);
};

interface AssumptionSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}

const AssumptionSlider: React.FC<AssumptionSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}) => (
  <div>
    <label
      htmlFor={`slider-${label.replace(/\s+/g, '-').toLowerCase()}`}
      className="block text-sm font-semibold text-brand-light"
    >
      {label}
    </label>
    <div className="flex items-center gap-4">
      <input
        id={`slider-${label.replace(/\s+/g, '-').toLowerCase()}`}
        name={`slider-${label.replace(/\s+/g, '-').toLowerCase()}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-brand-accent/50 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm font-bold text-brand-text w-16 text-right">
        {format(value)}
      </span>
    </div>
  </div>
);

const FinancialForecastDisplay: React.FC<{
  data: FinancialForecastData;
  originalRecord: GenerationRecord | null;
  onSaveVersion: (
    originalRecord: GenerationRecord,
    modifiedData: AnyAnalysisData,
    message: string
  ) => void;
}> = ({ data, originalRecord, onSaveVersion }) => {
  const { language, t } = useLanguage();

  const [liveForecast, setLiveForecast] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);

  // Extract initial assumptions or set defaults
  const initialGrowthRate = useMemo(
    () =>
      parseFloat(
        (data?.assumptions || [])
          .find((a) => a.point.includes('Growth'))
          ?.explanation.match(/(\d+(\.\d+)?)%/)?.[1] || '100'
      ) / 100,
    [data]
  );
  const initialCogsMargin = useMemo(
    () =>
      parseFloat(
        (data?.assumptions || [])
          .find((a) => a.point.includes('COGS'))
          ?.explanation.match(/(\d+(\.\d+)?)%/)?.[1] || '30'
      ) / 100,
    [data]
  );
  const initialOpexScaling = useMemo(
    () =>
      parseFloat(
        (data?.assumptions || [])
          .find((a) => a.point.includes('OPEX'))
          ?.explanation.match(/(\d+(\.\d+)?)%/)?.[1] || '50'
      ) / 100,
    [data]
  );

  const [growthRate, setGrowthRate] = useState(initialGrowthRate);
  const [cogsMargin, setCogsMargin] = useState(initialCogsMargin);
  const [opexScaling, setOpexScaling] = useState(initialOpexScaling);

  useEffect(() => {
    // When the base data from props changes (e.g., new generation), reset the lab
    setLiveForecast(data);
    setGrowthRate(initialGrowthRate);
    setCogsMargin(initialCogsMargin);
    setOpexScaling(initialOpexScaling);
    setHasChanges(false);
  }, [data, initialGrowthRate, initialCogsMargin, initialOpexScaling]);

  useEffect(() => {
    const recalculateForecast = () => {
      const newForecast = [...(data?.forecast || [])]; // Start from the original year 1
      for (let i = 1; i < newForecast.length; i++) {
        newForecast[i].revenue = newForecast[i - 1].revenue * (1 + growthRate);
        newForecast[i].cogs = newForecast[i].revenue * cogsMargin;
        newForecast[i].grossProfit =
          newForecast[i].revenue - newForecast[i].cogs;
        newForecast[i].opex = newForecast[i - 1].opex * (1 + opexScaling);
        newForecast[i].netProfit =
          newForecast[i].grossProfit - newForecast[i].opex;
      }

      const newAssumptions: AnalysisPoint[] = [
        {
          point: 'Annual Revenue Growth Rate',
          explanation: `Revenue is projected to grow by ${(growthRate * 100).toFixed(0)}% annually after Year 1.`,
        },
        {
          point: 'COGS Margin',
          explanation: `Cost of Goods Sold is assumed to be ${(cogsMargin * 100).toFixed(0)}% of revenue.`,
        },
        {
          point: 'OPEX Scaling',
          explanation: `Operating Expenses are projected to grow by ${(opexScaling * 100).toFixed(0)}% annually.`,
        },
      ];

      setLiveForecast({ forecast: newForecast, assumptions: newAssumptions });
      setHasChanges(true);
    };

    recalculateForecast();
  }, [growthRate, cogsMargin, opexScaling, data?.forecast]);

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('forecast' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No financial forecast data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  const handleReset = () => {
    setGrowthRate(initialGrowthRate);
    setCogsMargin(initialCogsMargin);
    setOpexScaling(initialOpexScaling);
    // The useEffect will handle the rest
  };

  const handleSave = () => {
    if (originalRecord) {
      onSaveVersion(
        originalRecord,
        liveForecast,
        `Modified forecast from ${new Date(originalRecord.timestamp).toLocaleTimeString()}`
      );
    }
  };

  const maxRevenue = Math.max(
    ...(liveForecast.forecast || []).map((y) => y.revenue),
    1
  ); // Avoid division by zero

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center"
      >
        <h3 className="text-2xl font-bold text-brand-teal">
          {t('financialForecastTitle')}
        </h3>
        {originalRecord && hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm bg-brand-accent hover:bg-brand-light text-white font-semibold rounded-md transition-colors"
            >
              {t('financialForecastReset')}
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-brand-teal hover:bg-teal-500 text-white font-semibold rounded-md transition-colors"
            >
              {t('financialForecastSaveVersion')}
            </button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            variants={itemVariants}
            className="rounded-lg p-4 bg-brand-secondary/30 overflow-hidden"
          >
            <h4 className="text-lg font-bold text-brand-light mb-2">
              {t('financialForecastProjections')}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-brand-light">
                <thead className="text-xs text-brand-text uppercase bg-brand-accent/30">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      {t('financialForecastYear')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('financialForecastRevenue')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('financialForecastCOGS')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('financialForecastGrossProfit')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('financialForecastOPEX')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('financialForecastNetProfit')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(liveForecast.forecast || []).map((yearData) => (
                    <tr
                      key={yearData.year}
                      className="border-b border-brand-accent/50 hover:bg-brand-accent/20"
                    >
                      <td className="px-4 py-3 font-bold text-brand-text">
                        {yearData.year}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatCurrency(yearData.revenue, language)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatCurrency(yearData.cogs, language)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatCurrency(yearData.grossProfit, language)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatCurrency(yearData.opex, language)}
                      </td>
                      <td
                        className={`px-4 py-3 font-mono font-bold ${yearData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {formatCurrency(yearData.netProfit, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="rounded-lg p-4 bg-brand-secondary/30 overflow-hidden mt-6"
          >
            <h4 className="text-lg font-bold text-brand-light mb-4">
              Visual Projections
            </h4>
            <div className="flex justify-around items-end h-48 p-4 space-x-2 rtl:space-x-reverse">
              {(liveForecast.forecast || []).map((yearData) => (
                <div
                  key={yearData.year}
                  className="flex flex-col items-center flex-1 h-full justify-end"
                >
                  <div className="flex w-full h-full items-end space-x-1 rtl:space-x-reverse justify-center">
                    <motion.div
                      className="w-1/2 bg-blue-500 rounded-t-sm"
                      initial={{ height: '0%' }}
                      animate={{
                        height: `${(yearData.revenue / maxRevenue) * 100}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      title={`Revenue: ${formatCurrency(yearData.revenue, language)}`}
                    />
                    <motion.div
                      className={`w-1/2 rounded-t-sm ${yearData.netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      initial={{ height: '0%' }}
                      animate={{
                        height: `${(Math.abs(yearData.netProfit) / maxRevenue) * 100}%`,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      title={`Net Profit: ${formatCurrency(yearData.netProfit, language)}`}
                    />
                  </div>
                  <span className="text-xs font-bold mt-2">
                    Year {yearData.year}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center space-x-4 rtl:space-x-reverse mt-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1.5"></div>
                Revenue
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm mr-1.5"></div>
                Net Profit
              </div>
            </div>
          </motion.div>
        </div>
        <div className="lg:col-span-1">
          <motion.div
            variants={itemVariants}
            className="rounded-lg p-4 bg-brand-secondary/30 space-y-4"
          >
            <h3 className="text-xl font-bold text-brand-teal">
              {t('financialForecastAssumptions')}
            </h3>
            <AssumptionSlider
              label="Annual Revenue Growth"
              value={growthRate}
              onChange={setGrowthRate}
              min={0}
              max={3}
              step={0.05}
              format={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <AssumptionSlider
              label="COGS Margin"
              value={cogsMargin}
              onChange={setCogsMargin}
              min={0.05}
              max={0.8}
              step={0.01}
              format={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <AssumptionSlider
              label="Annual OPEX Growth"
              value={opexScaling}
              onChange={setOpexScaling}
              min={0}
              max={2}
              step={0.05}
              format={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialForecastDisplay;
