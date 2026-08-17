import React from 'react';
import { Layers, Database, Cpu, HardDrive, Terminal, GitBranch } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  systemHealthy: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, systemHealthy }) => {
  const tabs = [
    { id: 'architecture', label: 'Architecture & Topology', icon: Layers },
    { id: 'files', label: 'File Tree & Codebase', icon: GitBranch },
    { id: 'simulator', label: 'Orchestration Runner', icon: Cpu },
    { id: 'memory', label: 'Dual Memory Studio', icon: HardDrive },
    { id: 'docker', label: 'Docker Compose Spec', icon: Database },
    { id: 'cli', label: 'CLI & Setup Guide', icon: Terminal },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-lg">
              Ω
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-semibold text-slate-100 text-base sm:text-lg tracking-tight">
                  Multi-Agent Orchestration
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-mono">
                  v0.1.0-scaffold
                </span>
              </div>
              <p className="text-xs text-slate-400">Postgres · Redis · ChromaDB · Celery · FastAPI</p>
            </div>
          </div>

          {/* Infrastructure Health Badges */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${systemHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-mono">Stack Status:</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 border-l border-slate-800 pl-4">
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">PG :5432</span>
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">Redis :6379</span>
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">Chroma :8000</span>
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">API :8080</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-t-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'bg-slate-800/90 text-emerald-400 border-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
