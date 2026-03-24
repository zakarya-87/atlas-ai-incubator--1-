import React from 'react';
import { motion, Variants } from 'framer-motion';
import type {
  ProblemValidationData,
  AnalysisPoint,
  MarketSizePoint,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import DataStructureDebugger from './DataStructureDebugger';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface MarketSizeCardProps {
  title: string;
  data: MarketSizePoint;
  bgColorClass: string;
  textColorClass: string;
}

const MarketSizeCard: React.FC<MarketSizeCardProps> = ({
  title,
  data,
  bgColorClass,
  textColorClass,
}) => (
  <motion.div
    variants={cardVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
  >
    <h3 className={`text-md font-bold ${textColorClass}`}>{title}</h3>
    <p className="text-3xl font-bold text-brand-text mt-2">{data.value}</p>
    <p className="text-xs text-brand-text/80 mt-1 flex-grow">
      {data.explanation}
    </p>
  </motion.div>
);

interface SectionCardProps {
  title: string;
  points: AnalysisPoint[];
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  points,
  icon,
  bgColorClass,
  textColorClass,
}) => (
  <motion.div
    variants={cardVariants}
    className={`rounded-lg p-4 flex flex-col h-full ${bgColorClass}`}
  >
    <div className="flex items-center mb-3">
      <span className={`mr-3 rtl:ml-3 rtl:mr-0 ${textColorClass}`}>{icon}</span>
      <h3 className={`text-xl font-bold ${textColorClass}`}>{title}</h3>
    </div>
    <ul className="space-y-3 text-brand-text/90 flex-grow">
      {(points || []).map((item, index) => (
        <li key={index} className="text-sm leading-relaxed">
          <strong className="font-semibold text-brand-text/95 display-block">
            {item?.point || 'N/A'}
          </strong>
          <p className="text-brand-text/80">{item?.explanation || ''}</p>
        </li>
      ))}
    </ul>
  </motion.div>
);

const icons = {
  segments: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.663M12 3.375c-3.418 0-6.138 1.49-6.138 3.375s2.72 3.375 6.138 3.375 6.138-1.49 6.138-3.375S15.418 3.375 12 3.375Z"
      />
    </svg>
  ),
  significance: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  ),
};

interface ProblemValidationDisplayProps {
  data: ProblemValidationData;
}

