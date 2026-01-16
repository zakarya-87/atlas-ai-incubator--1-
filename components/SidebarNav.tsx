
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { ModuleType } from '../types';
import { TranslationKey } from '../locales';
import Tooltip from './Tooltip';

interface SidebarNavProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

// Configuration for navigation items
interface NavItemConfig {
  key: ModuleType;
  labelKey: TranslationKey;
  iconKey: keyof typeof iconComponents;
  tooltipKey: TranslationKey;
}

const navigationConfig: NavItemConfig[] = [
  { key: 'dashboard', labelKey: 'sidebarDashboard', iconKey: 'dashboard', tooltipKey: 'tooltipDashboard' },
  { key: 'fundamentals', labelKey: 'sidebarFundamentals', iconKey: 'fundamentals', tooltipKey: 'tooltipFundamentals' },
  { key: 'strategy', labelKey: 'sidebarStrategy', iconKey: 'strategy', tooltipKey: 'tooltipStrategy' },
  { key: 'marketAnalysis', labelKey: 'sidebarMarketAnalysis', iconKey: 'marketAnalysis', tooltipKey: 'tooltipMarketAnalysis' },
  { key: 'finance', labelKey: 'sidebarFinance', iconKey: 'finance', tooltipKey: 'tooltipFinance' },
  { key: 'growth', labelKey: 'sidebarGrowth', iconKey: 'growth', tooltipKey: 'tooltipGrowth' },
  { key: 'funding', labelKey: 'sidebarFunding', iconKey: 'funding', tooltipKey: 'tooltipFunding' },
  { key: 'productivity', labelKey: 'sidebarProductivity', iconKey: 'productivity', tooltipKey: 'tooltipProductivity' },
  { key: 'integrations', labelKey: 'sidebarIntegrations', iconKey: 'integrations', tooltipKey: 'tooltipIntegrations' },
  { key: 'architecture', labelKey: 'sidebarArchitecture', iconKey: 'architecture', tooltipKey: 'tooltipArchitecture' },
  { key: 'audit', labelKey: 'sidebarAuditTrail', iconKey: 'audit', tooltipKey: 'tooltipAudit' },
];

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    tooltip: string;
    active?: boolean;
    onClick: () => void;
}

const DesktopNavItem: React.FC<NavItemProps> = ({ icon, label, tooltip, active, onClick }) => (
  <Tooltip content={tooltip} position="right" className="w-full">
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-colors duration-200 group w-full ${
        active ? 'bg-brand-teal/20 text-brand-teal' : 'text-brand-light hover:bg-brand-accent/30'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <div className="h-6 w-6">{icon}</div>
      <span className="text-xs font-medium tracking-wider group-hover:text-brand-text transition-colors duration-200">
        {label}
      </span>
    </button>
  </Tooltip>
);

const MobileNavItem: React.FC<NavItemProps> = ({ icon, label, tooltip, active, onClick }) => (
    <Tooltip content={tooltip} position="top" className="flex-1">
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-lg transition-colors duration-200 group w-full ${
          active ? 'text-brand-teal' : 'text-brand-light hover:text-brand-text'
        }`}
        aria-current={active ? 'page' : undefined}
      >
        <div className="h-6 w-6">{icon}</div>
        <span className="text-[10px] font-medium tracking-wider transition-colors duration-200">
          {label}
        </span>
      </button>
    </Tooltip>
  );

const iconComponents = {
  dashboard: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
  ),
  fundamentals: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
  ),
  strategy: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
  ),
  marketAnalysis: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
  ),
  finance: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m16.5 0h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m0 0a1.125 1.125 0 0 0-1.125 1.125v.375m0 0a1.125 1.125 0 0 1-1.125 1.125H3.75a1.125 1.125 0 0 1-1.125-1.125v-.375a1.125 1.125 0 0 0-1.125-1.125m0 0H2.25" /></svg>
  ),
  growth: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>
  ),
  funding: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.554-.413 1.278-.659 2.003-.659c.768 0 1.536.219 2.232.659l.879.659m0-2.219-2.232.659m2.232-.659L12 6.75l-2.232 2.219" /></svg>
  ),
  integrations: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-3.375A4.5 4.5 0 0 0 9 13.5h-3a4.5 4.5 0 0 0-4.5 4.5v3.375M13.5 21h-3v-3.375a4.5 4.5 0 0 1 4.5-4.5h1.5a4.5 4.5 0 0 1 4.5 4.5v3.375h-3M13.5 21v-3.375A4.5 4.5 0 0 0 9 13.5h-3m3 0V3" /></svg>
  ),
  architecture: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21v-18a2.25 2.25 0 0 1 2.25-2.25h12A2.25 2.25 0 0 1 20.25 3v18M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V3m6 18V3" />
    </svg>
  ),
  audit: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  productivity: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  ),
};

const SidebarNav: React.FC<SidebarNavProps> = ({ activeModule, onModuleChange }) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Desktop Sidebar */}
      <div id="sidebar-nav" className="hidden md:flex flex-col w-20 bg-brand-secondary/80 backdrop-blur-md border-r border-white/5 h-[calc(100vh-4rem)] fixed top-16 left-0 rtl:left-auto rtl:right-0 rtl:border-r-0 rtl:border-l overflow-y-auto py-4 z-40 transition-all duration-300">
        <div className="flex flex-col space-y-2 px-2">
          {navigationConfig.map((item) => (
            <DesktopNavItem
              key={item.key}
              icon={iconComponents[item.iconKey]}
              label={t(item.labelKey)}
              tooltip={t(item.tooltipKey)}
              active={activeModule === item.key}
              onClick={() => onModuleChange(item.key)}
            />
          ))}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <nav role="navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-secondary/90 backdrop-blur-lg border-t border-white/10 z-50 pb-safe">
        <div className="flex justify-around items-center p-2 overflow-x-auto">
          {navigationConfig.map((item) => (
            <MobileNavItem
              key={item.key}
              icon={iconComponents[item.iconKey]}
              label={t(item.labelKey)}
              tooltip={t(item.tooltipKey)}
              active={activeModule === item.key}
              onClick={() => onModuleChange(item.key)}
            />
          ))}
        </div>
      </nav>
    </>
  );
};

export default SidebarNav;