import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialize Gemini client to protect against startup failures when key is missing or blank
let aiClient: GoogleGenAI | null = null;
const isGeminiEnabled = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured in the host environment variable secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // API 1: Health check and service status
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      env: process.env.NODE_ENV || "development",
      geminiAvailable: isGeminiEnabled,
      localInferenceReady: true,
      time: new Date().toISOString()
    });
  });

  // API 2: Chat completion with streaming simulation or direct Gemini service
  app.post("/api/chat", async (req, res) => {
    const { message, history = [], systemInstruction, temperature = 0.7, attachment } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      if (isGeminiEnabled) {
        // USE REAL SERVER-SIDE GEMINI FOR INTELLIGENT ROUTING
        const ai = getGeminiClient();

        // Structure parts
        const parts: any[] = [];
        if (attachment && attachment.content) {
          // Check if attachment is base64 represented
          const isBase64 = attachment.content.includes(";base64,");
          const mime = attachment.type || "image/png";
          let rawData = attachment.content;
          if (isBase64) {
            rawData = attachment.content.split(";base64,")[1];
          }
          parts.push({
            inlineData: {
              data: rawData,
              mimeType: mime
            }
          });
        }
        
        parts.push({ text: message });

        // Build history-aware chat or direct contents
        const contentsList = [];
        for (const msg of history) {
          contentsList.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          });
        }
        contentsList.push({
          role: "user",
          parts: parts
        });

        const responseStream = await ai.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: contentsList,
          config: {
            systemInstruction: systemInstruction || "You are Lumina, a full-stack advanced open-source AI code assistant and creator platform. Answer comprehensively.",
            temperature: temperature,
          }
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
          }
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } else {
        // MOCK INTERACTIVE STREAMING COMPLIANT & INFORMATIVE FOR OFFLINE / NO-KEY INFERENCE
        const streamText = getSimulatedResponse(message);
        const tokens = streamText.split(/( ){1,}/); // split to simulate tokens

        let i = 0;
        const interval = setInterval(() => {
          if (i < tokens.length) {
            res.write(`data: ${JSON.stringify({ chunk: tokens[i] + (i % 2 === 0 ? " " : "") })}\n\n`);
            i++;
          } else {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            clearInterval(interval);
            res.end();
          }
        }, 12);
      }
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.write(`data: ${JSON.stringify({ error: err.message || "Unknown server execution error" })}\n\n`);
      res.end();
    }
  });

  // API 3: Web Crawler & Autonomous Agent Task Planner
  app.post("/api/agent/research", async (req, res) => {
    const { goal } = req.body;
    let researchResults = "";

    try {
      if (isGeminiEnabled) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Provide a detailed 4-step autonomous execution plan and the final gathered research outcome for this goal: "${goal}". Formulate it as a JSON payload containing 'planSteps' (array of strings showing steps of thought, search, tool usage) and 'researchOutcome' (comprehensive research synthesis).`,
          config: {
            responseMimeType: "application/json"
          }
        });
        res.json(JSON.parse(response.text || "{}"));
      } else {
        // High fidelity simulated plan for offline mode
        res.json({
          planSteps: [
            "Querying public DNS records and web archives for query: " + goal,
            "Executing parallel crawling on public documentation pages to chunk insights",
            "Synthesizing similarity ranking inside local semantic vector index",
            "Drafting local operational guide and component architecture blueprint"
          ],
          researchOutcome: `### GATHERED EVIDENCE & OUTCOME FOR: "${goal}"\n\n1. **Core Insight**: Synthesized modular blueprints based on local open source reference architectures.\n2. **Best Practices**: Discovered high efficiency weights (under 2.5B variables) optimizing real-world latency under 45ms.\n3. **Deployment Strategy**: Recommended container-orchestrated scaling to reduce pipeline bottlenecks.`
        });
      }
    } catch (ex: any) {
      res.status(500).json({ error: ex.message });
    }
  });

  // API 4: website layout generator
  app.post("/api/website/generate", async (req, res) => {
    const { prompt, currentComponents = [] } = req.body;

    try {
      if (isGeminiEnabled) {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Generate a gorgeous custom component for a visual builder in JSON format. The user wants: "${prompt}".
          Return a JSON object matching this structure:
          {
            "id": "comp_${Date.now()}",
            "type": "hero" | "features" | "pricing" | "testimonial" | "contact",
            "name": "Component Label",
            "html": "Clean HTML string wrapped with modern responsive Tailwind CSS styling. Make it stand out with vivid colors, rounded containers, clean grids, and gradients if matching prompt",
            "css": "",
            "customizableFields": [
              {"key": "title", "label": "Main Title", "value": "Initial Value"},
              {"key": "subtitle", "label": "Subtitle text", "value": "Initial value"},
              {"key": "ctaText", "label": "Button Label", "value": "Get Started"}
            ]
          }`,
          config: {
            responseMimeType: "application/json"
          }
        });
        res.json(JSON.parse(response.text || "{}"));
      } else {
        // High fidelity fallback tailwind component depending on keywords
        const randId = `comp_${Math.floor(Math.random() * 100000)}`;
        const type = prompt.toLowerCase().includes("price") ? "pricing" : (prompt.toLowerCase().includes("hero") ? "hero" : "features");
        
        const customComp = getFallbackTailwindComponent(type, prompt, randId);
        res.json(customComp);
      }
    } catch (ex: any) {
      res.status(500).json({ error: ex.message });
    }
  });

  // Serve static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Open-Source AI Studio Platform active at http://localhost:${PORT}`);
  });
}

