import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { PitchDeckData, PitchDeckSlide } from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const visualIcons = {
  bar_chart: (
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  line_graph: (
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
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  ),
  pie_chart: (
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
        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
      />
    </svg>
  ),
  map: (
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
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 13v-13"
      />
    </svg>
  ),
  table: (
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
        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  ),
  infographic: (
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
        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
      />
    </svg>
  ),
  none: (
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
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  ),
};

const SlideCard: React.FC<{ slide: PitchDeckSlide; index: number }> = ({
  slide,
  index,
}) => {
  const { t } = useLanguage();
  const visualIcon = slide.visualSuggestion
    ? visualIcons[slide.visualSuggestion.type]
    : visualIcons.none;

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-lg bg-brand-secondary/30 p-6 border border-brand-accent/30 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-brand-teal">{slide.title}</h3>
        <div className="flex-shrink-0 text-3xl font-black text-brand-accent/30 leading-none">
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      <ul className="space-y-3 text-brand-text/90 flex-grow mb-4">
        {(slide.content || []).map((item, i) => (
          <li key={i} className="flex items-start text-sm">
            <svg
              className="w-4 h-4 text-green-400 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0 mt-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <div>
              <strong className="font-semibold text-brand-text/95 display-block">
                {item.point}
              </strong>
              <p className="text-brand-text/80">{item.explanation}</p>
            </div>
          </li>
        ))}
      </ul>

      {slide.visualSuggestion && slide.visualSuggestion.type !== 'none' && (
        <div className="mt-auto pt-4 border-t border-brand-accent/20">
          <p className="text-xs font-bold uppercase text-brand-light mb-2">
            {t('pitchDeckVisualSuggestion')}
          </p>
          <div className="flex items-center text-sm text-brand-text/80 bg-brand-primary/50 p-2 rounded-md">
            <span className="mr-2 rtl:ml-2 rtl:mr-0 text-brand-teal">
              {visualIcon}
            </span>
            <p>{slide.visualSuggestion.description}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const PitchDeckDisplay: React.FC<{ data: PitchDeckData }> = ({ data }) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No pitch deck data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No pitch deck data available.</p>
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
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal">
          {t('pitchDeckTitle')}
        </h3>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(data.slides || []).map((slide, index) => (
          <SlideCard key={index} slide={slide} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default PitchDeckDisplay;
