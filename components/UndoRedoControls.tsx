import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  // Don't render anything if neither action is possible to keep UI clean
  if (!canUndo && !canRedo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center space-x-2 bg-brand-secondary/90 backdrop-blur-md border border-brand-accent/50 p-2 rounded-full shadow-lg"
      >
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-full transition-colors ${
            canUndo 
              ? 'text-brand-text hover:bg-brand-accent/50 hover:text-white' 
              : 'text-brand-accent cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <div className="w-px h-4 bg-brand-accent/30"></div>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-full transition-colors ${
            canRedo 
              ? 'text-brand-text hover:bg-brand-accent/50 hover:text-white' 
              : 'text-brand-accent cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default UndoRedoControls;