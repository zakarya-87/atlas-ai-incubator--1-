
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';
import type { StrategyTool, FundamentalsTool, FinanceTool, MarketAnalysisTool, GrowthTool, FundingTool, ArchitectureTool, IntegrationsTool, ProductivityTool } from '../types';

type AnyTool = StrategyTool | FundamentalsTool | FinanceTool | MarketAnalysisTool | GrowthTool | FundingTool | ArchitectureTool | IntegrationsTool | ProductivityTool;

interface WelcomeMessageProps {
  activeTool: AnyTool;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ activeTool }) => {
  const { t } = useLanguage();

  let titleKey: TranslationKey;
  let textKey: TranslationKey;
  let icon: React.ReactNode;

  switch(activeTool) {
    case 'swot':
      titleKey = 'welcomeTitleSwot';
      textKey = 'welcomeTextSwot';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
      break;
    case 'pestel':
      titleKey = 'welcomeTitlePestel';
      textKey = 'welcomeTextPestel';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.757 15.243l.001-.001M21.055 11H19a2 2 0 00-2 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 00-2-2h-1.945M12 7.243l.001-.001M16.243 11.243l-.001.001M12 11.243l.001-.001" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    case 'overview':
      titleKey = 'welcomeTitleMarket';
      textKey = 'welcomeTextMarket';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      );
      break;
    case 'research':
      titleKey = 'welcomeTitleMarketResearch';
      textKey = 'welcomeTextMarketResearch';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.287 8.287 0 0 0 3.962-2.558 8.252 8.252 0 0 1 2.4-2.83Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 3.75 3.75 0 0 0-7.99 0 3.75 3.75 0 0 0 .495 7.468Z" /></svg>
      );
      break;
    case 'roadmap':
        titleKey = 'welcomeTitleRoadmap';
        textKey = 'welcomeTextRoadmap';
        icon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        );
        break;
    case 'leanCanvas':
        titleKey = 'welcomeTitleLeanCanvas';
        textKey = 'welcomeTextLeanCanvas';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h9.75a2.25 2.25 0 0 1 2.25 2.25Z" />
            </svg>
        );
        break;
    case 'okrWorkflow':
        titleKey = 'welcomeTitleOkrWorkflow';
        textKey = 'welcomeTextOkrWorkflow';
        icon = (
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
        );
        break;
    case 'ideaValidation':
        titleKey = 'welcomeTitleIdeaValidation';
        textKey = 'welcomeTextIdeaValidation';
        icon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.421-.62-2.897-1.59-4.07-2.848m11.54 5.698c1.173-1.258 2.649-2.228 4.07-2.848a7.5 7.5 0 0 0-7.5 0m7.5 0a7.5 7.5 0 0 1-7.5 0m0 0c-1.421.62-2.897 1.59-4.07 2.848m11.54-5.698a12.06 12.06 0 0 0-4.5 0m3.75 2.311a7.5 7.5 0 0 0-7.5 0" />
          </svg>
        );
        break;
    case 'problemValidation':
        titleKey = 'welcomeTitleProblemValidation';
        textKey = 'welcomeTextProblemValidation';
        icon = (
           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
          </svg>
        );
        break;
    case 'competitorAnalysis':
        titleKey = 'welcomeTitleCompetitorAnalysis';
        textKey = 'welcomeTextCompetitorAnalysis';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v.015m0 3.735v.015m0 3.735v.015m3.75-5.25v.015m-7.5 0v.015m7.5 0v.015m0 3.735v.015m-7.5 0v.015m7.5 0v.015M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        );
        break;
    case 'customerValidation':
        titleKey = 'welcomeTitleCustomerValidation';
        textKey = 'welcomeTextCustomerValidation';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
        );
        break;
    case 'riskFeasibility':
        titleKey = 'welcomeTitleRiskFeasibility';
        textKey = 'welcomeTextRiskFeasibility';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z" />
            </svg>
        );
        break;
    case 'validationTracker':
        titleKey = 'welcomeTitleValidationTracker';
        textKey = 'welcomeTextValidationTracker';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
        );
        break;
    case 'brandIdentity':
      titleKey = 'welcomeTitleBrandIdentity';
      textKey = 'welcomeTextBrandIdentity';
      icon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
          </svg>
      );
      break;
    case 'experimentBuilder':
      titleKey = 'welcomeTitleExperimentBuilder';
      textKey = 'welcomeTextExperimentBuilder';
      icon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
      );
      break;
    case 'budgetGenerator':
        titleKey = 'welcomeTitleBudgetGenerator';
        textKey = 'welcomeTextBudgetGenerator';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m16.5 0h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m0 0a1.125 1.125 0 0 0-1.125 1.125v.375m0 0a1.125 1.125 0 0 1-1.125 1.125H3.75a1.125 1.125 0 0 1-1.125-1.125v-.375a1.125 1.125 0 0 0-1.125-1.125m0 0H2.25" />
            </svg>
        );
        break;
    case 'financialForecast':
        titleKey = 'welcomeTitleFinancialForecast';
        textKey = 'welcomeTextFinancialForecast';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l3 3L21.75 6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v6m0 0h-6m6 0-8-8" />
            </svg>
        );
        break;
    case 'cashFlowForecast':
        titleKey = 'welcomeTitleCashFlowForecast';
        textKey = 'welcomeTextCashFlowForecast';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M12 18V5.25m-3.75 3 3.75-3.75 3.75 3.75" />
            </svg>
        );
        break;
    case 'kpiDashboards':
        titleKey = 'welcomeTitleKpiDashboards';
        textKey = 'welcomeTextKpiDashboards';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V5.25A2.25 2.25 0 0 0 18 3H6A2.25 2.25 0 0 0 3.75 5.25v12.75A2.25 2.25 0 0 0 6 20.25Z" />
            </svg>
        );
        break;
    case 'milestones':
        titleKey = 'welcomeTitleMilestones';
        textKey = 'welcomeTextMilestones';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 9.563V9a3 3 0 0 1 6 0v.563m-6 0v5.874a3 3 0 0 0 6 0V9.563" />
            </svg>
        );
        break;
    case 'expansionStrategy':
        titleKey = 'welcomeTitleExpansionStrategy';
        textKey = 'welcomeTextExpansionStrategy';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L6 12Zm0 0h12.75" />
            </svg>
        );
        break;
    case 'pitchDeckGenerator':
        titleKey = 'welcomeTitlePitchDeckGenerator';
        textKey = 'welcomeTextPitchDeckGenerator';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 14.25v4.5A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25v-4.5m-16.5 0h16.5" />
            </svg>
        );
        break;
    case 'investorDatabase':
        titleKey = 'welcomeTitleInvestorDatabase';
        textKey = 'welcomeTextInvestorDatabase';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.286 5.446A4.5 4.5 0 0 1 7.286 15H6.5A4.5 4.5 0 0 1 2 10.5V10c0-1.242.414-2.395 1.13-3.322m13.235 4.346A4.5 4.5 0 0 0 17.5 10.5h.721a9.043 9.043 0 0 0-4.436-3.483m-3.442 3.483a4.5 4.5 0 0 0-4.286-2.722M7.286 15a4.5 4.5 0 0 0-4.286 2.722" />
            </svg>
        );
        break;
    case 'fundraisingRoadmap':
        titleKey = 'welcomeTitleFundraisingRoadmap';
        textKey = 'welcomeTextFundraisingRoadmap';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H21a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 21 3H3a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3 21h3.75m13.5-6.75a5.25 5.25 0 0 0-10.5 0 .75.75 0 0 1-1.5 0a6.75 6.75 0 1 1 13.5 0a.75.75 0 0 1-1.5 0Z" />
            </svg>
        );
        break;
    case 'systemDesign':
        titleKey = 'welcomeTitleArchitecture';
        textKey = 'welcomeTextArchitecture';
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21v-18a2.25 2.25 0 0 1 2.25-2.25h12A2.25 2.25 0 0 1 20.25 3v18M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V3m6 18V3" />
            </svg>
        );
        break;
    case 'connectors':
      titleKey = 'welcomeTitleIntegrations';
      textKey = 'welcomeTextIntegrations';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-3.375A4.5 4.5 0 0 0 9 13.5h-3a4.5 4.5 0 0 0-4.5 4.5v3.375M13.5 21h-3v-3.375a4.5 4.5 0 0 1 4.5-4.5h1.5a4.5 4.5 0 0 1 4.5 4.5v3.375h-3M13.5 21v-3.375A4.5 4.5 0 0 0 9 13.5h-3m3 0V3" />
        </svg>
      );
      break;
    case 'taskManager':
      titleKey = 'welcomeTitleTaskManager';
      textKey = 'welcomeTextTaskManager';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      );
      break;
  }

  return (
    <div className="text-center p-8 text-brand-light max-w-lg mx-auto animate-fade-in">
      {icon}
      <h2 className="mt-6 text-2xl font-bold text-brand-text">{t(titleKey)}</h2>
      <p className="mt-2">
        {t(textKey)}
      </p>
    </div>
  );
};

export default WelcomeMessage;
