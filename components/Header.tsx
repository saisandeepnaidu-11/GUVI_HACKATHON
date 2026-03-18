import React from 'react';
import { ShieldCheck, History } from 'lucide-react';
import { HistoryItem } from '../types';

interface HeaderProps {
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  historyLength: number;
}

export const Header: React.FC<HeaderProps> = ({ showHistory, setShowHistory, historyLength }) => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            VoxVeritas <span className="text-indigo-400 font-medium">Forensics</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${showHistory ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
            {historyLength > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {historyLength}
              </span>
            )}
          </button>
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
          <span className="flex items-center gap-1.5 text-indigo-400">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Sensor Active
          </span>
        </div>
      </div>
    </nav>
  );
};
