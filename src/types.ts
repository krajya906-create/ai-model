/**
 * Shared Type Definitions for Lumina Local AI Sandbox
 */

export type InferenceMode = 'webgpu' | 'ollama' | 'premium_hybrid';

export interface ModelPreset {
  id: string;
  name: string;
  size: string;
  type: string;
  provider: string;
  quantization: string;
  speedMultiplier: number; // For performance simulation / visual meter
  contextWindow: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // File string storage (Base64 or text)
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  mode?: InferenceMode;
  modelId?: string;
  reasoningSteps?: string[]; // Autonomous reasoning step logs
  tokenMetrics?: {
    promptTokens: number;
    completionTokens: number;
    firstTokenMs: number;
    tokensPerSec: number;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdTime: string;
  modelId: string;
  mode: InferenceMode;
  temperature: number;
  topK: number;
  topP: number;
}

export interface RAGDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  chunkCount: number;
  chunks: string[];
  embeddings?: number[][]; // Coordinates or mock vector components
  status: 'indexed' | 'indexing' | 'failed';
}

export interface AgentStep {
  id: string;
  agentName: string;
  status: 'planning' | 'executing' | 'reasoning' | 'completed' | 'searching' | 'writing';
  description: string;
  timestamp: string;
  output?: string;
}

export interface AgentTask {
  id: string;
  goal: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStepIndex: number;
  steps: AgentStep[];
}

export interface WebpageComponent {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'footer' | 'testimonial' | 'gallery' | 'contact';
  name: string;
  html: string;
  css: string;
  customizableFields: {
    key: string;
    label: string;
    value: string;
  }[];
}

export interface BuiltWebpage {
  id: string;
  title: string;
  description: string;
  responsiveMode: 'desktop' | 'tablet' | 'mobile';
  components: WebpageComponent[];
  publishedUrl?: string;
}

export interface SandboxFile {
  name: string;
  content: string;
  language: 'html' | 'css' | 'javascript' | 'typescript';
}

export interface PerformanceSnapshot {
  timestamp: string;
  cpuLoad: number;
  gpuLoad: number;
  vramUsed: number; // in GB
  vramTotal: number; // in GB
  tokensPerSec: number;
  latencyMs: number;
}
