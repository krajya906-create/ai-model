import { useState, useEffect, useRef } from 'react';
import { 
  Play, RefreshCw, FileCode, Check, Copy, Bug, Settings, 
  Terminal, ShieldCheck, FileText, CodeXml, Eye, Layout, AlertTriangle
} from 'lucide-react';
import { SandboxFile } from '../types';
import { INITIAL_FILES } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface CodePlaygroundProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
}

export default function CodePlayground({ initialCode, onCodeChange }: CodePlaygroundProps) {
  const [files, setFiles] = useState<SandboxFile[]>([...INITIAL_FILES]);
  const [activeFileName, setActiveFileName] = useState<string>('index.html');
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDebuggerActive, setIsDebuggerActive] = useState(true);

  // Debug Console stream log
  const [consoleLogs, setConsoleLogs] = useState<{ type: 'log' | 'warn' | 'error'; text: string; time: string }[]>([
    { type: 'log', text: 'Initializing virtual sandbox node...', time: new Date().toLocaleTimeString() },
    { type: 'log', text: 'Tailwind compilation layer configured successfully.', time: new Date().toLocaleTimeString() }
  ]);

  // Synchronize externally loaded visual layouts directly into local editor files
  useEffect(() => {
    if (initialCode) {
      setFiles(prev => prev.map(f => {
        if (f.name === 'index.html') {
          return { ...f, content: initialCode };
        }
        return f;
      }));
      setActiveFileName('index.html');
      
      // Auto compile
      compileSandboxCode();
    }
  }, [initialCode]);

  useEffect(() => {
    // Initial compile on load
    compileSandboxCode();
  }, []);

  const handleFileContentChange = (content: string) => {
    setFiles(prev => prev.map(f => {
      if (f.name === activeFileName) {
        return { ...f, content };
      }
      return f;
    }));
  };

  // Compile individual virtual files into a single responsive iframe srcDoc
  const compileSandboxCode = () => {
    setIsCompiling(true);
    
    // Find files
    const htmlFile = files.find(f => f.name === 'index.html')?.content || '';
    const cssFile = files.find(f => f.name === 'styles.css')?.content || '';
    const jsFile = files.find(f => f.name === 'app.js')?.content || '';

    // Inject styles and JavaScript into iframe index.html securely so it hot-compiles!
    let compiledDoc = htmlFile;

    // Inject styles
    if (compiledDoc.includes('</head>')) {
      compiledDoc = compiledDoc.replace('</head>', `<style>${cssFile}</style></head>`);
    } else {
      compiledDoc = `<style>${cssFile}</style>${compiledDoc}`;
    }

    // Inject JavaScript + simulated iframe logger to capture sandbox standard output console
    const consoleProxyScript = `
      <script>
        (function() {
          const _log = console.log;
          const _warn = console.warn;
          const _err = console.error;

          function sendToHost(type, args) {
            window.parent.postMessage({
              type: 'SANDBOX_CONSOLE',
              logType: type,
              text: Array.from(args).map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
            }, '*');
          }

          console.log = function() {
            sendToHost('log', arguments);
            _log.apply(console, arguments);
          };
          console.warn = function() {
            sendToHost('warn', arguments);
            _warn.apply(console, arguments);
          };
          console.error = function() {
            sendToHost('error', arguments);
            _err.apply(console, arguments);
          };
        })();
        
        try {
          ${jsFile}
        } catch (ex) {
          console.error("Script Error: " + ex.message);
        }
      </script>
    `;

    if (compiledDoc.includes('</body>')) {
      compiledDoc = compiledDoc.replace('</body>', `${consoleProxyScript}</body>`);
    } else {
      compiledDoc += consoleProxyScript;
    }

    setTimeout(() => {
      setIframeSrcDoc(compiledDoc);
      setIsCompiling(false);
      setConsoleLogs(prev => [
        ...prev,
        { type: 'log', text: 'Hot compiled sandbox payload successfully.', time: new Date().toLocaleTimeString() }
      ]);
    }, 450);
  };

  // Capture postMessages from the sandboxed iframe console!
  useEffect(() => {
    const handleSandboxLogs = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SANDBOX_CONSOLE') {
        setConsoleLogs(prev => [
          ...prev,
          { 
            type: event.data.logType, 
            text: event.data.text, 
            time: new Date().toLocaleTimeString() 
          }
        ]);
      }
    };

    window.addEventListener('message', handleSandboxLogs);
    return () => window.removeEventListener('message', handleSandboxLogs);
  }, []);

  const handleCopyFileCode = () => {
    const activeCode = files.find(f => f.name === activeFileName)?.content || '';
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeFileContent = files.find(f => f.name === activeFileName)?.content || '';

  return (
    <div className="flex-grow flex h-screen bg-slate-900 overflow-hidden text-slate-300">
      
      {/* Code Editor Column left */}
      <section className="w-[50%] flex flex-col h-full bg-slate-950 border-r border-slate-900">
        
        {/* Tab Selection */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-900 flex justify-between items-center sm:px-6">
          <div className="flex gap-1 bg-slate-900 border border-slate-850 p-1 rounded-xl">
            {files.map(f => {
              const isActive = f.name === activeFileName;
              return (
                <button
                  key={f.name}
                  onClick={() => setActiveFileName(f.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-slate-950 border border-slate-800 text-violet-400 font-semibold shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFileCode}
              className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-white transition"
              title="Copy active code block"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={compileSandboxCode}
              disabled={isCompiling}
              className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 rounded-xl text-white font-semibold text-xs flex items-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              {isCompiling ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              <span>Execute Sandbox</span>
            </button>
          </div>
        </div>

        {/* Real-time Code Editor panel */}
        <div className="flex-1 relative flex overflow-hidden">
          {/* Virtual Line numbers column */}
          <div className="w-12 bg-slate-950 pr-2 border-r border-slate-900 font-mono text-right text-slate-600 leading-relaxed py-6 select-none text-[11px]">
            {activeFileContent.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Interactive Editable Input textarea */}
          <textarea
            value={activeFileContent}
            onChange={(e) => handleFileContentChange(e.target.value)}
            className="flex-1 p-6 bg-slate-950/40 text-slate-200 outline-none leading-relaxed font-mono text-xs resize-none overflow-y-auto w-full border-0 select-text"
            placeholder="Edit raw text details to recompile active frames..."
            spellCheck="false"
          />
        </div>

        {/* Interactive Debug Diagnostics area */}
        <div className="h-48 border-t border-slate-900 flex flex-col bg-slate-950 shrink-0">
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-900 text-xs font-mono text-slate-500 flex justify-between items-center sm:px-6">
            <span className="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Terminal className="h-3.5 w-3.5" />
              <span>Sandbox Console Terminal</span>
            </span>
            <button 
              onClick={() => setConsoleLogs([])} 
              className="hover:text-white text-[10px] uppercase font-bold"
            >
              Clear Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px]">
            {consoleLogs.map((log, index) => (
              <div 
                key={index}
                className={`flex gap-3 leading-loose ${
                  log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className="shrink-0 font-bold uppercase">{log.type}:</span>
                <span className="break-all">{log.text}</span>
              </div>
            ))}
            {consoleLogs.length === 0 && (
              <div className="text-center text-slate-600 py-6 italic select-none">
                Listening for runtime script callbacks and sandbox alerts...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Frame Preview Column right */}
      <section className="w-[50%] flex flex-col h-full bg-slate-900">
        <header className="px-6 py-4.5 bg-slate-950/40 border-b border-slate-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono leading-none rounded uppercase">
              Isolated Render Node
            </div>
            <h2 className="text-xs font-semibold text-slate-300">Execution Sandbox</h2>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Environment: <b className="text-violet-400">Chrome Sandboxed VM</b>
          </div>
        </header>

        {/* Active Sandbox Output Frame container */}
        <div className="flex-grow p-6 flex justify-center items-center overflow-hidden bg-slate-950/20 relative">
          
          <div className="w-full h-full border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Visual url browser mockup address line */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-600 font-mono select-none">
              <span className="h-2 w-2 rounded-full bg-slate-800"></span>
              <span className="h-2 w-2 rounded-full bg-slate-800"></span>
              <span className="h-2 w-2 rounded-full bg-slate-800"></span>
              <div className="bg-slate-950 px-4 py-0.5 rounded text-[9px] truncate max-w-sm ml-4">
                sandbox://localhost:11434/virtual_main.html
              </div>
            </div>

            {/* Sandbox Iframe */}
            <iframe
              srcDoc={iframeSrcDoc}
              title="Execution Output Sandbox Frame"
              className="flex-grow w-full border-0 bg-white"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
