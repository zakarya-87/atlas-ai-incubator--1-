import React from 'react';
import { motion, Variants } from 'framer-motion';
import type {
  CustomerValidationData,
  ValidationMetric,
  AdCopy,
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

const MetricCard: React.FC<{ metric: ValidationMetric }> = ({ metric }) => (
  <motion.div
    variants={itemVariants}
    className="rounded-lg p-4 flex flex-col h-full bg-brand-secondary/50 border border-brand-accent/50"
  >
    <h4 className="text-md font-bold text-brand-light">{metric.metric}</h4>
    <p className="text-3xl font-bold text-brand-teal mt-2">{metric.value}</p>
    <p className="text-xs text-brand-text/80 mt-1 flex-grow">
      {metric.explanation}
    </p>
  </motion.div>
);

const AdCard: React.FC<{ ad: AdCopy }> = ({ ad }) => {
  const getPlatformColors = (platform: AdCopy['platform']) => {
    switch (platform) {
      case 'Facebook':
        return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'Google Ads':
        return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'LinkedIn':
        return 'bg-sky-600/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-brand-accent text-brand-text';
    }
  };
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-lg p-4 bg-brand-secondary/50 border border-brand-accent/50"
    >
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold rounded-md border mb-3 ${getPlatformColors(ad.platform)}`}
      >
        {ad.platform}
      </span>
      <h4 className="font-bold text-brand-text/95">{ad.headline}</h4>
      <p className="text-sm text-brand-text/80 mt-1">{ad.body}</p>
    </motion.div>
  );
};

const CustomerValidationDisplay: React.FC<{ data: CustomerValidationData }> = ({
  data,
}) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('validationScorecard' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No customer validation data available.</p>
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
      {/* Scorecard Section */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal mb-4">
          {t('customerValidationScorecard')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data?.validationScorecard || []).map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Landing Page Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-brand-teal mb-4">
              {t('customerValidationLandingPage')}
            </h3>
            <div className="rounded-lg p-6 bg-brand-secondary/30 border-2 border-dashed border-brand-accent/50 space-y-4">
              <div>
                <h4 className="text-lg font-bold text-brand-text">
                  {data?.landingPageCopy?.headline || 'Headline not available'}
                </h4>
                <p className="text-brand-text/80 mt-1">
                  {data?.landingPageCopy?.body || 'Body content not available'}
                </p>
              </div>
              <button
                className="px-5 py-2 bg-brand-teal text-white font-bold rounded-lg shadow-md"
                disabled
              >
                {data?.landingPageCopy?.callToAction || 'Call to Action not available'}
              </button>
            </div>
          </motion.div>

          {/* Ad Copy Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-brand-teal mb-4">
              {t('customerValidationAds')}
            </h3>
            <div className="space-y-4">
              {(data?.adCopy || []).map((ad, index) => (
                <AdCard key={index} ad={ad} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Survey Questions Section */}
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-brand-teal mb-4">
            {t('customerValidationSurvey')}
          </h3>
          <div className="rounded-lg p-6 bg-brand-secondary/30">
            <ul className="space-y-4">
              {(data?.surveyQuestions || []).map((q, index) => (
                <li key={index} className="flex items-start text-sm">
                  <span className="text-brand-teal font-bold mr-3 rtl:ml-3 rtl:mr-0">
                    {index + 1}.
                  </span>
                  <p className="text-brand-text/90">{q}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomerValidationDisplay;
