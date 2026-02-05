import React from 'react';
import { motion } from 'framer-motion';
import type { LeanCanvasData, AnalysisPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';

interface CanvasBlockProps {
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
}

const blockVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const CanvasBlock: React.FC<CanvasBlockProps> = ({
  title,
  points,
  icon,
  bgColorClass,
  textColorClass,
}) => (
  <motion.div
    variants={blockVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass} border border-white/10`}
  >
    <div className="flex items-center mb-3">
      <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>{icon}</span>
      <h3 className={`text-md font-bold ${textColorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-2 text-brand-text/90 flex-grow">
      {(points || []).map((item, index) => (
        <li key={index} className="text-sm leading-relaxed">
          <strong className="font-semibold text-brand-text/95 display-block">
            {item?.point || 'N/A'}
          </strong>
          <p className="text-xs text-brand-text/80">{item?.explanation || 'N/A'}</p>
        </li>
      ))}
    </ul>
  </motion.div>
);

const icons = {
  problem: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  solution: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
  keyMetrics: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  uniqueValueProposition: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  ),
  unfairAdvantage: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  ),
  channels: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  customerSegments: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
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
  costStructure: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
      />
    </svg>
  ),
  revenueStreams: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
      />
    </svg>
  ),
};

interface LeanCanvasDisplayProps {
  data: LeanCanvasData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const LeanCanvasDisplay: React.FC<LeanCanvasDisplayProps> = ({ data }) => {
  const { t } = useLanguage();

  const blocks: {
    key: keyof LeanCanvasData;
    titleKey: TranslationKey;
    icon: React.ReactNode;
    colors: string[];
  }[] = [
    {
      key: 'problem',
      titleKey: 'leanCanvasProblem',
      icon: icons.problem,
      colors: ['bg-red-500/10', 'text-red-400'],
    },
    {
      key: 'solution',
      titleKey: 'leanCanvasSolution',
      icon: icons.solution,
      colors: ['bg-green-500/10', 'text-green-400'],
    },
    {
      key: 'keyMetrics',
      titleKey: 'leanCanvasKeyMetrics',
      icon: icons.keyMetrics,
      colors: ['bg-blue-500/10', 'text-blue-400'],
    },
    {
      key: 'uniqueValueProposition',
      titleKey: 'leanCanvasUniqueValueProposition',
      icon: icons.uniqueValueProposition,
      colors: ['bg-teal-500/10', 'text-teal-400'],
    },
    {
      key: 'unfairAdvantage',
      titleKey: 'leanCanvasUnfairAdvantage',
      icon: icons.unfairAdvantage,
      colors: ['bg-yellow-500/10', 'text-yellow-400'],
    },
    {
      key: 'channels',
      titleKey: 'leanCanvasChannels',
      icon: icons.channels,
      colors: ['bg-purple-500/10', 'text-purple-400'],
    },
    {
      key: 'customerSegments',
      titleKey: 'leanCanvasCustomerSegments',
      icon: icons.customerSegments,
      colors: ['bg-pink-500/10', 'text-pink-400'],
    },
    {
      key: 'costStructure',
      titleKey: 'leanCanvasCostStructure',
      icon: icons.costStructure,
      colors: ['bg-orange-500/10', 'text-orange-400'],
    },
    {
      key: 'revenueStreams',
      titleKey: 'leanCanvasRevenueStreams',
      icon: icons.revenueStreams,
      colors: ['bg-lime-500/10', 'text-lime-400'],
    },
  ];

  const gridOrder: Record<string, string> = {
    problem: 'md:col-span-2',
    solution: 'md:col-span-2',
    keyMetrics: 'md:col-span-2',
    uniqueValueProposition:
      'md:col-span-2 row-span-2 flex items-center justify-center text-center',
    unfairAdvantage: 'md:col-span-2',
    channels: 'md:col-span-2',
    customerSegments: 'md:col-span-2',
    costStructure: 'md:col-span-3',
    revenueStreams: 'md:col-span-3',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className={gridOrder['problem']}>
          <CanvasBlock
            title={t(blocks[0].titleKey)}
            points={data.problem}
            icon={blocks[0].icon}
            bgColorClass={blocks[0].colors[0]}
            textColorClass={blocks[0].colors[1]}
          />
        </div>
        <div className={gridOrder['solution']}>
          <CanvasBlock
            title={t(blocks[1].titleKey)}
            points={data.solution}
            icon={blocks[1].icon}
            bgColorClass={blocks[1].colors[0]}
            textColorClass={blocks[1].colors[1]}
          />
        </div>
        <div className={gridOrder['uniqueValueProposition']}>
          <CanvasBlock
            title={t(blocks[3].titleKey)}
            points={data.uniqueValueProposition}
            icon={blocks[3].icon}
            bgColorClass={blocks[3].colors[0]}
            textColorClass={blocks[3].colors[1]}
          />
        </div>
        <div className={gridOrder['keyMetrics']}>
          <CanvasBlock
            title={t(blocks[2].titleKey)}
            points={data.keyMetrics}
            icon={blocks[2].icon}
            bgColorClass={blocks[2].colors[0]}
            textColorClass={blocks[2].colors[1]}
          />
        </div>
        <div className={gridOrder['unfairAdvantage']}>
          <CanvasBlock
            title={t(blocks[4].titleKey)}
            points={data.unfairAdvantage}
            icon={blocks[4].icon}
            bgColorClass={blocks[4].colors[0]}
            textColorClass={blocks[4].colors[1]}
          />
        </div>
        <div className={gridOrder['channels']}>
          <CanvasBlock
            title={t(blocks[5].titleKey)}
            points={data.channels}
            icon={blocks[5].icon}
            bgColorClass={blocks[5].colors[0]}
            textColorClass={blocks[5].colors[1]}
          />
        </div>
        <div className={gridOrder['customerSegments']}>
          <CanvasBlock
            title={t(blocks[6].titleKey)}
            points={data.customerSegments}
            icon={blocks[6].icon}
            bgColorClass={blocks[6].colors[0]}
            textColorClass={blocks[6].colors[1]}
          />
        </div>
        <div className={gridOrder['costStructure']}>
          <CanvasBlock
            title={t(blocks[7].titleKey)}
            points={data.costStructure}
            icon={blocks[7].icon}
            bgColorClass={blocks[7].colors[0]}
            textColorClass={blocks[7].colors[1]}
          />
        </div>
        <div className={gridOrder['revenueStreams']}>
          <CanvasBlock
            title={t(blocks[8].titleKey)}
            points={data.revenueStreams}
            icon={blocks[8].icon}
            bgColorClass={blocks[8].colors[0]}
            textColorClass={blocks[8].colors[1]}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LeanCanvasDisplay;
