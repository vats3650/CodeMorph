import React from 'react';
import { SecurityIssue } from '../types';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface TabsPanelProps {
  activeTab: 'tests' | 'security' | 'docs';
  setActiveTab: (tab: 'tests' | 'security' | 'docs') => void;
  unitTests: string;
  documentation: string;
  securityReport: SecurityIssue[];
}

export const TabsPanel: React.FC<TabsPanelProps> = ({
  activeTab,
  setActiveTab,
  unitTests,
  documentation,
  securityReport
}) => {

  const renderContent = () => {
    switch (activeTab) {
      case 'tests':
        return (
          <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap p-4 bg-[#1e1e1e] rounded h-full overflow-y-auto border border-slate-700">
            {unitTests || "// No unit tests generated yet."}
          </div>
        );
      case 'docs':
        return (
          <div className="prose prose-invert max-w-none p-4 bg-[#1e1e1e] rounded h-full overflow-y-auto border border-slate-700">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">
                {documentation || "No documentation generated yet."}
            </pre>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-3 p-4 bg-[#1e1e1e] rounded h-full overflow-y-auto border border-slate-700">
            {securityReport.length === 0 ? (
              <p className="text-gray-500 italic">No security issues detected (or analysis pending).</p>
            ) : (
              securityReport.map((issue, idx) => (
                <div key={idx} className={`p-3 rounded border-l-4 ${
                  issue.severity === 'HIGH' ? 'border-red-500 bg-red-900/10' :
                  issue.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-900/10' :
                  'border-blue-500 bg-blue-900/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                       issue.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                       issue.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                       'bg-blue-500/20 text-blue-400'
                    }`}>{issue.severity}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-200 mb-1">{issue.description}</p>
                  <p className="text-xs text-gray-400"><span className="font-semibold text-gray-500">Fix:</span> {issue.remediation}</p>
                </div>
              ))
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-800">
      <div className="flex items-center gap-1 bg-slate-950 px-2 py-2">
        <button
          onClick={() => setActiveTab('tests')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'tests' ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <CheckCircle2 size={16} />
          Unit Tests
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'security' ? 'bg-[#1e1e1e] text-red-400 border-t-2 border-red-500' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldAlert size={16} />
          Security Audit
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'docs' ? 'bg-[#1e1e1e] text-emerald-400 border-t-2 border-emerald-500' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText size={16} />
          Documentation
        </button>
      </div>
      <div className="flex-1 p-2 bg-slate-950">
        {renderContent()}
      </div>
    </div>
  );
};
