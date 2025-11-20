import { SchemaType } from "@google/generative-ai";
import type { SwotData, PestelData, MarketAnalysisData, MarketResearchData, RoadmapData, LeanCanvasData, OkrWorkflowData, IdeaValidationData, ProblemValidationData, CompetitorAnalysisData, CustomerValidationData, RiskFeasibilityData, ValidationTrackerData, BudgetGeneratorData, FinancialForecastData, CashFlowForecastData, KpiDashboardData, MilestonesData, AnalysisPoint, RoadmapPhase, MarketSizePoint, ExpansionStrategyData, PitchDeckData, InvestorMatchingData, FundraisingRoadmapData, BrandIdentityData, GenerationRecord, ModuleType, AnyTool, AnyAnalysisData } from '../types';
import { translations, Language } from '../locales';
import { API_CONFIG, STORAGE_KEYS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';

// Active request controllers for cancellation
const activeRequests = new Map<string, AbortController>();

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
async function fetchWithTimeout(url: string, options: RequestInit, timeout = API_CONFIG.REQUEST_TIMEOUT): Promise<Response> {
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
    } catch (error) {
        clearTimeout(timeoutId);
        activeRequests.delete(requestId);

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(ERROR_CODES.TIMEOUT);
        }
        throw error;
    }
}

// Retry with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = API_CONFIG.RETRY_ATTEMPTS): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, options);

            // Don't retry on 4xx errors (client errors)
            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                return response;
            }

            // Retry on 5xx errors and 429 (rate limit)
            if (response.status >= 500 || response.status === 429) {
                if (attempt < maxRetries) {
                    const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
                    logger.warn(`Request failed with status ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
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
                const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
                logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`, error);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error(ERROR_CODES.GENERIC);
}

// ... SCHEMAS ...
const analysisPointSchema = {
    type: Type.OBJECT,
    properties: {
        point: { type: Type.STRING },
        explanation: { type: Type.STRING }
    },
    required: ["point", "explanation"],
};

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
    refinement?: { instruction: string; parentId: string } // Optional Refinement
): Promise<T> {
    const t = (key: any) => translations[language][key] || translations['en'][key];
    const promptTemplate = t(promptKey as any);
    const prompt = promptTemplate.replace('{businessDescription}', businessDescription);
    const token = getAuthToken();

    try {
        logger.log(`[Frontend] Submitting async job to: ${API_CONFIG.BACKEND_URL}/analysis/generate`);

        // Submit job (returns immediately with job ID)
        const response = await fetchWithRetry(`${API_CONFIG.BACKEND_URL}/analysis/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
                parentAnalysisId: refinement?.parentId
            }),
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Authentication Required. Please sign in.');
            if (response.status === 429) throw new Error(ERROR_CODES.RATE_LIMIT);
            if (response.status === 500) throw new Error(ERROR_CODES.SERVER_ERROR);

            try {
                const errBody = await response.text();
                logger.error('Backend Error Response:', errBody);
            } catch (e) { }

            throw new Error(ERROR_CODES.GENERIC);
        }

        const { jobId } = await response.json();
        logger.log(`[Frontend] Job submitted: ${jobId}, polling for completion...`);

        // Poll for completion
        const result = await pollJobCompletion<T>(jobId);
        return result;

    } catch (error) {
        logger.error("Error generating analysis from Backend:", error);
        if (error instanceof Error) {
            if (error.message.includes('Authentication Required') || error.message === ERROR_CODES.RATE_LIMIT) {
                throw error;
            }
            if (error.message === ERROR_CODES.TIMEOUT) {
                logger.error(`Request timeout after ${API_CONFIG.REQUEST_TIMEOUT}ms`);
                throw error;
            }
            if (error.message === 'Failed to fetch') {
                logger.error(`[Network Error] Could not connect to ${API_CONFIG.BACKEND_URL}.`);
                logger.error(`1. Ensure the backend server is running (npm run start:dev).`);
                logger.error(`2. Check if port 3000 is exposed.`);
                throw new Error(ERROR_CODES.NETWORK_ERROR);
            }
            if ([ERROR_CODES.SERVER_ERROR, ERROR_CODES.NETWORK_ERROR, ERROR_CODES.GENERIC].includes(error.message)) {
                throw error;
            }
        }
        throw new Error(ERROR_CODES.GENERIC);
    }
}

// Poll job completion helper
async function pollJobCompletion<T>(jobId: string, pollInterval = 2000, timeout = 300000): Promise<T> {
    const token = getAuthToken();
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        const poll = async () => {
            try {
                if (Date.now() - startTime > timeout) {
                    clearInterval(intervalId);
                    reject(new Error('Job timeout after 5 minutes'));
                    return;
                }

                const statusResponse = await fetch(`${API_CONFIG.BACKEND_URL}/jobs/${jobId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!statusResponse.ok) {
                    throw new Error('Failed to fetch job status');
                }

                const status = await statusResponse.json();

                if (status.status === 'completed') {
                    clearInterval(intervalId);
                    logger.log(`[Frontend] Job ${jobId} completed successfully`);
                    resolve(status.result as T);
                } else if (status.status === 'failed') {
                    clearInterval(intervalId);
                    logger.error(`[Frontend] Job ${jobId} failed:`, status.error);
                    reject(new Error(status.error || 'Job failed'));
                } else {
                    logger.log(`[Frontend] Job ${jobId} status: ${status.status}`);
                }
            } catch (error) {
                clearInterval(intervalId);
                reject(error);
            }
        };

        const intervalId = setInterval(poll, pollInterval);
        poll(); // Initial poll
    });
}

