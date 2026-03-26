import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { ExpansionStrategyData, AnalysisPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SectionCard: React.FC<{
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
}> = ({ title, points, icon, bgColorClass, textColorClass }) => (
  <motion.div
    variants={itemVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
  >
    <div className="flex items-center mb-3">
      <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>{icon}</span>
      <h3 className={`text-xl font-bold ${textColorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-3 text-brand-text/90 flex-grow">
      {points.map((item, index) => (
        <li key={index} className="text-sm leading-relaxed">
          <strong className="font-semibold text-brand-text/95 display-block">
            {item.point}
          </strong>
          <p className="text-brand-text/80">{item.explanation}</p>
        </li>
      ))}
    </ul>
  </motion.div>
);

const icons = {
  strategy: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  ),
  market: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c1.35 0 2.463-.536 3.388-1.416M12 21c-1.35 0-2.463-.536-3.388-1.416M3.171 8.067c.211.211.434.414.67.608M3.171 8.067c-.211.211-.434.414-.67.608M3.171 8.067c.446.446.93.848 1.444 1.211M3.171 8.067a9.002 9.002 0 0 1 17.658 0M20.829 8.067c.211.211.434.414.67.608m-18.328 0c.446.446.93.848 1.444 1.211m15.44-1.211c-.211.211-.434.414-.67.608m1.34-1.211c-.446.446-.93.848-1.444 1.211M12 3c1.35 0 2.463.536 3.388 1.416M12 3c-1.35 0-2.463.536-3.388-1.416"
      />
    </svg>
  ),
  modeling: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
      />
    </svg>
  ),
  partnerships: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.286 5.446A4.5 4.5 0 0 1 7.286 15H6.5A4.5 4.5 0 0 1 2 10.5V10c0-1.242.414-2.395 1.13-3.322m13.235 4.346A4.5 4.5 0 0 0 17.5 10.5h.721a9.043 9.043 0 0 0-4.436-3.483m-3.442 3.483a4.5 4.5 0 0 0-4.286-2.722M7.286 15a4.5 4.5 0 0 0-4.286 2.722"
      />
    </svg>
  ),
};

const ExpansionStrategyDisplay: React.FC<{ data: ExpansionStrategyData }> = ({
  data,
}) => {
  const { t } = useLanguage();

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No expansion strategy data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  const sections = [
    {
      key: 'marketExpansionSuggestions',
      titleKey: 'expansionStrategyMarket',
      icon: icons.market,
      colors: ['bg-blue-500/5', 'text-blue-400'],
    },
    {
      key: 'predictiveModelingInsights',
      titleKey: 'expansionStrategyModeling',
      icon: icons.modeling,
      colors: ['bg-green-500/5', 'text-green-400'],
    },
    {
      key: 'partnershipRecommendations',
      titleKey: 'expansionStrategyPartnerships',
      icon: icons.partnerships,
      colors: ['bg-yellow-500/5', 'text-yellow-400'],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="rounded-lg p-6 bg-brand-secondary/30 text-center border-2 border-dashed border-brand-teal/50"
      >
        <div className="flex items-center justify-center mb-3">
          <span className="mr-3 rtl:ml-3 rtl:mr-0 text-brand-teal">
            {icons.strategy}
          </span>
          <h3 className="text-2xl font-bold text-brand-teal">
            {t('expansionStrategyRecommended')}
          </h3>
        </div>
        <p className="text-xl font-bold text-brand-text/95">
          {data.recommendedStrategy.strategyName}
        </p>
        <p className="text-brand-text/80 mt-2 max-w-2xl mx-auto">
          {data.recommendedStrategy.justification}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {sections.map((sec) => (
          <SectionCard
            key={sec.key}
            title={t(sec.titleKey as any)}
            points={(data[sec.key as keyof typeof data] as AnalysisPoint[]) || []}
            icon={sec.icon}
            bgColorClass={sec.colors[0]}
            textColorClass={sec.colors[1]}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ExpansionStrategyDisplay;
