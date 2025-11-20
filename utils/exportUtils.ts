
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { SwotData, PestelData, MarketAnalysisData, MarketResearchData, RoadmapData, LeanCanvasData, OkrWorkflowData, BudgetGeneratorData, FinancialForecastData, CashFlowForecastData, KpiDashboardData, MilestonesData, ExpansionStrategyData, PitchDeckData, InvestorMatchingData, FundraisingRoadmapData } from '../types';

// Define union types for better type safety
type AnalysisData = SwotData | PestelData | MarketAnalysisData | MarketResearchData | RoadmapData | LeanCanvasData | OkrWorkflowData | BudgetGeneratorData | FinancialForecastData | CashFlowForecastData | KpiDashboardData | MilestonesData | ExpansionStrategyData | PitchDeckData | InvestorMatchingData | FundraisingRoadmapData;
export type AnalysisType = 'swot' | 'pestel' | 'market' | 'marketResearch' | 'roadmap' | 'leanCanvas' | 'okrWorkflow' | 'budgetGenerator' | 'financialForecast' | 'cashFlowForecast' | 'kpiDashboard' | 'milestones' | 'expansionStrategy' | 'pitchDeck' | 'investorDatabase' | 'fundraisingRoadmap';

/**
 * Exports the content of a DOM element to a PDF file.
 */
