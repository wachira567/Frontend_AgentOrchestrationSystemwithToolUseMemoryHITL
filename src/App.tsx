import React, { useState } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { ArchitectureMap } from './components/ArchitectureMap';
import { FileInspector } from './components/FileInspector';
import { PipelineSimulator } from './components/PipelineSimulator';
import { MemorySandbox } from './components/MemorySandbox';
import { DockerComposeViewer } from './components/DockerComposeViewer';
import { CliQuickStart } from './components/CliQuickStart';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('architecture');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealthy={true}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'architecture' && <ArchitectureMap />}
        {activeTab === 'files' && <FileInspector />}
        {activeTab === 'simulator' && <PipelineSimulator />}
        {activeTab === 'memory' && <MemorySandbox />}
        {activeTab === 'docker' && <DockerComposeViewer />}
        {activeTab === 'cli' && <CliQuickStart />}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Multi-Agent Orchestration Architecture · Project 15 Scaffold
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            PostgreSQL 16 (Durable ACID) · Redis 7.2 (Working Cache & Broker) · ChromaDB 0.5 (Vector Store)
          </div>
        </div>
      </footer>
    </div>
  );
}
