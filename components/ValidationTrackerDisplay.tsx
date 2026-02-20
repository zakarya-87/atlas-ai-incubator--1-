import React from 'react';
import { motion, Variants } from 'framer-motion';
import type {
  ValidationTrackerData,
  ValidationTrackerMetric,
  CompetitorActivity,
  EmergingTrend,
  FundingInsight,
} from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({
  trend,
}) => {
  if (trend === 'up')
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-green-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  if (trend === 'down')
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-red-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 10.586V14a1 1 0 102 0v-3.414l1.293 1.293a1 1 0 001.414-1.414l-3-3z"
          clipRule="evenodd"
        />
      </svg>
    );
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-yellow-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const MetricCard: React.FC<{ metric: ValidationTrackerMetric }> = ({
  metric,
}) => (
  <motion.div
    variants={itemVariants}
    className="rounded-lg p-4 flex flex-col h-full bg-brand-secondary/50 border border-brand-accent/50"
  >
    <div className="flex items-center justify-between">
      <h4 className="text-md font-bold text-brand-light">{metric.metric}</h4>
      <TrendIcon trend={metric.trend} />
    </div>
    <p className="text-3xl font-bold text-brand-text mt-2">{metric.value}</p>
    <p className="text-xs text-brand-text/80 mt-1 flex-grow">
      {metric.explanation}
    </p>
  </motion.div>
);

const ImpactBadge: React.FC<{ impact: 'High' | 'Medium' | 'Low' }> = ({
  impact,
}) => {
  const getImpactClass = () => {
    switch (impact) {
      case 'High':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-brand-accent text-brand-text';
    }
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full border ${getImpactClass()}`}
    >
      {impact}
    </span>
  );
};

const ValidationTrackerDisplay: React.FC<{ data: ValidationTrackerData }> = ({
  data,
}) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('keyMetrics' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No validation tracker data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      {/* Metrics Dashboard */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal mb-4">
          {t('validationTrackerKeyMetrics')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.keyMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </motion.div>

      {/* Intelligence Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitor Activity */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-brand-teal mb-4">
            {t('validationTrackerCompetitorActivity')}
          </h3>
          <div className="space-y-3">
            {data.recentCompetitorActivity.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-brand-secondary/40">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-brand-text/95 text-sm">
                    {item.competitorName}
                  </p>
                  <p className="text-xs text-brand-light flex-shrink-0 ml-2">
                    {item.date}
                  </p>
                </div>
                <p className="text-sm text-brand-text/80 mt-1">
                  {item.activity}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Emerging Trends */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-brand-teal mb-4">
            {t('validationTrackerEmergingTrends')}
          </h3>
          <div className="space-y-3">
            {data.emergingTrends.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-brand-secondary/40">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-brand-text/95 text-sm">
                    {item.trend}
                  </p>
                  <ImpactBadge impact={item.impact} />
                </div>
                <p className="text-sm text-brand-text/80 mt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Funding Insights */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-brand-teal mb-4">
            {t('validationTrackerFundingInsights')}
          </h3>
          <div className="space-y-3">
            {data.fundingInsights.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-brand-secondary/40">
                <p className="font-bold text-brand-text/95 text-sm">
                  {item.insight}
                </p>
                <p className="text-sm text-brand-text/80 mt-1">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ValidationTrackerDisplay;
