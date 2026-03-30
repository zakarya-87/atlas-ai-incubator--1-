import React from 'react';
import { motion } from 'framer-motion';
import type { Source } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SourcesListProps {
  sources?: Source[];
}

const SourcesList: React.FC<SourcesListProps> = ({ sources }) => {
  const { t } = useLanguage();

  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 pt-6 border-t border-brand-accent/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-green-500/20 p-1.5 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-brand-text uppercase tracking-wider">
          {t('sourcesVerifiedTitle')}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-brand-secondary/40 border border-brand-accent/30 hover:bg-brand-secondary hover:border-brand-teal/50 transition-all group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-xs font-mono text-brand-accent/70">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <span className="text-sm text-brand-light group-hover:text-brand-text truncate font-medium">
                {source.title}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-brand-accent group-hover:text-brand-teal flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ))}
      </div>
    </motion.div>
  );
};

// ⚡ Bolt: Wrap SourcesList in React.memo to prevent unnecessary re-renders when AppContent updates
export default React.memo(SourcesList);
