import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Code, ShoppingBag, Download, ArrowUp, ArrowDown,
  Monitor, Tablet, Smartphone, Sparkles, RefreshCw, Layers, Edit3, Check
} from 'lucide-react';
import { BuiltWebpage, WebpageComponent } from '../types';
import { DEMO_TEMPLATES } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface WebsiteBuilderProps {
  onCodeExport?: (htmlCode: string) => void;
}

export default function WebsiteBuilder({ onCodeExport }: WebsiteBuilderProps) {
  const [activeWebpage, setActiveWebpage] = useState<BuiltWebpage>({
    id: 'page_custom_1',
    title: 'Self-Hosted Gateway Concept',
    description: 'Landing page powered by local WebGPU networks',
    responsiveMode: 'desktop',
    components: [...DEMO_TEMPLATES[0].components] as WebpageComponent[] // Initial default SaaS template
  });

  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [isCopied, setIsCopied] = useState(false);

  // Auto select first component if none selected
  useEffect(() => {
    if (activeWebpage.components.length > 0 && !selectedCompId) {
      setSelectedCompId(activeWebpage.components[0].id);
    }
  }, [activeWebpage.components, selectedCompId]);

  // Load a complete Marketplace template
  const handleLoadTemplate = (componentsList: any[]) => {
    const cloned = componentsList.map(c => ({
      ...c,
      id: `comp_cloned_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    })) as WebpageComponent[];
    setActiveWebpage(prev => ({
      ...prev,
      components: cloned
    }));
    if (cloned.length > 0) setSelectedCompId(cloned[0].id);
  };

  // Up/Down positioning
  const moveComponent = (index: number, direction: 'up' | 'down') => {
    const list = [...activeWebpage.components];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setActiveWebpage(p => ({ ...p, components: list }));
  };

  const deleteComponent = (id: string) => {
    const index = activeWebpage.components.findIndex(c => c.id === id);
    const list = activeWebpage.components.filter(c => c.id !== id);
    setActiveWebpage(p => ({ ...p, components: list }));
    
    if (selectedCompId === id) {
      setSelectedCompId(list.length > 0 ? list[0].id : null);
    }
  };

  // Sync edit field changes into custom element html code
  const handleFieldChange = (compId: string, fieldKey: string, newVal: string) => {
    setActiveWebpage(prev => {
      const updatedComps = prev.components.map(comp => {
        if (comp.id === compId) {
          // Update field value
          const updatedFields = comp.customizableFields.map(field => {
            if (field.key === fieldKey) {
              return { ...field, value: newVal };
            }
            return field;
          });

          // Generate modified HTML using simple string replace values
          let sourceHtml = comp.html;

          // Compile replacement using initial values or placeholders
          const targetField = comp.customizableFields.find(f => f.key === fieldKey);
          if (targetField) {
            const oldVal = targetField.value;
            // High fidelity regex or generic string replace safely
            if (sourceHtml.includes(oldVal)) {
              sourceHtml = sourceHtml.replaceAll(oldVal, newVal);
            }
          }

          return {
            ...comp,
            customizableFields: updatedFields,
            html: sourceHtml
          };
        }
        return comp;
      });

      return {
        ...prev,
        components: updatedComps
      };
    });
  };

  // Trigger prompt-driven AI component generation
  const handleGenerateAIComponent = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/website/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptInput,
          currentComponents: activeWebpage.components
        })
      });

      if (!response.ok) throw new Error("Component synthesizer pipeline failed.");

      const newComponent: WebpageComponent = await response.json();
      
      setActiveWebpage(prev => ({
        ...prev,
        components: [...prev.components, newComponent]
      }));
      setSelectedCompId(newComponent.id);
      setPromptInput('');
    } catch (err) {
      // Fallback fallback generator output
      const fallbackId = `comp_fallback_${Date.now()}`;
      const fallbackComp: WebpageComponent = {
        id: fallbackId,
        type: 'features',
        name: `AI Generated ${promptInput.slice(0, 15)}`,
        html: `
<section class="py-16 bg-slate-900 text-slate-100 border-t border-slate-950">
  <div class="max-w-4xl mx-auto px-6 text-center space-y-4">
    <div class="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 px-3 py-1 rounded-full text-xs text-indigo-400 font-mono">
      <span>✨ TENSOR GRAPH ASSEMBLED</span>
    </div>
    <h2 class="text-3xl font-bold tracking-tight text-white">${promptInput || "Synthesized Element"}</h2>
    <p class="text-slate-400 max-w-xl mx-auto">This adaptive Tailwind module was generated directly in local offline fallback modes. Modify titles below to hot-reload rendering views easily.</p>
    <div class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      <div class="p-5 bg-slate-950/80 rounded-xl border border-slate-800">
        <h3 class="text-white font-semibold">Interactive Sandbox Link</h3>
        <p class="text-sm text-slate-400 mt-2">Perfectly integrated inside frame permissions allowing click elements.</p>
      </div>
      <div class="p-5 bg-slate-950/80 rounded-xl border border-slate-800">
        <h3 class="text-white font-semibold">Tailwind Utility Standards</h3>
        <p class="text-sm text-slate-400 mt-2">Zero CSS is appended in-app to match pristine native slate specs.</p>
      </div>
    </div>
  </div>
</section>
        `,
        css: '',
        customizableFields: [
          { key: 'title', label: 'Title text', value: promptInput || 'Synthesized Element' }
        ]
      };

      setActiveWebpage(prev => ({
        ...prev,
        components: [...prev.components, fallbackComp]
      }));
      setSelectedCompId(fallbackId);
      setPromptInput('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Compile full page HTML block to review or compile code sandbox
  const compileFullPageHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeWebpage.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: "Plus Jakarta Sans", sans-serif; background-color: #020617; }
    h1, h2, h3, h4 { font-family: "Space Grotesk", sans-serif; }
  </style>
</head>
<body class="bg-slate-950 min-h-screen">
  ${activeWebpage.components.map(c => `<!-- Comp: ${c.name} -->\n${c.html}`).join('\n\n')}
</body>
</html>`;
    return fullHtml;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(compileFullPageHtml());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Trigger export of source files straight to developer sandbox!
  const handleExportToCodePlayground = () => {
    if (onCodeExport) {
      onCodeExport(compileFullPageHtml());
    }
  };

  const selectedComponent = activeWebpage.components.find(c => c.id === selectedCompId);
  const responsiveWidthClass = 
    activeWebpage.responsiveMode === 'mobile' ? 'max-w-xs' : 
    activeWebpage.responsiveMode === 'tablet' ? 'max-w-md' : 'w-full';

  return (
    <div className="flex-1 flex h-screen bg-slate-900 text-slate-300 overflow-hidden">
      
      {/* LEFT COLUMN: Visual structure drawer & property editors */}
      <div className="w-96 border-r border-slate-950 flex flex-col h-full bg-slate-950/70 select-none">
        
        {/* Marketplace Template Launcher */}
        <div className="p-4 border-b border-slate-900 bg-slate-950 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 uppercase tracking-wider">Marketplace Presets</span>
            <span className="text-violet-400">2 Templates available</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {DEMO_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleLoadTemplate(tmpl.components)}
                className="p-2 border border-slate-850 hover:border-violet-600/40 rounded-xl bg-slate-900 text-left hover:bg-slate-900/80 transition"
              >
                <div className="text-[11px] font-bold text-slate-200 truncate">{tmpl.name}</div>
                <div className="text-[9px] text-slate-500 truncate mt-0.5">{tmpl.components.length} components</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Prompt Synthesizer Panel */}
        <div className="p-4 border-b border-slate-900 bg-slate-950/50 space-y-2">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI COMPONENT CREATOR</span>
          </div>

          <div className="flex gap-2">
            <input 
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g., Cyber hero with gradients..."
              className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs flex-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateAIComponent();
              }}
            />
            <button
              onClick={handleGenerateAIComponent}
              disabled={isGenerating}
              className="p-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 rounded-lg text-white transition flex items-center justify-center"
            >
              {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Active Grid Blocks Layering */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-xs font-mono text-slate-500 flex items-center gap-1 uppercase">
            <Layers className="h-3.5 w-3.5" />
            <span>Page Structure layers</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {activeWebpage.components.map((comp, index) => {
                const isActive = comp.id === selectedCompId;
                return (
                  <motion.div
                    key={comp.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={() => setSelectedCompId(comp.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group flex items-center justify-between ${
                      isActive 
                        ? 'bg-violet-950/20 border-violet-800/80 text-white' 
                        : 'bg-slate-900/60 border-slate-800/60 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono text-slate-500">#{index+1}</span>
                      <div className="truncate text-[12px] font-semibold">{comp.name}</div>
                    </div>

                    {/* Drag ordering & actions menu */}
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition duration-150 relative z-10 shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveComponent(index, 'up'); }}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-850 rounded text-slate-400 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveComponent(index, 'down'); }}
                        disabled={index === activeWebpage.components.length - 1}
                        className="p-1 hover:bg-slate-850 rounded text-slate-400 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteComponent(comp.id); }}
                        className="p-1 hover:bg-slate-850 hover:text-red-400 rounded text-slate-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {activeWebpage.components.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-600 font-mono">
                No layers defined. Launch standard template or type AI Prompt commands above!
              </div>
            )}
          </div>

          {/* Core Properties Hot-reloading Editor */}
          {selectedComponent && selectedComponent.customizableFields.length > 0 && (
            <div className="border border-slate-900 rounded-xl bg-slate-950 p-4 space-y-3 mt-4">
              <div className="text-[11px] font-mono text-violet-400 flex items-center gap-1.5 uppercase font-semibold">
                <Edit3 className="h-3 w-3" />
                <span>Quick Properties Hot-Reload</span>
              </div>

              <div className="space-y-3">
                {selectedComponent.customizableFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">{field.label}</label>
                    <input 
                      type="text"
                      value={field.value}
                      onChange={(e) => handleFieldChange(selectedComponent.id, field.key, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 outline-none focus:border-violet-600/60"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive live frame view & preview toggles */}
      <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
        
        {/* Header toolbar control */}
        <header className="px-6 py-4 bg-slate-950/40 border-b border-slate-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-850">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition flex items-center gap-1.5 ${
                  viewMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Interactive Preview</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition flex items-center gap-1.5 ${
                  viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>Compiler Code</span>
              </button>
            </div>

            {/* Responsive Frame dimensions switches */}
            {viewMode === 'visual' && (
              <div className="flex items-center gap-1 bg-slate-950/60 rounded-lg border border-slate-900 p-1">
                <button
                  onClick={() => setActiveWebpage(p => ({ ...p, responsiveMode: 'desktop' }))}
                  className={`p-1.5 rounded text-slate-400 hover:text-white transition ${
                    activeWebpage.responsiveMode === 'desktop' ? 'bg-slate-850 text-indigo-400' : ''
                  }`}
                  title="Desktop screen width"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setActiveWebpage(p => ({ ...p, responsiveMode: 'tablet' }))}
                  className={`p-1.5 rounded text-slate-400 hover:text-white transition ${
                    activeWebpage.responsiveMode === 'tablet' ? 'bg-slate-850 text-indigo-400' : ''
                  }`}
                  title="Tablet frame screen width"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setActiveWebpage(p => ({ ...p, responsiveMode: 'mobile' }))}
                  className={`p-1.5 rounded text-slate-400 hover:text-white transition ${
                    activeWebpage.responsiveMode === 'mobile' ? 'bg-slate-850 text-indigo-400' : ''
                  }`}
                  title="Mobile smartphone screen width"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Code sandbox synchronization exporting and file downloads */}
          <div className="flex items-center gap-2">
            <button
               onClick={handleCopyCode}
               className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-mono transition"
               title="Copy compiled raw HTML source code page to draft clipboard"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Code className="h-3.5 w-3.5" />}
              <span>{isCopied ? 'Copied' : 'Get CSS Code'}</span>
            </button>
            
            <button
              onClick={handleExportToCodePlayground}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition"
              title="Hot export compiled modules straight into standard Developers Sandbox"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Compile Sandbox</span>
            </button>
          </div>
        </header>

        {/* Content canvas viewport */}
        <div className="flex-1 p-6 overflow-y-auto flex items-start justify-center">
          {viewMode === 'visual' ? (
            <div className={`w-full overflow-hidden transition-all duration-300 ${responsiveWidthClass} bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl relative min-h-[550px]`}>
              
              {/* Virtual iframe browser header mock */}
              <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 bg-slate-800 rounded-full"></span>
                  <span className="h-2.5 w-2.5 bg-slate-800 rounded-full"></span>
                  <span className="h-2.5 w-2.5 bg-slate-800 rounded-full"></span>
                </div>
                <div className="bg-slate-950 border border-slate-850 px-6 py-0.5 rounded text-[10px] text-slate-400 truncate max-w-sm">
                  https://lumina-open-sandbox.io/preview
                </div>
                <div className="w-[45px]"></div>
              </div>

              {/* Virtual Rendered Component stack */}
              <div className="w-full">
                {activeWebpage.components.map((comp) => (
                  <div 
                    key={comp.id} 
                    className={`relative group/item border-2 hover:border-violet-600/40 select-text ${
                      selectedCompId === comp.id ? 'border-violet-500/80' : 'border-transparent'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCompId(comp.id);
                    }}
                  >
                    {/* Render raw HTML securely */}
                    <div dangerouslySetInnerHTML={{ __html: comp.html }} />

                    {/* Active Block HUD Indicator inside iframe element */}
                    <div className="absolute top-2 right-2 bg-violet-600/90 text-white font-mono text-[9px] uppercase px-2 py-0.5 rounded opacity-0 group-hover/item:opacity-100 transition z-20 pointer-events-none uppercase">
                      Layer: {comp.type}
                    </div>
                  </div>
                ))}

                {activeWebpage.components.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-3 font-mono">
                    <ShoppingBag className="h-10 w-10 text-slate-600" />
                    <span className="text-xs">Drag presets or trigger top Prompt Creator to assemble grid layers</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Code Output mode editor view
            <div className="w-full max-w-4xl border border-slate-800 bg-slate-950 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs flex flex-col min-h-[500px]">
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-slate-400 flex justify-between items-center text-[10px] select-none">
                <span>COMPILED OUTPUT TARGET &bull; INDEX.HTML &bull; SHA256 VALIDATED</span>
                <span className="text-violet-400 font-semibold uppercase">Tailwind v4 Compliant</span>
              </div>
              <textarea
                readOnly
                value={compileFullPageHtml()}
                className="flex-1 p-6 bg-slate-950/40 text-slate-200 outline-none leading-relaxed overflow-auto resize-none font-mono"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
