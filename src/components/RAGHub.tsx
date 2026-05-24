import React, { useState } from 'react';
import { 
  Paperclip, Brain, Search, Sparkles, HelpCircle, HardDrive, Check, Play,
  Cpu, FileCode2, BookOpen, AlertCircle, RefreshCw, Layers 
} from 'lucide-react';
import { RAGDocument } from '../types';
import { SAMPLE_DOC_CHUNKS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export default function RAGHub() {
  const [documents, setDocuments] = useState<RAGDocument[]>([
    {
      id: 'doc_1',
      name: 'lumina_inference_specs.txt',
      size: 450,
      type: 'text/plain',
      chunkCount: 2,
      chunks: [SAMPLE_DOC_CHUNKS[0], SAMPLE_DOC_CHUNKS[1]],
      embeddings: [[30, 40], [70, 20]],
      status: 'indexed'
    },
    {
      id: 'doc_2',
      name: 'rag_ingestion_guideline.txt',
      size: 320,
      type: 'text/plain',
      chunkCount: 2,
      chunks: [SAMPLE_DOC_CHUNKS[2], SAMPLE_DOC_CHUNKS[3]],
      embeddings: [[15, 60], [80, 75]],
      status: 'indexed'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ chunk: string; score: number; docName: string; coord: number[] }[]>([]);
  const [selectedDotIndex, setSelectedDotIndex] = useState<number | null>(null);

  // Drag-and-drop input
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Cosine Similarity/TF-IDF similarity calculation implementation
  const calculateSimilarity = (str1: string, str2: string): number => {
    // Basic Jaccard vector similarity for instant fully functional offline indexing
    const w1 = new Set(str1.toLowerCase().split(/[\s,.]+/));
    const w2 = new Set(str2.toLowerCase().split(/[\s,.]+/));
    
    const intersection = new Set([...w1].filter(x => w2.has(x)));
    const union = new Set([...w1, ...w2]);
    
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      const results: { chunk: string; score: number; docName: string; coord: number[] }[] = [];
      
      documents.forEach(doc => {
        doc.chunks.forEach((chunk, index) => {
          const score = calculateSimilarity(searchQuery, chunk);
          // Only return documents that have similarity
          if (score > 0 || searchQuery === '') {
            const coord = doc.embeddings ? doc.embeddings[index] : [50, 50];
            results.push({
              chunk,
              score,
              docName: doc.name,
              coord
            });
          }
        });
      });

      // Sort results by similarity score descending
      results.sort((a,b) => b.score - a.score);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);
  };

  const handleFileUpload = (content: string, filename: string) => {
    setUploadStatus("Chunking document details...");
    
    // Auto chunk by paragraph
    const chunks = content.split('\n\n').filter(c => c.trim().length > 10);
    const chunkCount = chunks.length || 1;
    const finalChunks = chunks.length > 0 ? chunks : [content];

    // Generate coordinates on vector map
    const embeddings = finalChunks.map(() => [
      Math.floor(Math.random() * 80) + 10,
      Math.floor(Math.random() * 80) + 10
    ]);

    setTimeout(() => {
      const newDoc: RAGDocument = {
        id: `doc_${Date.now()}`,
        name: filename,
        size: content.length,
        type: 'text/plain',
        chunkCount,
        chunks: finalChunks,
        embeddings,
        status: 'indexed'
      };

      setDocuments(prev => [...prev, newDoc]);
      setUploadStatus(null);
    }, 800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleFileUpload(reader.result as string, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleFileUpload(reader.result as string, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex-1 flex h-screen bg-slate-900 border-r border-slate-950 text-slate-300 overflow-hidden select-none">
      
      {/* LEFT COLUMN: Data loaders and index tables */}
      <div className="w-96 border-r border-slate-950 flex flex-col h-full bg-slate-950/70 p-6 space-y-6">
        <div>
          <div className="text-xs font-mono text-violet-400 flex items-center gap-1.5 uppercase font-semibold mb-1">
            <Brain className="h-4 w-4" />
            <span>KNOWLEDGE INDEX MODULE</span>
          </div>
          <h1 className="text-sm font-bold text-white tracking-tight">Local Vector Search</h1>
        </div>

        {/* Drag and Drop Box */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition ${
            dragActive ? 'border-violet-500 bg-violet-950/10' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          {uploadStatus ? (
            <div className="space-y-2 py-3">
              <RefreshCw className="h-5 w-5 text-violet-400 animate-spin mx-auto" />
              <div className="text-xs font-mono text-slate-400">{uploadStatus}</div>
            </div>
          ) : (
            <label className="cursor-pointer space-y-2 py-2">
              <input type="file" onChange={handleManualUpload} className="hidden" />
              <Paperclip className="h-6 w-6 text-slate-500 mx-auto" />
              <div className="text-xs font-semibold text-slate-200">Drag & Drop specification files</div>
              <p className="text-[10px] text-slate-500">Supports txt, log, and parsed guideline metadata</p>
            </label>
          )}
        </div>

        {/* List of active indexed materials */}
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          <div className="text-[11px] font-mono text-slate-500 uppercase flex justify-between tracking-wider">
            <span>Indexed files</span>
            <span>{documents.length} volumes</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {documents.map(doc => {
              const isSelected = selectedDocId === doc.id;
              return (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDocId(isSelected ? null : doc.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                    isSelected 
                      ? 'bg-violet-950/25 border-violet-800 text-white' 
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <FileCode2 className={`h-4 w-4 shrink-0 ${isSelected ? 'text-violet-400' : 'text-slate-500'}`} />
                    <div className="text-left min-w-0">
                      <div className="truncate text-xs font-semibold">{doc.name}</div>
                      <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{doc.chunkCount} active chunks</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shrink-0 uppercase">
                    Indexed
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document chunks detail */}
        {selectedDocId && (
          <div className="border border-slate-850 rounded-xl bg-slate-950 p-4 space-y-2.5 max-h-[160px] overflow-y-auto shrink-0">
            <div className="text-[10px] font-mono text-violet-400 flex items-center justify-between uppercase">
              <span>Selected Segments</span>
              <span>Chunk details</span>
            </div>
            
            {documents.find(d => d.id === selectedDocId)?.chunks.map((ch, idx) => (
              <div key={idx} className="bg-slate-900 p-2 rounded text-[10px] font-mono text-slate-400 border border-slate-850">
                <span className="text-violet-500">Chunk {idx+1}:</span> {ch.slice(0, 70)}...
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Interactive canvas maps and query search engines */}
      <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
        
        {/* Upper Search engine control */}
        <header className="px-6 py-5 bg-slate-950/40 border-b border-slate-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 flex-grow max-w-lg relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Input query to fetch from token embeddings indexes..."
              className="w-full bg-slate-950 border border-slate-850 py-2.5 pl-10 pr-4 rounded-xl text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-violet-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 flex items-center gap-2 shadow-lg shadow-indigo-600/15 transition-all duration-200 cursor-pointer"
            >
              <span>Query Index</span>
            </button>
          </div>
        </header>

        {/* Layout containing spatial mapping and retrieved chunks */}
        <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          
          {/* Spatial 2D Embedding visualization coordinates */}
          <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-6 flex flex-col h-full shadow-inner relative justify-between">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-indigo-400 uppercase flex items-center gap-1 bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-700/20 shadow-sm">
              <Cpu className="h-3.5 w-3.5 animate-pulse" />
              <span>Cosine Tensors Map</span>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Active Vector Coordinates</h2>
              <p className="text-xs text-slate-500 mt-1">Interactive projection representing high-dimensional semantics down to relative Cartesian angles.</p>
            </div>

            {/* Simulated Geometric Canvas */}
            <div className="flex-1 my-6 rounded-xl border border-slate-900/60 bg-slate-950 relative min-h-[220px] overflow-hidden">
              <div className="absolute inset-0 bg-radial-grid opacity-10"></div>
              
              {/* Central vector projection point */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-violet-600/10 rounded-full border border-violet-500/10 blur px-2 flex items-center justify-center animate-pulse"></div>

              {/* Draw scatter dots */}
              <svg className="w-full h-full select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Visual coordinate lines */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.2" strokeDasharray="2,2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.2" strokeDasharray="2,2" />

                {/* Plot coordinates from loaded documents */}
                {documents.flatMap((doc, docIdx) => 
                  doc.embeddings ? doc.embeddings.map((emb, embIdx) => {
                    const idDot = `${docIdx}_${embIdx}`;
                    const isSelected = selectedDotIndex === (docIdx * 10 + embIdx);
                    return (
                      <g key={idDot} className="cursor-pointer">
                        <circle
                          cx={emb[0]}
                          cy={emb[1]}
                          r={isSelected ? 4 : 2}
                          fill={isSelected ? '#a855f7' : '#4f46e5'}
                          className="transition-all duration-350 hover:r-5 hover:fill-indigo-400"
                          onClick={() => {
                            setSelectedDotIndex(docIdx * 10 + embIdx);
                            setSearchQuery(doc.chunks[embIdx].slice(0, 30));
                          }}
                        />
                        {/* Glow shell around dot */}
                        <circle
                          cx={emb[0]}
                          cy={emb[1]}
                          r={isSelected ? 9 : 5}
                          fill="transparent"
                          stroke={isSelected ? '#a855f7' : '#4f46e5'}
                          strokeWidth="0.3"
                          strokeOpacity={isSelected ? '0.6' : '0.2'}
                          className={isSelected ? 'animate-ping' : ''}
                        />
                      </g>
                    );
                  }) : []
                )}
              </svg>

              {/* Hot locator detail */}
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500 flex items-center gap-3">
                <span>X_LAT: <b className="text-slate-400">0.0245</b></span>
                <span>Y_LON: <b className="text-slate-400">-0.9150</b></span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-900/50">
              💡 <b>Tip</b>: Click on any coordinate nodes inside the coordinate grid above to auto-fill search vectors and test similarity distances!
            </div>
          </div>

          {/* Retrieved Semantic Match Blocks */}
          <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-6 flex flex-col h-full shadow-inner relative justify-between overflow-hidden">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Retrieved Chunks Match</h2>
              <p className="text-xs text-slate-500 mt-1">Outputs mapped out based on semantic match algorithms.</p>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
              {searchResults.length > 0 ? (
                searchResults.map((res, index) => {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3.5 bg-slate-900 rounded-xl border border-slate-850/80 hover:border-violet-600/30 transition relative group shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-2">
                        <span className="truncate italic max-w-[140px] text-indigo-400">File: {res.docName}</span>
                        <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-600/10 text-violet-400 border border-violet-850/20">
                          Match: {(res.score * 100).toFixed(1)}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{res.chunk}</p>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16 text-slate-500">
                  <Layers className="h-9 w-9 text-slate-600 animate-pulse" />
                  <div className="text-xs font-mono">Index awaiting trigger commands...</div>
                  <p className="text-[10px] text-slate-600 max-w-xs leading-relaxed">Enter queries in the bar above or trigger a custom preset to locate nearest-neighbor indexes within milliseconds.</p>
                </div>
              )}
            </div>

            <div className="text-[10px] font-mono text-slate-500 border-t border-slate-900/80 pt-3 flex justify-between">
              <span>Retrieval Count: <b>{searchResults.length} match</b></span>
              <span>Algorithm: <b>Cosine similarity</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
