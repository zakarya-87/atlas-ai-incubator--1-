import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SwotData, AnalysisPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SwotQuadrantProps {
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
  category: keyof SwotData;
  fullData: SwotData;
  onUpdate: (updatedData: SwotData) => void;
}

const quadrantVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
  const [editedPoint, setEditedPoint] = useState<string>('');
  const [editedExplanation, setEditedExplanation] = useState<string>('');

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditedPoint(points?.[index]?.point || '');
    setEditedExplanation(points?.[index]?.explanation || '');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleToggleComplete = (index: number) => {
    if (editingIndex !== null || !points) return; // Don't allow toggling while editing or if points is undefined

    const updatedPoints = [...(points || [])];
    const currentPoint = { ...(updatedPoints[index] || {}) };
    currentPoint.completed = !currentPoint.completed;
    updatedPoints[index] = currentPoint;

    const updatedFullData = {
      ...fullData,
      [category]: updatedPoints,
    };

    onUpdate(updatedFullData);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !points) return;

    const updatedPoints = [...(points || [])];
    updatedPoints[editingIndex] = {
      ...updatedPoints[editingIndex],
      point: editedPoint.trim(),
      explanation: editedExplanation.trim(),
    };

    const updatedFullData = {
      ...fullData,
      [category]: updatedPoints,
    };

    onUpdate(updatedFullData);
    setEditingIndex(null);
  };

  return (
    <motion.div
      variants={quadrantVariants}
      className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
    >
      <div className="flex items-center mb-3">
        <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>
          {icon}
        </span>
        <h3 className={`text-xl font-bold ${textColorClass}`}>{title}</h3>
      </div>
      <ul className="space-y-3 text-brand-text/90 flex-grow">
        {(points || []).map((item, index) => (
          <li
            key={index}
            className="text-sm leading-relaxed group relative p-2 -m-2 rounded-md hover:bg-white/5 transition-colors grid"
          >
            {/* View Content - always present but may be visually hidden */}
            <motion.div
              animate={{ opacity: editingIndex === index ? 0 : 1 }}
              transition={{ duration: 0.1 }}
              className={editingIndex === index ? 'pointer-events-none' : ''}
              style={{ gridArea: '1 / 1' }}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(index)}
                  aria-label={`Mark as ${item.completed ? 'incomplete' : 'complete'}`}
                  className={`mt-1 flex-shrink-0 h-5 w-5 rounded-sm border-2 flex items-center justify-center transition-all duration-200 ${
                    item.completed
                      ? 'bg-brand-teal border-brand-teal'
                      : 'border-brand-accent group-hover:border-brand-teal'
                  }`}
                >
                  <AnimatePresence>
                    {item.completed && (
                      <motion.svg
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={4}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </button>
                <div
                  className={`flex-grow transition-all duration-300 ${item.completed ? 'opacity-60' : ''}`}
                >
                  <strong
                    className={`font-semibold text-brand-text/95 display-block transition-all ${item.completed ? 'line-through' : ''}`}
                  >
                    {item.point}
                  </strong>
                  <p
                    className={`text-brand-text/80 transition-all ${item.completed ? 'line-through' : ''}`}
                  >
                    {item.explanation}
                  </p>
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
                      type="text"
                      value={editedPoint}
                      onChange={(e) => setEditedPoint(e.target.value)}
                      className="w-full p-1 bg-brand-primary/50 border-b-2 border-brand-accent rounded-t-sm focus:ring-0 focus:border-brand-teal focus:outline-none transition-all text-brand-text/95 font-semibold"
                      aria-label="Edit point title"
                    />
                    <textarea
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
        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.736-.93l2.5-4.5M17 14h-2.5"
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
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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

interface SwotDisplayProps {
  data: SwotData;
  onUpdate: (updatedData: SwotData) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const SwotDisplay: React.FC<SwotDisplayProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('strengths' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No analysis data available.</p>
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
  );
};

export default SwotDisplay;
