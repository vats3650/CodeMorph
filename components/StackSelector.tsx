import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface StackSelectorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  colorClass: string;
}

export const StackSelector: React.FC<StackSelectorProps> = ({ label, items, onChange, colorClass }) => {
  const [inputVal, setInputVal] = useState('');

  const handleAdd = () => {
    if (inputVal.trim() && !items.includes(inputVal.trim())) {
      onChange([...items, inputVal.trim()]);
      setInputVal('');
    }
  };

  const handleRemove = (itemToRemove: string) => {
    onChange(items.filter(i => i !== itemToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="flex flex-wrap gap-2 p-3 bg-slate-900 border border-slate-700 rounded-lg min-h-[80px] content-start">
        {items.map((item) => (
          <span key={item} className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-opacity-20 border border-opacity-30 ${colorClass}`}>
            {item}
            <button onClick={() => handleRemove(item)} className="hover:text-white transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-2 flex-grow min-w-[120px]">
           <input 
             className="bg-transparent text-sm text-slate-200 outline-none w-full placeholder:text-slate-600"
             placeholder="Add tech..."
             value={inputVal}
             onChange={(e) => setInputVal(e.target.value)}
             onKeyDown={handleKeyDown}
           />
           <button onClick={handleAdd} className="text-slate-500 hover:text-indigo-400">
             <Plus size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};