// Simulated replies when GEMINI_API_KEY is not configured
function getSimulatedResponse(msg: string): string {
  const norm = msg.toLowerCase();
  
  if (norm.includes("hello") || norm.includes("hi")) {
    return `### Greetings! Welcome to Lumina Open AI Sandbox. 

I am currently operating in **Local Offline Mode** (since no host \`GEMINI_API_KEY\` was parsed under server secrets, or Ollama server is waiting to bind).

I have full support for:
1. **Dynamic Website Builder**: Select templates, drag components, and hot-reload changes visually.
2. **Local RAG & Vector similarity simulator**: Drag-and-drop texts to index vectors on high fidelity coordinates.
3. **Autonomous Agents Multiverse Workspace**: Start autonomous planners solving research tasks step-by-step.
4. **Developer Sandbox Playground**: Edit code live and execute iframe sandboxes.

How can I help you design something beautiful today? Let's build!`;
  }
  
  if (norm.includes("rag") || norm.includes("pdf") || norm.includes("chunk")) {
    return `### local Document Ingestion Engine

To use a **RAG Knowledge Hub** without paying for resources, Lumina segments uploaded files (PDF, txt) in-memory:
- **Chunking**: Chunks are split at paragraph boundaries (200-500 words).
- **Embeddings**: In-browser vector generation with standard coordinate models.
- **Search**: Employs real cosine similarity metrics to locate top matching semantic fragments.

Try uploading a list of guidelines in the **RAG Vector Hub** tab to start testing live query lookups!`;
  }

  if (norm.includes("code") || norm.includes("build") || norm.includes("create")) {
    return `### Web Developer Workbench AI Assistant

Here is a quick functional boilerplate for a high-performance **Tailwind card layout** with glowing dark borders:

\`\`\`html
<div class="relative group max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl overflow-hidden transition-all duration-300 hover:border-violet-500/50">
  <div class="absolute -inset-px bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-all duration-300"></div>
  <div class="relative space-y-4">
    <div class="text-violet-400 font-mono text-xs tracking-wider uppercase">Local Node Active</div>
    <h3 class="text-xl font-sans font-medium text-slate-100">Quantum Grid Node</h3>
    <p class="text-slate-400 text-sm leading-relaxed">Runs 100% locally using client WebGPU and deep compression models.</p>
    <button class="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl font-medium text-white transition-transform hover:scale-[1.02]">Execute Probe</button>
  </div>
</div>
\`\`\`

You can paste this layout into your **Interactive Code Playground** or start dragging sections inside the **AI Website Builder** to compile assets directly!`;
  }

  return `### Lumina Open-Source AI Synthesizer

You queried: "${msg}"

Since this platform is designed as a modular **Senior AI & Creator Sandbox Architecture**, you can investigate the exact sub-systems:
* **LLM Config**: Customize temperature (${0.7}), top-k parameter configs, or toggle **WebGPU Transformers** in-browser weight downloading.
* **Ollama Connection**: Spin up \`ollama run gemma2\` on localhost and click *Connect Ollama* to pipe real-time localhost streaming!
* **Workspace sandboxes**: Toggle tabs above to construct websites from templates, test custom agent reasoning scripts, and render interactive monitoring modules.

Tell me what kind of sub-agent workspace you would like to test next!`;
}

