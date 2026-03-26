import React from 'react';
import { motion } from 'framer-motion';
import type { MarketResearchData, AnalysisPoint } from '../types';
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
  drivers: (
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
  behavior: (
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
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.117 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.117 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  ),
  barriers: (
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
        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  ),
};

interface MarketResearchDisplayProps {
  data: MarketResearchData;
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

const MarketResearchDisplay: React.FC<MarketResearchDisplayProps> = ({
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
          <p>No market research data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  const sections: {
    key: keyof MarketResearchData;
    titleKey: TranslationKey;
    icon: React.ReactNode;
    colors: string[];
  }[] = [
    {
      key: 'marketDrivers',
      titleKey: 'marketResearchDrivers',
      icon: icons.drivers,
      colors: ['bg-green-500/5', 'text-green-400'],
    },
    {
      key: 'customerBehavior',
      titleKey: 'marketResearchCustomerBehavior',
      icon: icons.behavior,
      colors: ['bg-blue-500/5', 'text-blue-400'],
    },
    {
      key: 'barriersToEntry',
      titleKey: 'marketResearchBarriersToEntry',
      icon: icons.barriers,
      colors: ['bg-red-500/5', 'text-red-400'],
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
            points={data[sec.key] || []}
            icon={sec.icon}
            bgColorClass={sec.colors[0]}
            textColorClass={sec.colors[1]}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default MarketResearchDisplay;
