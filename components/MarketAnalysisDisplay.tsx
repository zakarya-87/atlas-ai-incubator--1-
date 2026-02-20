import React from 'react';
import { motion } from 'framer-motion';
import type { MarketAnalysisData, AnalysisPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';

interface SectionCardProps {
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  points,
  icon,
  bgColorClass,
  textColorClass,
}) => (
  <motion.div
    variants={cardVariants}
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
  targetAudience: (
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
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.663M12 3.375c-3.418 0-6.138 1.49-6.138 3.375s2.72 3.375 6.138 3.375 6.138-1.49 6.138-3.375S15.418 3.375 12 3.375Z"
      />
    </svg>
  ),
  marketSize: (
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
        d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-12a2.25 2.25 0 0 1-2.25-2.25V3.75m16.5 0v16.5M3.75 16.5v4.5m0 0h16.5"
      />
    </svg>
  ),
  competitors: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M12 3a4 4 0 0 1 4 4v2H8V7a4 4 0 0 1 4-4Z" />
      <path d="M20.5 13.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
      <path d="M3.5 13.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" />
    </svg>
  ),
};

interface MarketAnalysisDisplayProps {
  data: MarketAnalysisData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const MarketAnalysisDisplay: React.FC<MarketAnalysisDisplayProps> = ({
  data,
}) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('targetAudience' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No market analysis data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  const sections: {
    key: keyof MarketAnalysisData;
    titleKey: TranslationKey;
    icon: React.ReactNode;
    colors: string[];
  }[] = [
    {
      key: 'targetAudience',
      titleKey: 'marketTargetAudience',
      icon: icons.targetAudience,
      colors: ['bg-blue-500/5', 'text-blue-400'],
    },
    {
      key: 'marketSizeAndTrends',
      titleKey: 'marketSizeAndTrends',
      icon: icons.marketSize,
      colors: ['bg-green-500/5', 'text-green-400'],
    },
    {
      key: 'competitorLandscape',
      titleKey: 'marketCompetitorLandscape',
      icon: icons.competitors,
      colors: ['bg-yellow-500/5', 'text-yellow-400'],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {sections.map((sec) => (
          <SectionCard
            key={sec.key}
            title={t(sec.titleKey)}
            points={data[sec.key]}
            icon={sec.icon}
            bgColorClass={sec.colors[0]}
            textColorClass={sec.colors[1]}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default MarketAnalysisDisplay;
