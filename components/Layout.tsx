
import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import SidebarNav from './SidebarNav';
import Hero from './Hero';
import OnboardingTour, { TourStep } from './OnboardingTour';
import ShareModal from './ShareModal';
import AuthModal from './AuthModal';
import type { ModuleType, AnyTool } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  activeModule: ModuleType;
  onNavigate: (module: ModuleType, tool: AnyTool) => void;
  onModuleChange: (module: ModuleType) => void;
  children: React.ReactNode;
  subNav?: React.ReactNode;
  isTourOpen: boolean;
  setIsTourOpen: (isOpen: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  viewingHistoryRecord: boolean;
  onReturnToWorkspace: () => void;
  timestamp?: string;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

const tourSteps: TourStep[] = [
  { titleKey: 'tourWelcomeTitle', contentKey: 'tourWelcomeContent', placement: 'center' },
  { target: '#sidebar-nav', titleKey: 'tourSidebarTitle', contentKey: 'tourSidebarContent', placement: 'right' },
  { target: '#sub-nav', titleKey: 'tourSubNavTitle', contentKey: 'tourSubNavContent', placement: 'bottom' },
  { target: '#business-description-input', titleKey: 'tourInputTitle', contentKey: 'tourInputContent', placement: 'bottom' },
  { target: '#generate-button', titleKey: 'tourGenerateTitle', contentKey: 'tourGenerateContent', placement: 'left' },
  { target: '#export-content-area', titleKey: 'tourOutputTitle', contentKey: 'tourOutputContent', placement: 'top' },
  { target: '#export-controls', titleKey: 'tourExportTitle', contentKey: 'tourExportContent', placement: 'left' },
  { target: '#search-bar', titleKey: 'tourSearchTitle', contentKey: 'tourSearchContent', placement: 'bottom' },
  { target: '#language-switcher', titleKey: 'tourLanguageTitle', contentKey: 'tourLanguageContent', placement: 'bottom' },
  { titleKey: 'tourEndTitle', contentKey: 'tourEndContent', placement: 'center' },
];

const Layout: React.FC<LayoutProps> = ({
  activeModule,
  onNavigate,
  onModuleChange,
  children,
  subNav,
  isTourOpen,
  setIsTourOpen,
  isAuthModalOpen,
  setIsAuthModalOpen,
  viewingHistoryRecord,
  onReturnToWorkspace,
  timestamp,
  isFocusMode,
  onToggleFocusMode
}) => {
  const { t } = useLanguage();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleStartTour = useCallback(() => setIsTourOpen(true), [setIsTourOpen]);
  const handleShareClick = useCallback(() => setIsShareModalOpen(true), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  return (
    <div className={`min-h-screen bg-brand-primary transition-all duration-300 ${isTourOpen ? 'overflow-hidden' : ''}`}>

      {/* Focus Mode Exit Button */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={onToggleFocusMode}
            className="fixed top-4 right-4 z-[60] px-4 py-2 bg-brand-secondary/90 backdrop-blur-md border border-brand-accent/50 rounded-full text-brand-text hover:text-white text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-brand-accent/50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit Focus
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isFocusMode && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="sticky top-0 z-50"
          >
            <Header
              onNavigate={onNavigate}
              onStartTour={handleStartTour}
              onShareClick={handleShareClick}
              onToggleSidebar={toggleSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <AnimatePresence>
          {!isFocusMode && (
            <>
              {/* Mobile Overlay */}
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                />
              )}

              {/* Sidebar Container */}
              <motion.div
                initial={{ x: -280, opacity: 0 }} // Start off-screen
                animate={{
                  x: 0,
                  opacity: 1,
                  width: 'auto',
                  transition: { duration: 0.3 }
                }}
                exit={{ x: -280, opacity: 0 }}
                className={`fixed md:relative z-40 h-[calc(100vh-4rem)] ${isSidebarOpen ? 'block' : 'hidden md:block'}`}
              >
                <SidebarNav activeModule={activeModule} onModuleChange={onModuleChange} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className={`flex-1 transition-all duration-300 ${!isFocusMode ? 'md:ml-20 rtl:md:ml-0 rtl:md:mr-20 pb-20 md:pb-0' : 'p-4 md:p-8'}`}>

          {!isFocusMode && <Hero activeModule={activeModule} />}

          <AnimatePresence>
            {viewingHistoryRecord && !isFocusMode && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="sticky top-16 z-30 bg-yellow-500/10 text-yellow-300 p-2 text-center text-sm font-semibold border-b border-yellow-500/30"
              >
                Viewing historical version from {timestamp ? new Date(timestamp).toLocaleString() : 'Unknown'} | <button onClick={onReturnToWorkspace} className="underline hover:text-white">Return to Workspace</button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isFocusMode && (
              <motion.div
                id="sub-nav"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`px-4 mt-8 mb-8 sticky top-16 z-30 ${viewingHistoryRecord ? 'pt-12 -mt-12' : ''} transition-all duration-300`}
              >
                {subNav}
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${isFocusMode ? 'max-w-5xl' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isTourOpen && <OnboardingTour steps={tourSteps} onFinish={() => { setIsTourOpen(false); localStorage.setItem('atlas-ai-tour-complete', 'true'); }} />}
      </AnimatePresence>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Layout;
