// Centralized ModuleType definition
export type ModuleType =
  | 'dashboard'
  | 'fundamentals'
  | 'strategy'
  | 'marketAnalysis'
  | 'finance'
  | 'growth'
  | 'funding'
  | 'integrations'
  | 'architecture'
  | 'audit'
  | 'productivity';

export interface AnalysisPoint {
  point: string;
  explanation: string;
  completed?: boolean;
}

export interface Source {
  title: string;
  url: string;
}

// Authentication Types
export interface AuthCredentials {
  email: string;
  password: string;
}

// Agent Types
export type AgentType =
  | 'Lead Strategist'
  | 'Market Researcher'
  | 'Product Owner'
  | 'CFO'
  | 'Growth Hacker'
  | 'Venture Capitalist'
  | 'Systems Architect'
  | 'Creative Director';

export interface AgentLog {
  id: string;
  agent: AgentType;
  messageKey: string; // Translation key
  timestamp: number;
}

export interface SwotData {
  strengths: AnalysisPoint[];
  weaknesses: AnalysisPoint[];
  opportunities: AnalysisPoint[];
  threats: AnalysisPoint[];
}

export interface PestelData {
  political: AnalysisPoint[];
  economic: AnalysisPoint[];
  social: AnalysisPoint[];
  technological: AnalysisPoint[];
  environmental: AnalysisPoint[];
  legal: AnalysisPoint[];
}

export interface MarketAnalysisData {
  targetAudience: AnalysisPoint[];
  marketSizeAndTrends: AnalysisPoint[];
  competitorLandscape: AnalysisPoint[];
}

export interface MarketResearchData {
  marketDrivers: AnalysisPoint[];
  customerBehavior: AnalysisPoint[];
  barriersToEntry: AnalysisPoint[];
}

export interface RoadmapPhase {
  phaseName: string;
  milestones: AnalysisPoint[];
}

export interface RoadmapData {
  phases: RoadmapPhase[];
}

export interface LeanCanvasData {
  problem: AnalysisPoint[];
  solution: AnalysisPoint[];
  keyMetrics: AnalysisPoint[];
  uniqueValueProposition: AnalysisPoint[];
  unfairAdvantage: AnalysisPoint[];
  channels: AnalysisPoint[];
  customerSegments: AnalysisPoint[];
  costStructure: AnalysisPoint[];
  revenueStreams: AnalysisPoint[];
}

export interface KeyResult {
  description: string;
  trackingMethod: string;
}

export interface Objective {
  objective: string;
  keyResults: KeyResult[];
}

export interface StrategicGoal {
  goal: string;
  objectives: Objective[];
}

export interface OkrWorkflowData {
  visionStatement: string;
  strategicGoals: StrategicGoal[];
  cascadingAlignment: AnalysisPoint[];
  trackingAndReview: AnalysisPoint[];
  reflectionAndNextCycle: AnalysisPoint[];
}

export interface IdeaValidationData {
  summary: string;
  problemStatement: AnalysisPoint[];
  solutionStatement: AnalysisPoint[];
  valueProposition: AnalysisPoint[];
  keyAssumptions: AnalysisPoint[];
}

export interface MarketSizePoint {
  value: string; // e.g., "$10B", "5 Million Users"
  explanation: string;
}

export interface ProblemValidationData {
  marketSize: {
    tam: MarketSizePoint;
    sam: MarketSizePoint;
    som: MarketSizePoint;
  };
  customerSegments: AnalysisPoint[];
  problemSignificance: AnalysisPoint[];
}

export interface Competitor {
  name: string;
  type: 'Direct' | 'Indirect' | 'Substitute';
  features: string;
  pricing: string;
  positioning: string;
}

export interface CompetitorAnalysisData {
  competitors: Competitor[];
  gaps: AnalysisPoint[];
  differentiators: AnalysisPoint[];
  risks: AnalysisPoint[];
}

export interface LandingPageCopy {
  headline: string;
  body: string;
  callToAction: string;
}

export interface AdCopy {
  platform: 'Facebook' | 'Google Ads' | 'LinkedIn';
  headline: string;
  body: string;
}

export interface ValidationMetric {
  metric: string;
  value: string;
  explanation: string;
}