export const exportToPdf = async (
  targetElementId: string,
  fileName: string,
  title: string,
  businessDescription: string
) => {
  const element = document.getElementById(targetElementId);
  if (!element) {
    console.error(`Element with id "${targetElementId}" not found for PDF export.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0D1B2A', // Match app's primary background
      scale: 2, // Increase resolution for better quality
      useCORS: true,
      ignoreElements: (el) => el.classList.contains('no-export'), // Ignore the export button itself
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;

    // Add a header
    pdf.setFontSize(20);
    pdf.setTextColor('#E0E1DD'); // Match brand text color
    pdf.text(title, pdfWidth / 2, margin, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor('#778DA9'); // Match brand light color
    pdf.text(businessDescription, pdfWidth / 2, margin + 20, { align: 'center', maxWidth: pdfWidth - margin * 2 });

    // Add the captured image
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * (pdfWidth - margin * 2)) / imgProps.width;
    const contentHeight = pdfHeight - (margin * 2) - 40; // available height for image
    
    let y = margin + 40;
    if (imgHeight > contentHeight) {
       pdf.addImage(imgData, 'PNG', margin, y, pdfWidth - margin * 2, contentHeight, undefined, 'FAST');
       pdf.addPage();
    } else {
       pdf.addImage(imgData, 'PNG', margin, y, pdfWidth - margin * 2, imgHeight, undefined, 'FAST');
    }

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  }
};

/**
 * Converts the structured analysis data into a Markdown string.
 */
const convertToMarkdown = (data: AnalysisData, type: AnalysisType, businessDescription: string): string => {
    let md = `# ${type.toUpperCase().replace(/([A-Z])/g, ' $1').trim()} Report\n\n`;
    md += `**Context:** ${businessDescription}\n\n`;
    md += `---\n\n`;

    const addSection = (title: string, items: any[]) => {
        md += `### ${title}\n`;
        if (!items || items.length === 0) {
            md += `*No data available.*\n\n`;
            return;
        }
        items.forEach(item => {
            if (item.point && item.explanation) {
                md += `- **${item.point}**: ${item.explanation}\n`;
            } else if (item.name && item.value) { // KPI
                 md += `- **${item.name}**: ${item.value} (Benchmark: ${item.benchmark})\n  > Insight: ${item.insight}\n`;
            } else {
                md += `- ${JSON.stringify(item)}\n`;
            }
        });
        md += `\n`;
    };

    // Generic iterator for common structures
    Object.entries(data).forEach(([key, value]) => {
        if (key === '_sources' || key === 'id') return;
        
        const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        if (Array.isArray(value)) {
             addSection(title, value);
        } else if (typeof value === 'object' && value !== null) {
             md += `### ${title}\n`;
             Object.entries(value).forEach(([subKey, subValue]) => {
                 if (typeof subValue === 'object' && subValue !== null && 'value' in subValue) {
                      // Market Size case
                      const ms = subValue as any;
                      md += `- **${subKey.toUpperCase()}**: ${ms.value} - ${ms.explanation}\n`;
                 } else {
                      md += `- **${subKey}**: ${JSON.stringify(subValue)}\n`;
                 }
             });
             md += `\n`;
        } else {
            md += `### ${title}\n${value}\n\n`;
        }
    });

    // Sources
    if ('_sources' in data && (data as any)._sources) {
        md += `## Verified Sources\n`;
        (data as any)._sources.forEach((s: any) => {
            md += `- [${s.title}](${s.url})\n`;
        });
    }

    return md;
};

export const exportToMarkdown = (data: AnalysisData, fileName: string, type: AnalysisType, description: string) => {
    const mdString = convertToMarkdown(data, type, description);
    const blob = new Blob([mdString], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Converts the structured analysis data into a CSV string.
 */
const convertToCsv = (data: AnalysisData, type: AnalysisType): string => {
    let csvContent = '';
    const headers: Record<AnalysisType, string> = {
        swot: 'Category,Point,Explanation\n',
        pestel: 'Category,Point,Explanation\n',
        market: 'Section,Point,Explanation\n',
        marketResearch: 'Section,Point,Explanation\n',
        roadmap: 'Phase,Milestone Point,Milestone Explanation\n',
        leanCanvas: 'Section,Point,Explanation\n',
        okrWorkflow: 'Strategic Goal,Objective,Key Result,Tracking Method\n',
        budgetGenerator: 'Scenario,Category,Item Name,Item Type,Amount (12-Month Total)\n',
        financialForecast: 'Year,Revenue,COGS,Gross Profit,OPEX,Net Profit\n',
        cashFlowForecast: 'Month,Inflows,Outflows,Net Cash Flow,Ending Balance\n',
        kpiDashboard: 'KPI,Value,Benchmark,Insight\n',
        milestones: 'Type,Quarter/Severity,Title,Description/Recommendation\n',
        expansionStrategy: 'Section,Point/Strategy,Explanation/Justification\n',
        pitchDeck: 'Slide Number,Slide Title,Point,Explanation,Visual Suggestion Type,Visual Suggestion Description\n',
        investorDatabase: 'Investor Name,Type,Location,Stage,Ticket Size,Sector Focus,Alignment Score,Reasoning,Outreach Subject,Outreach Body\n',
        fundraisingRoadmap: 'Section,Title,Details,Status/Severity\n',
    };
    csvContent += headers[type];
    
    const escapeCsvCell = (cell: string | number | undefined) => `"${(cell || '').toString().replace(/"/g, '""')}"`;

    if (type === 'swot' && 'strengths' in data) {
        Object.entries(data).forEach(([category, points]) => {
            (points || []).forEach(p => {
                csvContent += `${escapeCsvCell(category)},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)}\n`;
            });
        });
    } else if (type === 'pestel' && 'political' in data) {
         Object.entries(data).forEach(([category, points]) => {
            (points || []).forEach(p => {
                csvContent += `${escapeCsvCell(category)},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)}\n`;
            });
        });
    } else if (type === 'market' && 'targetAudience' in data) {
         Object.entries(data).forEach(([section, points]) => {
            (points || []).forEach(p => {
                csvContent += `${escapeCsvCell(section)},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)}\n`;
            });
        });
    } else if (type === 'marketResearch' && 'marketDrivers' in data) {
        Object.entries(data).forEach(([section, points]) => {
           (points || []).forEach(p => {
               csvContent += `${escapeCsvCell(section)},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)}\n`;
           });
       });
   } else if (type === 'roadmap' && 'phases' in data) {
        (data.phases || []).forEach(phase => {
            (phase.milestones || []).forEach(milestone => {
                csvContent += `${escapeCsvCell(phase.phaseName)},${escapeCsvCell(milestone.point)},${escapeCsvCell(milestone.explanation)}\n`;
            });
        });
    } else if (type === 'leanCanvas' && 'problem' in data) {
        Object.entries(data).forEach(([section, points]) => {
            (points || []).forEach(p => {
                csvContent += `${escapeCsvCell(section)},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)}\n`;
            });
        });
    } else if (type === 'okrWorkflow' && 'strategicGoals' in data) {
        (data.strategicGoals || []).forEach(goal => {
            (goal.objectives || []).forEach(objective => {
                (objective.keyResults || []).forEach(kr => {
                    csvContent += `${escapeCsvCell(goal.goal)},${escapeCsvCell(objective.objective)},${escapeCsvCell(kr.description)},${escapeCsvCell(kr.trackingMethod)}\n`;
                });
            });
        });
    } else if (type === 'budgetGenerator' && 'scenarios' in data) {
        (data.scenarios || []).forEach(scenario => {
            (scenario.breakdown || []).forEach(category => {
                (category.items || []).forEach(item => {
                    csvContent += `${escapeCsvCell(scenario.scenarioName)},${escapeCsvCell(category.categoryName)},${escapeCsvCell(item.name)},${escapeCsvCell(item.type)},${escapeCsvCell(item.amount)}\n`;
                });
            });
        });
        csvContent += '\nRecommendations\nPoint,Explanation\n';
        (data.recommendations || []).forEach(rec => {
            csvContent += `${escapeCsvCell(rec.point)},${escapeCsvCell(rec.explanation)}\n`;
        });
    } else if (type === 'financialForecast' && 'forecast' in data) {
        (data.forecast || []).forEach(year => {
            csvContent += `${escapeCsvCell(year.year)},${escapeCsvCell(year.revenue)},${escapeCsvCell(year.cogs)},${escapeCsvCell(year.grossProfit)},${escapeCsvCell(year.opex)},${escapeCsvCell(year.netProfit)}\n`;
        });
        csvContent += '\nAssumptions\nPoint,Explanation\n';
        (data.assumptions || []).forEach(assump => {
            csvContent += `${escapeCsvCell(assump.point)},${escapeCsvCell(assump.explanation)}\n`;
        });
    } else if (type === 'cashFlowForecast' && 'monthlyForecasts' in data) {
        (data.monthlyForecasts || []).forEach(month => {
            csvContent += `${escapeCsvCell(month.month)},${escapeCsvCell(month.inflows)},${escapeCsvCell(month.outflows)},${escapeCsvCell(month.netCashFlow)},${escapeCsvCell(month.endingBalance)}\n`;
        });
        csvContent += '\nInsights\nPoint,Explanation\n';
        (data.insights || []).forEach(insight => {
            csvContent += `${escapeCsvCell(insight.point)},${escapeCsvCell(insight.explanation)}\n`;
        });
    } else if (type === 'kpiDashboard' && 'kpis' in data) {
        csvContent += `Executive Summary,"${escapeCsvCell(data.executiveSummary)}"\n\n`;
        (data.kpis || []).forEach(kpi => {
            csvContent += `${escapeCsvCell(kpi.name)},${escapeCsvCell(kpi.value)},${escapeCsvCell(kpi.benchmark)},${escapeCsvCell(kpi.insight)}\n`;
        });
    } else if (type === 'milestones' && 'milestones' in data) {
        csvContent += 'Milestones\n';
        (data.milestones || []).forEach(m => {
            csvContent += `${escapeCsvCell('Milestone')},${escapeCsvCell(`Q${m.quarter}`)},${escapeCsvCell(m.point)},${escapeCsvCell(m.explanation)}\n`;
        });
        csvContent += '\nSmart Alerts\n';
        (data.smartAlerts || []).forEach(a => {
            csvContent += `${escapeCsvCell('Smart Alert')},${escapeCsvCell(a.severity)},${escapeCsvCell(a.alert)},${escapeCsvCell(a.recommendation)}\n`;
        });
    } else if (type === 'expansionStrategy' && 'recommendedStrategy' in data) {
        const d = data as ExpansionStrategyData;
        csvContent += `${escapeCsvCell('Recommended Strategy')},${escapeCsvCell(d.recommendedStrategy.strategyName)},${escapeCsvCell(d.recommendedStrategy.justification)}\n`;
        
        (d.marketExpansionSuggestions || []).forEach(p => {
            csvContent += `${escapeCsvCell('Market Expansion Suggestions')},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)}\n`;
        });
        (d.predictiveModelingInsights || []).forEach(p => {
            csvContent += `${escapeCsvCell('Predictive Modeling Insights')},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)}\n`;
        });
        (d.partnershipRecommendations || []).forEach(p => {
            csvContent += `${escapeCsvCell('Partnership Recommendations')},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)}\n`;
        });
    } else if (type === 'pitchDeck' && 'slides' in data) {
        (data.slides || []).forEach((slide, index) => {
            (slide.content || []).forEach(p => {
                csvContent += `${escapeCsvCell(index + 1)},${escapeCsvCell(slide.title)},${escapeCsvCell(p.point)},${escapeCsvCell(p.explanation)},${escapeCsvCell(slide.visualSuggestion?.type)},${escapeCsvCell(slide.visualSuggestion?.description)}\n`;
            });
        });
    } else if (type === 'investorDatabase' && 'investors' in data) {
        (data.investors || []).forEach(inv => {
            csvContent += `${escapeCsvCell(inv.name)},${escapeCsvCell(inv.type)},${escapeCsvCell(inv.location)},${escapeCsvCell(inv.investmentStage)},${escapeCsvCell(inv.ticketSize)},${escapeCsvCell(inv.sectorFocus.join(', '))},${escapeCsvCell(inv.alignmentScore)},${escapeCsvCell(inv.reasoning)},${escapeCsvCell(inv.outreachSuggestion.subject)},${escapeCsvCell(inv.outreachSuggestion.body)}\n`;
        });
    } else if (type === 'fundraisingRoadmap' && 'alternativeFunding' in data) {
        (data.phases || []).forEach(phase => {
            (phase.tasks || []).forEach(task => {
                csvContent += `${escapeCsvCell(phase.phaseName)},${escapeCsvCell(task.task)},${escapeCsvCell(task.details)},${escapeCsvCell(task.status)}\n`;
            });
        });
        csvContent += '\nSmart Alerts\nSection,Title,Details,Status/Severity\n';
        (data.smartAlerts || []).forEach(alert => {
            csvContent += `Smart Alert,${escapeCsvCell(alert.alert)},${escapeCsvCell(alert.recommendation)},${escapeCsvCell(alert.severity)}\n`;
        });
        csvContent += '\nAlternative Funding\nSection,Title,Details,Status/Severity\n';
        (data.alternativeFunding || []).forEach(option => {
            csvContent += `Alternative Funding,${escapeCsvCell(option.option)},${escapeCsvCell(option.description)},\n`;
        });
    }

    return csvContent;
}

/**
 * Triggers the download of a CSV file from the analysis data.
 */
export const exportToCsv = (data: AnalysisData, fileName: string, type: AnalysisType) => {
  const csvString = convertToCsv(data, type);
  const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
