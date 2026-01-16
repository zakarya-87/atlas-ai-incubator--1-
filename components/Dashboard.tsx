
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchUserProfile } from '../services/authService';
import { fetchVentureHistory, fetchIntegrations, IntegrationStatus } from '../services/geminiService';
import type { GenerationRecord, ModuleType, AnyTool } from '../types';

interface DashboardProps {
  ventureId: string;
  onNavigate: (module: ModuleType, tool: AnyTool) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Dashboard: React.FC<DashboardProps> = ({ ventureId, onNavigate }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          if (isAdmin) {
            // Demo mode: stub values, skip backend
            setCredits(100);
            setIsPro(true);
          } else {
            const profile = await fetchUserProfile();
            setCredits(profile.credits);
            setIsPro(profile.subscriptionStatus === 'active');
          }
        }
        
        if (ventureId && isAuthenticated && !isAdmin) {
            try {
                const hist = await fetchVentureHistory(ventureId);
                setHistory(hist.slice(0, 5)); // Top 5
                const ints = await fetchIntegrations(ventureId);
                setIntegrations(ints);
            } catch(e) {
                console.warn("Dashboard data partial fail", e);
            }
        } else if (isAdmin) {
            // Optional: provide demo placeholders
            setHistory([]);
            setIntegrations([]);
        }
      } catch (e) {
        console.error("Dashboard load error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, isAdmin, ventureId]);

  const userName = user?.email.split('@')[0] || 'Founder';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-6xl mx-auto space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-brand-secondary to-brand-primary p-8 rounded-2xl border border-brand-accent/30 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text">
          {t('dashboardWelcome')} <span className="text-brand-teal">{userName}</span>
        </h1>
        <p className="text-brand-light mt-2 text-lg">
          {t('dashboardHeroSubtitle')}
        </p>
        
        <div className="mt-6 flex items-center gap-4">
           <div className="px-4 py-2 bg-black/30 rounded-lg border border-white/10 flex items-center gap-2">
                <span className="text-sm text-brand-light">{t('dashboardCredits')}:</span>
                <span className={`font-bold ${isPro ? 'text-brand-teal' : credits !== null && credits < 2 ? 'text-red-400' : 'text-brand-text'}`}>
                    {isPro ? t('dashboardUnlimited') : credits ?? '-'}
                </span>
           </div>
           <div className="px-4 py-2 bg-black/30 rounded-lg border border-white/10 flex items-center gap-2">
                <span className="text-sm text-brand-light">Plan:</span>
                <span className="font-bold text-brand-text text-xs uppercase bg-brand-accent/50 px-2 py-0.5 rounded">
                    {isPro ? t('dashboardPlanPro') : t('dashboardPlanFree')}
                </span>
           </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-bold text-brand-text mb-4">{t('dashboardQuickActions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => onNavigate('fundamentals', 'ideaValidation')} className="p-4 bg-brand-secondary/40 hover:bg-brand-secondary border border-brand-accent/30 rounded-xl transition-all group text-left">
                <div className="bg-purple-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <span className="font-semibold text-brand-text block">{t('dashboardActionIdea')}</span>
            </button>
            
            <button onClick={() => onNavigate('strategy', 'swot')} className="p-4 bg-brand-secondary/40 hover:bg-brand-secondary border border-brand-accent/30 rounded-xl transition-all group text-left">
                <div className="bg-blue-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <span className="font-semibold text-brand-text block">{t('dashboardActionStrategy')}</span>
            </button>

            <button onClick={() => onNavigate('finance', 'financialForecast')} className="p-4 bg-brand-secondary/40 hover:bg-brand-secondary border border-brand-accent/30 rounded-xl transition-all group text-left">
                <div className="bg-green-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
                </div>
                <span className="font-semibold text-brand-text block">{t('dashboardActionFinance')}</span>
            </button>

            <button onClick={() => onNavigate('funding', 'pitchDeckGenerator')} className="p-4 bg-brand-secondary/40 hover:bg-brand-secondary border border-brand-accent/30 rounded-xl transition-all group text-left">
                <div className="bg-yellow-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="font-semibold text-brand-text block">{t('dashboardActionFunding')}</span>
            </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-brand-secondary/20 rounded-xl p-6 border border-brand-accent/30">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-brand-text">{t('dashboardRecentActivity')}</h3>
                <button onClick={() => onNavigate('audit', 'trail')} className="text-sm text-brand-teal hover:text-white transition-colors">{t('dashboardViewAll')}</button>
            </div>
            
            <div className="space-y-3">
                {isLoading ? (
                     <div className="animate-pulse space-y-3">
                        <div className="h-12 bg-brand-secondary/50 rounded-lg"></div>
                        <div className="h-12 bg-brand-secondary/50 rounded-lg"></div>
                        <div className="h-12 bg-brand-secondary/50 rounded-lg"></div>
                     </div>
                ) : history.length > 0 ? (
                    history.map(record => (
                        <div key={record.id} className="p-3 rounded-lg bg-brand-secondary/30 flex items-center justify-between group hover:bg-brand-secondary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-teal"></div>
                                <div>
                                    <p className="text-sm font-bold text-brand-text group-hover:text-white transition-colors">{t(record.toolNameKey as any)}</p>
                                    <p className="text-xs text-brand-light">{new Date(record.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => onNavigate('audit', 'trail')} className="text-xs px-2 py-1 bg-brand-primary/50 rounded text-brand-light hover:text-white">View</button>
                        </div>
                    ))
                ) : (
                    <p className="text-brand-light/50 text-center py-8">{t('dashboardNoActivity')}</p>
                )}
            </div>
        </motion.div>

        {/* Integrations Status */}
        <motion.div variants={itemVariants} className="bg-brand-secondary/20 rounded-xl p-6 border border-brand-accent/30">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-brand-text">{t('dashboardIntegrations')}</h3>
                <button onClick={() => onNavigate('integrations', 'connectors')} className="text-sm text-brand-teal hover:text-white transition-colors">Manage</button>
            </div>
            
            <div className="space-y-4">
                {['ga', 'meta'].map(provider => {
                    const isConnected = integrations.find(i => i.provider === provider)?.status === 'connected';
                    const label = provider === 'ga' ? t('integrationsGA') : t('integrationsMeta');
                    
                    return (
                        <div key={provider} className="flex items-center justify-between p-3 bg-brand-secondary/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary/50 text-brand-light'}`}>
                                    {provider === 'ga' ? (
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    ) : (
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 002-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4 4h5a2 2 0 002-2v-6a2 2 0 00-2-2z" /></svg>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-brand-text">{label}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary/50 text-brand-light'}`}>
                                {isConnected ? t('dashboardConnected') : t('dashboardDisconnected')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
