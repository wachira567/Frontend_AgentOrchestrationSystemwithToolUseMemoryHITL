import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, Copy, Check, Download, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { FileTreeItem } from '../types';
import { scaffoldedFiles } from '../data/fileTreeData';

export const FileInspector: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileTreeItem>(() => {
    // Default to main.py or docker-compose.yml
    return scaffoldedFiles.children?.[0] || scaffoldedFiles;
  });
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    root: true,
    'backend-dir': true,
    'app-dir': true,
    'core-dir': true,
    'memory-dir': true,
    'agents-dir': true,
    'worker-dir': true,
    'api-dir': true,
    'config-dir': true,
  });
  const [copied, setCopied] = useState(false);

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCopy = () => {
    if (selectedFile.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!selectedFile.content) return;
    const element = document.createElement('a');
    const file = new Blob([selectedFile.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Recursive tree renderer
  const renderTree = (item: FileTreeItem, depth = 0) => {
    if (item.type === 'directory') {
      const isOpen = openFolders[item.id] ?? false;
      return (
        <div key={item.id} className="select-none">
          <div
            onClick={() => toggleFolder(item.id)}
            className={`flex items-center space-x-1.5 py-1 px-2 rounded-md cursor-pointer hover:bg-slate-800/80 transition-colors text-xs font-mono text-slate-300`}
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            {isOpen ? <FolderOpen className="w-4 h-4 text-emerald-400" /> : <Folder className="w-4 h-4 text-emerald-400" />}
            <span className="font-semibold text-slate-200">{item.name}</span>
          </div>

          {isOpen && item.children && (
            <div>{item.children.map((child) => renderTree(child, depth + 1))}</div>
          )}
        </div>
      );
    }

    const isSelected = selectedFile.id === item.id;
    return (
      <div
        key={item.id}
        onClick={() => setSelectedFile(item)}
        className={`flex items-center space-x-1.5 py-1 px-2 rounded-md cursor-pointer text-xs font-mono transition-colors ${
          isSelected
            ? 'bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
        }`}
        style={{ paddingLeft: `${depth * 14 + 18}px` }}
      >
        <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
        <span className="truncate">{item.name}</span>
      </div>
    );
  };

  const lineCount = selectedFile.content ? selectedFile.content.split('\n').length : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: File Explorer Tree */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Scaffolded Repository</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">15 files</span>
        </div>

        <div className="max-h-[600px] overflow-y-auto space-y-0.5 pr-1">
          {renderTree(scaffoldedFiles)}
        </div>
      </div>

      {/* Right Column: Code Viewer & Metadata */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        {/* File Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-medium text-slate-200">{selectedFile.path}</span>
            <span className="text-[10px] uppercase font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {selectedFile.language || 'text'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* File Description */}
        {selectedFile.description && (
          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{selectedFile.description}</span>
          </div>
        )}

        {/* Code Content with Line Numbers */}
        <div className="bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-h-[540px] text-slate-300">
          <pre className="flex">
            {/* Line numbers */}
            <div className="select-none text-slate-400 text-right pr-4 border-r border-slate-800">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-relaxed">
                  {i + 1}
                </div>
              ))}
            </div>
            {/* Code */}
            <div className="pl-4 leading-relaxed whitespace-pre text-slate-200 overflow-x-auto">
              {selectedFile.content || '# Empty file'}
            </div>
          </pre>
        </div>
      </div>
    </div>
  );
};
