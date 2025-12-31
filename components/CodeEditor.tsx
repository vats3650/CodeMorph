import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  label: string;
  borderColor: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language, 
  onChange, 
  readOnly = false,
  label,
  borderColor
}) => {
  
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Optional: Configure specific editor settings here if needed
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    });
  };

  return (
    <div className={`flex flex-col h-full border-2 rounded-lg overflow-hidden bg-[#1e1e1e] ${borderColor}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42]">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
          {label}
        </span>
        <span className="text-xs text-gray-500">{language}</span>
      </div>
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language} // Dynamic language update
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            readOnly: readOnly,
            domReadOnly: readOnly,
            renderWhitespace: 'selection',
          }}
          onMount={handleEditorDidMount}
          loading={<div className="text-gray-400 p-4">Loading Editor...</div>}
        />
      </div>
    </div>
  );
};
