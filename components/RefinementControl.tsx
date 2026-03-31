import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

interface RefinementControlProps {
  onRefine: (instruction: string) => void;
  isLoading: boolean;
}

const RefinementControl: React.FC<RefinementControlProps> = React.memo(({
  onRefine,
  isLoading,
}) => {
  const { t } = useLanguage();
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim()) {
      onRefine(instruction);
      setInstruction('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 mb-16 bg-brand-secondary/20 border border-brand-accent/30 rounded-xl p-4 max-w-3xl mx-auto"
    >
      <h4 className="text-sm font-bold text-brand-teal mb-2 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        {t('refineTitle')}
      </h4>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          id="refinement-input"
          name="refinement"
          autoComplete="off"
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={t('refinePlaceholder')}
          disabled={isLoading}
          className="flex-1 bg-brand-primary/50 border border-brand-accent/50 rounded-lg px-4 py-2 text-sm text-brand-text focus:ring-2 focus:ring-brand-teal focus:outline-none"
        />
        <button
          type="submit"
          disabled={!instruction.trim() || isLoading}
          className="px-4 py-2 bg-brand-teal hover:bg-teal-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Thinking...' : t('refineButton')}
        </button>
      </form>
      <p className="text-[10px] text-brand-light/50 mt-2 text-center">
        The AI will iterate on the current analysis based on your instructions.
      </p>
    </motion.div>
  );
});

export default RefinementControl;