// History Fetcher
export const fetchVentureHistory = async (ventureId: string): Promise<GenerationRecord[]> => {
    try {
        const token = getAuthToken();
        // If offline or not logged in, don't attempt fetch to avoid 401/Network errors
        if (!token) return [];

        const response = await fetchWithTimeout(`${API_CONFIG.BACKEND_URL}/history/${ventureId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) return [];

        if (!response.ok) {
            // Silent fail for history is better UX than alerts
            return [];
        }
        const rawHistory = await response.json();

        return rawHistory.map((record: any) => {
            const toolKeyCap = record.tool.charAt(0).toUpperCase() + record.tool.slice(1);
            const toolNameKey = `${record.module}Nav${toolKeyCap}`;

            // Parse the JSON result
            const parsedData = typeof record.resultData === 'string' ? JSON.parse(record.resultData) : record.resultData;

            return {
                id: record.id,
                timestamp: record.createdAt,
                module: record.module as ModuleType,
                tool: record.tool as AnyTool,
                toolNameKey: toolNameKey,
                inputDescription: record.inputContext,
                data: { ...parsedData, id: record.id } as AnyAnalysisData // Inject ID into data
            };
        });
    } catch (error) {
        // Suppress console noise for offline mode history checks
        logger.warn('Failed to fetch venture history (may be offline)', error);
        return [];
    }
};

// Save Version
export const saveAnalysisVersion = async (originalRecord: GenerationRecord, modifiedData: AnyAnalysisData, message: string): Promise<void> => {
    try {
        const token = getAuthToken();
        if (!token) throw new Error('Authentication required to save versions.');

        const response = await fetchWithTimeout(`${API_CONFIG.BACKEND_URL}/history/version`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ventureId: 'dev-venture-id', // In real app use actual ventureId
                parentId: originalRecord.id,
                module: originalRecord.module,
                tool: originalRecord.tool,
                description: message,
                data: modifiedData
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save version');
        }
    } catch (error) {
        logger.error("Failed to save version:", error);
        // throw error; // Optionally rethrow
    }
};


// Delete Analysis
export const deleteAnalysisRecord = async (analysisId: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required.');

    const response = await fetchWithTimeout(`${API_CONFIG.BACKEND_URL}/history/${analysisId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete analysis');
    }
};

// Invite Team Member
export const inviteTeamMember = async (ventureId: string, email: string, role: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required.');

    const response = await fetchWithTimeout(`${API_CONFIG.BACKEND_URL}/ventures/${ventureId}/invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
    });

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

export const downloadReportPdf = async (analysisId: string, fileName: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
        alert("Please sign in to download reports.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/reports/${analysisId}/pdf`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to generate PDF");

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
        console.error("PDF Download Error:", error);
        throw error;
    }
};

// --- Integrations API ---

export interface IntegrationStatus {
    provider: string;
    status: 'connected' | 'disconnected';
}

export const fetchIntegrations = async (ventureId: string): Promise<IntegrationStatus[]> => {
    const token = getAuthToken();
    // Don't throw or log if not logged in, just return empty state
    if (!token) return [];

    try {
        const response = await fetch(`${BACKEND_URL}/integrations?ventureId=${ventureId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        // Suppress console warning for integrations to keep console clean in offline mode
        return [];
    }
};

export const toggleIntegration = async (ventureId: string, provider: string, connect: boolean): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required.');

    const response = await fetch(`${BACKEND_URL}/integrations/toggle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ventureId, provider, connect })
    });

    if (!response.ok) throw new Error('Failed to toggle integration');
};

