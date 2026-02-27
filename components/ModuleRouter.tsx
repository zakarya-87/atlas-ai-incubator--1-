import React, { Suspense } from 'react';
import type {
  ModuleType,
  AnyTool,
  AnyAnalysisData,
  GenerationRecord,
  StrategyTool,
  MarketAnalysisTool,
  FundamentalsTool,
  FinanceTool,
  GrowthTool,
  FundingTool,
  ProductivityTool,
  DashboardTool,
} from '../types';

// SubNavs (Keep eager loaded as they are small and critical for navigation)
import StrategySubNav from './StrategySubNav';
import MarketAnalysisSubNav from './MarketAnalysisSubNav';
import FundamentalsSubNav from './FundamentalsSubNav';
import FinanceSubNav from './FinanceSubNav';
import GrowthSubNav from './GrowthSubNav';
import FundingSubNav from './FundingSubNav';
import ProductivitySubNav from './ProductivitySubNav';

// Utils & Shared (Eager loaded)
import AgentOrchestrator from './AgentOrchestrator';
import ErrorMessage from './ErrorMessage';
import WelcomeMessage from './WelcomeMessage';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

// Lazy Loaded Display Components
const SwotDisplay = React.lazy(() => import('./SwotDisplay'));
const PestelDisplay = React.lazy(() => import('./PestelDisplay'));
const MarketAnalysisDisplay = React.lazy(
  () => import('./MarketAnalysisDisplay')
);
const MarketResearchDisplay = React.lazy(
  () => import('./MarketResearchDisplay')
);
const RoadmapDisplay = React.lazy(() => import('./RoadmapDisplay'));
const LeanCanvasDisplay = React.lazy(() => import('./LeanCanvasDisplay'));
const OkrWorkflowDisplay = React.lazy(() => import('./OkrWorkflowDisplay'));
const IdeaValidationDisplay = React.lazy(
  () => import('./IdeaValidationDisplay')
);
const ProblemValidationDisplay = React.lazy(
  () => import('./ProblemValidationDisplay')
);
const CompetitorAnalysisDisplay = React.lazy(
  () => import('./CompetitorAnalysisDisplay')
);
const CustomerValidationDisplay = React.lazy(
  () => import('./CustomerValidationDisplay')
);
const RiskFeasibilityDisplay = React.lazy(
  () => import('./RiskFeasibilityDisplay')
);
const ValidationTrackerDisplay = React.lazy(
  () => import('./ValidationTrackerDisplay')
);
const BudgetGeneratorDisplay = React.lazy(
  () => import('./BudgetGeneratorDisplay')
);
const FinancialForecastDisplay = React.lazy(
  () => import('./FinancialForecastDisplay')
);
const CashFlowForecastDisplay = React.lazy(
  () => import('./CashFlowForecastDisplay')
);
const KpiDashboardDisplay = React.lazy(() => import('./KpiDashboardDisplay'));
const MilestonesDisplay = React.lazy(() => import('./MilestonesDisplay'));
const ExpansionStrategyDisplay = React.lazy(
  () => import('./ExpansionStrategyDisplay')
);
const PitchDeckDisplay = React.lazy(() => import('./PitchDeckDisplay'));
const InvestorMatchingDisplay = React.lazy(
  () => import('./InvestorMatchingDisplay')
);
const FundraisingRoadmapDisplay = React.lazy(
  () => import('./FundraisingRoadmapDisplay')
);
const ArchitectureExplanation = React.lazy(
  () => import('./ArchitectureExplanation')
);
const IntegrationsDisplay = React.lazy(() => import('./IntegrationsDisplay'));
const AuditTrailDisplay = React.lazy(() => import('./AuditTrailDisplay'));
const ExperimentBuilderDisplay = React.lazy(
  () => import('./ExperimentBuilderDisplay')
);
const TaskManager = React.lazy(() => import('./TaskManager'));
const BrandIdentityDisplay = React.lazy(() => import('./BrandIdentityDisplay'));
const Dashboard = React.lazy(() => import('./Dashboard'));

