import React from 'react';
import { MigrationWorkspace } from './components/MigrationWorkspace';
import { Cpu, Terminal } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* App Header */}
      <header className="h-14 bg-[#0d1117] border-b border-slate-800 flex items-center px-4 flex-shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Cpu size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">CodeMorph</h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Legacy AI Agent</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-400">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span>System Online</span>
           </div>
           <div className="h-4 w-[1px] bg-slate-700"></div>
           <div className="flex items-center gap-2">
              <Terminal size={14} />
              <span>v1.0.0</span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <MigrationWorkspace />
      </main>
    </div>
  );
};

export default App;
