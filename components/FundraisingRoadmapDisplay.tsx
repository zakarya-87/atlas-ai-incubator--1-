import React from 'react';
import { motion, Variants } from 'framer-motion';
import type {
  FundraisingRoadmapData,
  FundraisingTask,
  FundraisingRoadmapAlert,
} from '../types';
import { useLanguage } from '../context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TaskCard: React.FC<{ task: FundraisingTask }> = ({ task }) => {
  const getStatusClasses = (status: FundraisingTask['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-300';
      case 'In Progress':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'To Do':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-brand-accent';
    }
  };
  return (
    <div className="p-3 rounded-lg bg-brand-secondary/40 border-l-4 border-brand-accent/50">
      <div className="flex justify-between items-start">
        <strong className="font-semibold text-brand-text/95 text-sm display-block pr-2">
          {task.task}
        </strong>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusClasses(task.status)}`}
        >
          {task.status}
        </span>
      </div>
      <p className="text-brand-text/80 text-sm mt-1">{task.details}</p>
    </div>
  );
};

const AlertCard: React.FC<{ alert: FundraisingRoadmapAlert }> = ({ alert }) => {
  const getSeverityInfo = (severity: FundraisingRoadmapAlert['severity']) => {
    switch (severity) {
      case 'High':
        return {
          border: 'border-red-500/50',
          text: 'text-red-400',
          bg: 'bg-red-900/10',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.001-1.742 3.001H4.42c-1.532 0-2.492-1.667-1.742-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'Medium':
        return {
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          bg: 'bg-yellow-900/10',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'Low':
        return {
          border: 'border-blue-500/50',
          text: 'text-blue-400',
          bg: 'bg-blue-900/10',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      default:
        return {
          border: 'border-brand-accent',
          text: 'text-brand-light',
          bg: 'bg-brand-secondary',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  };
  const { border, text, bg, icon } = getSeverityInfo(alert.severity);

  return (
    <motion.div
      variants={itemVariants}
      className={`p-4 rounded-lg border-l-4 ${border} ${bg}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <span
            className={`flex-shrink-0 mr-3 rtl:ml-3 rtl:mr-0 mt-0.5 ${text}`}
          >
            {icon}
          </span>
          <h4 className={`font-bold ${text}`}>{alert.alert}</h4>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 rtl:ml-0 rtl:mr-2 ${text} ${bg}`}
        >
          {alert.severity}
        </span>
      </div>
      <p className="text-sm text-brand-text/80 mt-2 pl-8 rtl:pl-0 rtl:pr-8">
        {alert.recommendation}
      </p>
    </motion.div>
  );
};

const FundraisingRoadmapDisplay: React.FC<{ data: FundraisingRoadmapData }> = ({
  data,
}) => {
  const { t } = useLanguage();

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('phases' in data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <div className="text-brand-text/60">
          <p>No fundraising roadmap data available.</p>
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
      className="w-full space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-brand-teal mb-4">
          {t('fundraisingRoadmapTitle')}
        </h3>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold text-brand-light mb-4">
              {t('fundraisingRoadmapTimeline')}
            </h3>
            <div className="space-y-6 relative pl-4 rtl:pl-0 rtl:pr-4">
              <div className="absolute top-0 bottom-0 left-0 rtl:left-auto rtl:right-0 w-1 bg-brand-accent/30 rounded-full"></div>
              {(data.phases || []).map((phase) => (
                <div key={phase.phaseName} className="relative">
                  <div className="absolute -left-6 rtl:-left-auto rtl:-right-6 top-1 h-4 w-4 bg-brand-teal rounded-full border-4 border-brand-primary"></div>
                  <h4 className="text-lg font-bold text-brand-teal mb-3">
                    {phase.phaseName}
                  </h4>
                  <div className="space-y-3">
                    {(phase.tasks || []).map((task, index) => (
                      <TaskCard key={index} task={task} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold text-brand-light mb-4">
              {t('fundraisingRoadmapAlerts')}
            </h3>
            <div className="space-y-4">
              {(data.smartAlerts || []).map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold text-brand-light mb-4">
              {t('fundraisingRoadmapAlternatives')}
            </h3>
            <div className="space-y-3">
              {(data.alternativeFunding || []).map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg p-4 bg-brand-secondary/40"
                >
                  <strong className="font-semibold text-brand-text/95 text-sm display-block">
                    {item.option}
                  </strong>
                  <p className="text-brand-text/80 text-sm mt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FundraisingRoadmapDisplay;
