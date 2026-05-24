import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWorkspace from './components/ChatWorkspace';
import WebsiteBuilder from './components/WebsiteBuilder';
import RAGHub from './components/RAGHub';
import CodePlayground from './components/CodePlayground';
import AgentPlanner from './components/AgentPlanner';
import PerformanceDashboard from './components/PerformanceDashboard';
import { InferenceMode, Message } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [inferenceMode, setInferenceMode] = useState<InferenceMode>('webgpu');
  const [selectedModel, setSelectedModel] = useState<string>('gemma-2b-it');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [sandboxCodeOverride, setSandboxCodeOverride] = useState<string>('');
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434');
  const [isGenerating, setIsGenerating] = useState(false);

  // Default welcome message list
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system_welcome',
      role: 'system',
      content: `### Welcome to Lumina Core AI Platform & Workspace

Choose your inference direction in the left sidebar configuration:
- **WebGPU Local**: Safe, browser-based, zero latency, no keys required.
- **Local Ollama integration**: Connect pointing to an automated local daemon.
- **Server Hybrid**: Leverages process.env.GEMINI_API_KEY if declared.

Use the tabs above to toggle between AI Chat Workspace, visual Website Builder, RAG Vector Hub, Multi-Agent Planners, and live Developer Sandbox playgrounds.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // Ping the Express endpoint to verify real fullstack service status
  const checkBackendHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }
    } catch (_) {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  // When a website visual layout is compiled, redirect output straight to code editor tabs
  const handleImportWebToSandbox = (compiledBlock: string) => {
    setSandboxCodeOverride(compiledBlock);
    setActiveTab('sandbox');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans antialiased select-none">
      
      {/* Dynamic Left sidebar panel navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inferenceMode={inferenceMode}
        setInferenceMode={setInferenceMode}
        selectedModel={selectedModel}
        isBackendConnected={isBackendConnected}
        onRefreshStatus={checkBackendHealth}
      />

      {/* Main content display viewport router */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 border-l border-slate-950">
        {activeTab === 'chat' && (
          <ChatWorkspace 
            inferenceMode={inferenceMode}
            setInferenceMode={setInferenceMode}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            messages={messages}
            setMessages={setMessages}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            onSandboxImport={handleImportWebToSandbox}
            ollamaHost={ollamaHost}
            setOllamaHost={setOllamaHost}
          />
        )}

        {activeTab === 'builder' && (
          <WebsiteBuilder 
            onCodeExport={handleImportWebToSandbox}
          />
        )}

        {activeTab === 'rag' && (
          <RAGHub />
        )}

        {activeTab === 'sandbox' && (
          <CodePlayground 
            initialCode={sandboxCodeOverride} 
            onCodeChange={(code) => setSandboxCodeOverride(code)}
          />
        )}

        {activeTab === 'agents' && (
          <AgentPlanner />
        )}

        {activeTab === 'dashboard' && (
          <PerformanceDashboard />
        )}
      </main>
      
    </div>
  );
}
