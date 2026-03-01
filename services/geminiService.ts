import { SchemaType } from '@google/generative-ai';
import type {
  SwotData,
  PestelData,
  MarketAnalysisData,
  MarketResearchData,
  RoadmapData,
  LeanCanvasData,
  OkrWorkflowData,
  IdeaValidationData,
  ProblemValidationData,
  CompetitorAnalysisData,
  CustomerValidationData,
  RiskFeasibilityData,
  ValidationTrackerData,
  BudgetGeneratorData,
  FinancialForecastData,
  CashFlowForecastData,
  KpiDashboardData,
  MilestonesData,
  AnalysisPoint,
  RoadmapPhase,
  MarketSizePoint,
  ExpansionStrategyData,
  PitchDeckData,
  InvestorMatchingData,
  FundraisingRoadmapData,
  BrandIdentityData,
  GenerationRecord,
  ModuleType,
  AnyTool,
  AnyAnalysisData,
} from '../types';
import { translations, Language } from '../locales';
import { API_CONFIG, STORAGE_KEYS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';
// Schemas for Gemini response validation
const analysisPointSchema = {
  type: SchemaType.OBJECT,
  properties: {
    point: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ['point', 'explanation'],
};

const swotSchema = {
  type: SchemaType.OBJECT,
  properties: {
    strengths: { type: SchemaType.ARRAY, items: analysisPointSchema },
    weaknesses: { type: SchemaType.ARRAY, items: analysisPointSchema },
    opportunities: { type: SchemaType.ARRAY, items: analysisPointSchema },
    threats: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
};

const pestelSchema = {
  type: SchemaType.OBJECT,
  properties: {
    political: { type: SchemaType.ARRAY, items: analysisPointSchema },
    economic: { type: SchemaType.ARRAY, items: analysisPointSchema },
    social: { type: SchemaType.ARRAY, items: analysisPointSchema },
    technological: { type: SchemaType.ARRAY, items: analysisPointSchema },
    environmental: { type: SchemaType.ARRAY, items: analysisPointSchema },
    legal: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: [
    'political',
    'economic',
    'social',
    'technological',
    'environmental',
    'legal',
  ],
};

const marketAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    targetAudience: { type: SchemaType.ARRAY, items: analysisPointSchema },
    marketSizeAndTrends: { type: SchemaType.ARRAY, items: analysisPointSchema },
    competitorLandscape: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['targetAudience', 'marketSizeAndTrends', 'competitorLandscape'],
};

const marketResearchSchema = {
  type: SchemaType.OBJECT,
  properties: {
    marketDrivers: { type: SchemaType.ARRAY, items: analysisPointSchema },
    customerBehavior: { type: SchemaType.ARRAY, items: analysisPointSchema },
    barriersToEntry: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['marketDrivers', 'customerBehavior', 'barriersToEntry'],
};

const roadmapPhaseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    phaseName: { type: SchemaType.STRING },
    milestones: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['phaseName', 'milestones'],
};

const roadmapSchema = {
  type: SchemaType.OBJECT,
  properties: {
    phases: { type: SchemaType.ARRAY, items: roadmapPhaseSchema },
  },
  required: ['phases'],
};

const leanCanvasSchema = {
  type: SchemaType.OBJECT,
  properties: {
    problem: { type: SchemaType.ARRAY, items: analysisPointSchema },
    solution: { type: SchemaType.ARRAY, items: analysisPointSchema },
    keyMetrics: { type: SchemaType.ARRAY, items: analysisPointSchema },
    uniqueValueProposition: {
      type: SchemaType.ARRAY,
      items: analysisPointSchema,
    },
    unfairAdvantage: { type: SchemaType.ARRAY, items: analysisPointSchema },
    channels: { type: SchemaType.ARRAY, items: analysisPointSchema },
    customerSegments: { type: SchemaType.ARRAY, items: analysisPointSchema },
    costStructure: { type: SchemaType.ARRAY, items: analysisPointSchema },
    revenueStreams: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: [
    'problem',
    'solution',
    'keyMetrics',
    'uniqueValueProposition',
    'unfairAdvantage',
    'channels',
    'customerSegments',
    'costStructure',
    'revenueStreams',
  ],
};

const keyResultSchema = {
  type: SchemaType.OBJECT,
  properties: {
    description: { type: SchemaType.STRING },
    trackingMethod: { type: SchemaType.STRING },
  },
  required: ['description', 'trackingMethod'],
};

const objectiveSchema = {
  type: SchemaType.OBJECT,
  properties: {
    objective: { type: SchemaType.STRING },
    keyResults: { type: SchemaType.ARRAY, items: keyResultSchema },
  },
  required: ['objective', 'keyResults'],
};

const strategicGoalSchema = {
  type: SchemaType.OBJECT,
  properties: {
    goal: { type: SchemaType.STRING },
    objectives: { type: SchemaType.ARRAY, items: objectiveSchema },
  },
  required: ['goal', 'objectives'],
};

const okrWorkflowSchema = {
  type: SchemaType.OBJECT,
  properties: {
    visionStatement: { type: SchemaType.STRING },
    strategicGoals: { type: SchemaType.ARRAY, items: strategicGoalSchema },
    cascadingAlignment: { type: SchemaType.ARRAY, items: analysisPointSchema },
    trackingAndReview: { type: SchemaType.ARRAY, items: analysisPointSchema },
    reflectionAndNextCycle: {
      type: SchemaType.ARRAY,
      items: analysisPointSchema,
    },
  },
  required: [
    'visionStatement',
    'strategicGoals',
    'cascadingAlignment',
    'trackingAndReview',
    'reflectionAndNextCycle',
  ],
};

const ideaValidationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    problemStatement: { type: SchemaType.ARRAY, items: analysisPointSchema },
    solutionStatement: { type: SchemaType.ARRAY, items: analysisPointSchema },
    valueProposition: { type: SchemaType.ARRAY, items: analysisPointSchema },
    keyAssumptions: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: [
    'summary',
    'problemStatement',
    'solutionStatement',
    'valueProposition',
    'keyAssumptions',
  ],
};

const marketSizePointSchema = {
  type: SchemaType.OBJECT,
  properties: {
    value: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ['value', 'explanation'],
};

const problemValidationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    marketSize: {
      type: SchemaType.OBJECT,
      properties: {
        tam: marketSizePointSchema,
        sam: marketSizePointSchema,
        som: marketSizePointSchema,
      },
      required: ['tam', 'sam', 'som'],
    },
    customerSegments: { type: SchemaType.ARRAY, items: analysisPointSchema },
    problemSignificance: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['marketSize', 'customerSegments', 'problemSignificance'],
};

const competitorSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    type: { type: SchemaType.STRING },
    features: { type: SchemaType.STRING },
    pricing: { type: SchemaType.STRING },
    positioning: { type: SchemaType.STRING },
  },
  required: ['name', 'type', 'features', 'pricing', 'positioning'],
};

const competitorAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    competitors: { type: SchemaType.ARRAY, items: competitorSchema },
    gaps: { type: SchemaType.ARRAY, items: analysisPointSchema },
    differentiators: { type: SchemaType.ARRAY, items: analysisPointSchema },
    risks: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['competitors', 'gaps', 'differentiators', 'risks'],
};

