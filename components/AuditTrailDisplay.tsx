import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GenerationRecord } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AuditTrailDisplayProps {
  history: GenerationRecord[];
  onView: (record: GenerationRecord) => void;
  onDelete: (id: string) => void;
  modules: { key: string; label: string }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const AuditTrailDisplay: React.FC<AuditTrailDisplayProps> = ({
  history,
  onView,
  onDelete,
  modules,
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (filter === 'all') {
      return history;
    }
    return history.filter((record) => record.module === filter);
  }, [history, filter]);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    onDelete(id);
  };

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-brand-light max-w-lg mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-16 w-16 text-brand-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
        <h2 className="mt-6 text-2xl font-bold text-brand-text">
          {t('auditTrailTitle')}
        </h2>
        <p className="mt-2">{t('auditTrailNoHistory')}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-brand-text">
          {t('auditTrailTitle')}
        </h2>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-brand-secondary border border-brand-accent rounded-md px-3 py-2 text-sm focus:ring-brand-teal focus:border-brand-teal appearance-none"
            aria-label={t('auditTrailFilterByModule')}
          >
            <option value="all">{t('auditTrailAllModules')}</option>
            {modules.map((mod) => (
              <option key={mod.key} value={mod.key}>
                {mod.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence>
          {filteredHistory.map((record) => (
            <motion.div
              key={record.id}
              variants={itemVariants}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: 50,
                height: 0,
                marginBottom: 0,
                transition: { duration: 0.2 },
              }}
              layout
              className="bg-brand-secondary/40 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
            >
              <div className="flex-grow">
                <p className="font-bold text-brand-text">
                  {t(record.toolNameKey as any)}
                </p>
                <p className="text-sm text-brand-light truncate max-w-md">
                  Input: "{record.inputDescription}"
                </p>
                <p className="text-xs text-brand-accent mt-1">
                  {new Date(record.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => onView(record)}
                  className="px-4 py-2 bg-brand-accent hover:bg-brand-light text-white font-bold rounded-lg shadow-sm transition-all text-sm flex-grow md:flex-grow-0"
                >
                  {t('auditTrailViewButton')}
                </button>
                <button
                  onClick={(e) => handleDeleteClick(record.id, e)}
                  disabled={deletingId === record.id}
                  className="px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  aria-label={t('auditTrailDeleteButton')}
                >
                  {deletingId === record.id ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuditTrailDisplay;
