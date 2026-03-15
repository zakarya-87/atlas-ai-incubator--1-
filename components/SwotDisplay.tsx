import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import type { SwotData, AnalysisPoint } from '../types';

interface SwotDisplayProps {
  data: SwotData;
  onUpdate?: (updatedData: SwotData) => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

interface SwotQuadrantProps {
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
  category: keyof SwotData;
  fullData: SwotData;
  onUpdate?: (updatedData: SwotData) => void;
}

const SwotQuadrant: React.FC<SwotQuadrantProps> = ({
  title,
  points,
  icon,
  bgColorClass,
  textColorClass,
  category,
  fullData,
  onUpdate,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedPoint, setEditedPoint] = useState('');
  const [editedExplanation, setEditedExplanation] = useState('');

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditedPoint(points[index].point);
    setEditedExplanation(points[index].explanation || '');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !onUpdate) return;

    const newPoints = [...points];
    newPoints[editingIndex] = {
      ...newPoints[editingIndex],
      point: editedPoint,
      explanation: editedExplanation,
    };

    const newData = {
      ...fullData,
      [category]: newPoints,
    };

    onUpdate(newData);
    setEditingIndex(null);
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`p-6 rounded-xl border border-brand-accent/20 ${bgColorClass} backdrop-blur-sm flex flex-col h-full`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`${textColorClass} opacity-80`}>{icon}</div>
        <h3 className={`text-lg font-bold uppercase tracking-wider ${textColorClass}`}>
          {title}
        </h3>
      </div>

      <ul className="space-y-4 flex-grow">
        {points.map((point, index) => (
          <li key={index} className="group relative">
            <motion.div
              layout
              data-testid="analysis-point"
              className="p-3 rounded-lg bg-brand-primary/40 border border-brand-accent/10 hover:border-brand-teal/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${textColorClass.replace('text-', 'bg-')}`} />
                <div className="space-y-1">
                  <p className="text-brand-text font-semibold leading-tight">{point.point}</p>
                  {point.explanation && (
                    <p className="text-brand-text/60 text-xs leading-relaxed">{point.explanation}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleStartEdit(index)}
                className="absolute top-1 right-1 rtl:right-auto rtl:left-1 p-1 text-brand-light opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-full hover:bg-white/10"
                aria-label="Edit point"
              >
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L13.5 6.5z"
                  />
                </svg>
              </button>
            </motion.div>

            {/* Edit Form - overlays using grid and AnimatePresence */}
            <AnimatePresence>
              {editingIndex === index && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ gridArea: '1 / 1' }}
                  className="bg-brand-secondary p-2 rounded-md shadow-lg flex flex-col space-y-2 z-10"
                >
                  <div className="flex flex-col space-y-2 flex-grow">
                    <input
                      id={`edit-point-${index}`}
                      name={`swot-point-${index}`}
                      type="text"
                      value={editedPoint}
                      onChange={(e) => setEditedPoint(e.target.value)}
                      className="w-full p-1 bg-brand-primary/50 border-b-2 border-brand-accent rounded-t-sm focus:ring-0 focus:border-brand-teal focus:outline-none transition-all text-brand-text/95 font-semibold"
                      aria-label="Edit point title"
                    />
                    <textarea
                      id={`edit-explanation-${index}`}
                      name={`swot-explanation-${index}`}
                      value={editedExplanation}
                      onChange={(e) => setEditedExplanation(e.target.value)}
                      className="w-full p-1 bg-brand-primary/50 border-b-2 border-brand-accent rounded-t-sm focus:ring-0 focus:border-brand-teal focus:outline-none transition-all text-brand-text/80 text-sm resize-y"
                      rows={3}
                      aria-label="Edit point explanation"
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-xs text-brand-light hover:text-white rounded-md hover:bg-brand-accent/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-xs bg-brand-teal rounded-md text-white font-semibold hover:bg-teal-500 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const icons = {
  strengths: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.93L5.5 8m7 2H5.5"
      />
    </svg>
  ),
  weaknesses: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.017a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.085c.607 0 1.156-.272 1.512-.741L18.5 16m-7-2H18.5"
      />
    </svg>
  ),
  opportunities: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  ),
  threats: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
};

const SwotDisplay: React.FC<SwotDisplayProps> = ({ data: initialData, onUpdate }) => {
  const { t } = useLanguage();

  // Handle nested swot_analysis key if present
  const data = (initialData as any)?.swot_analysis || initialData;

  console.log('[DEBUG SwotDisplay] Received data:', data);

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('strengths' in data)) {
    return (
      <div className="w-full flex flex-col space-y-4">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full p-12 text-center bg-brand-secondary/30 rounded-xl border border-dashed border-brand-accent/30"
        >
          <div className="text-brand-text/60 max-w-sm mx-auto">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No analysis data available</p>
            <p className="text-sm mt-2">The analysis might be empty or malformed. Try generating it again with a more detailed description.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-4">

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        data-testid="analysis-output"
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SwotQuadrant
            title={t('swotStrengths')}
            points={data.strengths || []}
            icon={icons.strengths}
            bgColorClass="bg-green-500/5"
            textColorClass="text-green-400"
            category="strengths"
            fullData={data}
            onUpdate={onUpdate}
          />
          <SwotQuadrant
            title={t('swotWeaknesses')}
            points={data.weaknesses || []}
            icon={icons.weaknesses}
            bgColorClass="bg-yellow-500/5"
            textColorClass="text-yellow-400"
            category="weaknesses"
            fullData={data}
            onUpdate={onUpdate}
          />
          <SwotQuadrant
            title={t('swotOpportunities')}
            points={data.opportunities || []}
            icon={icons.opportunities}
            bgColorClass="bg-blue-500/5"
            textColorClass="text-blue-400"
            category="opportunities"
            fullData={data}
            onUpdate={onUpdate}
          />
          <SwotQuadrant
            title={t('swotThreats')}
            points={data.threats || []}
            icon={icons.threats}
            bgColorClass="bg-red-500/5"
            textColorClass="text-red-400"
            category="threats"
            fullData={data}
            onUpdate={onUpdate}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SwotDisplay;
