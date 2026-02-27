import React from 'react';
import type { AnyTool } from '../types';

interface SkeletonBlockProps {
  className?: string;
  rows?: number;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = '',
  rows = 3,
}) => (
  <div
    className={`bg-brand-secondary/20 rounded-lg p-4 animate-pulse border border-white/5 ${className}`}
  >
    <div className="h-5 w-1/3 bg-brand-light/10 rounded mb-4"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={`h-3 bg-brand-light/5 rounded mb-2 ${i === rows - 1 ? 'w-3/4' : 'w-full'}`}
      ></div>
    ))}
  </div>
);

const QuadrantSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SkeletonBlock className="h-48 bg-green-500/5 border-green-500/10" />
    <SkeletonBlock className="h-48 bg-yellow-500/5 border-yellow-500/10" />
    <SkeletonBlock className="h-48 bg-blue-500/5 border-blue-500/10" />
    <SkeletonBlock className="h-48 bg-red-500/5 border-red-500/10" />
  </div>
);

const ColumnsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SkeletonBlock className="h-64" />
    <SkeletonBlock className="h-64" />
    <SkeletonBlock className="h-64" />
  </div>
);

const SimpleCanvasSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
    <SkeletonBlock className="h-64 lg:row-span-2 bg-red-500/5" />
    <div className="flex flex-col gap-3 h-64 lg:h-auto lg:row-span-2">
      <SkeletonBlock className="flex-1 bg-green-500/5" />
      <SkeletonBlock className="flex-1 bg-blue-500/5" />
    </div>
    <SkeletonBlock className="h-64 lg:row-span-2 bg-teal-500/5" />
    <div className="flex flex-col gap-3 h-64 lg:h-auto lg:row-span-2">
      <SkeletonBlock className="flex-1 bg-yellow-500/5" />
      <SkeletonBlock className="flex-1 bg-purple-500/5" />
    </div>
    <SkeletonBlock className="h-64 lg:row-span-2 bg-pink-500/5" />
    <SkeletonBlock className="lg:col-span-3 h-32 bg-orange-500/5" />
    <SkeletonBlock className="lg:col-span-2 h-32 bg-lime-500/5" />
  </div>
);

const TableSkeleton = () => (
  <div className="w-full bg-brand-secondary/20 rounded-lg p-4 border border-white/5">
    <div className="flex space-x-4 mb-6 border-b border-white/10 pb-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-6 w-full bg-brand-light/10 rounded animate-pulse"
        ></div>
      ))}
    </div>
    {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
      <div key={row} className="flex space-x-4 mb-4">
        {[1, 2, 3, 4, 5, 6].map((col) => (
          <div
            key={col}
            className="h-4 w-full bg-brand-light/5 rounded animate-pulse"
          ></div>
        ))}
      </div>
    ))}
  </div>
);

const ListSkeleton = () => (
  <div className="space-y-4">
    <SkeletonBlock className="h-32" />
    <SkeletonBlock className="h-32" />
    <SkeletonBlock className="h-32" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <SkeletonBlock className="h-24" rows={1} />
      <SkeletonBlock className="h-24" rows={1} />
      <SkeletonBlock className="h-24" rows={1} />
      <SkeletonBlock className="h-24" rows={1} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkeletonBlock className="h-64" />
      <SkeletonBlock className="h-64" />
    </div>
  </div>
);

const PitchDeckSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <SkeletonBlock key={i} className="h-64" rows={5} />
    ))}
  </div>
);

const AnalysisSkeleton: React.FC<{ tool: AnyTool }> = ({ tool }) => {
  switch (tool) {
    case 'swot':
    case 'pestel':
      return <QuadrantSkeleton />;

    case 'leanCanvas':
      return <SimpleCanvasSkeleton />;

    case 'competitorAnalysis':
      return <TableSkeleton />;

    case 'budgetGenerator':
    case 'financialForecast':
    case 'cashFlowForecast':
      return <TableSkeleton />;

    case 'kpiDashboards':
    case 'validationTracker':
      return <DashboardSkeleton />;

    case 'pitchDeckGenerator':
    case 'investorDatabase':
      return <PitchDeckSkeleton />;

    case 'overview':
    case 'problemValidation':
    case 'research':
    case 'expansionStrategy':
      return <ColumnsSkeleton />;

    case 'roadmap':
    case 'milestones':
    case 'fundraisingRoadmap':
    case 'okrWorkflow':
    case 'ideaValidation':
    case 'customerValidation':
    case 'riskFeasibility':
      return <ListSkeleton />;

    default:
      return <ListSkeleton />;
  }
};

export default AnalysisSkeleton;