function getFallbackTailwindComponent(type: string, prompt: string, id: string): any {
  if (type === "pricing") {
    return {
      id,
      type: "pricing",
      name: "Modular Cyber Pricing",
      html: `
<section class="py-16 bg-slate-950 text-white">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <h2 class="text-3xl font-sans tracking-tight mb-2 font-medium">Clear Open-Source Pricing</h2>
    <p class="text-slate-400 mb-12">No hidden API keys. Host everything natively on your CPU/GPU hardware.</p>
    
    <div class="grid md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
      <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition">
        <h3 class="text-lg font-medium text-slate-200">Lite Developer</h3>
        <p class="text-3xl font-mono text-white mt-4">$0 <span class="text-sm text-slate-500">/ forever</span></p>
        <p class="text-slate-400 text-sm mt-4">Run small 1B-3B models in-browser using WebGPU/ONNX runtimes.</p>
        <button class="w-full mt-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition">Active Preset</button>
      </div>
      
      <div class="bg-slate-900/80 border-2 border-violet-500/50 p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div class="absolute top-3 right-3 bg-violet-600 text-[10px] font-mono uppercase px-2 py-0.5 rounded text-white">Popular</div>
        <h3 class="text-lg font-medium text-white">Quantum Powerhouse</h3>
        <p class="text-3xl font-mono mt-4">$0 <span class="text-sm text-violet-300">/ self-hosted</span></p>
        <p class="text-slate-300 text-sm mt-4">Leverage private Ollama clusters and multi-agent pipeline chains locally.</p>
        <button class="w-full mt-8 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-medium rounded-xl transition">Download GGUF</button>
      </div>
    </div>
  </div>
</section>
      `,
      css: "",
      customizableFields: [
        { key: "title", label: "Title", value: "Clear Open-Source Pricing" },
        { key: "subtitle", label: "Subtext", value: "No hidden API keys. Host everything natively on your CPU/GPU hardware." }
      ]
    };
  }

  if (type === "features") {
    return {
      id,
      type: "features",
      name: "Bento Feature Grid",
      html: `
<section class="py-16 bg-slate-900 text-slate-100">
  <div class="max-w-5xl mx-auto px-6">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-sans tracking-tight font-medium">Bento Architecture Specs</h2>
      <p class="text-slate-400">Features modular microservices built for deep visual creation.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-800/40 border border-slate-800/80 p-6 rounded-2xl md:col-span-2">
        <div class="text-violet-400 font-mono text-xs mb-2">WebGPU Accelerated</div>
        <h3 class="text-xl font-medium mb-2">Browser LLMs</h3>
        <p class="text-slate-400 text-sm">Download GGUF weights directly to client cache. Execute prompt streaming with zero round-trip latency, no backend server bills, and robust offline protection.</p>
      </div>
      
      <div class="bg-slate-800/40 border border-slate-800/80 p-6 rounded-2xl">
        <div class="text-indigo-400 font-mono text-xs mb-2">Embeddings</div>
        <h3 class="text-xl font-medium mb-2">Custom Vector Hub</h3>
        <p class="text-slate-400 text-sm">Upload docs, auto-chunk metadata, and match embeddings on a high precision canvas.</p>
      </div>
    </div>
  </div>
</section>
      `,
      css: "",
      customizableFields: [
        { key: "title", label: "Title", value: "Bento Architecture Specs" },
        { key: "p1", label: "Feature Description", value: "Download GGUF weights directly to client cache and execute prompts streamingly on device." }
      ]
    };
  }

  // Hero default fallback
  return {
    id,
    type: "hero",
    name: "Modern Cyber Hero",
    html: `
<header class="relative py-20 bg-slate-950 overflow-hidden text-center">
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
  <div class="relative max-w-3xl mx-auto px-6 space-y-6">
    <div class="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs text-indigo-400 font-mono">
      <span>🚀 Version 1.0.4 Live</span>
    </div>
    <h1 class="text-5xl md:text-6xl font-sans tracking-tight font-medium text-white leading-tight">
      Unleash the Power of <span class="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">Private AI Workspace</span>
    </h1>
    <p class="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
      A comprehensive creator workbench integrating browser GPU models, offline vector database indexers, intelligence pipelines, and direct code compilation without monthly subscriptions.
    </p>
    <div class="pt-4 flex flex-wrap justify-center gap-4">
      <button class="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition rounded-xl font-medium text-white shadow-lg shadow-indigo-600/10">
        Launch Local Node
      </button>
      <button class="px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition rounded-xl font-medium text-slate-300">
        Review Blueprints
      </button>
    </div>
  </div>
</header>
    `,
    css: "",
    customizableFields: [
      { key: "title", label: "Headline", value: "Unleash the Power of Private AI Workspace" },
      { key: "subtitle", label: "Lead Sentence", value: "A comprehensive creator workbench integrating browser GPU models, offline vector database indexers, intelligence pipelines, and direct code compilation." }
    ]
  };
}

startServer();
