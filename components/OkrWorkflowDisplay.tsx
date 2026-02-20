import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { OkrWorkflowData, AnalysisPoint } from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SectionCard: React.FC<{
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
}> = ({ title, points, icon, bgColorClass, textColorClass }) => (
  <motion.div
    variants={itemVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
  >
    <div className="flex items-center mb-3">
      <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>{icon}</span>
      <h3 className={`text-xl font-bold ${textColorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-3 text-brand-text/90 flex-grow">
      {points.map((item, index) => (
        <li key={index} className="text-sm leading-relaxed">
          <strong className="font-semibold text-brand-text/95 display-block">
            {item.point}
          </strong>
          <p className="text-brand-text/80">{item.explanation}</p>
        </li>
      ))}
    </ul>
  </motion.div>
);

const icons = {
  vision: (
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
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  ),
  alignment: (
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
  tracking: (
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
        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
      />
    </svg>
  ),
  reflection: (
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
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992h-4.992m0 0-3.181-3.183a8.25 8.25 0 0 1 11.667 0l3.181 3.183"
      />
    </svg>
  ),
};

const OkrWorkflowDisplay: React.FC<{ data: OkrWorkflowData }> = ({ data }) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('visionStatement' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No OKR analysis data available.</p>
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
      {/* Vision Statement */}
      <motion.div
        variants={itemVariants}
        className="rounded-lg p-6 bg-brand-secondary/30 text-center border-2 border-dashed border-brand-teal/50"
      >
        <div className="flex items-center justify-center mb-3">
          <span className="mr-3 rtl:ml-3 rtl:mr-0 text-brand-teal">
            {icons.vision}
          </span>
          <h3 className="text-2xl font-bold text-brand-teal">
            {t('okrWorkflowVision')}
          </h3>
        </div>
        <p className="text-lg text-brand-text/90 italic">
          "{data.visionStatement}"
        </p>
      </motion.div>

      {/* Strategic Goals, Objectives & KRs */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal mb-4">
          {t('okrWorkflowStrategicGoals')}
        </h3>
        <div className="space-y-4">
          {data.strategicGoals.map((goal, gIndex) => (
            <motion.div
              key={gIndex}
              variants={itemVariants}
              className="rounded-lg p-4 bg-brand-secondary/40 border border-brand-accent/30"
            >
              <h4 className="font-bold text-lg text-brand-light">
                <span className="text-brand-accent">Goal {gIndex + 1}: </span>
                {goal.goal}
              </h4>
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-brand-accent/50 rtl:pl-0 rtl:pr-4 rtl:border-l-0 rtl:border-r-2">
                {goal.objectives.map((obj, oIndex) => (
                  <div key={oIndex}>
                    <h5 className="font-semibold text-md text-brand-text/95">
                      <span className="text-brand-accent/80">Objective: </span>
                      {obj.objective}
                    </h5>
                    <ul className="mt-2 space-y-2 pl-6 rtl:pl-0 rtl:pr-6">
                      {obj.keyResults.map((kr, krIndex) => (
                        <li key={krIndex} className="text-sm">
                          <div className="flex items-start">
                            <svg
                              className="w-4 h-4 text-green-400 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0 mt-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 8a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                            <span className="text-brand-text/90">
                              {kr.description}
                            </span>
                          </div>
                          <p className="text-xs text-brand-light/70 ml-6 rtl:ml-0 rtl:mr-6">
                            (Tracking: {kr.trackingMethod})
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Other Workflow Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title={t('okrWorkflowCascadingAlignment')}
          points={data.cascadingAlignment}
          icon={icons.alignment}
          bgColorClass="bg-blue-500/5"
          textColorClass="text-blue-400"
        />
        <SectionCard
          title={t('okrWorkflowTracking')}
          points={data.trackingAndReview}
          icon={icons.tracking}
          bgColorClass="bg-yellow-500/5"
          textColorClass="text-yellow-400"
        />
        <SectionCard
          title={t('okrWorkflowReflection')}
          points={data.reflectionAndNextCycle}
          icon={icons.reflection}
          bgColorClass="bg-purple-500/5"
          textColorClass="text-purple-400"
        />
      </div>
    </motion.div>
  );
};

export default OkrWorkflowDisplay;
