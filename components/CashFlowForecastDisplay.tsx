import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { CashFlowForecastData, AnalysisPoint } from '../types';
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
  return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const MetricCard: React.FC<{ title: string; value: string; subtext: string; icon: React.ReactNode; }> = ({ title, value, subtext, icon }) => (
    <div className="bg-brand-secondary/50 p-4 rounded-lg flex items-center">
        <div className="p-3 rounded-full bg-brand-accent/30 mr-4 rtl:mr-0 rtl:ml-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-brand-light font-semibold">{title}</p>
            <p className="text-2xl font-bold text-brand-text">
                {value} <span className="text-lg font-medium text-brand-light">{subtext}</span>
            </p>
        </div>
    </div>
);

const CashFlowForecastDisplay: React.FC<{ data: CashFlowForecastData }> = ({ data }) => {
  const { language, t } = useLanguage();

  const icons = {
    runway: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    burn: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l3 3-3 3" /></svg>,
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full space-y-6">
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal mb-4">{t('cashFlowForecastTitle')}</h3>
      </motion.div>
      
      <motion.div variants={itemVariants}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard 
                title={t('cashFlowForecastRunway')} 
                value={data.runwayMonths >= 99 ? '∞' : data.runwayMonths.toString()}
                subtext={data.runwayMonths < 99 ? t('cashFlowForecastMonths') : ''}
                icon={icons.runway}
            />
            <MetricCard 
                title={t('cashFlowForecastBurnRate')} 
                value={formatCurrency(data.averageBurnRate, language)}
                subtext="/ month"
                icon={icons.burn}
            />
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <motion.div variants={itemVariants} className="rounded-lg p-4 bg-brand-secondary/30 overflow-hidden">
                 <h4 className="text-lg font-bold text-brand-light mb-2">{t('cashFlowForecastMonthlyView')}</h4>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left rtl:text-right text-brand-light">
                         <thead className="text-xs text-brand-text uppercase bg-brand-accent/30">
                            <tr>
                                <th scope="col" className="px-4 py-3">{t('cashFlowForecastMonth')}</th>
                                <th scope="col" className="px-4 py-3">{t('cashFlowForecastInflows')}</th>
                                <th scope="col" className="px-4 py-3">{t('cashFlowForecastOutflows')}</th>
                                <th scope="col" className="px-4 py-3">{t('cashFlowForecastNetFlow')}</th>
                                <th scope="col" className="px-4 py-3">{t('cashFlowForecastEndBalance')}</th>
                            </tr>
                         </thead>
                         <tbody>
                            {data.monthlyForecasts.map(monthData => (
                                 <tr key={monthData.month} className={`border-b border-brand-accent/50 hover:bg-brand-accent/20 ${monthData.endingBalance < 0 ? 'bg-red-900/30' : ''}`}>
                                    <td className="px-4 py-3 font-bold text-brand-text">{monthData.month}</td>
                                    <td className="px-4 py-3 font-mono text-green-400">{formatCurrency(monthData.inflows, language)}</td>
                                    <td className="px-4 py-3 font-mono text-red-400">{formatCurrency(monthData.outflows, language)}</td>
                                    <td className={`px-4 py-3 font-mono ${monthData.netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatCurrency(monthData.netCashFlow, language)}
                                    </td>
                                    <td className={`px-4 py-3 font-mono font-bold ${monthData.endingBalance < 0 ? 'text-red-300' : 'text-brand-text'}`}>
                                        {formatCurrency(monthData.endingBalance, language)}
                                    </td>
                                 </tr>
                            ))}
                         </tbody>
                     </table>
                 </div>
            </motion.div>
        </div>
        <div className="lg:col-span-1">
             <motion.div variants={itemVariants}>
                 <h3 className="text-xl font-bold text-brand-teal mb-4">{t('cashFlowForecastInsights')}</h3>
                 <div className="space-y-3">
                    {data.insights.map((insight, index) => (
                        <div key={index} className="rounded-lg p-4 bg-yellow-500/5">
                             <strong className="font-semibold text-yellow-300 text-sm display-block">{insight.point}</strong>
                             <p className="text-brand-text/80 text-sm mt-1">{insight.explanation}</p>
                        </div>
                    ))}
                 </div>
             </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CashFlowForecastDisplay;