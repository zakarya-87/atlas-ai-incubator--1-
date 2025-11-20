
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import Search from './Search';
import Tooltip from './Tooltip';
import type { ModuleType, AnyTool } from '../types';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import { fetchUserProfile } from '../services/authService';

interface HeaderProps {
  onNavigate: (module: ModuleType, tool: AnyTool) => void;
  onStartTour: () => void;
  onShareClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onStartTour, onShareClick }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);

  // Fetch credits periodically or on load
  useEffect(() => {
      if (isAuthenticated) {
          const loadCredits = async () => {
              try {
                  const profile = await fetchUserProfile();
                  setCredits(profile.credits);
                  setIsPro(profile.subscriptionStatus === 'active');
              } catch (e) {
                  console.error("Failed to load credits");
              }
          };
          loadCredits();
          // Refresh every 30s to keep sync (simple poll)
          const interval = setInterval(loadCredits, 30000);
          return () => clearInterval(interval);
      } else {
          setCredits(null);
          setIsPro(false);
      }
  }, [isAuthenticated]);

  return (
    <>
    <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex-shrink-0">
             <h1 className="text-xl font-bold text-brand-text tracking-tight">
              {t('headerTitle')}
            </h1>
          </div>
           <div className="flex-1 flex justify-center px-4">
            <Search onNavigate={onNavigate} />
          </div>
          <div id="language-switcher" className="flex items-center gap-2">
             <LanguageSwitcher />
             
             {isAuthenticated ? (
                <div className="flex items-center gap-4 border-l border-white/10 pl-4 ml-2">
                   {/* Credit Display */}
                   <Tooltip content={isPro ? "Unlimited Access" : "Remaining AI Generations"} position="bottom">
                       <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
                           isPro 
                             ? 'bg-gradient-to-r from-brand-teal to-blue-500 text-white border-transparent' 
                             : (credits !== null && credits <= 2) 
                                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                : 'bg-brand-secondary/50 text-brand-teal border-brand-teal/30'
                       }`}>
                           {isPro ? (
                               <>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                 PRO
                               </>
                           ) : (
                               <>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                 {credits} Credits
                               </>
                           )}
                       </div>
                   </Tooltip>

                   <div className="flex items-center gap-2">
                       <button 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="text-xs text-brand-light hover:text-white font-medium hidden sm:block transition-colors"
                       >
                            {user?.email.split('@')[0]}
                       </button>
                       <Tooltip content="Logout" position="bottom">
                        <button
                            onClick={logout}
                            className="p-2 rounded-full text-brand-light hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                       </Tooltip>
                   </div>
                </div>
             ) : (
                 <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="ml-2 px-4 py-1.5 text-xs font-bold bg-brand-accent/20 text-brand-teal border border-brand-teal/50 rounded-full hover:bg-brand-teal hover:text-white transition-all"
                 >
                    Sign In
                 </button>
             )}

             <div className="w-px h-6 bg-white/10 mx-1"></div>

             <Tooltip content={t('tooltipStartTour')} position="bottom">
               <button
                onClick={onStartTour}
                className="p-2 rounded-full text-brand-light hover:bg-brand-accent/50 hover:text-white transition-colors"
                aria-label={t('tourStart')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
             </Tooltip>
             <Tooltip content={t('tooltipShare')} position="bottom">
              <button
                onClick={onShareClick}
                className="p-2 rounded-full text-brand-light hover:bg-brand-accent/50 hover:text-white transition-colors"
                aria-label={t('headerShare')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367 2.684z" />
                </svg>
              </button>
             </Tooltip>
          </div>
        </div>
      </div>
    </header>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};

export default Header;