export interface CustomerValidationData {
  landingPageCopy: LandingPageCopy;
  surveyQuestions: string[];
  adCopy: AdCopy[];
  validationScorecard: ValidationMetric[];
}

export interface ResourceEstimate {
  category: 'Time' | 'Capital' | 'Team';
  estimate: string;
  explanation: string;
}

export interface FeasibilityScore {
  score: number;
  summary: string;
}

export interface RiskFeasibilityData {
  regulatoryRisks: AnalysisPoint[];
  financialRisks: AnalysisPoint[];
  operationalRisks: AnalysisPoint[];
  resourceEstimates: ResourceEstimate[];
  feasibilityScore: FeasibilityScore;
}

// Types for Continuous Learning & Tracking
export interface ValidationTrackerMetric {
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  explanation: string;
}

export interface CompetitorActivity {
  competitorName: string;
  activity: string;
  date: string; // e.g., "YYYY-MM-DD" or "Last week"
}

export interface EmergingTrend {
  trend: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface FundingInsight {
  insight: string;
  explanation: string;
}

export interface ValidationTrackerData {
  keyMetrics: ValidationTrackerMetric[];
  recentCompetitorActivity: CompetitorActivity[];
  emergingTrends: EmergingTrend[];
  fundingInsights: FundingInsight[];
}

// Types for Brand Identity
export interface BrandIdentityData {
  logoImage: string; // Base64
  imagePrompt: string;
  rationale: string;
  palette: string[]; // Array of Hex codes
}

// Types for Budget Generator
export interface BudgetItem {
  name: string;
  amount: number;
  type: 'Fixed' | 'Variable';
}

export interface BudgetCategory {
  categoryName:
    | 'Revenue Streams'
    | 'Cost of Goods Sold (COGS)'
    | 'Operating Expenses (OPEX)'
    | 'Capital Expenditures (CAPEX)';
  items: BudgetItem[];
}

export interface ScenarioSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfitOrLoss: number;
}

export interface BudgetScenario {
  scenarioName: 'Conservative' | 'Realistic' | 'Aggressive';
  summary: ScenarioSummary;
  breakdown: BudgetCategory[];
}

export interface BudgetGeneratorData {
  scenarios: BudgetScenario[];
  recommendations: AnalysisPoint[];
}

// Types for Financial Forecast
export interface ForecastYear {
  year: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netProfit: number;
}

export interface FinancialForecastData {
  forecast: ForecastYear[];
  assumptions: AnalysisPoint[];
}

// Types for Cash Flow Forecast
export interface CashFlowMonth {
  month: number; // 1-12
  inflows: number;
  outflows: number;
  netCashFlow: number;
  endingBalance: number;
}

export interface CashFlowForecastData {
  monthlyForecasts: CashFlowMonth[];
  runwayMonths: number;
  averageBurnRate: number;
  insights: AnalysisPoint[];
}

// Types for KPI Dashboard
export interface Kpi {
  name: string;
  value: string;
  benchmark: string;
  insight: string;
}

export interface KpiDashboardData {
  executiveSummary: string;
  kpis: Kpi[];
}

// Types for Milestones & Smart Alerts
export interface Milestone {
  point: string;
  explanation: string;
  quarter: number; // e.g., 1, 2, 3, 4 for the next 12 months
}

