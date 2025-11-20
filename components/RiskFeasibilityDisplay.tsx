import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { RiskFeasibilityData, AnalysisPoint, ResourceEstimate } from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeasibilityScoreCircle: React.FC<{ score: number; summary: string }> = ({ score, summary }) => {
  const { t } = useLanguage();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  const scoreColor = score >= 7 ? 'text-green-400' : score >= 4 ? 'text-yellow-400' : 'text-red-400';

  return (
    <motion.div variants={itemVariants} className="flex flex-col items-center text-center p-4 rounded-lg bg-brand-secondary/30">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 140 140">
          <circle className="text-brand-accent/20" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="70" cy="70" />
          <motion.circle
            className={scoreColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
            transform="rotate(-90 70 70)"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${scoreColor}`}>{score.toFixed(1)}</span>
          <span className="text-sm text-brand-light">/ 10</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-brand-text mt-4">{t('riskFeasibilityScore')}</h3>
      <p className="text-sm text-brand-light max-w-xs mt-1">{summary}</p>
    </motion.div>
  );
};

const RiskCard: React.FC<{ title: string; points: AnalysisPoint[]; icon: React.ReactNode; bgColorClass: string, textColorClass: string }> = ({ title, points, icon, bgColorClass, textColorClass }) => (
  <motion.div variants={itemVariants} className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}>
    <div className="flex items-center mb-3">
      <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>{icon}</span>
      <h3 className={`text-xl font-bold ${textColorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-3 text-brand-text/90 flex-grow">
      {points.map((item, index) => (
        <li key={index} className="text-sm leading-relaxed">
          <strong className="font-semibold text-brand-text/95 display-block">{item.point}</strong>
          <p className="text-brand-text/80">{item.explanation}</p>
        </li>
      ))}
    </ul>
  </motion.div>
);

const ResourceCard: React.FC<{ resource: ResourceEstimate; icon: React.ReactNode }> = ({ resource, icon }) => (
    <motion.div variants={itemVariants} className="rounded-lg p-4 flex flex-col h-full bg-brand-secondary/50 text-center items-center">
        <div className="text-blue-400">{icon}</div>
        <h4 className="text-md font-bold text-brand-light mt-2">{resource.category}</h4>
        <p className="text-2xl font-bold text-brand-text mt-1">{resource.estimate}</p>
        <p className="text-xs text-brand-text/80 mt-1 flex-grow">{resource.explanation}</p>
    </motion.div>
);

const icons = {
  regulatory: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 12h6m-6 5.25h6M5.25 6h.008v.008H5.25V6zm.75 4.5h.008v.008h-.008v-.008zm-.75 4.5h.008v.008H5.25v-.008zm13.5-9h.008v.008h-.008V6zm-.75 4.5h.008v.008h-.008v-.008zm.75 4.5h.008v.008h-.008v-.008z" /></svg>,
  financial: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
  operational: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10M13 16l2 4M13 16H6m11 4l2-4m-2 4h4" /></svg>,
  time: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  capital: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m16.5 0h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m0 0a1.125 1.125 0 00-1.125 1.125v.375m0 0a1.125 1.125 0 01-1.125 1.125H3.75a1.125 1.125 0 01-1.125-1.125v-.375a1.125 1.125 0 00-1.125-1.125m0 0H2.25" /></svg>,
  team: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 3.375c-3.418 0-6.138 1.49-6.138 3.375s2.72 3.375 6.138 3.375 6.138-1.49 6.138-3.375S15.418 3.375 12 3.375z" /></svg>,
};


const RiskFeasibilityDisplay: React.FC<{ data: RiskFeasibilityData }> = ({ data }) => {
    const { t } = useLanguage();
    
    const resourceIcons = {
        Time: icons.time,
        Capital: icons.capital,
        Team: icons.team,
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full space-y-6"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <FeasibilityScoreCircle score={data.feasibilityScore.score} summary={data.feasibilityScore.summary} />
                </div>
                <div className="lg:col-span-2">
                    <motion.div variants={itemVariants}>
                        <h3 className="text-2xl font-bold text-brand-teal mb-4">{t('riskFeasibilityResources')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {data.resourceEstimates.map((res, index) => (
                                <ResourceCard key={index} resource={res} icon={resourceIcons[res.category]}/>
                           ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <RiskCard
                    title={t('riskFeasibilityRegulatory')}
                    points={data.regulatoryRisks}
                    icon={icons.regulatory}
                    bgColorClass="bg-yellow-500/5"
                    textColorClass="text-yellow-400"
                />
                <RiskCard
                    title={t('riskFeasibilityFinancial')}
                    points={data.financialRisks}
                    icon={icons.financial}
                    bgColorClass="bg-red-500/5"
                    textColorClass="text-red-400"
                />
                <RiskCard
                    title={t('riskFeasibilityOperational')}
                    points={data.operationalRisks}
                    icon={icons.operational}
                    bgColorClass="bg-blue-500/5"
                    textColorClass="text-blue-400"
                />
            </div>
        </motion.div>
    );
};

export default RiskFeasibilityDisplay;