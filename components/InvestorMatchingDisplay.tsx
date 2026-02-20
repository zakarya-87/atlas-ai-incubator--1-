import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvestorMatchingData, InvestorProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const InvestorMatchingDisplay: React.FC<{ data: InvestorMatchingData }> = ({
  data,
}) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('investors' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No investor matching data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }
  const [selectedInvestor, setSelectedInvestor] =
    useState<InvestorProfile | null>(null);

  // State for filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Memoize filters and sorted results
  const uniqueTypes = useMemo(
    () => ['all', ...Array.from(new Set(data.investors.map((i) => i.type)))],
    [data.investors]
  );
  const uniqueStages = useMemo(
    () => [
      'all',
      ...Array.from(new Set(data.investors.map((i) => i.investmentStage))),
    ],
    [data.investors]
  );

  const filteredAndSortedInvestors = useMemo(() => {
    let result = [...data.investors];

    if (typeFilter !== 'all') {
      result = result.filter((i) => i.type === typeFilter);
    }
    if (stageFilter !== 'all') {
      result = result.filter((i) => i.investmentStage === stageFilter);
    }
    if (sectorFilter.trim() !== '') {
      const lowerSectorFilter = sectorFilter.toLowerCase();
      result = result.filter((i) =>
        i.sectorFocus.some((s) => s.toLowerCase().includes(lowerSectorFilter))
      );
    }

    result.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.alignmentScore - a.alignmentScore
        : a.alignmentScore - b.alignmentScore;
    });

    return result;
  }, [data.investors, typeFilter, stageFilter, sectorFilter, sortOrder]);

  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Failed to copy text: ', err));
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal mb-4">
          {t('investorMatchingTitle')}
        </h3>
      </motion.div>

      {/* Filter Controls */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-brand-secondary/30 rounded-lg space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4"
      >
        <h4 className="text-lg font-bold text-brand-light flex-shrink-0">
          {t('investorMatchingFilters')}
        </h4>
        <div className="grid grid-cols-2 md:flex md:items-center gap-4 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-brand-primary/50 border border-brand-accent rounded-md px-2 py-1.5 text-sm focus:ring-brand-teal focus:border-brand-teal"
          >
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? t('investorMatchingFilterType') : type}
              </option>
            ))}
          </select>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full bg-brand-primary/50 border border-brand-accent rounded-md px-2 py-1.5 text-sm focus:ring-brand-teal focus:border-brand-teal"
          >
            {uniqueStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage === 'all' ? t('investorMatchingFilterStage') : stage}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            placeholder={t('investorMatchingFilterSector')}
            className="col-span-2 w-full bg-brand-primary/50 border border-brand-accent rounded-md px-2 py-1.5 text-sm placeholder-brand-accent focus:ring-brand-teal focus:border-brand-teal"
          />
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="col-span-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-brand-accent/50 hover:bg-brand-accent/80 rounded-md text-sm"
          >
            {t('investorMatchingSortByAlignment')}
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </motion.div>

      {/* Investor List */}
      <motion.div variants={itemVariants} className="overflow-hidden">
        <div className="space-y-4">
          {filteredAndSortedInvestors.length > 0 ? (
            filteredAndSortedInvestors.map((investor, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-brand-secondary/40 rounded-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
              >
                <div className="md:col-span-5">
                  <p className="font-bold text-lg text-brand-text">
                    {investor.name}
                  </p>
                  <p className="text-sm text-brand-light">{investor.type}</p>
                  <p className="text-xs text-brand-accent mt-1">
                    {investor.location}
                  </p>
                </div>
                <div className="md:col-span-4">
                  <p className="text-sm">
                    <span className="font-semibold text-brand-light">
                      Stage:
                    </span>{' '}
                    {investor.investmentStage}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-brand-light">
                      Ticket:
                    </span>{' '}
                    {investor.ticketSize}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {investor.sectorFocus.map((s) => (
                      <span
                        key={s}
                        className="bg-brand-teal/20 text-brand-teal text-xs font-semibold px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-3 flex flex-col items-center md:items-end text-center md:text-right">
                  <div className="text-3xl font-bold text-brand-teal">
                    {investor.alignmentScore}
                    <span className="text-lg text-brand-light">/100</span>
                  </div>
                  <p className="text-xs text-brand-light italic mb-2">
                    {investor.reasoning}
                  </p>
                  <button
                    onClick={() => setSelectedInvestor(investor)}
                    className="px-3 py-1.5 bg-brand-accent hover:bg-brand-light text-white font-bold rounded-md shadow-sm transition-all text-sm w-full md:w-auto"
                  >
                    {t('investorMatchingOutreachButton')}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-brand-light bg-brand-secondary/30 rounded-lg">
              {t('investorMatchingNoResults')}
            </div>
          )}
        </div>
      </motion.div>

      {/* Outreach Modal */}
      <AnimatePresence>
        {selectedInvestor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInvestor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-secondary rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-brand-accent flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h4 className="text-xl font-bold text-brand-teal">
                  {t('investorMatchingOutreachTitle')}
                </h4>
                <button
                  onClick={() => setSelectedInvestor(null)}
                  className="text-brand-light hover:text-white text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2">
                <div className="bg-brand-primary/50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-brand-light">
                      Subject:
                    </p>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(
                          selectedInvestor.outreachSuggestion.subject
                        )
                      }
                      className="text-xs text-brand-light hover:text-white bg-brand-accent/50 px-2 py-1 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-brand-text/90 mt-1">
                    {selectedInvestor.outreachSuggestion.subject}
                  </p>
                </div>
                <div className="bg-brand-primary/50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-brand-light">
                      Body:
                    </p>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(
                          selectedInvestor.outreachSuggestion.body
                        )
                      }
                      className="text-xs text-brand-light hover:text-white bg-brand-accent/50 px-2 py-1 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-brand-text/90 text-sm leading-relaxed mt-1">
                    {selectedInvestor.outreachSuggestion.body}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvestor(null)}
                className="mt-6 w-full px-4 py-2 bg-brand-accent hover:bg-brand-light text-white font-bold rounded-lg flex-shrink-0"
              >
                {t('investorMatchingClose')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InvestorMatchingDisplay;
