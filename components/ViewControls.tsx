import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface ViewControlsProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  isFocusMode,
  onToggleFocusMode,
}) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 z-30 flex items-center space-x-2"
      >
        <button
          onClick={onToggleFocusMode}
          className={`p-3 rounded-full transition-all shadow-lg border ${
            isFocusMode
              ? 'bg-brand-teal text-white border-brand-teal hover:bg-teal-600'
              : 'bg-brand-secondary/90 backdrop-blur-md text-brand-light border-brand-accent/50 hover:text-white hover:bg-brand-accent/50'
          }`}
          title={isFocusMode ? t('viewExitFocus') : t('viewEnterFocus')}
          aria-label={isFocusMode ? t('viewExitFocus') : t('viewEnterFocus')}
        >
          {isFocusMode ? (
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
                d="M9 9L4 4m0 0l5 0M4 4l0 5M15 9l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5M15 15l5 5m0 0l-5 0m5 0l0-5"
              />
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
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

// ⚡ Bolt: Wrapped in React.memo() to prevent unnecessary re-renders of the view controls
// during heavy AppContent state updates, keeping the typing experience responsive.
export default React.memo(ViewControls);
