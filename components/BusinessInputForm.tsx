
import React, { useState, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../locales';
import type { AnyTool } from '../types';

const PROMPT_HELPERS: { labelKey: TranslationKey; templateKey: TranslationKey }[] = [
    { labelKey: 'promptHelperAudience', templateKey: 'promptTemplateAudience' },
    { labelKey: 'promptHelperProblem', templateKey: 'promptTemplateProblem' },
    { labelKey: 'promptHelperSolution', templateKey: 'promptTemplateSolution' },
    { labelKey: 'promptHelperRevenue', templateKey: 'promptTemplateRevenue' },
];

interface BusinessInputFormProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (image?: string) => void; 
  isLoading: boolean;
  activeTool: AnyTool;
  extraFields?: React.ReactNode;
}

const BusinessInputForm: React.FC<BusinessInputFormProps> = ({ value, onChange, onSubmit, isLoading, activeTool, extraFields }) => {
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = value.length;
  
  // Prompt Quality Logic
  const quality = useMemo(() => {
      if (charCount === 0) return { label: 'inputQualityEmpty', color: 'bg-gray-600', width: '0%' };
      if (charCount < 50) return { label: 'inputQualityWeak', color: 'bg-red-500', width: '25%' };
      if (charCount < 150) return { label: 'inputQualityFair', color: 'bg-yellow-500', width: '60%' };
      if (charCount < 300) return { label: 'inputQualityGood', color: 'bg-green-400', width: '85%' };
      return { label: 'inputQualityExcellent', color: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]', width: '100%' };
  }, [charCount]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleSubmit();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setImageFile(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = () => {
      onSubmit(imageFile || undefined);
  };
  
  const clearImage = () => {
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleClearInput = () => {
      const event = {
          target: { value: '' }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(event);
      if (textareaRef.current) textareaRef.current.focus();
  }

  const addPromptTemplate = (templateKey: TranslationKey) => {
      const template = t(templateKey);
      const newValue = value ? `${value}\n\n${template}` : template;
      
      // Create a synthetic event to trigger the parent's onChange
      const event = {
          target: { value: newValue }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      onChange(event);
      
      // Focus textarea
      setTimeout(() => {
          if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
          }
      }, 50);
  };

  let labelKey: TranslationKey = 'inputLabelSwot';
  let placeholderKey: TranslationKey = 'inputPlaceholderSwot';

  switch(activeTool) {
    case 'swot': labelKey = 'inputLabelSwot'; placeholderKey = 'inputPlaceholderSwot'; break;
    case 'pestel': labelKey = 'inputLabelPestel'; placeholderKey = 'inputPlaceholderPestel'; break;
    case 'overview': labelKey = 'inputLabelMarket'; placeholderKey = 'inputPlaceholderMarket'; break;
    case 'research': labelKey = 'inputLabelMarketResearch'; placeholderKey = 'inputPlaceholderMarketResearch'; break;
    case 'roadmap': labelKey = 'inputLabelRoadmap'; placeholderKey = 'inputPlaceholderRoadmap'; break;
    case 'leanCanvas': labelKey = 'inputLabelLeanCanvas'; placeholderKey = 'inputPlaceholderLeanCanvas'; break;
    case 'okrWorkflow': labelKey = 'inputLabelOkrWorkflow'; placeholderKey = 'inputPlaceholderOkrWorkflow'; break;
    case 'ideaValidation': labelKey = 'inputLabelIdeaValidation'; placeholderKey = 'inputPlaceholderIdeaValidation'; break;
    case 'problemValidation': labelKey = 'inputLabelProblemValidation'; placeholderKey = 'inputPlaceholderProblemValidation'; break;
    case 'competitorAnalysis': labelKey = 'inputLabelCompetitorAnalysis'; placeholderKey = 'inputPlaceholderCompetitorAnalysis'; break;
    case 'customerValidation': labelKey = 'inputLabelCustomerValidation'; placeholderKey = 'inputPlaceholderCustomerValidation'; break;
    case 'riskFeasibility': labelKey = 'inputLabelRiskFeasibility'; placeholderKey = 'inputPlaceholderRiskFeasibility'; break;
    case 'validationTracker': labelKey = 'inputLabelValidationTracker'; placeholderKey = 'inputPlaceholderValidationTracker'; break;
    case 'brandIdentity': labelKey = 'inputLabelBrandIdentity'; placeholderKey = 'inputPlaceholderBrandIdentity'; break;
    case 'budgetGenerator': labelKey = 'inputLabelBudgetGenerator'; placeholderKey = 'inputPlaceholderBudgetGenerator'; break;
    case 'financialForecast': labelKey = 'inputLabelFinancialForecast'; placeholderKey = 'inputPlaceholderFinancialForecast'; break;
    case 'cashFlowForecast': labelKey = 'inputLabelCashFlowForecast'; placeholderKey = 'inputPlaceholderCashFlowForecast'; break;
    case 'kpiDashboards': labelKey = 'inputLabelKpiDashboards'; placeholderKey = 'inputPlaceholderKpiDashboards'; break;
    case 'milestones': labelKey = 'inputLabelMilestones'; placeholderKey = 'inputPlaceholderMilestones'; break;
    case 'expansionStrategy': labelKey = 'inputLabelExpansionStrategy'; placeholderKey = 'inputPlaceholderExpansionStrategy'; break;
    case 'pitchDeckGenerator': labelKey = 'inputLabelPitchDeckGenerator'; placeholderKey = 'inputPlaceholderPitchDeckGenerator'; break;
    case 'investorDatabase': labelKey = 'inputLabelInvestorDatabase'; placeholderKey = 'inputPlaceholderInvestorDatabase'; break;
    case 'fundraisingRoadmap': labelKey = 'inputLabelFundraisingRoadmap'; placeholderKey = 'inputPlaceholderFundraisingRoadmap'; break;
    case 'systemDesign': labelKey = 'inputLabelArchitecture'; placeholderKey = 'inputPlaceholderArchitecture'; break;
    case 'connectors': labelKey = 'inputLabelIntegrations'; placeholderKey = 'inputPlaceholderIntegrations'; break;
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-2">
          <label htmlFor="business-description" className="block text-lg font-semibold text-brand-light">
            {t(labelKey)}
          </label>
          {value && (
              <button onClick={handleClearInput} className="text-xs text-brand-light hover:text-red-400 underline transition-colors">
                  {t('inputClear')}
              </button>
          )}
      </div>

      <div className="relative group">
          <textarea
            id="business-description-input"
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={t(placeholderKey)}
            className="w-full h-40 p-4 bg-brand-primary/50 border-2 border-brand-accent rounded-xl focus:ring-2 focus:ring-brand-teal focus:outline-none transition-all duration-300 resize-y text-brand-text placeholder-brand-accent/60 leading-relaxed font-sans pb-10"
            disabled={isLoading}
          />
          
          {/* Helper Chips */}
          <div className="absolute bottom-3 right-3 flex gap-2 overflow-x-auto max-w-[90%] justify-end opacity-80 group-hover:opacity-100 transition-opacity">
              {PROMPT_HELPERS.map((helper) => (
                  <button
                    key={helper.labelKey}
                    onClick={() => addPromptTemplate(helper.templateKey)}
                    className="px-2 py-1 text-[10px] font-medium bg-brand-secondary/80 hover:bg-brand-accent text-brand-light hover:text-white rounded-md border border-brand-accent/30 transition-colors shadow-sm whitespace-nowrap backdrop-blur-sm"
                    title="Add template"
                    disabled={isLoading}
                  >
                      + {t(helper.labelKey)}
                  </button>
              ))}
          </div>
      </div>
      
      {/* Quality & Char Counter Bar */}
      <div className="mt-1 flex items-center gap-2">
          <div className="flex-grow h-1.5 bg-brand-secondary rounded-full overflow-hidden">
              <div 
                  className={`h-full transition-all duration-500 ease-out ${quality.color}`} 
                  style={{ width: quality.width }}
              ></div>
          </div>
          <span className={`text-[10px] font-bold whitespace-nowrap transition-colors ${quality.label === 'inputQualityWeak' ? 'text-red-400' : quality.label === 'inputQualityExcellent' ? 'text-green-400' : 'text-brand-light'}`}>
              {t(quality.label as TranslationKey)}
          </span>
          <span className="text-[10px] text-brand-light font-mono w-12 text-right">{charCount}</span>
      </div>
      
      {/* Multi-Modal Image Input for Competitor Analysis */}
      {activeTool === 'competitorAnalysis' && (
          <div className="mt-4 p-4 bg-brand-secondary/30 rounded-lg border border-dashed border-brand-accent/50">
              <label className="block text-sm font-semibold text-brand-light mb-2">Upload Competitor Screenshot (Optional)</label>
              <div className="flex items-center gap-4">
                  <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      ref={fileInputRef}
                      className="block w-full text-sm text-brand-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-teal/20 file:text-brand-teal hover:file:bg-brand-teal/30 cursor-pointer"
                      disabled={isLoading}
                  />
                  {imageFile && (
                      <div className="relative h-10 w-10 flex-shrink-0 group">
                          <img src={imageFile} alt="Preview" className="h-full w-full object-cover rounded-md" />
                          <button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                          </button>
                      </div>
                  )}
              </div>
              <p className="text-xs text-brand-light/50 mt-1">Gemini Vision will analyze the visual features of the uploaded image.</p>
          </div>
      )}

      {extraFields}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
         <p className="text-sm text-brand-light text-center sm:text-left order-2 sm:order-1">
          {t('inputHintPrefix')}{' '}
          <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl</kbd> + <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Enter</kbd>
          {' '}{t('inputHintSuffix')}
        </p>
        <button
          id="generate-button"
          onClick={handleSubmit}
          disabled={isLoading || !value}
          className="w-full sm:w-auto px-8 py-3 bg-brand-teal hover:bg-teal-500 disabled:bg-brand-accent disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 order-1 sm:order-2 flex items-center justify-center"
        >
          {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('buttonGenerating')}
              </>
          ) : t('buttonGenerate')}
        </button>
      </div>
    </div>
  );
};

export default BusinessInputForm;