const landingPageCopySchema = {
  type: SchemaType.OBJECT,
  properties: {
    headline: { type: SchemaType.STRING },
    body: { type: SchemaType.STRING },
    callToAction: { type: SchemaType.STRING },
  },
  required: ['headline', 'body', 'callToAction'],
};

const adCopySchema = {
  type: SchemaType.OBJECT,
  properties: {
    platform: { type: SchemaType.STRING },
    headline: { type: SchemaType.STRING },
    body: { type: SchemaType.STRING },
  },
  required: ['platform', 'headline', 'body'],
};

const validationMetricSchema = {
  type: SchemaType.OBJECT,
  properties: {
    metric: { type: SchemaType.STRING },
    value: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ['metric', 'value', 'explanation'],
};

const customerValidationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    landingPageCopy: landingPageCopySchema,
    surveyQuestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    adCopy: { type: SchemaType.ARRAY, items: adCopySchema },
    validationScorecard: {
      type: SchemaType.ARRAY,
      items: validationMetricSchema,
    },
  },
  required: [
    'landingPageCopy',
    'surveyQuestions',
    'adCopy',
    'validationScorecard',
  ],
};

const resourceEstimateSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: { type: SchemaType.STRING },
    estimate: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ['category', 'estimate', 'explanation'],
};

const feasibilityScoreSchema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.NUMBER },
    summary: { type: SchemaType.STRING },
  },
  required: ['score', 'summary'],
};

const riskFeasibilitySchema = {
  type: SchemaType.OBJECT,
  properties: {
    regulatoryRisks: { type: SchemaType.ARRAY, items: analysisPointSchema },
    financialRisks: { type: SchemaType.ARRAY, items: analysisPointSchema },
    operationalRisks: { type: SchemaType.ARRAY, items: analysisPointSchema },
    resourceEstimates: {
      type: SchemaType.ARRAY,
      items: resourceEstimateSchema,
    },
    feasibilityScore: feasibilityScoreSchema,
  },
  required: [
    'regulatoryRisks',
    'financialRisks',
    'operationalRisks',
    'resourceEstimates',
    'feasibilityScore',
  ],
};

