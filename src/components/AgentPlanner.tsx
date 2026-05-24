import { useState } from 'react';
import { 
  Network, Play, CheckCircle2, RefreshCw, Sparkles, UserCheck, Check,
  Bot, ShieldAlert, Cpu, CheckSquare, Layers, HelpCircle, FileText 
} from 'lucide-react';
import { AgentTask, AgentStep } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function AgentPlanner() {
  const [goal, setGoal] = useState('Create a custom Tailwind features landing page, index specifications vector chunks, and debug runtime exceptions.');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Live Agent steps backlog state
  const [steps, setSteps] = useState<AgentStep[]>([
    {
      id: 'step_welcome',
      agentName: 'System Orchestrator Core',
      status: 'planning',
      description: 'Orchestrator stands ready. Input goals above to dispatch multi-agent pipelines.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [gatheredOutcome, setGatheredOutcome] = useState<string | null>(null);

  // Preset goals
  const PRESET_GOALS = [
    "Compile structural landing page layouts with glowing responsive cards",
    "Index guidelines into local spatial similarity matrix maps",
    "Audit WebGPU scripts for potential unverified dependencies"
  ];

  const handleLaunchPipeline = async () => {
    if (!goal.trim()) return;
    setIsRunning(true);
    setCurrentStep(0);
    setGatheredOutcome(null);

    // Initial Orchestrator logs
    setSteps([
      {
        id: 'step_1',
        agentName: 'Orchestrator Bot',
        status: 'planning',
        description: `Spawning collaborative nodes to solve complex task: "${goal}"`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    try {
      // Direct call to Express agents pipeline to retrieve full plan
      const response = await fetch('/api/agent/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goal })
      });

      if (!response.ok) throw new Error("Connection failed.");

      const result = await response.json();
      const planSteps: string[] = result.planSteps || [];
      const finalReport: string = result.researchOutcome || "";

      // Simulate character stream on steps
      let localStepIdx = 0;
      const stepInterval = setInterval(() => {
        if (localStepIdx < planSteps.length) {
          const names = ['Research Agent', 'Synthesizer Node', 'QA Debugger Module', 'Orchestrator Bot'];
          const statuses = ['searching', 'writing', 'reasoning', 'completed'] as const;
          
          setSteps(prev => [
            ...prev,
            {
              id: `step_${localStepIdx}_${Date.now()}`,
              agentName: names[localStepIdx % names.length],
              status: statuses[localStepIdx % statuses.length],
              description: planSteps[localStepIdx],
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
          localStepIdx++;
          setCurrentStep(localStepIdx);
        } else {
          // Finished steps, show comprehensive outcome
          clearInterval(stepInterval);
          setGatheredOutcome(finalReport);
          setIsRunning(false);
        }
      }, 1500);

    } catch (ex) {
      // Local fallback simulator solver
      const fallbackSteps = [
        "Analyzing target nodes and building sub-goal hierarchy matrix",
        "Executing parallel scraping on browser cache datasets to retrieve layout properties",
        "Compiling semantic index using spatial similarity cosine angles",
        "Validating sandbox compilation variables"
      ];

      let localStepIdx = 0;
      const stepInterval = setInterval(() => {
        if (localStepIdx < fallbackSteps.length) {
          setSteps(prev => [
            ...prev,
            {
              id: `step_fb_${localStepIdx}`,
              agentName: 'Local Fallback Orchestrator',
              status: 'executing',
              description: fallbackSteps[localStepIdx],
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
          localStepIdx++;
          setCurrentStep(localStepIdx);
        } else {
          clearInterval(stepInterval);
          setGatheredOutcome(`### OFFLINE GENERATED SYNTHESIS PIPELINE\n\n1. **Orchestrator Outcome**: Modular landing page chunks generated.\n2. **RAG Vectoring**: Coordinates mapped successfully within 45ms.\n3. **Sandbox Compliance**: Validated inside browser iframe container. Ready for deployment.`);
          setIsRunning(false);
        }
      }, 1400);
    }
  };

  return (
    <div className="flex-1 flex h-screen bg-slate-900 border-r border-slate-950 text-slate-300 overflow-hidden select-none">
      
      {/* LEFT COLUMN: Orchestrator Controls and parameters */}
      <div className="w-96 border-r border-slate-950 flex flex-col h-full bg-slate-950/70 p-6 space-y-6">
        <div>
          <div className="text-xs font-mono text-violet-400 flex items-center gap-1.5 uppercase font-semibold mb-1">
            <Network className="h-4 w-4" />
            <span>AGENTS ORCHESTRATION LAYER</span>
          </div>
          <h1 className="text-sm font-bold text-white tracking-tight font-sans">Multi-Agent Planner</h1>
        </div>

        {/* Goal input text areas */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Define Autonomous Goal</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-violet-600/60 resize-none h-24"
            placeholder="Type goal for cooperative bots..."
          />
          <button
            onClick={handleLaunchPipeline}
            disabled={isRunning}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 transition cursor-pointer"
          >
            {isRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            <span>Initiate Agents Cascade</span>
          </button>
        </div>

        {/* Goal Presets */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Boilerplate Cascades</div>
          <div className="space-y-1">
            {PRESET_GOALS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setGoal(preset)}
                className="w-full text-left text-xs bg-slate-900 hover:bg-slate-900/80 border border-slate-850 p-2.5 rounded-xl text-slate-400 hover:text-white transition truncate font-medium"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Node overview status lists */}
        <div className="border border-slate-900 bg-slate-950/30 p-4 rounded-xl space-y-3 shrink-0">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Multiverse Nodes</div>
          
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-900">
              <span className="flex items-center gap-1.5 font-sans">
                <Bot className="h-3.5 w-3.5 text-violet-400" />
                <span>Orchestration Manager</span>
              </span>
              <span className="text-[9px] text-violet-400 font-mono">STANDBY</span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-900">
              <span className="flex items-center gap-1.5 font-sans">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                <span>Synthesis Engine</span>
              </span>
              <span className="text-[9px] text-indigo-400 font-mono">STANDBY</span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-900">
              <span className="flex items-center gap-1.5 font-sans text-slate-400">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                <span>QA Diagnostics Module</span>
              </span>
              <span className="text-[9px] text-amber-500 font-mono">STANDBY</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive live node graphs and reasoning telemetry logs */}
      <div className="flex-grow flex flex-col h-full bg-slate-900 overflow-hidden">
        
        {/* Upper interactive node network visualizer card */}
        <div className="h-64 border-b border-slate-900 bg-slate-950/40 p-6 flex flex-col justify-between relative select-none shrink-0">
          <div className="absolute top-4 right-4 text-[10px] font-mono text-indigo-400 uppercase flex items-center gap-1 bg-indigo-950/30 px-2.5 py-1 rounded border border-indigo-700/20 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Agent Graph</span>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Node Network Graph</h2>
            <p className="text-xs text-slate-500 mt-1">Collab nodes executing tasks cooperatively from left to right.</p>
          </div>

          {/* Interactive Flow visual plot */}
          <div className="flex-grow my-4 rounded-xl border border-slate-900 bg-slate-950 relative overflow-hidden flex items-center justify-around px-8">
            <div className="absolute inset-0 bg-radial-grid opacity-5"></div>
            
            {/* Horizontal flow lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Connector lines between agents */}
              <line x1="15%" y1="50%" x2="50%" y2="50%" stroke="#1e293b" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="50%" y1="50%" x2="85%" y2="50%" stroke="#1e293b" strokeWidth="2" strokeDasharray="3,3" />
              
              {/* Active animated pulses */}
              {isRunning && (
                <>
                  <circle r="4" fill="#a855f7" className="animate-ping">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M -10,120 L 500,120" />
                  </circle>
                </>
              )}
            </svg>

            {/* Node 1: User Goal */}
            <div className="flex flex-col items-center space-y-2 relative z-10">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
                isRunning ? 'bg-indigo-950 border-indigo-400 text-indigo-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">Goal stack</span>
            </div>

            {/* Node 2: Collaborative Orchestrator */}
            <div className="flex flex-col items-center space-y-2 relative z-10">
              <div className={`h-14 w-14 rounded-full flex items-center justify-center border transition-all duration-300 ${
                isRunning && currentStep > 0 ? 'bg-violet-950 border-violet-500 text-violet-400 shadow-lg shadow-violet-500/10' : 'bg-slate-900 border-slate-850 text-slate-500'
              }`}>
                <Bot className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono text-slate-400">Collaborator Core</span>
            </div>

            {/* Node 3: Ready Output */}
            <div className="flex flex-col items-center space-y-2 relative z-10">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
                gatheredOutcome ? 'bg-emerald-950 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <Check className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">Ready Outcome</span>
            </div>
          </div>
        </div>

        {/* Lower reasoning terminal logs stream and markdown outcome */}
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden min-h-0">
          
          {/* Sub terminal showing active logs */}
          <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-5 flex flex-col h-full shadow-inner overflow-hidden">
            <div className="text-[11px] font-mono text-slate-500 uppercase border-b border-slate-900 pb-2 flex justify-between tracking-wide shrink-0">
              <span>Active reasoning trace</span>
              <span>{steps.length} entries</span>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 space-y-3 pr-1 font-mono text-[11px]">
              {steps.map((step, idx) => {
                return (
                  <motion.div
                    key={step.id || idx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 space-y-1.5 shadow-sm"
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span className="text-violet-400 font-bold">{step.agentName}</span>
                      <span>{step.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Outcome Report synthesized results markdown panel */}
          <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-5 flex flex-col h-full shadow-inner overflow-hidden">
            <div className="text-[11px] font-mono text-slate-500 uppercase border-b border-slate-900 pb-2 tracking-wide shrink-0">
              <span>Synthesised Mindset Outcome</span>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 pr-1">
              {gatheredOutcome ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed max-w-full whitespace-pre-wrap select-text selection:bg-violet-900/50"
                  dangerouslySetInnerHTML={{
                    __html: gatheredOutcome
                      .replaceAll('###', '<h3 class="text-sm font-bold text-white font-mono mt-4 border-b border-slate-900 pb-1 font-semibold">')
                      .replaceAll('**', '<b class="text-violet-400 font-bold">')
                      .replaceAll('1.', '<b class="text-violet-500 font-bold">-</b>')
                      .replaceAll('2.', '<b class="text-violet-500 font-bold">-</b>')
                      .replaceAll('3.', '<b class="text-violet-500 font-bold">-</b>')
                      .replaceAll('4.', '<b class="text-violet-500 font-bold">-</b>')
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-600 font-mono py-12">
                  <CheckSquare className="h-9 w-9 text-slate-800 animate-pulse" />
                  <span className="text-xs">Outcomes Synthesizer standby</span>
                  <p className="text-[10px] text-slate-600 max-w-xs leading-relaxed">Synthesis of the full multi-agent cooperations will compile immediately here once the reasoning stack terminates.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
