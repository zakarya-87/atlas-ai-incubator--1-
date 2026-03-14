import React from 'react';

interface DataStructureDebuggerProps {
  data: any;
  label?: string;
}

const DataStructureDebugger: React.FC<DataStructureDebuggerProps> = ({ data, label = 'Data' }) => {
  console.log(`[DataStructureDebugger] ${label}:`, {
    raw: data,
    type: typeof data,
    isNull: data === null,
    isUndefined: data === undefined,
    isArray: Array.isArray(data),
    keys: data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : [],
    firstLevelKeys: data && typeof data === 'object' ? Object.keys(data).slice(0, 10) : [],
  });

  if (!data) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <h3 className="font-bold text-yellow-400 mb-2">{label} - No Data</h3>
        <p className="text-sm text-brand-text/70">Data is null or undefined</p>
      </div>
    );
  }

  const renderValue = (value: any, depth: number = 0): React.ReactNode => {
    if (depth > 3) return <span className="text-brand-text/50 text-xs">...</span>;
    
    if (value === null) return <span className="text-red-400">null</span>;
    if (value === undefined) return <span className="text-red-400">undefined</span>;
    if (typeof value === 'string') return <span className="text-green-400">"{value.substring(0, 100)}"</span>;
    if (typeof value === 'number') return <span className="text-blue-400">{value}</span>;
    if (typeof value === 'boolean') return <span className="text-purple-400">{value.toString()}</span>;
    
    if (Array.isArray(value)) {
      return (
        <details className="ml-4">
          <summary className="cursor-pointer text-brand-text/70">
            Array[{value.length}]
          </summary>
          <div className="ml-4 space-y-1">
            {value.slice(0, 5).map((item, idx) => (
              <div key={idx} className="text-sm">
                [{idx}]: {renderValue(item, depth + 1)}
              </div>
            ))}
            {value.length > 5 && <div className="text-xs text-brand-text/50">... {value.length - 5} more</div>}
          </div>
        </details>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      return (
        <details className="ml-4">
          <summary className="cursor-pointer text-brand-text/70">
            Object {keys.length} keys: [{keys.slice(0, 3).join(', ')}{keys.length > 3 ? '...' : ''}]
          </summary>
          <div className="ml-4 space-y-1">
            {keys.slice(0, 10).map((key) => (
              <div key={key} className="text-sm">
                <span className="text-cyan-400">{key}</span>: {renderValue(value[key], depth + 1)}
              </div>
            ))}
            {keys.length > 10 && <div className="text-xs text-brand-text/50">... {keys.length - 10} more keys</div>}
          </div>
        </details>
      );
    }
    
    return <span className="text-brand-text/50">{String(value)}</span>;
  };

  return (
    <div className="p-4 bg-brand-secondary/30 border border-brand-accent/20 rounded-lg font-mono text-sm">
      <h3 className="font-bold text-brand-teal mb-3">{label} Structure</h3>
      <div className="space-y-2">
        <div>
          <span className="text-brand-text/70">Type:</span> <span className="text-blue-400">{typeof data}</span>
        </div>
        <div>
          <span className="text-brand-text/70">Is Array:</span> <span className="text-blue-400">{Array.isArray(data).toString()}</span>
        </div>
        {typeof data === 'object' && !Array.isArray(data) && (
          <div>
            <span className="text-brand-text/70">Keys ({Object.keys(data).length}):</span>
            <div className="mt-2">
              {renderValue(data)}
            </div>
          </div>
        )}
        {Array.isArray(data) && (
          <div>
            <span className="text-brand-text/70">Length:</span> <span className="text-blue-400">{data.length}</span>
            <div className="mt-2">
              {renderValue(data)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataStructureDebugger;