const validationTrackerMetricSchema = {
  type: SchemaType.OBJECT,
  properties: {
    metric: { type: SchemaType.STRING },
    value: { type: SchemaType.STRING },
    trend: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ['metric', 'value', 'trend', 'explanation'],
};

const competitorActivitySchema = {
  type: SchemaType.OBJECT,
  properties: {
    competitorName: { type: SchemaType.STRING },
    activity: { type: SchemaType.STRING },
    date: { type: SchemaType.STRING },
  },
  required: ['competitorName', 'activity', 'date'],
};

const emergingTrendSchema = {
  type: SchemaType.OBJECT,
  properties: {
    trend: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    impact: { type: SchemaType.STRING },
  },
  required: ['trend', 'description', 'impact'],
};

const fundingInsightSchema = {
  type: SchemaType.OBJECT,
  properties: {
    insight: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ['insight', 'explanation'],
};

const validationTrackerSchema = {
  type: SchemaType.OBJECT,
  properties: {
    keyMetrics: {
      type: SchemaType.ARRAY,
      items: validationTrackerMetricSchema,
    },
    recentCompetitorActivity: {
      type: SchemaType.ARRAY,
      items: competitorActivitySchema,
    },
    emergingTrends: { type: SchemaType.ARRAY, items: emergingTrendSchema },
    fundingInsights: { type: SchemaType.ARRAY, items: fundingInsightSchema },
  },
  required: [
    'keyMetrics',
    'recentCompetitorActivity',
    'emergingTrends',
    'fundingInsights',
  ],
};

const brandIdentitySchema = {
  type: SchemaType.OBJECT,
  properties: {
    logoImage: { type: SchemaType.STRING },
    imagePrompt: { type: SchemaType.STRING },
    rationale: { type: SchemaType.STRING },
    palette: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['logoImage', 'imagePrompt', 'rationale', 'palette'],
};

const budgetItemSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    amount: { type: SchemaType.NUMBER },
    type: { type: SchemaType.STRING },
  },
  required: ['name', 'amount', 'type'],
};

const budgetCategorySchema = {
  type: SchemaType.OBJECT,
  properties: {
    categoryName: { type: SchemaType.STRING },
    items: { type: SchemaType.ARRAY, items: budgetItemSchema },
  },
  required: ['categoryName', 'items'],
};

const scenarioSummarySchema = {
  type: SchemaType.OBJECT,
  properties: {
    totalRevenue: { type: SchemaType.NUMBER },
    totalExpenses: { type: SchemaType.NUMBER },
    netProfitOrLoss: { type: SchemaType.NUMBER },
  },
  required: ['totalRevenue', 'totalExpenses', 'netProfitOrLoss'],
};

const budgetScenarioSchema = {
  type: SchemaType.OBJECT,
  properties: {
    scenarioName: { type: SchemaType.STRING },
    summary: scenarioSummarySchema,
    breakdown: { type: SchemaType.ARRAY, items: budgetCategorySchema },
  },
  required: ['scenarioName', 'summary', 'breakdown'],
};

const budgetGeneratorSchema = {
  type: SchemaType.OBJECT,
  properties: {
    scenarios: { type: SchemaType.ARRAY, items: budgetScenarioSchema },
    recommendations: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['scenarios', 'recommendations'],
};

const forecastYearSchema = {
  type: SchemaType.OBJECT,
  properties: {
    year: { type: SchemaType.NUMBER },
    revenue: { type: SchemaType.NUMBER },
    cogs: { type: SchemaType.NUMBER },
    grossProfit: { type: SchemaType.NUMBER },
    opex: { type: SchemaType.NUMBER },
    netProfit: { type: SchemaType.NUMBER },
  },
  required: ['year', 'revenue', 'cogs', 'grossProfit', 'opex', 'netProfit'],
};

const financialForecastSchema = {
  type: SchemaType.OBJECT,
  properties: {
    forecast: { type: SchemaType.ARRAY, items: forecastYearSchema },
    assumptions: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['forecast', 'assumptions'],
};

const cashFlowMonthSchema = {
  type: SchemaType.OBJECT,
  properties: {
    month: { type: SchemaType.NUMBER },
    inflows: { type: SchemaType.NUMBER },
    outflows: { type: SchemaType.NUMBER },
    netCashFlow: { type: SchemaType.NUMBER },
    endingBalance: { type: SchemaType.NUMBER },
  },
  required: ['month', 'inflows', 'outflows', 'netCashFlow', 'endingBalance'],
};

const cashFlowForecastSchema = {
  type: SchemaType.OBJECT,
  properties: {
    monthlyForecasts: { type: SchemaType.ARRAY, items: cashFlowMonthSchema },
    runwayMonths: { type: SchemaType.NUMBER },
    averageBurnRate: { type: SchemaType.NUMBER },
    insights: { type: SchemaType.ARRAY, items: analysisPointSchema },
  },
  required: ['monthlyForecasts', 'runwayMonths', 'averageBurnRate', 'insights'],
};

const kpiSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    value: { type: SchemaType.STRING },
    benchmark: { type: SchemaType.STRING },
    insight: { type: SchemaType.STRING },
  },
  required: ['name', 'value', 'benchmark', 'insight'],
};

const kpiDashboardSchema = {
  type: SchemaType.OBJECT,
  properties: {
    executiveSummary: { type: SchemaType.STRING },
    kpis: { type: SchemaType.ARRAY, items: kpiSchema },
  },
  required: ['executiveSummary', 'kpis'],
};

const milestoneSchema = {
  type: SchemaType.OBJECT,
  properties: {
    point: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
    quarter: { type: SchemaType.NUMBER },
  },
  required: ['point', 'explanation', 'quarter'],
};

const smartAlertSchema = {
  type: SchemaType.OBJECT,
  properties: {
    alert: { type: SchemaType.STRING },
    recommendation: { type: SchemaType.STRING },
    severity: { type: SchemaType.STRING },
  },
  required: ['alert', 'recommendation', 'severity'],
};

const milestonesSchema = {
  type: SchemaType.OBJECT,
  properties: {
    milestones: { type: SchemaType.ARRAY, items: milestoneSchema },
    smartAlerts: { type: SchemaType.ARRAY, items: smartAlertSchema },
  },
  required: ['milestones', 'smartAlerts'],
};

const recommendedStrategySchema = {
  type: SchemaType.OBJECT,
  properties: {
    strategyName: { type: SchemaType.STRING },
    justification: { type: SchemaType.STRING },
  },
  required: ['strategyName', 'justification'],
};

const expansionStrategySchema = {
  type: SchemaType.OBJECT,
  properties: {
    recommendedStrategy: recommendedStrategySchema,
    marketExpansionSuggestions: {
      type: SchemaType.ARRAY,
      items: analysisPointSchema,
    },
    predictiveModelingInsights: {
      type: SchemaType.ARRAY,
      items: analysisPointSchema,
    },
    partnershipRecommendations: {
      type: SchemaType.ARRAY,
      items: analysisPointSchema,
    },
  },
  required: [
    'recommendedStrategy',
    'marketExpansionSuggestions',
    'predictiveModelingInsights',
    'partnershipRecommendations',
  ],
};

const visualSuggestionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
  },
};

const pitchDeckSlideSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    content: { type: SchemaType.ARRAY, items: analysisPointSchema },
    visualSuggestion: visualSuggestionSchema,
  },
  required: ['title', 'content'],
};

const pitchDeckSchema = {
  type: SchemaType.OBJECT,
  properties: {
    slides: { type: SchemaType.ARRAY, items: pitchDeckSlideSchema },
  },
  required: ['slides'],
};

const outreachSuggestionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    subject: { type: SchemaType.STRING },
    body: { type: SchemaType.STRING },
  },
  required: ['subject', 'body'],
};

const investorProfileSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    type: { type: SchemaType.STRING },
    location: { type: SchemaType.STRING },
    investmentStage: { type: SchemaType.STRING },
    ticketSize: { type: SchemaType.STRING },
    sectorFocus: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    alignmentScore: { type: SchemaType.NUMBER },
    reasoning: { type: SchemaType.STRING },
    outreachSuggestion: outreachSuggestionSchema,
  },
  required: [
    'name',
    'type',
    'location',
    'investmentStage',
    'ticketSize',
    'sectorFocus',
    'alignmentScore',
    'reasoning',
    'outreachSuggestion',
  ],
};

const investorMatchingSchema = {
  type: SchemaType.OBJECT,
  properties: {
    investors: { type: SchemaType.ARRAY, items: investorProfileSchema },
  },
  required: ['investors'],
};

const fundraisingTaskSchema = {
  type: SchemaType.OBJECT,
  properties: {
    task: { type: SchemaType.STRING },
    details: { type: SchemaType.STRING },
    status: { type: SchemaType.STRING },
  },
  required: ['task', 'details', 'status'],
};

const fundraisingPhaseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    phaseName: { type: SchemaType.STRING },
    tasks: { type: SchemaType.ARRAY, items: fundraisingTaskSchema },
  },
  required: ['phaseName', 'tasks'],
};

const fundraisingRoadmapAlertSchema = {
  type: SchemaType.OBJECT,
  properties: {
    alert: { type: SchemaType.STRING },
    recommendation: { type: SchemaType.STRING },
    severity: { type: SchemaType.STRING },
  },
  required: ['alert', 'recommendation', 'severity'],
};

const alternativeFundingOptionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    option: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
  },
  required: ['option', 'description'],
};

const fundraisingRoadmapSchema = {
  type: SchemaType.OBJECT,
  properties: {
    phases: { type: SchemaType.ARRAY, items: fundraisingPhaseSchema },
    smartAlerts: {
      type: SchemaType.ARRAY,
      items: fundraisingRoadmapAlertSchema,
    },
    alternativeFunding: {
      type: SchemaType.ARRAY,
      items: alternativeFundingOptionSchema,
    },
  },
  required: ['phases', 'smartAlerts', 'alternativeFunding'],
};

// Active request controllers for cancellation
const activeRequests = new Map<string, AbortController>();
const activeTimers = new Set<NodeJS.Timeout>();

// Helper to get the JWT token
const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '';
};

// Cancel all active requests (useful for cleanup)
export const cancelAllRequests = () => {
  activeRequests.forEach((controller, key) => {
    controller.abort();
    activeRequests.delete(key);
  });
  activeTimers.forEach((timer) => {
    clearTimeout(timer);
  });
  activeTimers.clear();
};

// Cancel a specific request
export const cancelRequest = (requestId: string) => {
  const controller = activeRequests.get(requestId);
  if (controller) {
    controller.abort();
    activeRequests.delete(requestId);
  }
};

// Fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = API_CONFIG.REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const requestId = `${url}-${Date.now()}`;

  // Store controller for potential cancellation
  activeRequests.set(requestId, controller);

  const timeoutId = setTimeout(() => {
    controller.abort();
    activeRequests.delete(requestId);
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    activeRequests.delete(requestId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    activeRequests.delete(requestId);

    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      throw new Error(ERROR_CODES.TIMEOUT);
    }
    throw error;
  }
}

// Retry with exponential backoff
export interface AnalysisOptions {
  pollInterval?: number;
  timeout?: number;
  retryDelay?: number;
  image?: string;
  refinement?: { instruction: string; parentId: string };
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = API_CONFIG.RETRY_ATTEMPTS,
  retryDelay = API_CONFIG.RETRY_DELAY
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      // Handle success
      if (response.ok) {
        return response;
      }

      // Don't retry on most 4xx errors
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }

      // Retry on 5xx errors and 429
      if (response.status >= 500 || response.status === 429) {
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          logger.warn(`Request failed with status ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
              activeTimers.delete(timer);
              resolve();
            }, delay);
            activeTimers.add(timer);

            // If cancelAllRequests is called, this promise should reject to break the retry loop
            // We can check this by setting a 'cancelled' flag or relying on the AbortController if we had one here.
            // For now, being able to clear the timeout is enough to stop the next iteration.
          });
          continue;
        }

        // Retries exhausted
        if (response.status === 429) {
          throw new Error(ERROR_CODES.RATE_LIMIT);
        }
        if (response.status >= 500) {
          throw new Error(ERROR_CODES.SERVER_ERROR);
        }
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort/timeout
      if (lastError.message === ERROR_CODES.TIMEOUT) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt);
        logger.warn(
          `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
          error
        );
        await new Promise<void>((resolve) => {
          const timer = setTimeout(() => {
            activeTimers.delete(timer);
            resolve();
          }, delay);
          activeTimers.add(timer);
        });
      }
    }
  }

  throw lastError || new Error(ERROR_CODES.GENERIC);
}

// ... SCHEMAS ...

