import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { IdeaValidationData, AnalysisPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';
import DataStructureDebugger from './DataStructureDebugger';

interface SectionCardProps {
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  points,
  icon,
  bgColorClass,
  textColorClass,
}) => (
  <motion.div
    variants={cardVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
  >
    <div className="flex items-center mb-3">
      <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>{icon}</span>
      <h3 className={`text-xl font-bold ${textColorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-3 text-brand-text/90 flex-grow">
      {(points || []).map((item, index) => (
        <li key={index} className="text-sm leading-relaxed" data-testid="analysis-point">
          <strong className="font-semibold text-brand-text/95 display-block">
            {item?.point || 'N/A'}
          </strong>
          <p className="text-brand-text/80">{item?.explanation || ''}</p>
        </li>
      ))}
    </ul>
  </motion.div>
);

const icons = {
  summary: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
      />
    </svg>
  ),
  problem: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  ),
  solution: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
      />
    </svg>
  ),
  valueProp: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>
  ),
  assumptions: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  ),
};

interface IdeaValidationDisplayProps {
  data: IdeaValidationData;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const IdeaValidationDisplay: React.FC<IdeaValidationDisplayProps> = ({
  data,
}) => {
  const { t } = useLanguage();

  // Normalize flexible item shapes (string | object)
  const getItemText = (item: any) => {
    if (item == null) return 'N/A';
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
      return (
        item.description ||
        item.point ||
        item.text ||
        item.summary ||
        item.title ||
        JSON.stringify(item)
      );
    }
    return String(item);
  };

  const getItemDetails = (item: any) => {
    if (item && typeof item === 'object') {
      return item.details || item.detail || null;
    }
    return null;
  };

  const getItemMitigation = (item: any) => {
    if (item && typeof item === 'object') {
      return item.mitigation || item.recommendation || null;
    }
    return null;
  };

  // Debug logging
  console.log('[IdeaValidationDisplay] Received data:', data);
  console.log('[IdeaValidationDisplay] Data keys:', data ? Object.keys(data) : 'null');

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
          <p>No idea validation data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  // Handle different data structures from backend
  // Structure 1: business_idea_validation (AI-generated)
  if ('business_idea_validation' in data) {
    const validationData = (data as any).business_idea_validation;
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4"
      >
        <DataStructureDebugger data={data} label="Idea Validation Data (business_idea_validation)" />
        
        {/* Name and Description */}
        {(validationData.name || validationData.description) && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-brand-secondary/30">
            {validationData.name && (
              <h3 className="text-2xl font-bold text-brand-teal mb-3">{validationData.name}</h3>
            )}
            {validationData.description && (
              <p className="text-brand-text/90 leading-relaxed">{validationData.description}</p>
            )}
            {validationData.validation_status && (
              <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-brand-teal/20 border border-brand-teal/40">
                <span className="text-brand-teal font-semibold">Status: </span>
                <span className="text-brand-text/90">{validationData.validation_status.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Validation Summary / SWOT */}
        {(validationData.validation_summary || validationData.swot_analysis || validationData.strengths || validationData.weaknesses_and_risks) && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(validationData.validation_summary?.strengths || validationData.strengths) && (
                <motion.div variants={cardVariants} className="rounded-lg p-4 bg-green-500/5">
                  <h3 className="text-xl font-bold text-green-400 mb-3">✓ Strengths</h3>
                  <ul className="space-y-3 text-sm text-brand-text/90">
                    {(validationData.validation_summary?.strengths || validationData.strengths || []).map((item: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-400 mr-2 mt-0.5">•</span>
                        <div className="flex-1">
                          <span className="text-brand-text/95">{getItemText(item)}</span>
                          {getItemDetails(item) && (
                            <p className="text-xs text-brand-text/70 mt-1 ml-2">{getItemDetails(item)}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {(validationData.validation_summary?.weaknesses || validationData.weaknesses || validationData.weaknesses_and_risks) && (
                <motion.div variants={cardVariants} className="rounded-lg p-4 bg-red-500/5">
                  <h3 className="text-xl font-bold text-red-400 mb-3">⚠ Weaknesses</h3>
                  <ul className="space-y-3 text-sm text-brand-text/90">
                    {(validationData.validation_summary?.weaknesses || validationData.weaknesses || validationData.weaknesses_and_risks || []).map((item: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-red-400 mr-2 mt-0.5">•</span>
                        <div className="flex-1">
                          <span className="text-brand-text/95">{getItemText(item)}</span>
                          {getItemDetails(item) && (
                            <p className="text-xs text-brand-text/70 mt-1 ml-2">{getItemDetails(item)}</p>
                          )}
                          {getItemMitigation(item) && (
                            <p className="text-xs text-green-400/80 mt-1 ml-2">
                              <strong>Mitigation:</strong> {getItemMitigation(item)}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {validationData.validation_summary?.opportunities && (
                <motion.div variants={cardVariants} className="rounded-lg p-4 bg-blue-500/5">
                  <h3 className="text-xl font-bold text-blue-400 mb-3">↗ Opportunities</h3>
                  <ul className="space-y-3 text-sm text-brand-text/90">
                    {validationData.validation_summary.opportunities.map((item: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-400 mr-2 mt-0.5">•</span>
                        <div className="flex-1">
                          <span className="text-brand-text/95">{getItemText(item)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {validationData.validation_summary?.threats && (
                <motion.div variants={cardVariants} className="rounded-lg p-4 bg-orange-500/5">
                  <h3 className="text-xl font-bold text-orange-400 mb-3">⚡ Threats</h3>
                  <ul className="space-y-3 text-sm text-brand-text/90">
                    {validationData.validation_summary.threats.map((item: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-orange-400 mr-2 mt-0.5">•</span>
                        <div className="flex-1">
                          <span className="text-brand-text/95">{getItemText(item)}</span>
                          {getItemMitigation(item) && (
                            <p className="text-xs text-green-400/80 mt-1 ml-2">
                              <strong>Mitigation:</strong> {getItemMitigation(item)}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Market Analysis (if present) */}
        {validationData.market_analysis && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-blue-500/5">
            <h3 className="text-xl font-bold text-blue-400 mb-3">📊 Market Analysis</h3>
            <div className="space-y-2 text-sm text-brand-text/90">
              {validationData.market_analysis.industry && (
                <p><strong>Industry:</strong> {validationData.market_analysis.industry}</p>
              )}
              {validationData.market_analysis.target_market && (
                <div>
                  <strong>Target Market:</strong>
                  <p className="ml-4 mt-1 text-brand-text/80">{JSON.stringify(validationData.market_analysis.target_market, null, 2)}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Risk Assessment */}
        {(validationData.risk_assessment || validationData.risk_mitigation_matrix) && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-rose-500/5">
            <h3 className="text-xl font-bold text-rose-400 mb-3">🛡 Risk Assessment</h3>
            {validationData.risk_assessment?.overall_risk_level && (
              <p className="text-sm text-brand-text/90 mb-2">
                <strong>Overall Risk:</strong> {validationData.risk_assessment.overall_risk_level}
              </p>
            )}
            {validationData.risk_assessment?.rationale && (
              <p className="text-sm text-brand-text/80 mb-3">{validationData.risk_assessment.rationale}</p>
            )}
            {(validationData.risk_assessment?.risk_mitigation_matrix || validationData.risk_mitigation_matrix) && (
              <ul className="space-y-3 text-sm text-brand-text/90">
                {(validationData.risk_assessment?.risk_mitigation_matrix || validationData.risk_mitigation_matrix || []).map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-rose-400 mr-2 mt-0.5">•</span>
                    <div className="flex-1">
                      <span className="text-brand-text/95">{getItemText(item)}</span>
                      {getItemDetails(item) && (
                        <p className="text-xs text-brand-text/70 mt-1 ml-2">{getItemDetails(item)}</p>
                      )}
                      {getItemMitigation(item) && (
                        <p className="text-xs text-green-400/80 mt-1 ml-2">
                          <strong>Mitigation:</strong> {getItemMitigation(item)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Recommendations / Next Steps */}
        {(validationData.recommendations || validationData.next_steps || validationData.long_term_strategy) && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-yellow-500/5">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">💡 Recommendations</h3>
            {(() => {
              const rec = validationData.recommendations;
              const { next_steps: recNext, long_term_strategy: recLong, ...rest } =
                (rec && typeof rec === 'object' && !Array.isArray(rec)) ? rec : { next_steps: null, long_term_strategy: null };
              const recommendationsList = Array.isArray(rec)
                ? rec
                : Array.isArray((rest as any)?.items)
                  ? (rest as any).items
                  : Array.isArray((rest as any)?.list)
                    ? (rest as any).list
                    : Object.values(rest || {}).flat().filter(Boolean);

              return recommendationsList && recommendationsList.length > 0 ? (
                <ul className="space-y-2 text-sm text-brand-text/90 mb-3">
                {recommendationsList.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-yellow-400 mr-2">→</span>
                    <span>{getItemText(item)}</span>
                  </li>
                ))}
              </ul>
              ) : null;
            })()}
            {(() => {
              const nextSteps =
                validationData.next_steps ||
                (validationData.recommendations &&
                  typeof validationData.recommendations === 'object' &&
                  !Array.isArray(validationData.recommendations) &&
                  (validationData.recommendations as any).next_steps) ||
                [];
              return Array.isArray(nextSteps) && nextSteps.length > 0 ? (
              <div className="mb-3">
                <p className="font-semibold text-sm text-brand-text/85 mb-1">Next Steps</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-brand-text/90">
                  {nextSteps.map((item: any, idx: number) => (
                    <li key={idx}>{getItemText(item)}</li>
                  ))}
                </ol>
              </div>
              ) : null;
            })()}
            {(() => {
              const longTerm =
                validationData.long_term_strategy ||
                (validationData.recommendations &&
                  typeof validationData.recommendations === 'object' &&
                  !Array.isArray(validationData.recommendations) &&
                  (validationData.recommendations as any).long_term_strategy);
              if (!longTerm) return null;
              return (
              <div className="space-y-2 text-sm text-brand-text/90">
                {longTerm.vision && (
                  <p>
                    <strong>Vision:</strong> {getItemText(longTerm.vision)}
                  </p>
                )}
                {longTerm.key_pillars && (
                  <div>
                    <strong>Key Pillars:</strong>
                    <ul className="list-disc list-inside ml-4 space-y-1 mt-1 text-brand-text/85">
                      {longTerm.key_pillars.map((p: any, idx: number) => (
                        <li key={idx}>{getItemText(p)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              );
            })()}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Structure 2: venture_validation_checklist (AI-generated checklist)
  if ('venture_validation_checklist' in data) {
    const checklist = (data as any).venture_validation_checklist;
    const requestForUser = (data as any).request_for_user;
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4"
      >
        <DataStructureDebugger data={data} label="Idea Validation Data (venture_validation_checklist)" />
        
        {requestForUser && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-brand-teal/10 border border-brand-teal/30">
            <h3 className="text-xl font-bold text-brand-teal mb-3">
              📋 Information Request
            </h3>
            <p className="text-brand-text/90 mb-4">{requestForUser.purpose}</p>
            {requestForUser.questions && (
              <div className="space-y-2">
                <h4 className="font-semibold text-brand-text">Questions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-brand-text/80">
                  {requestForUser.questions.map((q: string, idx: number) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>
        )}

        <motion.div variants={cardVariants} className="rounded-lg p-4 bg-brand-secondary/30">
          <h3 className="text-xl font-bold text-brand-teal mb-4">Validation Checklist</h3>
          <div className="space-y-4">
            {Object.entries(checklist).map(([key, value]: [string, any]) => {
              if (key === 'next_steps') {
                return (
                  <div key={key} className="border-t border-brand-accent/20 pt-4">
                    <h4 className="font-bold text-brand-text mb-2">Next Steps</h4>
                    {value.immediate_actions && (
                      <div className="ml-4">
                        <p className="font-semibold text-sm text-brand-text/80">Immediate Actions:</p>
                        <ul className="list-disc list-inside text-sm text-brand-text/70 space-y-1">
                          {value.immediate_actions.map((action: string, idx: number) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              
              if (typeof value === 'object' && value.question) {
                const statusColors = {
                  pending_user_input: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
                  pending_analysis: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                  pending_validation: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                  completed: 'bg-green-500/10 border-green-500/30 text-green-400',
                };
                const colorClass = statusColors[value.status as keyof typeof statusColors] || 'bg-brand-secondary/20 border-brand-accent/20 text-brand-text/70';
                
                return (
                  <div key={key} className={`p-3 rounded border ${colorClass}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{value.question}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-black/20">{value.status}</span>
                    </div>
                    {value.notes && (
                      <p className="text-xs text-brand-text/70 mt-1">{value.notes}</p>
                    )}
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Structure 3: Expected format (summary, problemStatement, etc.)
  if (!('summary' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4"
      >
        <DataStructureDebugger data={data} label="Idea Validation Data (Unknown Structure)" />
        <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
          <p className="text-yellow-400 font-semibold mb-2">Unexpected Data Structure</p>
          <p className="text-sm text-brand-text/70">
            The received data doesn't match any expected format. See debug info above.
          </p>
        </div>
      </motion.div>
    );
  }

  const sections: {
    key: keyof Omit<IdeaValidationData, 'summary'>;
    titleKey: TranslationKey;
    icon: React.ReactNode;
    colors: string[];
  }[] = [
    {
      key: 'problemStatement',
      titleKey: 'ideaValidationProblemStatement',
      icon: icons.problem,
      colors: ['bg-red-500/5', 'text-red-400'],
    },
    {
      key: 'solutionStatement',
      titleKey: 'ideaValidationSolutionStatement',
      icon: icons.solution,
      colors: ['bg-green-500/5', 'text-green-400'],
    },
    {
      key: 'valueProposition',
      titleKey: 'ideaValidationValueProposition',
      icon: icons.valueProp,
      colors: ['bg-blue-500/5', 'text-blue-400'],
    },
    {
      key: 'keyAssumptions',
      titleKey: 'ideaValidationKeyAssumptions',
      icon: icons.assumptions,
      colors: ['bg-yellow-500/5', 'text-yellow-400'],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-4"
      data-testid="analysis-output"
    >
      <motion.div
        variants={cardVariants}
        className="rounded-lg p-4 bg-brand-secondary/30"
      >
        <div className="flex items-center mb-3">
          <span className="mr-3 rtl:ml-3 rtl:mr-0 text-brand-teal">
            {icons.summary}
          </span>
          <h3 className="text-xl font-bold text-brand-teal">
            {t('ideaValidationSummary')}
          </h3>
        </div>
        <p className="text-brand-text/90 leading-relaxed">{data.summary}</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((sec) => (
          <SectionCard
            key={sec.key}
            title={t(sec.titleKey)}
            points={data[sec.key] || []}
            icon={sec.icon}
            bgColorClass={sec.colors[0]}
            textColorClass={sec.colors[1]}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default IdeaValidationDisplay;
