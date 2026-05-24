import { useState, useEffect } from 'react';
import { 
  Zap, Cpu, HardDrive, RefreshCw, Sliders, Check, Settings, ShieldCheck,
  AlertOctagon, Info, Activity, Hourglass, HelpCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import { PerformanceSnapshot } from '../types';
import { motion } from 'motion/react';

export default function PerformanceDashboard() {
  const [cpuLoad, setCpuLoad] = useState(38);
  const [gpuLoad, setGpuLoad] = useState(54);
  const [vramUsed, setVramUsed] = useState(3.4);
  const vramTotal = 8.0;

  // Real-time chart trace data
  const [metricsHistory, setMetricsHistory] = useState<number[]>([40, 48, 45, 52, 59, 51, 62, 58, 65, 54, 58, 62]);
  const [gpuHistory, setGpuHistory] = useState<number[]>([30, 41, 48, 59, 64, 52, 58, 49, 56, 68, 72, 64]);

  // Optimization toggles state
  const [gpuAcceleration, setGpuAcceleration] = useState(true);
  const [quantizedCaching, setQuantizedCaching] = useState(true);
  const [garbageCollectorActive, setGarbageCollectorActive] = useState(true);
  const [gcStatus, setGcStatus] = useState<'idle' | 'running' | 'success'>('idle');

  // Multi-threaded updater
  useEffect(() => {
    const tracker = setInterval(() => {
      setCpuLoad(prev => {
        const delta = Math.floor(Math.random() * 11) - 5;
        const next = Math.max(10, Math.min(95, prev + delta));
        return next;
      });

      setGpuLoad(prev => {
        const delta = Math.floor(Math.random() * 15) - 7;
        const next = Math.max(15, Math.min(100, prev + delta));
        
        // Sync vram slightly
        setVramUsed(v => {
          const ratio = next / 100;
          return parseFloat((vramTotal * 0.3 + (vramTotal * 0.5 * ratio) + (Math.random() * 0.2 - 0.1)).toFixed(2));
        });

        // Add to historical lists and shift left
        setMetricsHistory(h => [...h.slice(1), cpuLoad]);
        setGpuHistory(g => [...g.slice(1), next]);

        return next;
      });
    }, 1800);

    return () => clearInterval(tracker);
  }, [cpuLoad]);

  const runGarbageCollector = () => {
    setGcStatus('running');
    setTimeout(() => {
      setGcStatus('success');
      setVramUsed(2.1);
      setTimeout(() => setGcStatus('idle'), 1500);
    }, 1200);
  };

  // Convert array to SVG line coords
  const makeSvgPoints = (data: number[]) => {
    const width = 100;
    const height = 40;
    const size = data.length;
    return data.map((val, idx) => {
      const x = (idx / (size - 1)) * width;
      // invert y (since SVG 0 is top)
      const y = height - (val / 100) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="flex-grow flex h-screen bg-slate-900 overflow-hidden text-slate-300">
      
      {/* Telemetry charts row and meters (Left side) */}
      <section className="flex-1 p-6 space-y-6 overflow-y-auto max-w-4xl">
        <div>
          <div className="text-xs font-mono text-violet-400 flex items-center gap-1.5 uppercase font-semibold mb-1">
            <Zap className="h-4 w-4" />
            <span>REAL-TIME PERFORMANCE MONITOR</span>
          </div>
          <h1 className="text-sm font-bold text-white tracking-tight sm:text-base">System Telemetry & Resource Logs</h1>
        </div>

        {/* Top 3 Core Metrics cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: CPU load */}
          <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-5 space-y-3 shadow-sm select-none">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">CPU Core Load</span>
              <Cpu className="h-4 w-4 text-violet-400" />
            </div>
            
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-mono text-white tracking-tight">{cpuLoad}%</span>
              <span className="text-xs text-emerald-400 font-mono">16 Cores Active</span>
            </div>

            {/* Visual meter bar */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-violet-500 h-full transition-all duration-300" style={{ width: `${cpuLoad}%` }}></div>
            </div>
            <div className="text-[9px] font-mono text-slate-500">Thread Pool: x86-64 SIMD AVX-512</div>
          </div>

          {/* Card 2: GPU compute load */}
          <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-5 space-y-3 shadow-sm select-none">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">GPU Compute Load</span>
              <Zap className="h-4 w-4 text-indigo-400 animate-pulse" />
            </div>
            
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-mono text-white tracking-tight">{gpuLoad}%</span>
              <span className="text-xs text-violet-400 font-mono">WebGPU Thread</span>
            </div>

            {/* Visual meter bar */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${gpuLoad}%` }}></div>
            </div>
            <div className="text-[9px] font-mono text-slate-500">Device Layer: Apple/NVIDIA Vulkan Backend</div>
          </div>

          {/* Card 3: VRAM memory load */}
          <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-5 space-y-3 shadow-sm select-none">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">VRAM Layer Usage</span>
              <HardDrive className="h-4 w-4 text-emerald-400" />
            </div>
            
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-mono text-white tracking-tight">{vramUsed} GB</span>
              <span className="text-xs text-slate-500 font-mono">/ {vramTotal} GB Max</span>
            </div>

            {/* Visual meter bar */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${(vramUsed/vramTotal)*100}%` }}></div>
            </div>
            <div className="text-[9px] font-mono text-slate-500">GGUF Quantization Block Size: INT4</div>
          </div>

        </div>

        {/* Real-time fluctuating chart visualizers drawn via pure custom SVGs */}
        <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-6 shadow-inner select-none space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Active Compute Wave History (t/s)</h2>
              <p className="text-xs text-slate-500 mt-1">Live coordinates representing relative processing throughput and core cycles.</p>
            </div>

            {/* Legend colors */}
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5"><b className="h-2 w-2 rounded-full bg-violet-500"></b> CPU Core</span>
              <span className="flex items-center gap-1.5"><b className="h-2 w-2 rounded-full bg-indigo-500"></b> WebGPU Tensor</span>
            </div>
          </div>

          {/* Pure SVG Graph Grid Container */}
          <div className="h-48 border border-slate-900/80 rounded-xl bg-slate-950 relative overflow-hidden flex items-end">
            <div className="absolute inset-0 bg-radial-grid opacity-10 pointer-events-none"></div>

            <svg className="w-full h-full p-2" viewBox="0 0 100 40" preserveAspectRatio="none">
              {/* Grid Horizontal axis markers */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="2,2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="2,2" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="2,2" />

              {/* CPU wave line */}
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="0.75"
                points={makeSvgPoints(metricsHistory)}
                className="transition-all duration-300"
              />

              {/* GPU wave line */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="0.75"
                points={makeSvgPoints(gpuHistory)}
                className="transition-all duration-300"
              />
            </svg>

            {/* Dynamic time stamp guidelines */}
            <div className="absolute bottom-2 left-3 text-[9px] font-mono text-slate-600 flex gap-6">
              <span>Timestamp guidelines:</span>
              <span>1s intervals</span>
              <span>Polling Rate: 56Hz</span>
            </div>
          </div>
        </div>

        {/* Telemetry log trace */}
        <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-6 shadow-xs font-mono text-xs space-y-3">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">System Diagnostics Trace</div>
          
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl max-h-[140px] overflow-y-auto border border-slate-900 text-[10px] leading-relaxed">
            <div><span className="text-slate-600 font-bold">[03:51:33]</span> <span className="text-violet-400">INFO:</span> Initialised client-side tensor core structures inside IndexedDB sandbox weights.</div>
            <div><span className="text-slate-600 font-bold">[03:52:05]</span> <span className="text-indigo-400">INFO:</span> Mapping RAG schema coordinates over 4 virtual nodes. Spatial similarity set.</div>
            <div><span className="text-slate-600 font-bold">[03:53:16]</span> <span className="text-emerald-400">SUCCESS:</span> Sandbox virtual compilation succeeded within 450ms. Listening secure message.</div>
            <div><span className="text-slate-600 font-bold">[03:54:55]</span> <span className="text-indigo-400">INFO:</span> Connected multi-worker thread for hardware acceleration logging diagnostics.</div>
          </div>
        </div>

      </section>

      {/* Optimizers parameter controls (Right Side panels) */}
      <section className="w-80 border-l border-slate-950 bg-slate-950/70 p-6 flex flex-col h-full space-y-6 shrink-0 select-none">
        
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold mb-1">TUNER LAYER</div>
          <h2 className="text-xs font-semibold text-slate-300">In-App Hardware Optimizers</h2>
        </div>

        {/* Caching & Optimizer switches */}
        <div className="space-y-4">
          
          {/* Item 1: Hardware Acceleration toggle */}
          <div className="flex justify-between items-start bg-slate-900/60 border border-slate-850 p-3 rounded-xl transition hover:border-violet-600/20">
            <div className="space-y-1 pr-4 text-left">
              <div className="text-xs font-bold text-slate-200">GPU WebGL Tensors</div>
              <p className="text-[10px] text-slate-500 leading-normal">Bypasses CPU processing pipeline layers to load parameters straight into Vulkan core caches.</p>
            </div>
            <button 
              onClick={() => setGpuAcceleration(!gpuAcceleration)}
              className="p-1 shrink-0 text-slate-400 hover:text-white transition"
            >
              {gpuAcceleration ? <ToggleRight className="h-6 w-6 text-violet-400" /> : <ToggleLeft className="h-6 w-6 text-slate-600" />}
            </button>
          </div>

          {/* Item 2: Quantized cache toggle */}
          <div className="flex justify-between items-start bg-slate-900/60 border border-slate-850 p-3 rounded-xl transition hover:border-violet-600/20">
            <div className="space-y-1 pr-4 text-left">
              <div className="text-xs font-bold text-slate-200">INT4 Weight Compression</div>
              <p className="text-[10px] text-slate-500 leading-normal">Optimizes standard FP16 weight values down to 4-bit quantization ranges inside IndexedDB storage.</p>
            </div>
            <button 
              onClick={() => setQuantizedCaching(!quantizedCaching)}
              className="p-1 shrink-0 text-slate-400 hover:text-white transition"
            >
              {quantizedCaching ? <ToggleRight className="h-6 w-6 text-violet-400" /> : <ToggleLeft className="h-6 w-6 text-slate-600" />}
            </button>
          </div>

          {/* Item 3: Active garbage cleaner button */}
          <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-3">
            <div className="text-left space-y-1">
              <div className="text-xs font-bold text-slate-200">Tensor Memory Purge</div>
              <p className="text-[10px] text-slate-500 leading-normal">Force dispatches localized garbage collector algorithms to wipe idle coordinates, freeing browser VRAM allocations.</p>
            </div>

            <button
              onClick={runGarbageCollector}
              disabled={gcStatus === 'running'}
              className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-violet-650 rounded-xl text-xs font-mono font-semibold transition text-slate-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              {gcStatus === 'running' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-violet-400" />
                  <span>Purging coordinates...</span>
                </>
              ) : gcStatus === 'success' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Memory Purged</span>
                </>
              ) : (
                <span>Wipe Idle Coordinates</span>
              )}
            </button>
          </div>

        </div>

        {/* Security Sandboxing confirmation box */}
        <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-3 text-left">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Sandbox Isolation Active</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All virtual script callbacks inside the **Developer Sandbox** execution flow execute with zero browser token exposure alerts. Local storage indexes remain safe inside your private hardware bounds.
          </p>
        </div>

      </section>

    </div>
  );
}