// Tool Exports - Updated with image argument for relevant tools
export const generateSwotAnalysis = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<SwotData>('geminiPromptSwot', desc, {}, lang, vid, 'swot', 'strategy', image, refinement);
export const generatePestelAnalysis = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<PestelData>('geminiPromptPestel', desc, {}, lang, vid, 'pestel', 'strategy', image, refinement);
export const generateMarketAnalysis = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<MarketAnalysisData>('geminiPromptMarket', desc, {}, lang, vid, 'overview', 'marketAnalysis', image, refinement);
export const generateMarketResearch = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<MarketResearchData>('geminiPromptMarketResearch', desc, {}, lang, vid, 'research', 'marketAnalysis', image, refinement);
export const generateRoadmap = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<RoadmapData>('geminiPromptRoadmap', desc, {}, lang, vid, 'roadmap', 'strategy', image, refinement);
export const generateLeanCanvas = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<LeanCanvasData>('geminiPromptLeanCanvas', desc, {}, lang, vid, 'leanCanvas', 'strategy', image, refinement);
export const generateOkrWorkflow = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<OkrWorkflowData>('geminiPromptOkrWorkflow', desc, {}, lang, vid, 'okrWorkflow', 'strategy', image, refinement);
export const generateIdeaValidation = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<IdeaValidationData>('geminiPromptIdeaValidation', desc, {}, lang, vid, 'ideaValidation', 'fundamentals', image, refinement);
export const generateProblemValidation = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<ProblemValidationData>('geminiPromptProblemValidation', desc, {}, lang, vid, 'problemValidation', 'fundamentals', image, refinement);

// Competitor Analysis - Supports Image Input
export const generateCompetitorAnalysis = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) =>
    generateAnalysis<CompetitorAnalysisData>('geminiPromptCompetitorAnalysis', desc, {}, lang, vid, 'competitorAnalysis', 'fundamentals', image, refinement);

export const generateCustomerValidation = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<CustomerValidationData>('geminiPromptCustomerValidation', desc, {}, lang, vid, 'customerValidation', 'fundamentals', image, refinement);
export const generateRiskFeasibilityAnalysis = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<RiskFeasibilityData>('geminiPromptRiskFeasibility', desc, {}, lang, vid, 'riskFeasibility', 'fundamentals', image, refinement);
export const generateValidationTracker = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<ValidationTrackerData>('geminiPromptValidationTracker', desc, {}, lang, vid, 'validationTracker', 'fundamentals', image, refinement);
export const generateBudget = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<BudgetGeneratorData>('geminiPromptBudgetGenerator', desc, {}, lang, vid, 'budgetGenerator', 'finance', image, refinement);
export const generateFinancialForecast = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<FinancialForecastData>('geminiPromptFinancialForecast', desc, {}, lang, vid, 'financialForecast', 'finance', image, refinement);
export const generateCashFlowForecast = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<CashFlowForecastData>('geminiPromptCashFlowForecast', desc, {}, lang, vid, 'cashFlowForecast', 'finance', image, refinement);
export const generateKpiDashboard = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<KpiDashboardData>('geminiPromptKpiDashboard', desc, {}, lang, vid, 'kpiDashboards', 'finance', image, refinement);
export const generateMilestones = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<MilestonesData>('geminiPromptMilestones', desc, {}, lang, vid, 'milestones', 'growth', image, refinement);
export const generateExpansionStrategy = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<ExpansionStrategyData>('geminiPromptExpansionStrategy', desc, {}, lang, vid, 'expansionStrategy', 'growth', image, refinement);
export const generatePitchDeck = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<PitchDeckData>('geminiPromptPitchDeckGenerator', desc, {}, lang, vid, 'pitchDeckGenerator', 'funding', image, refinement);
export const generateInvestorMatches = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<InvestorMatchingData>('geminiPromptInvestorDatabase', desc, {}, lang, vid, 'investorDatabase', 'funding', image, refinement);
export const generateFundraisingRoadmap = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) => generateAnalysis<FundraisingRoadmapData>('geminiPromptFundraisingRoadmap', desc, {}, lang, vid, 'fundraisingRoadmap', 'funding', image, refinement);

export const generateBrandIdentity = (desc: string, lang: Language, vid: string, image?: string, refinement?: any) =>
    generateAnalysis<BrandIdentityData>('geminiPromptBrandIdentity', desc, {}, lang, vid, 'brandIdentity', 'fundamentals', image, refinement);
