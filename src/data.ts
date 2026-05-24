import { ModelPreset, SandboxFile } from './types';

export const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'gemma-2b-it',
    name: 'Gemma 2B Instruct (WebGPU)',
    size: '1.4 GB',
    type: 'Transformer',
    provider: 'Google Google',
    quantization: 'INT4 Quantized',
    speedMultiplier: 1.8,
    contextWindow: 8192
  },
  {
    id: 'llama-3-8b',
    name: 'LLaMA 3 8B (Ollama GGUF)',
    size: '4.7 GB',
    type: 'Decoder-Only',
    provider: 'Meta AI',
    quantization: 'Q4_K_M GGUF',
    speedMultiplier: 1.2,
    contextWindow: 16384
  },
  {
    id: 'mistral-7b-v0.3',
    name: 'Mistral 7B Instruct',
    size: '4.1 GB',
    type: 'Sparse-Attention',
    provider: 'Mistral AI',
    quantization: 'Q4_0 Quantized',
    speedMultiplier: 1.4,
    contextWindow: 32768
  },
  {
    id: 'deepseek-coder-1.5b',
    name: 'DeepSeek Coder 1.5B (WebAssembly)',
    size: '950 MB',
    type: 'Code-Specialist',
    provider: 'DeepSeek',
    quantization: 'INT8 Quantized',
    speedMultiplier: 2.2,
    contextWindow: 8192
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini (3.8B Lightweight)',
    size: '2.2 GB',
    type: 'SLM (Small Language Model)',
    provider: 'Microsoft',
    quantization: 'FP16 Standard',
    speedMultiplier: 1.6,
    contextWindow: 4096
  }
];

export const INITIAL_FILES: SandboxFile[] = [
  {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaS Hero Concept</title>
    <!-- Tailwind CDN for Sandboxed Playgrounds -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0b0f19;
        }
        .heading-font {
            font-family: 'Space Grotesk', sans-serif;
        }
    </style>
</head>
<body class="text-slate-100 min-h-screen relative overflow-hidden flex flex-col justify-between">
    <!-- Glow Effect -->
    <div class="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

    <header class="border-b border-slate-800/80 backdrop-blur bg-slate-950/40 sticky top-0 z-50 px-6 py-4">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="h-9 w-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">L</div>
                <span class="font-bold text-lg heading-font tracking-tight">LUMINA CONCEPTS</span>
            </div>
            <nav class="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
                <a href="#" class="hover:text-violet-400 transition">Models</a>
                <a href="#" class="hover:text-violet-400 transition">RAG Core</a>
                <a href="#" class="hover:text-violet-400 transition">Pricing</a>
                <a href="#" class="hover:text-violet-400 transition">GitHub</a>
            </nav>
            <button class="px-5 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition shadow-lg shadow-violet-600/20">Deploy Sandbox</button>
        </div>
    </header>

    <main class="max-w-4xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div class="inline-flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs text-violet-400 font-medium">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Self-Hosted Model Active</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight heading-font text-white leading-tight">
            Build Without Limits. <br>
            Run Without <span class="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">API Subscriptions</span>
        </h1>
        <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Drag templates into existence, index markdown guidelines using local embedding matrices, and trigger reasoning agents from an all-in-one terminal dashboard.
        </p>
        <div class="pt-4 flex flex-wrap justify-center gap-4">
            <button onclick="triggerAlert()" class="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 rounded-xl font-medium text-white transition-all shadow-lg shadow-indigo-600/15">
                Execute Test Script
            </button>
            <button class="px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl font-medium text-slate-300 transition">
                Explore Codebase
            </button>
        </div>
    </main>

    <footer class="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500 font-mono">
        &copy; 2026 Lumina AI. Rendered within complete browser sandbox.
    </footer>

    <script>
        function triggerAlert() {
            console.log('Testing callback connection...');
            const header = document.querySelector('h1');
            if (header) {
                header.classList.add('scale-105');
                setTimeout(() => header.classList.remove('scale-105'), 300);
            }
        }
    </script>
</body>
</html>`
  },
  {
    name: 'styles.css',
    language: 'css',
    content: `/* Custom design rules */
@keyframes pulseGlow {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.1); }
}

.glow-heavy {
  animation: pulseGlow 10s infinite ease-in-out;
}`
  },
  {
    name: 'app.js',
    language: 'javascript',
    content: `// Interactive dynamic code parameters
console.log("Local JavaScript playground compiled successfully.");
// Feel free to connect backend hooks here!`
  }
];

