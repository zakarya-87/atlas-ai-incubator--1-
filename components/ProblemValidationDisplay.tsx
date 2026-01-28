import React from 'react';
import { motion, Variants } from 'framer-motion';
import type {
  ProblemValidationData,
  AnalysisPoint,
  MarketSizePoint,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface MarketSizeCardProps {
  title: string;
  data: MarketSizePoint;
  bgColorClass: string;
  textColorClass: string;
}

const MarketSizeCard: React.FC<MarketSizeCardProps> = ({
  title,
  data,
  bgColorClass,
  textColorClass,
}) => (
  <motion.div
    variants={cardVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
  >
    <h3 className={`text-md font-bold ${textColorClass}`}>{title}</h3>
    <p className="text-3xl font-bold text-brand-text mt-2">{data.value}</p>
    <p className="text-xs text-brand-text/80 mt-1 flex-grow">
      {data.explanation}
    </p>
  </motion.div>
);

interface SectionCardProps {
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
}

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
  segments: (
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
  significance: (
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  ),
};

interface ProblemValidationDisplayProps {
  data: ProblemValidationData;
}

const ProblemValidationDisplay: React.FC<ProblemValidationDisplayProps> = ({
  data,
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-4"
    >
      <motion.div
        variants={cardVariants}
        className="rounded-lg p-4 bg-brand-secondary/30"
      >
        <h3 className="text-xl font-bold text-brand-teal mb-3">
          {t('problemValidationMarketSize')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MarketSizeCard
            title={t('problemValidationTAM')}
            data={data.marketSize.tam}
            bgColorClass="bg-blue-500/10"
            textColorClass="text-blue-400"
          />
          <MarketSizeCard
            title={t('problemValidationSAM')}
            data={data.marketSize.sam}
            bgColorClass="bg-teal-500/10"
            textColorClass="text-teal-400"
          />
          <MarketSizeCard
            title={t('problemValidationSOM')}
            data={data.marketSize.som}
            bgColorClass="bg-green-500/10"
            textColorClass="text-green-400"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title={t('problemValidationCustomerSegments')}
          points={data.customerSegments}
          icon={icons.segments}
          bgColorClass="bg-purple-500/5"
          textColorClass="text-purple-400"
        />
        <SectionCard
          title={t('problemValidationProblemSignificance')}
          points={data.problemSignificance}
          icon={icons.significance}
          bgColorClass="bg-yellow-500/5"
          textColorClass="text-yellow-400"
        />
      </div>
    </motion.div>
  );
};

export default ProblemValidationDisplay;