export interface SmartAlert {
  alert: string;
  recommendation: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface MilestonesData {
  milestones: Milestone[];
  smartAlerts: SmartAlert[];
}

export interface RecommendedStrategy {
  strategyName:
    | 'Market Penetration'
    | 'Market Development'
    | 'Product Development'
    | 'Diversification';
  justification: string;
}

export interface ExpansionStrategyData {
  recommendedStrategy: RecommendedStrategy;
  marketExpansionSuggestions: AnalysisPoint[];
  predictiveModelingInsights: AnalysisPoint[];
  partnershipRecommendations: AnalysisPoint[];
}

// Types for Pitch Deck Generator
export interface PitchDeckSlide {
  title: string;
  content: AnalysisPoint[];
  visualSuggestion?: {
    type:
      | 'bar_chart'
      | 'line_graph'
      | 'pie_chart'
      | 'map'
      | 'table'
      | 'infographic'
      | 'none';
    description: string;
  };
}

export interface PitchDeckData {
  slides: PitchDeckSlide[];
}

// Types for Investor Database Access
export interface InvestorProfile {
  name: string;
  type:
    | 'Angel Investor'
    | 'Venture Capital (Early Stage)'
    | 'Venture Capital (Late Stage)'
    | 'Accelerator / Incubator'
    | 'Corporate Venture Arm'
    | 'Grant Program';
  location: string;
  investmentStage: string;
  ticketSize: string;
  sectorFocus: string[];
  alignmentScore: number;
  reasoning: string;
  outreachSuggestion: {
    subject: string;
    body: string;
  };
}

export interface InvestorMatchingData {
  investors: InvestorProfile[];
}

// Types for Fundraising Roadmap
export interface FundraisingTask {
  task: string;
  details: string;
  status: 'To Do' | 'In Progress' | 'Completed';
}

export interface FundraisingPhase {
  phaseName:
    | 'Preparation'
    | 'Investor Outreach'
    | 'Meetings & Due Diligence'
    | 'Closing';
  tasks: FundraisingTask[];
}

export interface FundraisingRoadmapAlert {
  alert: string;
  recommendation: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface AlternativeFundingOption {
  option: string;
  description: string;
}

export interface FundraisingRoadmapData {
  phases: FundraisingPhase[];
  smartAlerts: FundraisingRoadmapAlert[];
  alternativeFunding: AlternativeFundingOption[];
}

// Types for Experiment Builder
export interface ExperimentCard {
  id: string;
  content: string;
  completed: boolean;
}

export interface ExperimentColumn {
  id: 'hypotheses' | 'methods' | 'metrics';
  titleKey: string;
  cards: ExperimentCard[];
}

export interface ExperimentData {
  columns: ExperimentColumn[];
}

// Type for any possible analysis data. Added _sources support and optional ID from database.
export type AnyAnalysisData = (
  | SwotData
  | PestelData
  | MarketAnalysisData
  | MarketResearchData
  | RoadmapData
  | LeanCanvasData
  | OkrWorkflowData
  | IdeaValidationData
  | ProblemValidationData
  | CompetitorAnalysisData
  | CustomerValidationData
  | RiskFeasibilityData
  | ValidationTrackerData
  | BudgetGeneratorData
  | FinancialForecastData
  | CashFlowForecastData
  | KpiDashboardData
  | MilestonesData
  | ExpansionStrategyData
  | PitchDeckData
  | InvestorMatchingData
  | FundraisingRoadmapData
  | ExperimentData
  | BrandIdentityData
) & { _sources?: Source[]; id?: string };

// Type for Generation History
export interface GenerationRecord {
  id: string;
  timestamp: string;
  module: ModuleType;
  tool: AnyTool;
  toolNameKey: string;
  inputDescription: string;
  data: AnyAnalysisData;
}

// Centralized Tool Types
export type StrategyTool =
  | 'swot'
  | 'pestel'
  | 'roadmap'
  | 'leanCanvas'
  | 'okrWorkflow';
export type MarketAnalysisTool = 'overview' | 'research';
export type FundamentalsTool =
  | 'ideaValidation'
  | 'problemValidation'
  | 'competitorAnalysis'
  | 'customerValidation'
  | 'riskFeasibility'
  | 'validationTracker'
  | 'experimentBuilder'
  | 'brandIdentity';
export type FinanceTool =
  | 'budgetGenerator'
  | 'financialForecast'
  | 'cashFlowForecast'
  | 'kpiDashboards';
export type GrowthTool = 'milestones' | 'expansionStrategy';
export type FundingTool =
  | 'pitchDeckGenerator'
  | 'investorDatabase'
  | 'fundraisingRoadmap';
export type ArchitectureTool = 'systemDesign';
export type AuditTool = 'trail';
export type IntegrationsTool = 'connectors';
export type ProductivityTool = 'taskManager';
export type DashboardTool = 'overview';

export type AnyTool =
  | StrategyTool
  | MarketAnalysisTool
  | FundamentalsTool
  | FinanceTool
  | GrowthTool
  | FundingTool
  | ArchitectureTool
  | AuditTool
  | IntegrationsTool
  | ProductivityTool
  | DashboardTool;