// Generic generator function - Now async-aware
async function generateAnalysis<T>(
  promptKey: keyof (typeof translations)['en'],
  businessDescription: string,
  schema: any,
  language: Language,
  ventureId: string,
  toolName: string,
  moduleName: ModuleType,
  image?: string, // Optional Base64 Image
  refinement?: { instruction: string; parentId: string }, // Optional Refinement
  pollInterval = 2000,
  timeout = 900000,
  retryDelay = API_CONFIG.RETRY_DELAY
): Promise<T> {
  const t = (key: any) =>
    (translations[language] as any)[key] || (translations['en'] as any)[key];
  const promptTemplate = t(promptKey as any);
  const prompt = promptTemplate.replace(
    '{businessDescription}',
    businessDescription
  );
  const token = getAuthToken();

  try {
    logger.log(
      `[Frontend] Submitting async job to: ${API_CONFIG.BACKEND_URL}/analysis/generate`
    );

    // Submit job (returns immediately with job ID)
    const response = await fetchWithRetry(
      `${API_CONFIG.BACKEND_URL}/analysis/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ventureId: ventureId,
          module: moduleName,
          tool: toolName,
          description: businessDescription,
          language: language,
          prompt: prompt,
          responseSchema: schema,
          images: image ? [image] : undefined,
          refinementInstruction: refinement?.instruction,
          parentAnalysisId: refinement?.parentId,
        }),
      },
      API_CONFIG.RETRY_ATTEMPTS,
      retryDelay
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error(ERROR_CODES.AUTH_REQUIRED);
      if (response.status === 429) throw new Error(ERROR_CODES.RATE_LIMIT);
      if (response.status >= 500) throw new Error(ERROR_CODES.SERVER_ERROR);

      try {
        const errBody = await response.text();
        logger.error('Backend Error Response:', errBody);
      } catch (e) { }

      throw new Error(ERROR_CODES.GENERIC);
    }

    const { jobId } = await response.json();
    logger.log(`[Frontend] Job submitted: ${jobId}, polling for completion...`);

    // Poll for completion
    const result = await pollJobCompletion<T>(jobId, pollInterval, timeout);
    return result;
  } catch (error: any) {
    logger.error('Error generating analysis from Backend:', error);

    const message = error?.message || '';

    // Recognize specific network errors to wrap them
    if (
      message.toLowerCase().includes('failed to fetch') ||
      message.toLowerCase().includes('network error')
    ) {
      logger.error(`[Network Error] Could not connect to ${API_CONFIG.BACKEND_URL}.`);
      throw new Error(ERROR_CODES.NETWORK_ERROR);
    }

    // Otherwise, rethrow the error as-is (e.g., job failures, auth, known error codes)
    throw error;
  }
}

// Poll job completion helper
async function pollJobCompletion<T>(
  jobId: string,
  pollInterval = 2000,
  timeout = 900000
): Promise<T> {
  const token = getAuthToken();
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        activeTimers.delete(timeoutId);
      }
    };

    const poll = async () => {
      try {
        if (Date.now() - startTime > timeout) {
          cleanup();
          reject(new Error(`${ERROR_CODES.TIMEOUT} after ${timeout}ms`));
          return;
        }

        const statusResponse = await fetch(
          `${API_CONFIG.BACKEND_URL}/jobs/${jobId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!statusResponse.ok) {
          throw new Error('Failed to fetch job status');
        }

        const status = await statusResponse.json();

        if (status.status === 'completed') {
          cleanup();
          if (!status.result) {
            logger.error(`[Frontend] Job ${jobId} completed but result is missing or malformed`);
            reject(new Error(ERROR_CODES.GENERIC));
            return;
          }
          logger.log(`[Frontend] Job ${jobId} completed successfully`);
          resolve(status.result as T);
        } else if (status.status === 'failed') {
          cleanup();
          logger.error(`[Frontend] Job ${jobId} failed:`, status.error);
          reject(new Error(status.error || 'Job failed'));
        } else {
          logger.log(`[Frontend] Job ${jobId} status: ${status.status}`);
          timeoutId = setTimeout(poll, pollInterval);
          activeTimers.add(timeoutId);
        }
      } catch (error: any) {
        cleanup();
        reject(error);
      }
    };

    // Initial poll
    timeoutId = setTimeout(poll, 0);
    activeTimers.add(timeoutId);
  });
}

