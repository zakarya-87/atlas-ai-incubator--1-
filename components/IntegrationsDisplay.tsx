
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { fetchIntegrations, toggleIntegration, IntegrationStatus } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface ConnectorCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  onToggle: () => void;
}

const ConnectorCard: React.FC<ConnectorCardProps> = ({ id, title, description, icon, isConnected, onToggle }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
        await onToggle();
    } catch (error) {
        console.error("Integration toggle failed", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <motion.div variants={itemVariants} className={`bg-brand-secondary/40 p-6 rounded-lg flex flex-col md:flex-row items-center gap-6 border transition-colors ${isConnected ? 'border-green-500/30 bg-green-900/5' : 'border-brand-accent/50'}`}>
      <div className="flex-shrink-0 w-16 h-16 bg-brand-primary/50 rounded-full flex items-center justify-center text-brand-light">
        {icon}
      </div>
      <div className="flex-grow text-center md:text-left">
        <h3 className="text-xl font-bold text-brand-text">{title}</h3>
        <p className="text-sm text-brand-light mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0 w-full md:w-auto">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`w-full md:w-32 px-4 py-2 font-bold rounded-lg transition-all duration-300 flex items-center justify-center ${
            isConnected
              ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30'
              : isLoading
              ? 'bg-brand-accent/50 text-brand-light cursor-wait'
              : 'bg-brand-teal hover:bg-teal-500 text-white'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          ) : isConnected ? (
             "Disconnect"
          ) : (
            t('integrationsConnect')
          )}
        </button>
      </div>
    </motion.div>
  );
};

interface IntegrationsDisplayProps {
    ventureId: string;
}

const IntegrationsDisplay: React.FC<IntegrationsDisplayProps> = ({ ventureId }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  
  useEffect(() => {
      const loadIntegrations = async () => {
          if (!ventureId) return;
          try {
              const data = await fetchIntegrations(ventureId);
              setIntegrations(data);
          } catch (e) {
              // Silent fail or log
              console.debug("Integrations unavailable");
          }
      };
      loadIntegrations();
  }, [ventureId]);

  const handleToggle = async (providerId: string) => {
      try {
        const isCurrentlyConnected = integrations.find(i => i.provider === providerId)?.status === 'connected';
        await toggleIntegration(ventureId, providerId, !isCurrentlyConnected);
        
        // Refresh list
        const data = await fetchIntegrations(ventureId);
        setIntegrations(data);
      } catch (e: any) {
        showToast(e.message || "Operation failed. Are you signed in?", 'error');
      }
  };
  
  const connectors = [
    {
        id: 'ga',
        title: t('integrationsGA'),
        description: t('integrationsGADesc'),
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    },
    {
        id: 'meta',
        title: t('integrationsMeta'),
        description: t('integrationsMetaDesc'),
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 002-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4 4h5a2 2 0 002-2v-6a2 2 0 00-2-2z" /></svg>
    }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-3xl font-bold text-brand-text">{t('integrationsTitle')}</h2>
        <p className="mt-2 text-brand-light max-w-2xl mx-auto">{t('integrationsDescription')}</p>
      </motion.div>

      <div className="space-y-4">
        {connectors.map(connector => (
            <ConnectorCard 
                key={connector.id} 
                {...connector} 
                isConnected={integrations.find(i => i.provider === connector.id)?.status === 'connected'}
                onToggle={() => handleToggle(connector.id)}
            />
        ))}
      </div>
    </motion.div>
  );
};

export default IntegrationsDisplay;
