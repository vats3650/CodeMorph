import React, { useState, useCallback, useEffect } from 'react';
import { CodeLanguage, ConversionResult, MigrationConfig, ProjectFile } from '../types';
import { DEFAULT_MIGRATION_CONFIG, SAMPLE_LEGACY_CODE } from '../constants';
import { convertLegacyCode } from '../services/geminiService';
import { processZipFile, fetchGitHubRepoTree, fetchFileContent } from '../services/fileService';
import { CodeEditor } from './CodeEditor';
import { TabsPanel } from './TabsPanel';
import { FileExplorer } from './FileExplorer';
import { StackSelector } from './StackSelector';
import { ArrowRight, Play, Loader2, Upload, AlertTriangle, Github, Settings2, X } from 'lucide-react';

export const MigrationWorkspace: React.FC = () => {
  const [config, setConfig] = useState<MigrationConfig>(DEFAULT_MIGRATION_CONFIG);
  
  // File System State
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [gitUrl, setGitUrl] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // UI State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'security' | 'docs'>('tests');

  // Initialization
  useEffect(() => {
     // Load sample code if empty
     if (projectFiles.length === 0) {
         setProjectFiles([{
             path: 'SecurityConfig.java',
             content: SAMPLE_LEGACY_CODE,
             type: 'file',
             status: 'pending',
             language: CodeLanguage.JAVA,
             modernContent: null,
             unitTests: null,
             documentation: null,
             securityIssues: []
         }]);
         setActiveFilePath('SecurityConfig.java');
     }
  }, []);

  // Derived state for the active file
  const activeFile = projectFiles.find(f => f.path === activeFilePath) || null;

  // ---------------------------------------------------------------------------
  // Processing Logic
  // ---------------------------------------------------------------------------

  const convertSingleFile = async (file: ProjectFile): Promise<ProjectFile> => {
      try {
          if (!file.content) {
               // Should have been loaded by now, but just in case
               if (file.url) {
                   file.content = await fetchFileContent(file.url);
               } else {
                   throw new Error("No content available");
               }
          }

          const result = await convertLegacyCode(file.content, config, file.path);
          
          return {
              ...file,
              status: 'completed',
              modernContent: result.modernCode,
              unitTests: result.unitTests,
              documentation: result.documentation,
              securityIssues: result.securityReport
          };
      } catch (e: any) {
          console.error(e);
          return {
              ...file,
              status: 'failed',
              error: e.message
          };
      }
  };

  const handleBatchMigration = async () => {
      if (projectFiles.length === 0) return;
      
      setIsBatchProcessing(true);
      setError(null);

      // Process pending files
      // We process sequentially to avoid rate limits in this demo
      const filesToProcess = projectFiles.filter(f => f.status === 'pending' || f.status === 'failed');

      for (const file of filesToProcess) {
          // Update status to processing
          setProjectFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'processing' } : f));
          
          // Ensure content is loaded
          let currentFile = file;
          if (!currentFile.content && currentFile.url) {
              try {
                const content = await fetchFileContent(currentFile.url);
                currentFile = { ...currentFile, content };
              } catch (e) {
                 setProjectFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'failed', error: 'Could not fetch content' } : f));
                 continue;
              }
          }

          // Skip if still no content (e.g. binary or empty)
          if (!currentFile.content) {
               setProjectFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'failed', error: 'Empty content' } : f));
               continue;
          }

          // Convert
          const updatedFile = await convertSingleFile(currentFile);
          
          // Update State
          setProjectFiles(prev => prev.map(f => f.path === file.path ? updatedFile : f));
      }

      setIsBatchProcessing(false);
  };

  // ---------------------------------------------------------------------------
  // File & Input Handlers
  // ---------------------------------------------------------------------------

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoadingFiles(true);

    try {
        if (file.name.endsWith('.zip')) {
            const files = await processZipFile(file);
            setProjectFiles(files);
            if (files.length > 0) setActiveFilePath(files[0].path);
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const content = event.target.result as string;
                    setProjectFiles([{ 
                        path: file.name, 
                        content: content, 
                        type: 'file',
                        status: 'pending',
                        language: CodeLanguage.JAVA, // Simplified default
                        modernContent: null,
                        unitTests: null,
                        documentation: null,
                        securityIssues: []
                    }]);
                    setActiveFilePath(file.name);
                }
            };
            reader.readAsText(file);
        }
    } catch (err: any) {
        setError(`Failed to load file: ${err.message}`);
    } finally {
        setIsLoadingFiles(false);
    }
  };

  const handleGitImport = async () => {
      if (!gitUrl.trim()) return;
      setError(null);
      setIsLoadingFiles(true);
      try {
          const files = await fetchGitHubRepoTree(gitUrl);
          setProjectFiles(files);
          if (files.length > 0) handleFileSelect(files[0]);
      } catch (err: any) {
          setError(`GitHub Import Failed: ${err.message}`);
      } finally {
          setIsLoadingFiles(false);
      }
  };

  const handleFileSelect = async (file: ProjectFile) => {
      setActiveFilePath(file.path);
      
      // Lazy load content if needed
      if (file.content === null && file.url) {
          try {
             const content = await fetchFileContent(file.url);
             setProjectFiles(prev => prev.map(f => f.path === file.path ? { ...f, content } : f));
          } catch (e) {
              console.error("Failed to load file content on select");
          }
      }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Config Modal Overlay */}
      {isConfigOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#202024]">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings2 size={20} className="text-indigo-400"/>
                        Tech Stack Configuration
                    </h2>
                    <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <StackSelector 
                        label="Legacy / Source Stack" 
                        items={config.sourceTechs} 
                        onChange={(items) => setConfig(prev => ({...prev, sourceTechs: items}))}
                        colorClass="bg-blue-500 text-blue-200 border-blue-400"
                    />
                     <div className="flex justify-center text-slate-600">
                        <ArrowRight size={24} className="rotate-90 md:rotate-0" />
                     </div>
                    <StackSelector 
                        label="Modern / Target Stack" 
                        items={config.targetTechs} 
                        onChange={(items) => setConfig(prev => ({...prev, targetTechs: items}))}
                        colorClass="bg-emerald-500 text-emerald-200 border-emerald-400"
                    />
                </div>
                <div className="p-4 border-t border-slate-700 bg-[#202024] flex justify-end">
                    <button 
                        onClick={() => setIsConfigOpen(false)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-sm transition-colors"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between flex-shrink-0 gap-4">
        
        {/* Stack Summary / Config Trigger */}
        <div 
            className="flex items-center gap-3 cursor-pointer group p-2 rounded hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
            onClick={() => setIsConfigOpen(true)}
        >
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Source</span>
                <span className="text-xs text-blue-300 font-medium truncate max-w-[120px]">{config.sourceTechs[0]} +{config.sourceTechs.length-1}</span>
            </div>
            <ArrowRight className="text-gray-600 group-hover:text-indigo-400 transition-colors" size={16} />
            <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Target</span>
                <span className="text-xs text-emerald-300 font-medium truncate max-w-[120px]">{config.targetTechs[0]} +{config.targetTechs.length-1}</span>
            </div>
            <Settings2 size={14} className="text-slate-500 group-hover:text-white ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-slate-800 rounded border border-slate-700 overflow-hidden">
                <div className="px-3 text-slate-400"><Github size={14} /></div>
                <input 
                    type="text"
                    placeholder="public/repo/url"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    className="bg-transparent text-xs text-white py-2 w-32 outline-none placeholder:text-slate-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleGitImport()}
                />
                <button onClick={handleGitImport} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 border-l border-slate-600">Load</button>
            </div>

            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 transition-all">
                <Upload size={14} />
                <span className="hidden sm:inline">Zip</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".zip" />
            </label>

            <button
              onClick={handleBatchMigration}
              disabled={isBatchProcessing || projectFiles.length === 0}
              className={`flex items-center gap-2 px-5 py-2 rounded font-semibold text-sm transition-all ${
                isBatchProcessing || projectFiles.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {isBatchProcessing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {isBatchProcessing ? `Processing...` : 'Morph Project'}
            </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0">
          <div className="hidden md:block h-full">
            <FileExplorer 
                files={projectFiles} 
                activeFile={activeFilePath} 
                onSelectFile={handleFileSelect} 
                isLoading={isLoadingFiles}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {/* Editors */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 min-h-0 overflow-hidden bg-slate-950">
              <div className="h-full min-h-0 flex flex-col">
                 <CodeEditor 
                    code={activeFile?.content || '// Select a file to view content'} 
                    language={activeFile?.language || 'text'}
                    label={activeFile ? `Legacy: ${activeFile.path}` : "Legacy Source"}
                    borderColor="border-slate-700"
                    readOnly={true}
                 />
              </div>
              <div className="h-full min-h-0 relative flex flex-col">
                 <CodeEditor 
                    code={activeFile?.modernContent || '// Run "Morph Project" to generate modern code'} 
                    language={activeFile?.language || 'text'}
                    label="Modern Target"
                    readOnly={true}
                    borderColor={activeFile?.status === 'failed' ? "border-red-900" : activeFile?.status === 'processing' ? "border-indigo-500/50" : activeFile?.status === 'completed' ? "border-emerald-900" : "border-slate-800"}
                 />
                 {activeFile?.status === 'processing' && (
                   <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                     <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded shadow-xl flex items-center gap-3">
                       <Loader2 className="animate-spin text-indigo-400" size={20} />
                       <span className="text-sm text-indigo-200">AI Architect is coding...</span>
                     </div>
                   </div>
                 )}
              </div>
            </div>

            {/* Bottom Tabs */}
            <div className="h-1/3 min-h-[250px] flex-shrink-0 bg-slate-900">
               {error && (
                 <div className="bg-red-900/20 border-t border-red-900/50 p-2 px-4 flex items-center gap-2 text-red-200 text-sm">
                    <AlertTriangle size={16} />
                    {error}
                 </div>
               )}
               <TabsPanel 
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  unitTests={activeFile?.unitTests || ''}
                  documentation={activeFile?.documentation || ''}
                  securityReport={activeFile?.securityIssues || []}
               />
            </div>
        </div>
      </div>
    </div>
  );
};