// History Fetcher
export const fetchVentureHistory = async (
  ventureId: string
): Promise<GenerationRecord[]> => {
  try {
    const token = getAuthToken();
    // If offline or not logged in, don't attempt fetch to avoid 401/Network errors
    if (!token) return [];

    const response = await fetchWithTimeout(
      `${API_CONFIG.BACKEND_URL}/history/${ventureId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) return [];

    if (!response.ok) {
      // Silent fail for history is better UX than alerts
      return [];
    }
    const rawHistory = await response.json();

    return rawHistory.map((record: any) => {
      const toolKeyCap =
        record.tool.charAt(0).toUpperCase() + record.tool.slice(1);
      const toolNameKey = `${record.module}Nav${toolKeyCap}`;

      // Parse the JSON result
      const parsedData =
        typeof record.resultData === 'string'
          ? JSON.parse(record.resultData)
          : record.resultData;

      return {
        id: record.id,
        timestamp: record.createdAt,
        module: record.module as ModuleType,
        tool: record.tool as AnyTool,
        toolNameKey: toolNameKey,
        inputDescription: record.inputContext,
        data: { ...parsedData, id: record.id } as AnyAnalysisData, // Inject ID into data
      };
    });
  } catch (error) {
    // Suppress console noise for offline mode history checks
    logger.warn('Failed to fetch venture history (may be offline)', error);
    return [];
  }
};

// Save Version
export const saveAnalysisVersion = async (
  originalRecord: GenerationRecord,
  modifiedData: AnyAnalysisData,
  message: string
): Promise<void> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error(ERROR_CODES.AUTH_REQUIRED);

    const response = await fetchWithTimeout(
      `${API_CONFIG.BACKEND_URL}/history/version`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ventureId: 'dev-venture-id', // In real app use actual ventureId
          parentId: originalRecord.id,
          module: originalRecord.module,
          tool: originalRecord.tool,
          description: message,
          data: modifiedData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save version');
    }
  } catch (error) {
    logger.error('Failed to save version:', error);
    // throw error; // Optionally rethrow
  }
};

// Delete Analysis
export const deleteAnalysisRecord = async (
  analysisId: string
): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error(ERROR_CODES.AUTH_REQUIRED);

  const response = await fetchWithTimeout(
    `${API_CONFIG.BACKEND_URL}/history/${analysisId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete analysis');
  }
};

// Invite Team Member
export const inviteTeamMember = async (
  ventureId: string,
  email: string,
  role: string
): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error(ERROR_CODES.AUTH_REQUIRED);

  const response = await fetchWithTimeout(
    `${API_CONFIG.BACKEND_URL}/ventures/${ventureId}/invite`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, role }),
    }
  );

  if (!response.ok) {
    let errorMessage = 'Failed to invite member';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) { }
    throw new Error(errorMessage);
  }
};

// --- Reports API (Server-Side PDF) ---

export const downloadReportPdf = async (
  analysisId: string,
  fileName: string
): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    alert('Please sign in to download reports.');
    return;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BACKEND_URL}/reports/${analysisId}/pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error('Failed to generate PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Download Error:', error);
    throw error;
  }
};

// --- Integrations API ---

export interface IntegrationStatus {
  provider: string;
  status: 'connected' | 'disconnected';
}

