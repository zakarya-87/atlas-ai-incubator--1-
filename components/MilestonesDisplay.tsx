import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { MilestonesData, SmartAlert } from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AlertCard: React.FC<{ alert: SmartAlert }> = ({ alert }) => {
    const getSeverityClasses = (severity: SmartAlert['severity']) => {
        switch (severity) {
            case 'High': return { border: 'border-red-500/50', text: 'text-red-400', bg: 'bg-red-900/10' };
            case 'Medium': return { border: 'border-yellow-500/50', text: 'text-yellow-400', bg: 'bg-yellow-900/10' };
            case 'Low': return { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-900/10' };
            default: return { border: 'border-brand-accent', text: 'text-brand-light', bg: 'bg-brand-secondary' };
        }
    };
    const { border, text, bg } = getSeverityClasses(alert.severity);

    return (
        <motion.div variants={itemVariants} className={`p-4 rounded-lg border-l-4 ${border} ${bg}`}>
            <div className="flex justify-between items-start">
                 <h4 className={`font-bold ${text}`}>{alert.alert}</h4>
                 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${text} ${bg}`}>{alert.severity}</span>
            </div>
            <p className="text-sm text-brand-text/80 mt-2">{alert.recommendation}</p>
        </motion.div>
    );
};

const MilestonesDisplay: React.FC<{ data: MilestonesData }> = ({ data }) => {
  const { t } = useLanguage();
  const quarters = [1, 2, 3, 4];
  const milestonesByQuarter = quarters.map(q => ({
      quarter: q,
      milestones: data.milestones.filter(m => m.quarter === q)
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold text-brand-teal mb-4">{t('milestonesRoadmap')}</h3>
                <div className="space-y-4">
                     {milestonesByQuarter.map(({ quarter, milestones }) => (
                         milestones.length > 0 && (
                            <div key={quarter} className="relative pl-8 rtl:pl-0 rtl:pr-8">
                                <div className="absolute -left-2 rtl:right-auto rtl:-right-2 top-2 h-4 w-4 bg-brand-teal rounded-full border-4 border-brand-primary"></div>
                                <div className="absolute top-4 bottom-0 left-0 rtl:left-auto rtl:right-0 w-0.5 bg-brand-accent/30"></div>
                                <h4 className="text-lg font-bold text-brand-light mb-2">Quarter {quarter}</h4>
                                <div className="space-y-3 pl-2 rtl:pl-0 rtl:pr-2">
                                {milestones.map((m, index) => (
                                    <div key={index} className="p-3 rounded-lg bg-brand-secondary/30">
                                         <strong className="font-semibold text-brand-text/95 text-sm display-block">{m.point}</strong>
                                         <p className="text-brand-text/80 text-sm mt-1">{m.explanation}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                         )
                     ))}
                </div>
            </motion.div>
        </div>
        <div className="lg:col-span-1">
             <motion.div variants={itemVariants}>
                 <h3 className="text-2xl font-bold text-brand-teal mb-4">{t('milestonesSmartAlerts')}</h3>
                 <div className="space-y-4">
                    {data.smartAlerts.map((alert, index) => (
                        <AlertCard key={index} alert={alert} />
                    ))}
                 </div>
             </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MilestonesDisplay;