export const DEMO_TEMPLATES = [
  {
    id: 'tpl_saas',
    name: 'Crypto & SaaS Launchpad',
    description: 'A modern cyber slate design focused on visual conversion and deep background grids.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    components: [
      {
        id: 'comp_saas_hero',
        type: 'hero',
        name: 'SaaS Crypto Hero',
        html: `
<header class="relative py-24 bg-slate-950 text-white overflow-hidden text-center">
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
  <div class="relative max-w-4xl mx-auto px-6 space-y-6">
    <div class="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-xs text-violet-400 font-mono">
      <span>🛡️ End-to-End Encrypted Node</span>
    </div>
    <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
      Decentralized AI Intellect <br>
      <span class="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Natively in Your Hardware</span>
    </h1>
    <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
      A lightweight visual platform to generate production websites, manage embeddings, and deploy self-contained agents under a unified offline control panel.
    </p>
    <div class="pt-4 flex justify-center gap-4">
      <button class="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 transition rounded-xl font-medium text-white shadow-lg shadow-violet-600/20">
        Boot Private Engine
      </button>
      <button class="px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition rounded-xl font-medium text-slate-300">
        Read Whitepaper
      </button>
    </div>
  </div>
</header>
        `,
        css: '',
        customizableFields: [
          { key: 'title', label: 'Main Headline', value: 'Decentralized AI Intellect Natively in Your Hardware' },
          { key: 'lead', label: 'Lead Paragraph', value: 'A lightweight visual platform to generate production websites, manage embeddings, and deploy self-contained agents.' }
        ]
      },
      {
        id: 'comp_saas_features',
        type: 'features',
        name: 'Specs Bento Grid',
        html: `
<section class="py-16 bg-slate-900 text-slate-200">
  <div class="max-w-5xl mx-auto px-6">
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-slate-950/50 border border-slate-800/60 p-6 rounded-2xl space-y-3">
        <div class="h-10 w-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400">⚡</div>
        <h3 class="text-lg font-medium text-white">0ms Server Latency</h3>
        <p class="text-slate-400 text-sm">Leverages state of the art browser tensors to run inference immediately inside WebGPU RAM.</p>
      </div>
      <div class="bg-slate-950/50 border border-slate-800/60 p-6 rounded-2xl space-y-3">
        <div class="h-10 w-10 bg-fuchsia-500/10 rounded-xl flex items-center justify-center text-fuchsia-400">📂</div>
        <h3 class="text-lg font-medium text-white">Local Storage Only</h3>
        <p class="text-slate-400 text-sm">Your files, notes, metadata chunks, and chat weights remain indexed strictly in your dev sandbox.</p>
      </div>
      <div class="bg-slate-950/50 border border-slate-800/60 p-6 rounded-2xl space-y-3">
        <div class="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">🤖</div>
        <h3 class="text-lg font-medium text-white">Multi-Agent Loops</h3>
        <p class="text-slate-400 text-sm">Autonomous workers trigger actions, execute test files, and synthesize HTML structures.</p>
      </div>
    </div>
  </div>
</section>
        `,
        css: '',
        customizableFields: []
      }
    ]
  },
  {
    id: 'tpl_minimal',
    name: 'Minimalist Editorial',
    description: 'Elegant high-contrast dark-mode portfolio for writers, researchers, and engineers.',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
    components: [
      {
        id: 'comp_minimal_hero',
        type: 'hero',
        name: 'Editorial Welcome',
        html: `
<header class="py-20 bg-slate-950 text-slate-100 max-w-3xl mx-auto px-6 text-left border-l border-slate-800/80 mt-10">
  <div class="space-y-6 pl-6 md:pl-10">
    <div class="text-xs font-mono tracking-widest text-slate-400 uppercase">SYNTHESISED MINDSET //</div>
    <h1 class="text-4xl md:text-5xl font-light tracking-tight text-white font-sans">
      Building simple, reliable software <span class="text-slate-400">powered by native transformers.</span>
    </h1>
    <p class="text-slate-400 text-base max-w-xl leading-relaxed">
      This editorial canvas is compiled completely in clean HTML5 using minimal structural margins and standard default element spacing. Try changing titles on the right.
    </p>
    <div class="pt-4">
      <a href="#" class="inline-flex items-center gap-3 text-sm text-violet-400 border-b border-violet-500/20 pb-1 hover:text-violet-300 transition">
        <span>Get Offline Bundle</span>
        <span>&rarr;</span>
      </a>
    </div>
  </div>
</header>
        `,
        css: '',
        customizableFields: [
          { key: 'title', label: 'Main Headline', value: 'Building simple, reliable software powered by native transformers.' }
        ]
      }
    ]
  }
];

export const SAMPLE_DOC_CHUNKS = [
  "Lumina Platform Guideline v2.0 - Core Inference. All browser executions happen via WebGPU on active FP16 layers. No paid cloud tokens are dispatched to third party hosts.",
  "Security Audit Blueprint - Model files are verified with SHA256 signatures before being deserialized in the application sandbox. Local storage protects search inputs.",
  "RAG Vector Ingestion Rules. Documents must be stripped of HTML tags, tokenized over 256 character overlaps, and indexed inside standard spatial coordinates.",
  "Autonomous Agent Protocol: Multi-agent systems execute reasoning loops using an internal goal-stack. Agents can research online targets and produce complete HTML templates."
];
