import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { CompetitorAnalysisData, AnalysisPoint } from '../types';
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
    variants={itemVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
  >
    <div className="flex items-center mb-3">
      <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>{icon}</span>
      <h3 className={`text-xl font-bold ${textColorClass}`}>{title}</h3>
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
  gaps: (
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
        d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.832.168-1.591 1.591M21.75 12h-2.25m-1.668 5.832-1.591-1.591M5.25 12H3m4.232-5.832L6.168 7.832"
      />
    </svg>
  ),
  differentiators: (
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
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
      />
    </svg>
  ),
  risks: (
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

const CompetitorAnalysisDisplay: React.FC<{ data: CompetitorAnalysisData }> = ({
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
  const compData =
    (data as any)?.competitors
      ? (data as any)
      : (data as any)?.competitor_analysis ||
        (data as any)?.competitorAnalysis ||
        (data as any)?.competitive_analysis ||
        (data as any)?.analysis ||
        (data as any)?.data;

  // Handle undefined, null, non-object, or array data gracefully
  if (!compData || typeof compData !== 'object' || Array.isArray(compData)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <DataStructureDebugger data={data} label="Competitor Analysis Data" />
        <div className="text-brand-text/60">
          <p>No competitor analysis data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  // Get competitors with fallbacks
  const competitors = normalizeList(compData.competitors || compData.competitor_list || compData.companies);
  const gaps = normalizeList(compData.gaps || compData.market_gaps || compData.opportunities);
  const differentiators = normalizeList(compData.differentiators || compData.competitive_advantages || compData.advantages);
  const risks = normalizeList(compData.risks || compData.competitive_risks || compData.threats);

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'Direct':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Indirect':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Substitute':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-brand-accent text-brand-text';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      <DataStructureDebugger data={data} label="Competitor Analysis Data" />
      
      {competitors.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-lg p-4 bg-brand-secondary/30 overflow-hidden"
        >
          <h3 className="text-2xl font-bold text-brand-teal mb-4">
            {t('competitorAnalysisMap')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-brand-light">
              <thead className="text-xs text-brand-text uppercase bg-brand-accent/30">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    {t('competitorAnalysisHeaderName')}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t('competitorAnalysisHeaderType')}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t('competitorAnalysisHeaderFeatures')}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t('competitorAnalysisHeaderPricing')}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t('competitorAnalysisHeaderPositioning')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c: any, index: number) => (
                  <motion.tr
                    key={index}
                    variants={itemVariants}
                    className="border-b border-brand-accent/50 hover:bg-brand-accent/20"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-brand-text whitespace-nowrap"
                    >
                      {c.name || c.company || c.title || 'Unknown'}
                    </th>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full border ${getBadgeClass(c.type || c.category || 'Direct')}`}
                      >
                        {c.type || c.category || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{c.features || c.key_features || c.strengths || '-'}</td>
                    <td className="px-6 py-4">{c.pricing || c.price || c.price_range || '-'}</td>
                    <td className="px-6 py-4">{c.positioning || c.market_position || c.description || '-'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {(gaps.length > 0 || differentiators.length > 0 || risks.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {gaps.length > 0 && (
            <SectionCard
              title={t('competitorAnalysisGaps')}
              points={gaps}
              icon={icons.gaps}
              bgColorClass="bg-blue-500/5"
              textColorClass="text-blue-400"
            />
          )}
          {differentiators.length > 0 && (
            <SectionCard
              title={t('competitorAnalysisDifferentiators')}
              points={differentiators}
              icon={icons.differentiators}
              bgColorClass="bg-green-500/5"
              textColorClass="text-green-400"
            />
          )}
          {risks.length > 0 && (
            <SectionCard
              title={t('competitorAnalysisRisks')}
              points={risks}
              icon={icons.risks}
              bgColorClass="bg-red-500/5"
              textColorClass="text-red-400"
            />
          )}
        </div>
      )}

      {/* Fallback: render any other top-level arrays/objects */}
      {competitors.length === 0 && gaps.length === 0 && differentiators.length === 0 && risks.length === 0 && (
        <motion.div variants={itemVariants} className="rounded-lg p-4 bg-brand-secondary/30">
          <h3 className="text-xl font-bold text-brand-teal mb-3">Analysis Results</h3>
          <div className="space-y-3 text-sm text-brand-text/90">
            {Object.entries(compData).map(([key, value]) => {
              if (key === 'id') return null;
              const items = normalizeList(value);
              if (items.length === 0) return null;
              return (
                <div key={key}>
                  <h4 className="font-semibold text-brand-text/95 mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                  <ul className="space-y-1 ml-4">
                    {items.slice(0, 10).map((item: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-brand-teal mr-2">•</span>
                        <span>{typeof item === 'string' ? item : item?.point || item?.title || item?.description || item?.name || JSON.stringify(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CompetitorAnalysisDisplay;