const ProblemValidationDisplay: React.FC<ProblemValidationDisplayProps> = ({
  data,
}) => {
  const { t } = useLanguage();

  // Helper to normalize list items
  const normalizeList = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') {
      if (Array.isArray((value as any).items)) return (value as any).items;
      if (Array.isArray((value as any).list)) return (value as any).list;
      // For objects, return entries as array for rendering
      return Object.entries(value).map(([k, v]) => ({ key: k, value: v }));
    }
    return [value];
  };

  // Helper to extract text from various item shapes
  const getItemText = (item: any): string => {
    if (!item) return 'N/A';
    if (typeof item === 'string') return item;
    if (typeof item === 'number') return String(item);
    if (typeof item === 'object') {
      return (
        item.name ||
        item.title ||
        item.point ||
        item.description ||
        item.pain_point ||
        item.step ||
        item.text ||
        item.summary ||
        (item.key ? `${item.key.replace(/_/g, ' ')}` : null) ||
        JSON.stringify(item)
      );
    }
    return String(item);
  };

  const getItemDetails = (item: any): string | null => {
    if (!item || typeof item !== 'object') return null;
    return (
      item.description ||
      item.explanation ||
      item.details ||
      item.percentage ||
      item.timeline ||
      item.source ||
      (item.value && typeof item.value === 'object' ? JSON.stringify(item.value) : item.value) ||
      null
    );
  };

  // Handle undefined, null, non-object, or array data gracefully
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 text-center"
      >
        <DataStructureDebugger data={data} label="Problem Validation Data" />
        <div className="text-brand-text/60">
          <p>No problem validation data available.</p>
          <p className="text-sm mt-2">Please generate an analysis to see results.</p>
        </div>
      </motion.div>
    );
  }

  // Use the data directly - it's already the rich analysis object
  const analysisData = data as any;

  // Check for classic structure first
  const classicMarketSize = analysisData.marketSize || analysisData.market_size;
  const hasClassicMarketSize = classicMarketSize?.tam || classicMarketSize?.sam || classicMarketSize?.som;

  // New rich structure detection
  const marketAnalysis = analysisData.market_analysis;
  const competitiveAnalysis = analysisData.competitive_analysis;
  const productPositioning = analysisData.product_positioning;
  const pricingStrategy = analysisData.pricing_strategy;
  const goToMarket = analysisData.go_to_market_strategy;
  const riskAssessment = analysisData.risk_assessment;
  const strategicRecommendations = analysisData.strategic_recommendations;
  const conclusion = analysisData.conclusion;

  const hasRichStructure = marketAnalysis || competitiveAnalysis || productPositioning || conclusion;

  // Render rich structure
  if (hasRichStructure) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4"
      >
        <DataStructureDebugger data={data} label="Problem Validation Data" />

        {/* Conclusion / Summary */}
        {conclusion && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-brand-teal/10 border border-brand-teal/30">
            <h3 className="text-xl font-bold text-brand-teal mb-3">📋 Validation Summary</h3>
            {conclusion.problem_statement_validation && (
              <p className="text-sm text-brand-text/90 mb-3">{conclusion.problem_statement_validation}</p>
            )}
            {conclusion.market_opportunity && (
              <p className="text-sm text-brand-text/80 mb-3"><strong>Market Opportunity:</strong> {conclusion.market_opportunity}</p>
            )}
            {conclusion.key_recommendations && (
              <div className="mb-3">
                <h4 className="font-semibold text-brand-text/95 mb-2">Key Recommendations:</h4>
                <ul className="space-y-1 ml-4">
                  {normalizeList(conclusion.key_recommendations).slice(0, 6).map((rec: any, idx: number) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-brand-teal mr-2">→</span>
                      <span className="text-brand-text/90">{getItemText(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {conclusion.next_steps && (
              <div>
                <h4 className="font-semibold text-brand-text/95 mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-brand-text/80">
                  {normalizeList(conclusion.next_steps).slice(0, 6).map((step: any, idx: number) => (
                    <li key={idx}>
                      {getItemText(step)}
                      {getItemDetails(step) && <span className="text-brand-text/60 ml-2">({getItemDetails(step)})</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>
        )}

        {/* Market Analysis */}
        {marketAnalysis && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-blue-500/5">
            <h3 className="text-xl font-bold text-blue-400 mb-3">📊 Market Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketAnalysis.market_size && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-brand-text/95 mb-2">Market Size</h4>
                  <div className="space-y-2 text-sm text-brand-text/80">
                    {Object.entries(marketAnalysis.market_size).map(([key, val]: [string, any]) => (
                      <div key={key}>
                        <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong>{' '}
                        {typeof val === 'object' ? (val.value || JSON.stringify(val)) : val}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {marketAnalysis.customer_pain_points && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-brand-text/95 mb-2">Customer Pain Points</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(marketAnalysis.customer_pain_points).slice(0, 5).map((p: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span className="text-brand-text/90">{getItemText(p)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {marketAnalysis.market_trends && (
                <div className="bg-brand-primary/20 p-3 rounded md:col-span-2">
                  <h4 className="font-semibold text-brand-text/95 mb-2">Market Trends</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {normalizeList(marketAnalysis.market_trends).slice(0, 6).map((trend: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-400 mr-2">↗</span>
                        <div>
                          <span className="text-brand-text/95">{getItemText(trend)}</span>
                          {getItemDetails(trend) && (
                            <p className="text-xs text-brand-text/60 mt-0.5">{getItemDetails(trend)}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Competitive Analysis */}
        {competitiveAnalysis && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-purple-500/5">
            <h3 className="text-xl font-bold text-purple-400 mb-3">⚔️ Competitive Analysis</h3>
            {competitiveAnalysis.competitive_landscape?.description && (
              <p className="text-sm text-brand-text/80 mb-3">{competitiveAnalysis.competitive_landscape.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitiveAnalysis.direct_competitors && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-brand-text/95 mb-2">Direct Competitors</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(competitiveAnalysis.direct_competitors).slice(0, 5).map((c: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span className="text-brand-text/90">{getItemText(c)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {competitiveAnalysis.indirect_competitors && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-brand-text/95 mb-2">Indirect Competitors</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(competitiveAnalysis.indirect_competitors).slice(0, 5).map((c: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        <span className="text-brand-text/90">{getItemText(c)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {competitiveAnalysis.competitive_landscape?.competitive_gaps && (
                <div className="bg-brand-primary/20 p-3 rounded md:col-span-2">
                  <h4 className="font-semibold text-green-400 mb-2">Competitive Gaps (Opportunities)</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {normalizeList(competitiveAnalysis.competitive_landscape.competitive_gaps).map((g: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span className="text-brand-text/90">{getItemText(g)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Product Positioning */}
        {productPositioning && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-green-500/5">
            <h3 className="text-xl font-bold text-green-400 mb-3">🎯 Product Positioning</h3>
            {productPositioning.value_proposition && (
              <p className="text-sm text-brand-text/90 mb-3"><strong>Value Proposition:</strong> {typeof productPositioning.value_proposition === 'string' ? productPositioning.value_proposition : JSON.stringify(productPositioning.value_proposition)}</p>
            )}
            {productPositioning.differentiators && (
              <div className="mb-3">
                <h4 className="font-semibold text-brand-text/95 mb-2">Key Differentiators:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {normalizeList(productPositioning.differentiators).slice(0, 6).map((d: any, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-2">★</span>
                      <span className="text-brand-text/90">{getItemText(d)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Risk Assessment */}
        {riskAssessment && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-red-500/5">
            <h3 className="text-xl font-bold text-red-400 mb-3">⚠️ Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskAssessment.market_risks && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-yellow-400 mb-2">Market Risks</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(riskAssessment.market_risks).slice(0, 4).map((r: any, idx: number) => (
                      <li key={idx} className="text-brand-text/80">{getItemText(r)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {riskAssessment.operational_risks && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-orange-400 mb-2">Operational Risks</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(riskAssessment.operational_risks).slice(0, 4).map((r: any, idx: number) => (
                      <li key={idx} className="text-brand-text/80">{getItemText(r)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {riskAssessment.financial_risks && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-red-400 mb-2">Financial Risks</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(riskAssessment.financial_risks).slice(0, 4).map((r: any, idx: number) => (
                      <li key={idx} className="text-brand-text/80">{getItemText(r)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Strategic Recommendations */}
        {strategicRecommendations && (
          <motion.div variants={cardVariants} className="rounded-lg p-4 bg-yellow-500/5">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">💡 Strategic Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategicRecommendations.short_term && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-green-400 mb-2">Short Term</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(strategicRecommendations.short_term).slice(0, 4).map((r: any, idx: number) => (
                      <li key={idx} className="text-brand-text/80">{getItemText(r)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {strategicRecommendations.medium_term && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-blue-400 mb-2">Medium Term</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(strategicRecommendations.medium_term).slice(0, 4).map((r: any, idx: number) => (
                      <li key={idx} className="text-brand-text/80">{getItemText(r)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {strategicRecommendations.long_term && (
                <div className="bg-brand-primary/20 p-3 rounded">
                  <h4 className="font-semibold text-purple-400 mb-2">Long Term</h4>
                  <ul className="space-y-1 text-sm">
                    {normalizeList(strategicRecommendations.long_term).slice(0, 4).map((r: any, idx: number) => (
                      <li key={idx} className="text-brand-text/80">{getItemText(r)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Classic structure rendering
  if (hasClassicMarketSize) {
    const customerSegments = normalizeList(analysisData.customerSegments || analysisData.customer_segments || analysisData.segments);
    const problemSignificance = normalizeList(analysisData.problemSignificance || analysisData.problem_significance || analysisData.significance || analysisData.pain_points);

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4"
      >
        <DataStructureDebugger data={data} label="Problem Validation Data" />
        
        <motion.div
          variants={cardVariants}
          className="rounded-lg p-4 bg-brand-secondary/30"
        >
          <h3 className="text-xl font-bold text-brand-teal mb-3">
            {t('problemValidationMarketSize')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MarketSizeCard
              title={t('problemValidationTAM')}
              data={classicMarketSize?.tam || { value: 'N/A', explanation: 'Data not available' }}
              bgColorClass="bg-blue-500/10"
              textColorClass="text-blue-400"
            />
            <MarketSizeCard
              title={t('problemValidationSAM')}
              data={classicMarketSize?.sam || { value: 'N/A', explanation: 'Data not available' }}
              bgColorClass="bg-teal-500/10"
              textColorClass="text-teal-400"
            />
            <MarketSizeCard
              title={t('problemValidationSOM')}
              data={classicMarketSize?.som || { value: 'N/A', explanation: 'Data not available' }}
              bgColorClass="bg-green-500/10"
              textColorClass="text-green-400"
            />
          </div>
        </motion.div>

        {(customerSegments.length > 0 || problemSignificance.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {customerSegments.length > 0 && (
              <SectionCard
                title={t('problemValidationCustomerSegments')}
                points={customerSegments}
                icon={icons.segments}
                bgColorClass="bg-purple-500/5"
                textColorClass="text-purple-400"
              />
            )}
            {problemSignificance.length > 0 && (
              <SectionCard
                title={t('problemValidationProblemSignificance')}
                points={problemSignificance}
                icon={icons.significance}
                bgColorClass="bg-yellow-500/5"
                textColorClass="text-yellow-400"
              />
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Fallback: render all top-level keys
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-4"
    >
      <DataStructureDebugger data={data} label="Problem Validation Data" />
      
      <motion.div variants={cardVariants} className="rounded-lg p-4 bg-brand-secondary/30">
        <h3 className="text-xl font-bold text-brand-teal mb-3">Analysis Results</h3>
        <div className="space-y-4 text-sm text-brand-text/90">
          {Object.entries(analysisData).filter(([key]) => key !== 'id').map(([key, value]) => {
            const items = normalizeList(value);
            return (
              <div key={key} className="bg-brand-primary/20 p-3 rounded">
                <h4 className="font-semibold text-brand-text/95 mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                {typeof value === 'string' ? (
                  <p className="text-brand-text/80">{value}</p>
                ) : items.length > 0 ? (
                  <ul className="space-y-1 ml-4">
                    {items.slice(0, 8).map((item: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-brand-teal mr-2">•</span>
                        <span>{getItemText(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <pre className="text-xs bg-brand-primary/30 p-2 rounded overflow-auto max-h-40">{JSON.stringify(value, null, 2)}</pre>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProblemValidationDisplay;