interface ModuleRouterProps {
  activeModule: ModuleType;
  activeTool: AnyTool;
  currentAnalysis: AnyAnalysisData | null;
  isLoading: boolean;
  error: { code: string; message: string } | null;
  isRetrying: boolean;
  ventureId: string;
  generationHistory: GenerationRecord[];
  viewingHistoryRecord: GenerationRecord | null;

  // Callbacks
  onToolChange: (tool: AnyTool) => void;
  onRetry: () => void;
  onUpdateAnalysis: (data: AnyAnalysisData) => void;
  onSaveVersion: (
    originalRecord: GenerationRecord,
    modifiedData: AnyAnalysisData,
    message: string
  ) => void;
  onViewHistory: (record: GenerationRecord) => void;
  onDeleteHistory: (id: string) => void;
  onNavigate: (module: ModuleType, tool: AnyTool) => void;
  onAnalysisResult?: (result: { jobId: string; result: AnyAnalysisData }) => void;
}

// Wrapper for Lazy Loaded Content defined outside to avoid recreation and fix type inference
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      {children}
    </Suspense>
  </ErrorBoundary>
);

const ModuleRouter = (props: ModuleRouterProps) => {
  const {
    activeModule,
    activeTool,
    currentAnalysis,
    isLoading,
    error,
    isRetrying,
    ventureId,
    generationHistory,
    viewingHistoryRecord,
    onToolChange,
    onRetry,
    onUpdateAnalysis,
    onSaveVersion,
    onViewHistory,
    onDeleteHistory,
    onNavigate,
    onAnalysisResult,
  } = props;

  // --- 0. Debug Logging ---
  React.useEffect(() => {
    if (currentAnalysis) {
      console.log(`[ModuleRouter] Data arrived for ${activeModule}/${activeTool}:`, {
        hasData: !!currentAnalysis,
        keys: Object.keys(currentAnalysis),
        id: (currentAnalysis as any).id
      });
    }
  }, [currentAnalysis, activeModule, activeTool]);

  // --- 1. Sub Navigation Rendering ---
  const renderSubNav = () => {
    switch (activeModule) {
      case 'strategy':
        return (
          <StrategySubNav
            activeTool={activeTool as StrategyTool}
            onToolChange={onToolChange as (tool: StrategyTool) => void}
          />
        );
      case 'marketAnalysis':
        return (
          <MarketAnalysisSubNav
            activeTool={activeTool as MarketAnalysisTool}
            onToolChange={onToolChange as (tool: MarketAnalysisTool) => void}
          />
        );
      case 'fundamentals':
        return (
          <FundamentalsSubNav
            activeTool={activeTool as FundamentalsTool}
            onToolChange={onToolChange as (tool: FundamentalsTool) => void}
          />
        );
      case 'finance':
        return (
          <FinanceSubNav
            activeTool={activeTool as FinanceTool}
            onToolChange={onToolChange as (tool: FinanceTool) => void}
          />
        );
      case 'growth':
        return (
          <GrowthSubNav
            activeTool={activeTool as GrowthTool}
            onToolChange={onToolChange as (tool: GrowthTool) => void}
          />
        );
      case 'funding':
        return (
          <FundingSubNav
            activeTool={activeTool as FundingTool}
            onToolChange={onToolChange as (tool: FundingTool) => void}
          />
        );
      case 'productivity':
        return (
          <ProductivitySubNav
            activeTool={activeTool as ProductivityTool}
            onToolChange={onToolChange as (tool: ProductivityTool) => void}
          />
        );
      default:
        return null;
    }
  };

  // --- 2. Main Content Rendering ---
  const renderContent = () => {
    if (isLoading)
      return (
        <AgentOrchestrator
          activeTool={activeTool}
          ventureId={ventureId}
          onAnalysisResult={onAnalysisResult}
        />
      );
    if (error)
      return (
        <ErrorMessage
          code={error.code}
          message={error.message}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      );

    // Modules that don't rely on AI generation state directly or have custom views
    if (activeModule === 'dashboard')
      return (
        <LazyWrapper>
          <Dashboard ventureId={ventureId} onNavigate={onNavigate} />
        </LazyWrapper>
      );
    if (activeModule === 'architecture')
      return (
        <LazyWrapper>
          <ArchitectureExplanation />
        </LazyWrapper>
      );
    if (activeModule === 'integrations')
      return (
        <LazyWrapper>
          <IntegrationsDisplay ventureId={ventureId} />
        </LazyWrapper>
      );
    if (activeModule === 'audit')
      return (
        <LazyWrapper>
          <AuditTrailDisplay
            history={generationHistory}
            onView={onViewHistory}
            onDelete={onDeleteHistory}
            modules={[
              { key: 'fundamentals', label: 'Fundamentals' },
              { key: 'strategy', label: 'Strategy' },
              { key: 'marketAnalysis', label: 'Market Analysis' },
              { key: 'finance', label: 'Finance' },
              { key: 'growth', label: 'Growth' },
              { key: 'funding', label: 'Funding' },
            ]}
          />
        </LazyWrapper>
      );
    if (activeModule === 'productivity')
      return (
        <LazyWrapper>
          <TaskManager />
        </LazyWrapper>
      );

    // Interactive tools
    if (activeTool === 'experimentBuilder') {
      return (
        <LazyWrapper>
          <ExperimentBuilderDisplay
            data={currentAnalysis as any}
            onUpdate={onUpdateAnalysis}
            onSave={(data) =>
              onSaveVersion(
                viewingHistoryRecord ||
                ({
                  id: 'temp-id',
                  timestamp: new Date().toISOString(),
                  module: 'fundamentals',
                  tool: 'experimentBuilder',
                  toolNameKey: 'fundamentalsNavExperimentBuilder',
                  inputDescription: 'Experiment Board',
                  data: { columns: [] },
                } as GenerationRecord),
                data,
                `Saved board from ${new Date().toLocaleTimeString()}`
              )
            }
          />
        </LazyWrapper>
      );
    }

    // Standard AI Result Displays
    if (currentAnalysis) {
      let Component = null;
      switch (activeTool) {
        case 'swot':
          Component = SwotDisplay;
          break;
        case 'pestel':
          Component = PestelDisplay;
          break;
        case 'overview':
          Component = MarketAnalysisDisplay;
          break;
        case 'research':
          Component = MarketResearchDisplay;
          break;
        case 'roadmap':
          Component = RoadmapDisplay;
          break;
        case 'leanCanvas':
          Component = LeanCanvasDisplay;
          break;
        case 'okrWorkflow':
          Component = OkrWorkflowDisplay;
          break;
        case 'ideaValidation':
          Component = IdeaValidationDisplay;
          break;
        case 'problemValidation':
          Component = ProblemValidationDisplay;
          break;
        case 'competitorAnalysis':
          Component = CompetitorAnalysisDisplay;
          break;
        case 'customerValidation':
          Component = CustomerValidationDisplay;
          break;
        case 'riskFeasibility':
          Component = RiskFeasibilityDisplay;
          break;
        case 'validationTracker':
          Component = ValidationTrackerDisplay;
          break;
        case 'brandIdentity':
          Component = BrandIdentityDisplay;
          break;
        case 'budgetGenerator':
          Component = BudgetGeneratorDisplay;
          break;
        case 'financialForecast':
          return (
            <LazyWrapper>
              <FinancialForecastDisplay
                data={currentAnalysis as any}
                originalRecord={viewingHistoryRecord}
                onSaveVersion={onSaveVersion}
              />
            </LazyWrapper>
          );
        case 'cashFlowForecast':
          Component = CashFlowForecastDisplay;
          break;
        case 'kpiDashboards':
          Component = KpiDashboardDisplay;
          break;
        case 'milestones':
          Component = MilestonesDisplay;
          break;
        case 'expansionStrategy':
          Component = ExpansionStrategyDisplay;
          break;
        case 'pitchDeckGenerator':
          Component = PitchDeckDisplay;
          break;
        case 'investorDatabase':
          Component = InvestorMatchingDisplay;
          break;
        case 'fundraisingRoadmap':
          Component = FundraisingRoadmapDisplay;
          break;
      }

      if (Component) {
        return (
          <LazyWrapper>
            <Component
              data={currentAnalysis as any}
              onUpdate={onUpdateAnalysis}
            />
          </LazyWrapper>
        );
      }
    }

    return <WelcomeMessage activeTool={activeTool} />;
  };

  return {
    subNav: renderSubNav(),
    content: renderContent(),
  };
};

export default ModuleRouter;
