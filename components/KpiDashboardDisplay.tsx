import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { KpiDashboardData, Kpi } from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const KpiCard: React.FC<{ kpi: Kpi }> = ({ kpi }) => {
    // A simple heuristic to determine if the KPI is good, neutral, or bad
    // This could be made more robust in a real application
    const insightLower = kpi.insight.toLowerCase();
    let insightColorClass = 'text-yellow-400';
    let icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
    
    if (insightLower.includes('strong') || insightLower.includes('healthy') || insightLower.includes('excellent')) {
        insightColorClass = 'text-green-400';
        icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    } else if (insightLower.includes('high') || insightLower.includes('low') || insightLower.includes('warning') || insightLower.includes('optimize')) {
        insightColorClass = 'text-red-400';
        icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
    }

    return (
        <motion.div variants={itemVariants} className="rounded-lg p-4 flex flex-col h-full bg-brand-secondary/50 border border-brand-accent/50">
            <h4 className="text-md font-bold text-brand-light">{kpi.name}</h4>
            <p className="text-3xl font-bold text-brand-text mt-2">{kpi.value}</p>
            <p className="text-xs text-brand-text/70 mt-1">Benchmark: {kpi.benchmark}</p>
            <div className={`flex items-start mt-3 pt-3 border-t border-brand-accent/30 ${insightColorClass}`}>
                 <div className="flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2 mt-0.5">{icon}</div>
                <p className="text-xs font-semibold">{kpi.insight}</p>
            </div>
        </motion.div>
    );
};

const KpiDashboardDisplay: React.FC<{ data: KpiDashboardData }> = ({ data }) => {
  const { t } = useLanguage();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full space-y-6">
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal mb-4">{t('kpiDashboardTitle')}</h3>
      </motion.div>
      
      <motion.div variants={itemVariants} className="rounded-lg p-4 bg-brand-secondary/30">
        <h4 className="text-xl font-bold text-brand-light mb-2">{t('kpiDashboardExecutiveSummary')}</h4>
        <p className="text-brand-text/90">{data.executiveSummary}</p>
      </motion.div>
      
      <motion.div variants={containerVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.kpis.map((kpi, index) => (
            <KpiCard key={index} kpi={kpi} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default KpiDashboardDisplay;