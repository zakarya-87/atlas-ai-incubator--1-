import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExperimentData, ExperimentCard, ExperimentColumn } from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ExperimentBuilderDisplay: React.FC<{
  data: ExperimentData | null;
  onUpdate: (data: ExperimentData) => void;
  onSave: (data: ExperimentData) => void;
}> = ({ data, onUpdate, onSave }) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <div className="w-full p-12 text-center bg-brand-secondary/30 rounded-xl border border-dashed border-brand-accent/30">
        <div className="text-brand-text/60 max-w-sm mx-auto">
          <p className="text-lg font-medium">No analysis data available</p>
          <p className="text-sm mt-2">The analysis might be empty or malformed. Try generating it again with a more detailed description.</p>
        </div>
      </div>
    );
  }


  const initialData: ExperimentData = {
    columns: [
      {
        id: 'hypotheses',
        titleKey: 'experimentBuilderColumnHypotheses',
        cards: [],
      },
      { id: 'methods', titleKey: 'experimentBuilderColumnMethods', cards: [] },
      { id: 'metrics', titleKey: 'experimentBuilderColumnMetrics', cards: [] },
    ],
  };

  const boardData = data || initialData;

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

  const handleAddCard = (colId: 'hypotheses' | 'methods' | 'metrics') => {
    const newBoard = deepClone(boardData);
    const column = newBoard.columns.find((c: ExperimentColumn) => c.id === colId);
    if (column) {
      const newCardId = `card-${Date.now()}`;
      column.cards.push({
        id: newCardId,
        content: t('experimentBuilderCardPlaceholder'),
        completed: false,
      });
      onUpdate(newBoard);
      setEditingCardId(newCardId);
      setEditingText(t('experimentBuilderCardPlaceholder'));
    }
  };

  const handleStartEdit = (card: ExperimentCard) => {
    setEditingCardId(card.id);
    setEditingText(card.content);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditingText('');
  };

  const handleSaveEdit = () => {
    if (!editingCardId) return;
    const newBoard = deepClone(boardData);
    for (const column of newBoard.columns) {
      const card = column.cards.find((c: ExperimentCard) => c.id === editingCardId);
      if (card) {
        card.content = editingText;
        onUpdate(newBoard);
        break;
      }
    }
    setEditingCardId(null);
    setEditingText('');
  };

  const handleDeleteCard = (colId: string, cardId: string) => {
    const newBoard = deepClone(boardData);
    const column = newBoard.columns.find((c: ExperimentColumn) => c.id === colId);
    if (column) {
      column.cards = column.cards.filter((c: ExperimentCard) => c.id !== cardId);
      onUpdate(newBoard);
    }
  };

  const handleToggleComplete = (colId: string, cardId: string) => {
    const newBoard = deepClone(boardData);
    const column = newBoard.columns.find((c: ExperimentColumn) => c.id === colId);
    const card = column?.cards.find((c: ExperimentCard) => c.id === cardId);
    if (card) {
      card.completed = !card.completed;
      onUpdate(newBoard);
    }
  };

  const handleMoveCard = (
    colId: string,
    cardId: string,
    direction: 'left' | 'right'
  ) => {
    const newBoard = deepClone(boardData);
    const sourceColIndex = newBoard.columns.findIndex((c: ExperimentColumn) => c.id === colId);
    if (sourceColIndex === -1) return;

    const targetColIndex =
      direction === 'left' ? sourceColIndex - 1 : sourceColIndex + 1;
    if (targetColIndex < 0 || targetColIndex >= newBoard.columns.length) return;

    const sourceCol = newBoard.columns[sourceColIndex];
    const cardIndex = sourceCol.cards.findIndex((c: ExperimentCard) => c.id === cardId);
    if (cardIndex === -1) return;

    const [movedCard] = sourceCol.cards.splice(cardIndex, 1);
    newBoard.columns[targetColIndex].cards.push(movedCard);

    onUpdate(newBoard);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-end">
        <button
          onClick={() => onSave(boardData)}
          className="px-6 py-2 bg-brand-teal hover:bg-teal-500 text-white font-bold rounded-lg shadow-md transition-colors"
        >
          {t('experimentBuilderSaveBoard')}
        </button>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {boardData.columns.map((column, colIndex) => (
          <motion.div
            key={column.id}
            variants={itemVariants}
            className="bg-brand-secondary/30 rounded-lg p-4 h-full"
          >
            <h3 className="text-xl font-bold text-brand-light mb-4 text-center">
              {t(column.titleKey as any)}
            </h3>
            <div className="space-y-3 min-h-[100px]">
              <AnimatePresence>
                {column.cards.map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-brand-secondary p-3 rounded-md shadow-sm border-l-4 ${card.completed ? 'border-green-500' : 'border-brand-accent'}`}
                  >
                    {editingCardId === card.id ? (
                      <div>
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2 bg-brand-primary/50 border border-brand-accent rounded-md focus:ring-2 focus:ring-brand-teal focus:outline-none text-sm"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs text-brand-light hover:text-white"
                          >
                            {t('experimentBuilderCancel')}
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 text-xs bg-brand-teal text-white rounded"
                          >
                            {t('experimentBuilderSave')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p
                          className={`text-sm text-brand-text/90 ${card.completed ? 'line-through opacity-60' : ''}`}
                        >
                          {card.content}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-accent/20">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleToggleComplete(column.id, card.id)
                              }
                              title="Toggle complete"
                            >
                              <svg
                                className={`w-5 h-5 ${card.completed ? 'text-green-500' : 'text-brand-light hover:text-white'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12l2 2 4-4m6 8a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleStartEdit(card)}
                              title="Edit"
                            >
                              <svg
                                className="w-4 h-4 text-brand-light hover:text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L13.5 6.5z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCard(column.id, card.id)
                              }
                              title="Delete"
                            >
                              <svg
                                className="w-4 h-4 text-brand-light hover:text-red-400"
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
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            {colIndex > 0 && (
                              <button
                                onClick={() =>
                                  handleMoveCard(column.id, card.id, 'left')
                                }
                                title="Move left"
                                className="p-1 rounded-full hover:bg-brand-accent/50"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>
                            )}
                            {colIndex < boardData.columns.length - 1 && (
                              <button
                                onClick={() =>
                                  handleMoveCard(column.id, card.id, 'right')
                                }
                                title="Move right"
                                className="p-1 rounded-full hover:bg-brand-accent/50"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              onClick={() => handleAddCard(column.id as any)}
              className="mt-3 w-full text-left p-2 rounded-md text-sm text-brand-light hover:bg-brand-accent/50 transition-colors"
            >
              + {t('experimentBuilderAddCard')}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ExperimentBuilderDisplay;
