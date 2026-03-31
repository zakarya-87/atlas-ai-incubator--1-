import React, { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import type {
  GenerationRecord,
  AnyAnalysisData,
  ModuleType,
  AnyTool,
} from './types';
import {
  generateSwotAnalysis,
  generatePestelAnalysis,
  generateMarketAnalysis,
  generateMarketResearch,
  generateRoadmap,
  generateLeanCanvas,
  generateOkrWorkflow,
  generateIdeaValidation,
  generateProblemValidation,
  generateCompetitorAnalysis,
  generateCustomerValidation,
  generateRiskFeasibilityAnalysis,
  generateValidationTracker,
  generateBudget,
  generateFinancialForecast,
  generateCashFlowForecast,
  generateKpiDashboard,
  generateMilestones,
  generateExpansionStrategy,
  generatePitchDeck,
  generateInvestorMatches,
  generateFundraisingRoadmap,
  fetchVentureHistory,
  deleteAnalysisRecord,
  generateBrandIdentity,
} from './services/geminiService';
import { useLanguage } from './context/LanguageContext';
import { TranslationKey } from './locales';
import BusinessInputForm from './components/BusinessInputForm';
import ExportControls from './components/ExportControls';
import useUndoRedo from './hooks/useUndoRedo';
import UndoRedoControls from './components/UndoRedoControls';
import ViewControls from './components/ViewControls';
import SourcesList from './components/SourcesList';
import RefinementControl from './components/RefinementControl';
import Layout from './components/Layout';
import ModuleRouter from './components/ModuleRouter';
import usePersistedState from './hooks/usePersistedState';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const AppContent: React.FC = () => {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();

  // --- Global State ---
  // Use persisted state for the input description to save drafts
  const [businessDescription, setBusinessDescription] =
    usePersistedState<string>('atlas_input_draft', '');

  const [lastSubmittedImage, setLastSubmittedImage] = useState<
    string | undefined
  >(undefined);
  const [ventureId, setVentureId] = useState<string>('');
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard'); // Default to Dashboard
  const [activeTool, setActiveTool] = useState<AnyTool>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(
    null
  );
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [generationHistory, setGenerationHistory] = useState<
    GenerationRecord[]
  >([]);
  const [viewingHistoryRecord, setViewingHistoryRecord] =
    useState<GenerationRecord | null>(null);

  // UI State
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Undo/Redo Hook
  const {
    state: currentAnalysis,
    set: setCurrentAnalysis,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo<AnyAnalysisData | null>(null);

  // --- Initialization ---
  useEffect(() => {
    let vid = localStorage.getItem('atlas_venture_id');
    if (!vid) {
      vid = generateUUID();
      localStorage.setItem('atlas_venture_id', vid);
    }
    setVentureId(vid);

    const hasTakenTour = localStorage.getItem('atlas-ai-tour-complete');
    if (!hasTakenTour) setIsTourOpen(true);
  }, []); // Empty deps array is correct - should only run once on mount

  // Load History when authenticated or ventureId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (ventureId && isAuthenticated) {
        try {
          const history = await fetchVentureHistory(ventureId);
          setGenerationHistory(history);
        } catch (e) {
          console.error('Failed to load history from backend', e);
        }
      }
    };
    loadHistory();
  }, [ventureId, isAuthenticated]); // Added missing dependencies

  // --- Navigation Logic ---
  const clearAnalysisData = useCallback(() => {
    resetHistory(null);
    setError(null);
  }, [resetHistory]);

  const handleNavigate = useCallback((module: ModuleType, tool: AnyTool) => {
    clearAnalysisData();
    setViewingHistoryRecord(null);
    setActiveModule(module);
    setActiveTool(tool);
    setIsFocusMode(false); // Exit focus on nav
  }, [clearAnalysisData]);

  const handleModuleChange = useCallback(
    (module: ModuleType) => {
      if (module === activeModule) return;
      clearAnalysisData();
      setViewingHistoryRecord(null);
      setActiveModule(module);
      setIsFocusMode(false);

      // Default tool selection logic
      switch (module) {
        case 'dashboard':
          setActiveTool('overview');
          break;
        case 'fundamentals':
          setActiveTool('ideaValidation');
          break;
        case 'strategy':
          setActiveTool('swot');
          break;
        case 'marketAnalysis':
          setActiveTool('overview');
          break;
        case 'finance':
          setActiveTool('budgetGenerator');
          break;
        case 'growth':
          setActiveTool('milestones');
          break;
        case 'funding':
          setActiveTool('pitchDeckGenerator');
          break;
        case 'architecture':
          setActiveTool('systemDesign');
          break;
        case 'audit':
          setActiveTool('trail');
          break;
        case 'integrations':
          setActiveTool('connectors');
          break;
        case 'productivity':
          setActiveTool('taskManager');
          break;
        default:
          setActiveTool('swot');
      }
    },
    [activeModule, clearAnalysisData]
  );

  const handleToolChange = useCallback(
    (tool: AnyTool) => {
      if (tool === activeTool) return;
      clearAnalysisData();
      setViewingHistoryRecord(null);
      setActiveTool(tool);
    },
    [activeTool, clearAnalysisData]
  );

  // --- History Logic ---
  const handleViewHistoryRecord = useCallback((record: GenerationRecord) => {
    resetHistory(record.data);
    setActiveModule(record.module);
    setActiveTool(record.tool);
    setBusinessDescription(record.inputDescription);
    setViewingHistoryRecord(record);
  }, [resetHistory, setBusinessDescription]);

  const handleDeleteHistoryRecord = async (id: string) => {
    try {
      await deleteAnalysisRecord(id);
      setGenerationHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete record', error);
    }
  };

  const handleReturnToWorkspace = useCallback(() => {
    setViewingHistoryRecord(null);
    clearAnalysisData();
  }, [clearAnalysisData]);

  const handleSaveNewVersion = useCallback(
    (
      originalRecord: GenerationRecord,
      modifiedData: AnyAnalysisData,
      message: string
    ) => {
      const newRecord: GenerationRecord = {
        ...originalRecord,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        inputDescription: message,
        data: modifiedData,
      };
      setGenerationHistory((prev) => [newRecord, ...prev]);
      handleViewHistoryRecord(newRecord);
    },
    [handleViewHistoryRecord]
  );

  // --- AI Generation Logic ---
  const handleGenerate = useCallback(
    async (
      image?: string,
      refinement?: { instruction: string; parentId: string }
    ) => {
      if (!businessDescription.trim() && !refinement) {
        setError({
          code: 'errorEmptyDescription',
          message: t('errorEmptyDescription'),
        });
        return;
      }

      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
      }

      // Set loading FIRST to prevent WelcomeMessage flash
      setIsLoading(true);
      setIsRetrying(false);

      // Then clear previous analysis data (isLoading is already true,
      // so ModuleRouter shows AgentOrchestrator instead of WelcomeMessage)
      if (!refinement) {
        clearAnalysisData();
        setViewingHistoryRecord(null);
      }

      if (image) setLastSubmittedImage(image);

      const generationFunctions: {
        [key in AnyTool]?: (
          desc: string,
          lang: 'en' | 'fr' | 'ar',
          ventureId: string,
          image?: string,
          refinement?: any
        ) => Promise<any>;
      } = {
        swot: generateSwotAnalysis,
        pestel: generatePestelAnalysis,
        roadmap: generateRoadmap,
        leanCanvas: generateLeanCanvas,
        okrWorkflow: generateOkrWorkflow,
        overview: generateMarketAnalysis,
        research: generateMarketResearch,
        ideaValidation: generateIdeaValidation,
        problemValidation: generateProblemValidation,
        competitorAnalysis: generateCompetitorAnalysis,
        customerValidation: generateCustomerValidation,
        riskFeasibility: generateRiskFeasibilityAnalysis,
        validationTracker: generateValidationTracker,
        brandIdentity: generateBrandIdentity,
        budgetGenerator: generateBudget,
        financialForecast: generateFinancialForecast,
        cashFlowForecast: generateCashFlowForecast,
        kpiDashboards: generateKpiDashboard,
        milestones: generateMilestones,
        expansionStrategy: generateExpansionStrategy,
        pitchDeckGenerator: generatePitchDeck,
        investorDatabase: generateInvestorMatches,
        fundraisingRoadmap: generateFundraisingRoadmap,
      };

      const generate = generationFunctions[activeTool];

      if (generate) {
        try {
          // Pass the optional image and refinement arguments
          const data = await generate(
            businessDescription,
            language,
            ventureId,
            image || lastSubmittedImage,
            refinement
          );
          console.log('[DEBUG handleGenerate] Setting state with:', {
            type: typeof data,
            isNull: data === null,
            keys: data ? Object.keys(data) : 'N/A',
            hasStrengths: !!(data as any)?.strengths,
            strengthsType: Array.isArray((data as any)?.strengths) ? 'array' : typeof (data as any)?.strengths,
            firstStrength: (data as any)?.strengths?.[0],
            hasResultData: !!(data as any)?.resultData,
            raw: data,
          });
          setCurrentAnalysis(data);

          const newRecord: GenerationRecord = {
            id: data.id || `${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            module: activeModule,
            tool: activeTool,
            toolNameKey:
              `${activeModule}Nav${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}` as TranslationKey,
            inputDescription: refinement
              ? `Refinement: ${refinement.instruction}`
              : businessDescription,
            data: data,
          };
          setGenerationHistory((prev) => [newRecord, ...prev]);

          if (refinement) {
            // If refining, treat the new result as the "viewed record" to show context
            setViewingHistoryRecord(newRecord);
          }
        } catch (e: any) {
          if (e.message && e.message.includes('Authentication Required')) {
            setIsAuthModalOpen(true);
          } else if (e.message === 'errorRateLimit') {
            setError({ code: 'errorRateLimit', message: t('errorRateLimit') });
          } else {
            setError({
              code: e.message,
              message: t(e.message as TranslationKey) || t('errorApiGeneric'),
            });
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    },
    [
      businessDescription,
      activeTool,
      activeModule,
      language,
      t,
      ventureId,
      setCurrentAnalysis,
      clearAnalysisData,
      isAuthenticated,
      lastSubmittedImage,
    ]
  );

  const handleRetry = () => {
    setIsRetrying(true);
    handleGenerate(lastSubmittedImage);
  };

  const handleCancel = () => {
    setIsLoading(false);
    setIsRetrying(false);
    // State cleans up effectively allowing the user to start a new job.
  };

  const handleAnalysisResult = (data: { jobId: string; result: AnyAnalysisData }) => {
    try {
      if (!data || !data.result) {
        throw new Error('errorInvalidData');
      }

      let unwrappedResult = data.result;
      if (unwrappedResult && typeof unwrappedResult === 'object' && !Array.isArray(unwrappedResult)) {
          const keys = Object.keys(unwrappedResult);
          if (keys.length === 1 && typeof (unwrappedResult as any)[keys[0]] === 'object' && !Array.isArray((unwrappedResult as any)[keys[0]])) {
              unwrappedResult = (unwrappedResult as any)[keys[0]];
          }
      }

      // Clear any previous error before updating with new data
      setError(null);

      // Update state with the received analysis result
      console.log('[DEBUG handleAnalysisResult] Setting state with:', {
        type: typeof unwrappedResult,
        keys: unwrappedResult ? Object.keys(unwrappedResult) : 'N/A',
        hasStrengths: !!(unwrappedResult as any)?.strengths,
        firstStrength: (unwrappedResult as any)?.strengths?.[0],
        raw: unwrappedResult,
      });
      setCurrentAnalysis(unwrappedResult);

      // Create a new history record
      const newRecord: GenerationRecord = {
        id: unwrappedResult.id || `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        module: activeModule,
        tool: activeTool,
        toolNameKey:
          `${activeModule}Nav${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}` as TranslationKey,
        inputDescription: businessDescription,
        data: unwrappedResult,
      };
      setGenerationHistory((prev) => [newRecord, ...prev]);
    } catch (e: any) {
      console.error('Failed to handle analysis result:', e);
      setError({
        code: 'errorInvalidData',
        message: t('errorInvalidData') || 'Invalid or malformed data received from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinement = useCallback((instruction: string) => {
    // Find the ID of the current analysis being viewed/edited
    const currentId = (currentAnalysis as any)?.id || viewingHistoryRecord?.id;
    if (currentId) {
      handleGenerate(lastSubmittedImage, { instruction, parentId: currentId });
    }
  }, [currentAnalysis, viewingHistoryRecord, handleGenerate, lastSubmittedImage]);

  const handleToggleFocusMode = useCallback(() => setIsFocusMode(prev => !prev), []);

  // --- Render Helpers ---
  const showInputForm =
    ![
      'dashboard',
      'systemDesign',
      'connectors',
      'trail',
      'experimentBuilder',
      'taskManager',
    ].includes(activeModule) &&
    !['experimentBuilder'].includes(activeTool) &&
    !viewingHistoryRecord;

  // Invoke Module Router to get content
  const { subNav, content } = ModuleRouter({
    activeModule,
    activeTool,
    currentAnalysis,
    isLoading,
    error,
    isRetrying,
    ventureId,
    generationHistory,
    viewingHistoryRecord,
    onToolChange: handleToolChange,
    onRetry: handleRetry,
    onUpdateAnalysis: setCurrentAnalysis,
    onSaveVersion: handleSaveNewVersion,
    onViewHistory: handleViewHistoryRecord,
    onDeleteHistory: handleDeleteHistoryRecord,
    onNavigate: handleNavigate,
    onAnalysisResult: handleAnalysisResult,
  });

  return (
    <Layout
      activeModule={activeModule}
      onNavigate={handleNavigate}
      onModuleChange={handleModuleChange}
      subNav={subNav}
      isTourOpen={isTourOpen}
      setIsTourOpen={setIsTourOpen}
      isAuthModalOpen={isAuthModalOpen}
      setIsAuthModalOpen={setIsAuthModalOpen}
      viewingHistoryRecord={!!viewingHistoryRecord}
      onReturnToWorkspace={handleReturnToWorkspace}
      timestamp={viewingHistoryRecord?.timestamp}
      isFocusMode={isFocusMode}
      onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
    >
      {showInputForm && !isFocusMode && (
        <div className="max-w-4xl mx-auto mb-8">
          <BusinessInputForm
            value={businessDescription}
            onChange={setBusinessDescription}
            onSubmit={handleGenerate}
            onCancel={handleCancel}
            isLoading={isLoading}
            activeTool={activeTool}
          />
        </div>
      )}

      <div id="export-content-area" className="max-w-7xl mx-auto relative">
        {content}

        {/* Refinement Control */}
        {currentAnalysis && !isLoading && !error && (
          <RefinementControl
            onRefine={handleRefinement}
            isLoading={isLoading}
          />
        )}

        {/* Footer Elements */}
        {currentAnalysis && (currentAnalysis as any)._sources && (
          <SourcesList sources={(currentAnalysis as any)._sources} />
        )}

        {currentAnalysis && !isLoading && !error && (
          <>
            <UndoRedoControls
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <ViewControls
              isFocusMode={isFocusMode}
              onToggleFocusMode={handleToggleFocusMode}
            />
            <ExportControls
              analysisData={currentAnalysis as any}
              analysisType={activeTool as any}
              businessDescription={businessDescription}
              targetElementId="export-content-area"
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export const App: React.FC = () => (
  <ToastProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ToastProvider>
);
