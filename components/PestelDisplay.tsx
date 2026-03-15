import React from 'react';
import { motion } from 'framer-motion';
import type { PestelData, AnalysisPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';

interface PestelQuadrantProps {
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
}

const quadrantVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PestelQuadrant: React.FC<PestelQuadrantProps> = ({
  title,
  points,
  icon,
  bgColorClass,
  textColorClass,
}) => (
  <motion.div
    variants={quadrantVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
  >
    <div className="flex items-center mb-3">
      <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>{icon}</span>
      <h3 className={`text-lg font-bold ${textColorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-3 text-brand-text/90 flex-grow">
      {(points || []).map((item, index) => (
        <li key={index} className="text-sm leading-relaxed">
          <strong className="font-semibold text-brand-text/95 display-block">
            {item?.point || 'N/A'}
          </strong>
          <p className="text-brand-text/80">{item?.explanation || ''}</p>
        </li>
      ))}
    </ul>
  </motion.div>
);

const icons = {
  political: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
      />
    </svg>
  ),
  economic: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  ),
  social: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  technological: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    </svg>
  ),
  environmental: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.757 15.243l.001-.001M21.055 11H19a2 2 0 00-2 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 00-2-2h-1.945M12 7.243l.001-.001M16.243 11.243l-.001.001M12 11.243l.001-.001"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  legal: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 12h6m-6 5.25h6M5.25 6h.008v.008H5.25V6zm.75 4.5h.008v.008h-.008v-.008zm-.75 4.5h.008v.008H5.25v-.008zm13.5-9h.008v.008h-.008V6zm-.75 4.5h.008v.008h-.008v-.008zm.75 4.5h.008v.008h-.008v-.008z"
      />
    </svg>
  ),
};

interface PestelDisplayProps {
  data: PestelData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const PestelDisplay: React.FC<PestelDisplayProps> = ({ data }) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('political' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No PESTEL analysis data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  const quadrants: {
    key: keyof PestelData;
    titleKey: TranslationKey;
    icon: React.ReactNode;
    colors: string[];
  }[] = [
    {
      key: 'political',
      titleKey: 'pestelPolitical',
      icon: icons.political,
      colors: ['bg-red-500/5', 'text-red-400'],
    },
    {
      key: 'economic',
      titleKey: 'pestelEconomic',
      icon: icons.economic,
      colors: ['bg-green-500/5', 'text-green-400'],
    },
    {
      key: 'social',
      titleKey: 'pestelSocial',
      icon: icons.social,
      colors: ['bg-yellow-500/5', 'text-yellow-400'],
    },
    {
      key: 'technological',
      titleKey: 'pestelTechnological',
      icon: icons.technological,
      colors: ['bg-blue-500/5', 'text-blue-400'],
    },
    {
      key: 'environmental',
      titleKey: 'pestelEnvironmental',
      icon: icons.environmental,
      colors: ['bg-teal-500/5', 'text-teal-400'],
    },
    {
      key: 'legal',
      titleKey: 'pestelLegal',
      icon: icons.legal,
      colors: ['bg-indigo-500/5', 'text-indigo-400'],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quadrants.map((q) => (
          <PestelQuadrant
            key={q.key}
            title={t(q.titleKey)}
            points={(data as any)[q.key] || []}
            icon={q.icon}
            bgColorClass={q.colors[0]}
            textColorClass={q.colors[1]}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PestelDisplay;
