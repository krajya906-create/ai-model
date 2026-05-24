import { MessageSquare, LayoutTemplate, BrainCircuit, Terminal, Network, Activity, Cpu, RefreshCw, Key, HardDrive } from 'lucide-react';
import { InferenceMode } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inferenceMode: InferenceMode;
  setInferenceMode: (mode: InferenceMode) => void;
  selectedModel: string;
  isBackendConnected: boolean;
  onRefreshStatus: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  inferenceMode,
  setInferenceMode,
  selectedModel,
  isBackendConnected,
  onRefreshStatus
}: SidebarProps) {
  
  const menuItems = [
    { id: 'chat', label: 'AI Chat Workspace', icon: MessageSquare, description: 'Direct model conversation' },
    { id: 'builder', label: 'AI Website Builder', icon: LayoutTemplate, description: 'Drag-&-drop page creator' },
    { id: 'rag', label: 'RAG Document Hub', icon: BrainCircuit, description: 'Local semantic vector index' },
    { id: 'sandbox', label: 'Developer Sandbox', icon: Terminal, description: 'Multi-file code execution' },
    { id: 'agents', label: 'Autonomous Agents', icon: Network, description: 'Reasoning planners & tools' },
    { id: 'dashboard', label: 'Telemetry & Stats', icon: Activity, description: 'GPU load & resource health' }
  ];

  return (
    <aside className="w-80 bg-slate-950 border-r border-slate-900 flex flex-col justify-between h-screen text-slate-300">
      {/* Upper Brand Section */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/10">
              L
            </div>
            <div>
              <h2 className="font-bold text-white text-base tracking-tight leading-none">LUMINA</h2>
              <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase">LOCAL WORKSPACE</span>
            </div>
          </div>
          <button 
            onClick={onRefreshStatus}
            title="Reload backend health telemetry"
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition duration-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Runtime Mode Switcher Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-400">ROUTER ENDPOINT</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono leading-none ${
              isBackendConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {isBackendConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-900">
            {(['webgpu', 'ollama', 'premium_hybrid'] as InferenceMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setInferenceMode(mode)}
                className={`py-1.5 text-[10px] rounded font-mono transition-all duration-200 text-center ${
                  inferenceMode === mode
                    ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title={
                  mode === 'webgpu' 
                    ? 'Execute directly in browser using WebGPU' 
                    : mode === 'ollama' 
                    ? 'Fetch from local Ollama endpoint (http://localhost:11434)' 
                    : 'Leverage available server secret AI key'
                }
              >
                {mode === 'webgpu' ? 'GPU' : mode === 'ollama' ? 'Ollama' : 'Hybrid'}
              </button>
            ))}
          </div>

          {/* Quick Stats Line */}
          <div className="text-[11px] text-slate-400 flex justify-between font-mono bg-slate-950/20 p-2 rounded">
            <span className="flex items-center gap-1 text-slate-500">
              <Cpu className="h-3 w-3" />
              {inferenceMode === 'webgpu' ? 'Web Tensors' : inferenceMode === 'ollama' ? 'Local GGUF' : 'Proxy Sync'}
            </span>
            <span className="text-violet-400">
              {inferenceMode === 'webgpu' ? 'INT4 cached' : inferenceMode === 'ollama' ? 'Port 11434' : 'Gemini 3.5'}
            </span>
          </div>
        </div>

        {/* Tab Selection List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm transition-all relative ${
                  isSelected 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
                }`}
              >
                {/* Visual Accent Pill */}
                {isSelected && (
                  <motion.div 
                    layoutId="active-sidebar-pill"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent rounded-xl border-l-[3px] border-violet-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`h-4 w-4 relative z-10 ${isSelected ? 'text-violet-400' : 'text-slate-500'}`} />
                <div className="text-left relative z-10 leading-none">
                  <div className="font-medium text-[13px]">{item.label}</div>
                  <span className="text-[10px] text-slate-500 tracking-normal block mt-0.5 font-normal leading-none">{item.description}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lower Setup & Configuration Box */}
      <div className="p-6 border-t border-slate-900 space-y-4 bg-slate-950">
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-slate-500">SYSTEM CAPABILITIES</div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-900/30 rounded-lg">
            <HardDrive className="h-3 w-3 text-slate-500" />
            <span className="leading-tight">Offline Embeddings: <b className="text-emerald-400 font-mono">Ready</b></span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-900/30 rounded-lg">
            <Key className="h-3 w-3 text-slate-500" />
            <span className="leading-tight">Gemini Key: <b className={isBackendConnected ? 'text-violet-400' : 'text-slate-500'}>{isBackendConnected ? 'Self-Hosted proxy' : 'Local Mode'}</b></span>
          </div>
        </div>

        <div className="text-center text-[10px] font-mono text-slate-600">
          Lumina Studio Build &bull; v1.0.4
        </div>
      </div>
    </aside>
  );
}
