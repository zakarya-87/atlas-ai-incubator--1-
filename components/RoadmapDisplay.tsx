import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { RoadmapData } from '../types';

interface RoadmapDisplayProps {
  data: RoadmapData;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const phaseVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, type: 'spring', stiffness: 50 } },
};

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ data }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-3xl mx-auto"
    >
      <div className="relative pl-8 rtl:pl-0 rtl:pr-8">
        {/* Vertical Timeline Bar */}
        <div className="absolute top-0 bottom-0 left-0 rtl:left-auto rtl:right-0 w-1 bg-brand-accent/30 rounded-full"></div>

        {data.phases.map((phase, phaseIndex) => (
          <motion.div
            key={phaseIndex}
            variants={phaseVariants}
            className="mb-12"
          >
            <div className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-10 rtl:-left-auto rtl:-right-10 top-1 h-4 w-4 bg-brand-teal rounded-full border-4 border-brand-primary"></div>
              
              <div className="p-4 rounded-lg bg-brand-secondary/30 border border-brand-accent/50">
                <h3 className="text-xl font-bold text-brand-teal mb-3">{phase.phaseName}</h3>
                <ul className="space-y-3">
                  {phase.milestones.map((milestone, milestoneIndex) => (
                    <li key={milestoneIndex} className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-green-400 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <div>
                        <strong className="font-semibold text-brand-text/95">{milestone.point}</strong>
                        <p className="text-brand-text/80">{milestone.explanation}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RoadmapDisplay;
