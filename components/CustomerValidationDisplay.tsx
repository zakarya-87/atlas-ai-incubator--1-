import React from 'react';
import { motion, Variants } from 'framer-motion';
import type {
  CustomerValidationData,
  ValidationMetric,
  AdCopy,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import DataStructureDebugger from './DataStructureDebugger';

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

  // Helper to normalize list items
  const normalizeList = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') {
      if (Array.isArray((value as any).items)) return (value as any).items;
      if (Array.isArray((value as any).list)) return (value as any).list;
      return Object.values(value).filter(Boolean);
    }
    return [value];
  };

  // Extract nested data from various possible structures
  const custData =
    (data as any)?.validationScorecard
      ? (data as any)
      : (data as any)?.customer_validation ||
        (data as any)?.customerValidation ||
        (data as any)?.validation ||
        (data as any)?.data;

  // Handle undefined, null, non-object, or array data gracefully
  if (!custData || typeof custData !== 'object' || Array.isArray(custData)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <DataStructureDebugger data={data} label="Customer Validation Data" />
        <div className="text-brand-text/60">
          <p>No customer validation data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  // Get data with fallbacks
  const scorecard = normalizeList(custData.validationScorecard || custData.validation_scorecard || custData.scorecard || custData.metrics);
  const landingPageCopy = custData.landingPageCopy || custData.landing_page_copy || custData.landing_page || {};
  const adCopy = normalizeList(custData.adCopy || custData.ad_copy || custData.ads);
  const surveyQuestions = normalizeList(custData.surveyQuestions || custData.survey_questions || custData.questions);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      <DataStructureDebugger data={data} label="Customer Validation Data" />
      
      {/* Scorecard Section */}
      {scorecard.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-brand-teal mb-4">
            {t('customerValidationScorecard')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scorecard.map((metric: any, index: number) => (
              <MetricCard key={index} metric={{
                metric: metric.metric || metric.name || metric.title || `Metric ${index + 1}`,
                value: metric.value || metric.score || 'N/A',
                explanation: metric.explanation || metric.description || ''
              }} />
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Landing Page Section */}
          {(landingPageCopy.headline || landingPageCopy.body || landingPageCopy.callToAction) && (
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-brand-teal mb-4">
                {t('customerValidationLandingPage')}
              </h3>
              <div className="rounded-lg p-6 bg-brand-secondary/30 border-2 border-dashed border-brand-accent/50 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-brand-text">
                    {landingPageCopy?.headline || 'Headline not available'}
                  </h4>
                  <p className="text-brand-text/80 mt-1">
                    {landingPageCopy?.body || 'Body content not available'}
                  </p>
                </div>
                <button
                  className="px-5 py-2 bg-brand-teal text-white font-bold rounded-lg shadow-md"
                  disabled
                >
                  {landingPageCopy?.callToAction || landingPageCopy?.call_to_action || 'Call to Action not available'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Ad Copy Section */}
          {adCopy.length > 0 && (
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-brand-teal mb-4">
                {t('customerValidationAds')}
              </h3>
              <div className="space-y-4">
                {adCopy.map((ad: any, index: number) => (
                  <AdCard key={index} ad={{
                    platform: ad.platform || 'General',
                    headline: ad.headline || ad.title || 'Ad headline',
                    body: ad.body || ad.description || ad.text || ''
                  }} />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Survey Questions Section */}
        {surveyQuestions.length > 0 && (
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-brand-teal mb-4">
              {t('customerValidationSurvey')}
            </h3>
            <div className="rounded-lg p-6 bg-brand-secondary/30">
              <ul className="space-y-4">
                {surveyQuestions.map((q: any, index: number) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-brand-teal font-bold mr-3 rtl:ml-3 rtl:mr-0">
                      {index + 1}.
                    </span>
                    <p className="text-brand-text/90">{typeof q === 'string' ? q : q.question || q.text || JSON.stringify(q)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fallback: render any other top-level data */}
      {scorecard.length === 0 && adCopy.length === 0 && surveyQuestions.length === 0 && !landingPageCopy.headline && (
        <motion.div variants={itemVariants} className="rounded-lg p-4 bg-brand-secondary/30">
          <h3 className="text-xl font-bold text-brand-teal mb-3">Analysis Results</h3>
          <div className="space-y-3 text-sm text-brand-text/90">
            {Object.entries(custData).map(([key, value]) => {
              if (key === 'id') return null;
              const items = normalizeList(value);
              if (items.length === 0 && typeof value !== 'object') return null;
              return (
                <div key={key}>
                  <h4 className="font-semibold text-brand-text/95 mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                  {typeof value === 'object' && !Array.isArray(value) ? (
                    <pre className="text-xs bg-brand-primary/30 p-2 rounded overflow-auto">{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    <ul className="space-y-1 ml-4">
                      {items.slice(0, 10).map((item: any, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-brand-teal mr-2">•</span>
                          <span>{typeof item === 'string' ? item : item?.point || item?.title || item?.description || JSON.stringify(item)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomerValidationDisplay;
