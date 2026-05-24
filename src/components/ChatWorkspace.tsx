import React, { useState, useRef } from 'react';
import { 
  Send, Sparkles, Sliders, ArrowRight, CornerDownLeft, Paperclip, 
  Trash2, Play, Mic, MicOff, Info, Image as ImageIcon, FileText, Check, Copy 
} from 'lucide-react';
import { Message, InferenceMode, ModelPreset, Attachment } from '../types';
import { MODEL_PRESETS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWorkspaceProps {
  inferenceMode: InferenceMode;
  setInferenceMode: (mode: InferenceMode) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isGenerating: boolean;
  setIsGenerating: (gen: boolean) => void;
  onSandboxImport?: (code: string) => void;
  ollamaHost: string;
  setOllamaHost: (host: string) => void;
}

const PROMPT_TEMPLATES = [
  { label: '🚀 Web Template', prompt: 'Create a responsive pricing section in custom Tailwind HTML code' },
  { label: '📂 Feed Guidelines', prompt: 'Using RAG, document embedding indices can compare paragraphs.' },
  { label: '🛡️ Local Config', prompt: 'Explain the benefits of running quantized GGUF models via WebGPU.' },
  { label: '🤖 Multi-Agents', prompt: 'Simulate a multi-agent orchestration solving a visual design issue' }
];

export default function ChatWorkspace({
  inferenceMode,
  setInferenceMode,
  selectedModel,
  setSelectedModel,
  messages,
  setMessages,
  isGenerating,
  setIsGenerating,
  onSandboxImport,
  ollamaHost,
  setOllamaHost
}: ChatWorkspaceProps) {
  
  const [inputValue, setInputValue] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(40);
  const [topP, setTopP] = useState(0.9);
  const [showConfig, setShowConfig] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');

  // File Attachments State
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeModelInfo = MODEL_PRESETS.find(m => m.id === selectedModel) || MODEL_PRESETS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = () => {
        const newAttachment: Attachment = {
          id: `attach_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content: reader.result as string
        };
        setAttachedFiles(prev => [...prev, newAttachment]);
      };
      
      // Determine if file is text or image to read appropriately
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: Attachment = {
          id: `attach_${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content: reader.result as string
        };
        setAttachedFiles(prev => [...prev, newAttachment]);
      };
      reader.readAsText(file);
    }
  };

  const simulateMicInput = () => {
    if (isRecording) {
      setIsRecording(false);
      setInputValue(prev => prev + " " + "Simulated speech transcript: Deploy local WebGPU container...");
    } else {
      setIsRecording(true);
      setAudioTranscript("Listening on default system device...");
      setTimeout(() => {
        setAudioTranscript("Detecting voice frequencies...");
      }, 1000);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'system_welcome',
        role: 'system',
        content: `### Welcome to Lumina Core AI platform!
Choose your inference direction in the left sidebar configuration:
- **WebGPU Local**: Safe, browser-based, zero latency, no keys required.
- **Local Ollama integration**: Connect pointing to an automated local daemon.
- **Server Hybrid**: Leverages process.env.GEMINI_API_KEY if declared.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputValue;
    if (!promptToSend.trim() && attachedFiles.length === 0) return;

    setIsGenerating(true);
    setInputValue('');

    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString(),
      attachments: attachedFiles,
      mode: inferenceMode,
      modelId: selectedModel
    };

    setMessages(prev => [...prev, userMessage]);
    setAttachedFiles([]);

    // Create container for incoming assistant content
    const assistantMsgId = `msg_assist_${Date.now()}`;
    const assistantMessagePlaceholder: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString(),
      mode: inferenceMode,
      modelId: selectedModel,
      tokenMetrics: {
        promptTokens: Math.floor(promptToSend.length / 4) + 12,
        completionTokens: 0,
        firstTokenMs: 45,
        tokensPerSec: 0
      }
    };
    setMessages(prev => [...prev, assistantMessagePlaceholder]);

    // Stream from server or local simulated model
    try {
      const isOllamaMode = inferenceMode === 'ollama';
      const fetchUrl = isOllamaMode ? `${ollamaHost}/api/chat` : '/api/chat';
      
      const payload = {
        message: promptToSend,
        history: messages.filter(m => m.id !== 'system_welcome').map(m => ({ role: m.role, content: m.content })),
        temperature,
        attachment: userMessage.attachments?.[0] || null
      };

      if (isOllamaMode) {
        // Direct Client-to-Local-Ollama query so it genuinely works!
        const response = await fetch(`${ollamaHost}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel === 'gemma-2b-it' ? 'gemma' : 'llama3',
            messages: [{ role: 'user', content: promptToSend }],
            stream: false
          })
        });

        if (!response.ok) throw new Error("Local Ollama endpoint offline. Verify if Ollama is running (`ollama run gemma2`).");
        const json = await response.json();
        const finalTxt = json.message?.content || json.response || "";

        setMessages(prev => prev.map(msg => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              content: finalTxt,
              tokenMetrics: {
                promptTokens: 24,
                completionTokens: finalTxt.split(' ').length,
                firstTokenMs: 80,
                tokensPerSec: 28
              }
            };
          }
          return msg;
        }));
        setIsGenerating(false);
      } else {
        // Hybrid mode or WebGPU simulation query via internal server
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Server communication broken.");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let runningText = '';
        let startMs = Date.now();
        let firstTokenProcessed = false;
        let firstTokenMsTimer = 45;

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const textChunk = decoder.decode(value);
            const lines = textChunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataRaw = line.slice(6).trim();
                if (!dataRaw) continue;
                
                try {
                  const parsed = JSON.parse(dataRaw);
                  if (parsed.error) {
                    runningText = `### Server Notice\n\n${parsed.error}`;
                    break;
                  }
                  if (parsed.chunk) {
                    if (!firstTokenProcessed) {
                      firstTokenMsTimer = Date.now() - startMs;
                      firstTokenProcessed = true;
                    }
                    runningText += parsed.chunk;
                    
                    setMessages(prev => prev.map(msg => {
                      if (msg.id === assistantMsgId) {
                        const tokenCount = Math.floor(runningText.length / 4);
                        const durSec = (Date.now() - startMs) / 1000 || 0.1;
                        return {
                          ...msg,
                          content: runningText,
                          tokenMetrics: {
                            promptTokens: Math.floor(promptToSend.length / 4) + 15,
                            completionTokens: tokenCount,
                            firstTokenMs: firstTokenMsTimer,
                            tokensPerSec: Math.floor(tokenCount / durSec)
                          }
                        };
                      }
                      return msg;
                    }));
                  }
                  if (parsed.done) {
                    break;
                  }
                } catch (e) {
                  // Json parse recovery
                }
              }
            }
          }
        }
        setIsGenerating(false);
      }
    } catch (err: any) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === assistantMsgId) {
          return {
            ...msg,
            content: `### ⚠️ Connection Notice\n\nFailed to invoke model via *${inferenceMode === 'ollama' ? 'Local Ollama' : 'Hybrid Broker'}*.\n\n**Cause**: ${err.message || "Endpoint offline"}.\n\n*Suggestion: Ensure your microservice or Ollama host configuration matches \`${ollamaHost}\` or that local weights are mounted successfully.*`
          };
        }
        return msg;
      }));
      setIsGenerating(false);
    }
    
    // Smooth scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Helper to test if assistant output includes code and parse it with a Sandbox Button
  const renderMessageContent = (content: string, msgId: string) => {
    // If has code blocks, render elegantly
    if (content.includes('```')) {
      const parts = content.split('```');
      return (
        <div className="space-y-3 font-sans break-words leading-relaxed text-slate-300">
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              // Code block
              const lines = part.split('\n');
              const language = lines[0].trim() || 'javascript';
              const code = lines.slice(1).join('\n');
              return (
                <div key={index} className="border border-slate-800 rounded-xl overflow-hidden my-4 bg-slate-950 font-mono text-xs shadow-inner">
                  <div className="flex justify-between items-center px-4 py-2 bg-slate-900 text-slate-400 border-b border-slate-800">
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-indigo-400">{language}</span>
                    <div className="flex items-center gap-2">
                      {onSandboxImport && (
                        <button 
                          onClick={() => onSandboxImport(code)}
                          className="px-2 py-1 text-[10px] bg-indigo-900/30 hover:bg-indigo-900/60 border border-indigo-700/50 rounded text-indigo-300 flex items-center gap-1 transition-all duration-200"
                        >
                          <Play className="h-2.5 w-2.5" />
                          <span>Load Sandbox</span>
                        </button>
                      )}
                      <button 
                        onClick={() => copyToClipboard(code, `${msgId}_code_${index}`)}
                        className="p-1 hover:text-white transition-colors"
                        title="Copy code snippet"
                      >
                        {copiedId === `${msgId}_code_${index}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 overflow-x-auto select-text text-slate-100 leading-relaxed max-h-[300px]"><code>{code}</code></pre>
                </div>
              );
            } else {
              // Simple markdown string
              return <div key={index} className="whitespace-pre-wrap">{part}</div>;
            }
          })}
        </div>
      );
    }

    return <div className="whitespace-pre-wrap leading-relaxed text-slate-300">{content}</div>;
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-900 border-r border-slate-950 overflow-hidden" onDragOver={handleDragOver} onDrop={handleDrop}>
      {/* Header bar with Active Model Config info */}
      <header className="px-6 py-4 bg-slate-950/40 border-b border-slate-900 backdrop-blur flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-violet-600/10 to-transparent border border-violet-500/20 rounded-xl">
            <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 uppercase">
              <span>{inferenceMode.replace('_', ' ')}</span>
              <span>•</span>
              <span className="text-violet-400">{activeModelInfo.quantization}</span>
            </div>
            <h1 className="text-sm font-semibold text-white tracking-tight">{activeModelInfo.name}</h1>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {inferenceMode === 'ollama' && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs text-slate-500 font-mono uppercase">Ollama Host:</span>
              <input 
                type="text" 
                value={ollamaHost}
                onChange={(e) => setOllamaHost(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs px-2 py-1.5 rounded-lg text-slate-300 w-44 font-mono focus:outline-none focus:border-violet-600"
              />
            </div>
          )}

          {/* Model selection dropdown */}
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-xl text-slate-300 focus:outline-none focus:border-violet-600 font-medium"
          >
            {MODEL_PRESETS.map((m) => (
              <option key={m.id} value={m.id}>{m.provider} — {m.name}</option>
            ))}
          </select>

          <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-xl border transition-all ${
              showConfig 
                ? 'bg-violet-950/40 border-violet-800 text-violet-400' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Inference configurations"
          >
            <Sliders className="h-4 w-4" />
          </button>
          
          <button 
            onClick={handleClearHistory}
            className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-900/40 hover:text-red-400 rounded-xl text-slate-500 transition-all duration-200"
            title="Clear current workspace thread logs"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Model config slide down panels */}
      <AnimatePresence>
        {showConfig && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-950 border-b border-slate-900 overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-400">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs">Temperature: {temperature}</span>
                  <span className="text-[10px] text-slate-600">Deterministic vs Creative</span>
                </div>
                <input 
                  type="range" min="0" max="1.5" step="0.1"
                  value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs">Top K Tokens: {topK}</span>
                  <span className="text-[10px] text-slate-600">Vocabulary subset limit</span>
                </div>
                <input 
                  type="range" min="1" max="100" step="1"
                  value={topK} onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full accent-violet-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs">Top P Probability: {topP}</span>
                  <span className="text-[10px] text-slate-600">Nucleus sampling threshold</span>
                </div>
                <input 
                  type="range" min="0.1" max="1.0" step="0.05"
                  value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Workspace area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';
          return (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              key={msg.id || index}
              className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                  isUser 
                    ? 'bg-indigo-600 text-white' 
                    : isSystem 
                    ? 'bg-slate-800 text-slate-400' 
                    : 'bg-violet-900/30 text-violet-400 border border-violet-800/10'
                }`}>
                  {isUser ? 'ME' : isSystem ? 'SYS' : 'L'}
                </div>

                {/* Message Bubble Body */}
                <div className={`p-4 rounded-xl border shadow-sm ${
                  isUser 
                    ? 'bg-slate-800/50 border-slate-700/60 text-slate-100' 
                    : isSystem 
                    ? 'bg-slate-950/30 border-slate-900 text-slate-400 font-mono text-xs' 
                    : 'bg-slate-950/80 border-slate-900 text-slate-300'
                }`}>
                  {/* Handle Attached Previews */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {msg.attachments.map((file) => (
                        <div key={file.id} className="inline-flex items-center gap-2 p-1.5 bg-slate-900/80 rounded border border-slate-800 text-xs">
                          {file.type?.startsWith('image/') ? (
                            <img referrerPolicy="no-referrer" src={file.content} className="h-8 w-8 object-cover rounded" alt="Thumbnail" />
                          ) : (
                            <FileText className="h-4 w-4 text-indigo-400" />
                          )}
                          <span className="truncate max-w-[120px] font-mono font-medium">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Message Output Text */}
                  {renderMessageContent(msg.content, msg.id)}

                  {/* Telemetry info for chunk outputs */}
                  {msg.tokenMetrics && msg.tokenMetrics.completionTokens > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-900/60 flex items-center gap-4 text-[10px] font-mono text-slate-500">
                      <span>TTFT: <b className="text-violet-400">{msg.tokenMetrics.firstTokenMs}ms</b></span>
                      <span>Speed: <b className="text-violet-400">{(msg.tokenMetrics.tokensPerSec || 34)} t/s</b></span>
                      <span>Tokens: <b className="text-slate-400">{msg.tokenMetrics.completionTokens} out</b></span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {isGenerating && (
          <div className="flex gap-4 justify-start">
            <div className="h-8 w-8 rounded-lg bg-indigo-900/30 text-indigo-400 border border-indigo-800/20 flex items-center justify-center font-bold text-xs shrink-0 select-none animate-pulse">
              L
            </div>
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-900 text-slate-500 flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-ping"></span>
              <span>Synthesizing matrix tokens from memory nodes...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached uploads indicator list */}
      {attachedFiles.length > 0 && (
        <div className="px-6 py-2 bg-slate-950/70 border-t border-slate-900 flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
              {file.type?.startsWith('image/') ? (
                <img referrerPolicy="no-referrer" src={file.content} className="h-6 w-6 object-cover rounded" alt="attached" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
              )}
              <span className="max-w-[100px] truncate font-mono">{file.name}</span>
              <button 
                onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                className="text-slate-500 hover:text-red-400 font-bold transition ml-1"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input section with prompt actions / voice / paperclip */}
      <footer className="p-6 bg-slate-950/40 border-t border-slate-900 backdrop-blur">
        
        {/* Preset prompts templates list */}
        <div className="mb-4 flex flex-wrap gap-2 overflow-x-auto pb-1">
          {PROMPT_TEMPLATES.map((tmpl) => (
            <button
              onClick={() => handleSendMessage(tmpl.prompt)}
              key={tmpl.label}
              className="px-3 py-1.5 rounded-lg border border-slate-850 bg-slate-950 hover:bg-slate-900 hover:border-violet-600/30 text-slate-400 hover:text-white transition-all text-xs font-medium cursor-pointer"
            >
              {tmpl.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative border border-slate-800 bg-slate-950/90 rounded-2xl focus-within:border-violet-600/60 p-2 shadow-2xl transition duration-200">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Query browser tensors, upload guidelines, or trigger visual templates..."
            className="w-full bg-transparent border-0 focus:ring-0 p-3 text-slate-200 placeholder-slate-500 font-sans text-sm outline-none resize-none h-14"
          />

          <div className="flex justify-between items-center border-t border-slate-900 pt-2 px-2 mt-1 bg-transparent">
            {/* Attachment inputs and status indicators */}
            <div className="flex items-center gap-1">
              <input 
                type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-slate-900 hover:text-white rounded-lg text-slate-500 transition"
                title="Attach text specifications or raw image datasets"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <button 
                onClick={simulateMicInput}
                className={`p-1.5 rounded-lg transition ${
                  isRecording 
                    ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40 animate-pulse' 
                    : 'hover:bg-slate-900 hover:text-white text-slate-500'
                }`}
                title="Simulate speech to text input parameters"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              
              {isRecording && (
                <span className="text-[11px] text-rose-400 animate-pulse font-mono ml-2">
                  {audioTranscript}
                </span>
              )}
            </div>

            {/* Submit */}
            <button 
              onClick={() => handleSendMessage()}
              disabled={isGenerating}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 rounded-xl font-medium text-white text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition"
            >
              <span>Transmit</span>
              <CornerDownLeft className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Offline notice bar */}
        <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
          <Info className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <span>No keys required. Select model configurations or input your own local Ollama server address.</span>
        </div>
      </footer>
    </div>
  );
}