export const fetchIntegrations = async (
  ventureId: string
): Promise<IntegrationStatus[]> => {
  const token = getAuthToken();
  // Don't throw or log if not logged in, just return empty state
  if (!token) return [];

  try {
    const response = await fetch(
      `${API_CONFIG.BACKEND_URL}/integrations?ventureId=${ventureId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    // Suppress console warning for integrations to keep console clean in offline mode
    return [];
  }
};

export const toggleIntegration = async (
  ventureId: string,
  provider: string,
  connect: boolean
): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error(ERROR_CODES.AUTH_REQUIRED);

  const response = await fetch(
    `${API_CONFIG.BACKEND_URL}/integrations/toggle`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ventureId, provider, connect }),
    }
  );

  if (!response.ok) throw new Error('Failed to toggle integration');
};

// Tool Exports - Updated with image argument for relevant tools
export const generateSwotAnalysis = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<SwotData>(
    'geminiPromptSwot',
    desc,
    swotSchema,
    lang,
    vid,
    'swot',
    'strategy',
    image,
    refinement
  );
export const generatePestelAnalysis = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<PestelData>(
    'geminiPromptPestel',
    desc,
    pestelSchema,
    lang,
    vid,
    'pestel',
    'strategy',
    image,
    refinement
  );
export const generateMarketAnalysis = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<MarketAnalysisData>(
    'geminiPromptMarket',
    desc,
    marketAnalysisSchema,
    lang,
    vid,
    'overview',
    'marketAnalysis',
    image,
    refinement
  );
export const generateMarketResearch = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<MarketResearchData>(
    'geminiPromptMarketResearch',
    desc,
    marketResearchSchema,
    lang,
    vid,
    'research',
    'marketAnalysis',
    image,
    refinement
  );
export const generateRoadmap = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<RoadmapData>(
    'geminiPromptRoadmap',
    desc,
    roadmapSchema,
    lang,
    vid,
    'roadmap',
    'strategy',
    image,
    refinement
  );
export const generateLeanCanvas = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<LeanCanvasData>(
    'geminiPromptLeanCanvas',
    desc,
    leanCanvasSchema,
    lang,
    vid,
    'leanCanvas',
    'strategy',
    image,
    refinement
  );
export const generateOkrWorkflow = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<OkrWorkflowData>(
    'geminiPromptOkrWorkflow',
    desc,
    okrWorkflowSchema,
    lang,
    vid,
    'okrWorkflow',
    'strategy',
    image,
    refinement
  );
export const generateIdeaValidation = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<IdeaValidationData>(
    'geminiPromptIdeaValidation',
    desc,
    ideaValidationSchema,
    lang,
    vid,
    'ideaValidation',
    'fundamentals',
    image,
    refinement
  );
export const generateProblemValidation = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<ProblemValidationData>(
    'geminiPromptProblemValidation',
    desc,
    problemValidationSchema,
    lang,
    vid,
    'problemValidation',
    'fundamentals',
    image,
    refinement
  );

// Competitor Analysis - Supports Image Input
export const generateCompetitorAnalysis = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<CompetitorAnalysisData>(
    'geminiPromptCompetitorAnalysis',
    desc,
    competitorAnalysisSchema,
    lang,
    vid,
    'competitorAnalysis',
    'fundamentals',
    image,
    refinement
  );

export const generateCustomerValidation = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<CustomerValidationData>(
    'geminiPromptCustomerValidation',
    desc,
    customerValidationSchema,
    lang,
    vid,
    'customerValidation',
    'fundamentals',
    image,
    refinement
  );
export const generateRiskFeasibilityAnalysis = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<RiskFeasibilityData>(
    'geminiPromptRiskFeasibility',
    desc,
    riskFeasibilitySchema,
    lang,
    vid,
    'riskFeasibility',
    'fundamentals',
    image,
    refinement
  );
export const generateValidationTracker = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<ValidationTrackerData>(
    'geminiPromptValidationTracker',
    desc,
    validationTrackerSchema,
    lang,
    vid,
    'validationTracker',
    'fundamentals',
    image,
    refinement
  );
export const generateBudget = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<BudgetGeneratorData>(
    'geminiPromptBudgetGenerator',
    desc,
    budgetGeneratorSchema,
    lang,
    vid,
    'budgetGenerator',
    'finance',
    image,
    refinement
  );
export const generateFinancialForecast = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<FinancialForecastData>(
    'geminiPromptFinancialForecast',
    desc,
    financialForecastSchema,
    lang,
    vid,
    'financialForecast',
    'finance',
    image,
    refinement
  );
export const generateCashFlowForecast = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<CashFlowForecastData>(
    'geminiPromptCashFlowForecast',
    desc,
    cashFlowForecastSchema,
    lang,
    vid,
    'cashFlowForecast',
    'finance',
    image,
    refinement
  );
export const generateKpiDashboard = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<KpiDashboardData>(
    'geminiPromptKpiDashboard',
    desc,
    kpiDashboardSchema,
    lang,
    vid,
    'kpiDashboards',
    'finance',
    image,
    refinement
  );
export const generateMilestones = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<MilestonesData>(
    'geminiPromptMilestones',
    desc,
    milestonesSchema,
    lang,
    vid,
    'milestones',
    'growth',
    image,
    refinement
  );
export const generateExpansionStrategy = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<ExpansionStrategyData>(
    'geminiPromptExpansionStrategy',
    desc,
    expansionStrategySchema,
    lang,
    vid,
    'expansionStrategy',
    'growth',
    image,
    refinement
  );
export const generatePitchDeck = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<PitchDeckData>(
    'geminiPromptPitchDeckGenerator',
    desc,
    pitchDeckSchema,
    lang,
    vid,
    'pitchDeckGenerator',
    'funding',
    image,
    refinement
  );
export const generateInvestorMatches = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<InvestorMatchingData>(
    'geminiPromptInvestorDatabase',
    desc,
    investorMatchingSchema,
    lang,
    vid,
    'investorDatabase',
    'funding',
    image,
    refinement
  );
export const generateFundraisingRoadmap = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<FundraisingRoadmapData>(
    'geminiPromptFundraisingRoadmap',
    desc,
    fundraisingRoadmapSchema,
    lang,
    vid,
    'fundraisingRoadmap',
    'funding',
    image,
    refinement
  );

export const generateBrandIdentity = (
  desc: string,
  lang: Language,
  vid: string,
  image?: string,
  refinement?: any
) =>
  generateAnalysis<BrandIdentityData>(
    'geminiPromptBrandIdentity',
    desc,
    brandIdentitySchema,
    lang,
    vid,
    'brandIdentity',
    'fundamentals',
    image,
    refinement
  );
