import React from 'react';
import { ProjectFile } from '../types';
import { FileCode, Folder, CheckCircle2, CircleDashed, AlertCircle, Loader2 } from 'lucide-react';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFile: string | null;
  onSelectFile: (file: ProjectFile) => void;
  isLoading: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  activeFile, 
  onSelectFile,
  isLoading
}) => {
  if (isLoading) {
    return (
        <div className="w-64 bg-[#18181b] border-r border-slate-800 p-4 flex flex-col items-center justify-center text-slate-500 gap-2 h-full">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <span className="text-xs">Loading Project...</span>
        </div>
    );
  }

  if (files.length === 0) {
      return (
        <div className="w-64 bg-[#18181b] border-r border-slate-800 p-4 flex flex-col items-center justify-center text-slate-500 text-center h-full">
            <Folder size={32} className="mb-2 opacity-20" />
            <p className="text-xs">No files loaded.</p>
            <p className="text-[10px] mt-1 text-slate-600">Upload Zip or use Git URL</p>
        </div>
      );
  }

  const getStatusIcon = (file: ProjectFile) => {
      if (file.status === 'processing') return <Loader2 size={12} className="animate-spin text-indigo-400" />;
      if (file.status === 'completed') return <CheckCircle2 size={12} className="text-emerald-500" />;
      if (file.status === 'failed') return <AlertCircle size={12} className="text-red-500" />;
      return null;
  };

  return (
    <div className="w-64 bg-[#18181b] border-r border-slate-800 flex flex-col h-full">
      <div className="p-3 border-b border-slate-800 bg-[#1f1f23]">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Folder size={14} className="text-indigo-400"/>
            Project Explorer
        </h3>
        <p className="text-[10px] text-slate-500 mt-1">{files.length} files detected</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {files.map((file) => (
            <li key={file.path}>
              <button
                onClick={() => onSelectFile(file)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-xs transition-colors truncate ${
                  activeFile === file.path 
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={file.path}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileCode size={14} className={activeFile === file.path ? 'text-indigo-400' : 'text-slate-600'} />
                    <span className="truncate">{file.path}</span>
                </div>
                <div>
                    {getStatusIcon(file)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
