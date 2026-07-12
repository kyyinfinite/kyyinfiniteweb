import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, runPlaygroundRequest } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  IconTerminal,
  IconPlay,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconClock,
  IconDownload,
  IconSearch,
} from '../lib/icons.jsx';

// Tambahan Icon Close untuk Modal
function IconX({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

const STORAGE_KEY = 'kyy-playground-api-key';

const METHOD_STYLES = {
  GET: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  POST: 'bg-blue-500/15 text-blue-300 border-blue-500/30', // Disesuaikan dengan tema biru
  PUT: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  DELETE: 'bg-red-500/15 text-red-300 border-red-500/30',
};

function categoryOf(endpoint) {
  if (endpoint.category) return endpoint.category;
  const segment = endpoint.path.split('/').filter(Boolean)[0];
  return segment || 'other';
}

function categoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// 1. Komponen Card yang lebih simpel (hanya untuk trigger modal)
function EndpointCard({ endpoint, onOpen }) {
  const methodStyle = METHOD_STYLES[endpoint.method] || METHOD_STYLES.GET;

  return (
    <button
      onClick={() => onOpen(endpoint)}
      className="w-full card-surface p-4 flex items-center justify-between gap-4 text-left group hover:border-brand/40 hover:bg-zinc-900/50 transition-all"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-mono-ui px-2 py-0.5 rounded border uppercase tracking-wide ${methodStyle}`}>
            {endpoint.method}
          </span>
          <span className="font-mono-ui text-sm text-zinc-200 truncate group-hover:text-brand-light transition-colors">
            /api/v1{endpoint.path}
          </span>
          {endpoint.cached && (
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <IconClock className="w-3 h-3" /> cached
            </span>
          )}
        </div>
        <p className="text-zinc-400 text-sm mt-1.5 truncate">{endpoint.description}</p>
      </div>
      <span className="hidden md:block text-[10px] font-mono-ui text-brand-light/0 group-hover:text-brand-light/70 transition-colors border border-brand/0 group-hover:border-brand/30 px-2 py-1 rounded">
        Execute
      </span>
    </button>
  );
}

// 2. Komponen Modal Glassmorphism Baru
function EndpointModal({ endpoint, apiKey, onClose }) {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const showToast = useToast();
  const methodStyle = METHOD_STYLES[endpoint.method] || METHOD_STYLES.GET;

  // Tutup modal jika user menekan tombol Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  async function handleRun() {
    setIsRunning(true);
    setResult(null);
    try {
      const response = await runPlaygroundRequest(endpoint.path, values, apiKey);
      setResult(response);
    } catch (error) {
      setResult({ ok: false, kind: 'json', data: { message: error.message } });
    } finally {
      setIsRunning(false);
    }
  }

  function copyAsCurl() {
    const query = Object.entries(values)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const curl = `curl "https://kyyinfinite.my.id/api/v1${endpoint.path}${query ? `?${query}` : ''}" \\\n  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}"`;
    navigator.clipboard.writeText(curl);
    showToast('curl command copied', { type: 'success' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop Gelap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
      />

      {/* Modal Container (Glassmorphism Biru) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-zinc-950/70 backdrop-blur-2xl border border-brand/30 shadow-[0_0_40px_rgba(var(--brand-rgb),0.15)] rounded-2xl overflow-hidden"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono-ui px-2 py-0.5 rounded border uppercase tracking-wide ${methodStyle}`}>
              {endpoint.method}
            </span>
            <span className="font-mono-ui text-sm text-zinc-100">/api/v1{endpoint.path}</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg">
            <IconX />
          </button>
        </div>

        {/* Body Modal (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-zinc-400 text-sm">{endpoint.description}</p>

          {/* Form Parameter */}
          {endpoint.params?.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Parameters</h4>
              {endpoint.params.map((param) => (
                <div key={param.name}>
                  <label className="text-xs text-zinc-400 mb-1.5 block">
                    {param.name}
                    {param.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    value={values[param.name] || ''}
                    onChange={(event) => setValues((prev) => ({ ...prev, [param.name]: event.target.value }))}
                    placeholder={param.description || param.name}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/50 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRun}
              disabled={isRunning}
              className="btn-primary text-sm flex items-center gap-2 px-6 py-2 shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)]"
            >
              <IconPlay className="w-3.5 h-3.5" /> {isRunning ? 'Executing...' : 'Execute Request'}
            </motion.button>
            <button
              onClick={copyAsCurl}
              className="text-xs text-zinc-400 hover:text-brand-light flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <IconCopy className="w-3.5 h-3.5" /> Copy as curl
            </button>
          </div>

          {/* Response Terminal */}
          {result && (
            <div className="terminal-mockup overflow-hidden mt-6 border border-brand/20 shadow-lg">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 border-b border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="ml-2 text-[11px] text-zinc-400 font-mono-ui">
                  status: {result.status || (result.ok ? 200 : 'error')}
                </span>
                {result.rateLimit?.remaining !== null && result.rateLimit?.remaining !== undefined && (
                  <span className="ml-auto text-[10px] text-zinc-500 font-mono-ui">
                    {result.rateLimit.remaining}/{result.rateLimit.limit} req left
                  </span>
                )}
              </div>
              <div className="p-4 font-mono-ui text-xs bg-zinc-950/90 max-h-[300px] overflow-y-auto">
                {result.kind === 'binary' ? (
                  <div className="space-y-3">
                    {result.contentType?.startsWith('image/') && (
                      <img src={result.blobUrl} alt="Response preview" className="max-w-full rounded-lg border border-white/10" />
                    )}
                    {result.contentType?.startsWith('video/') && (
                      <video src={result.blobUrl} controls className="max-w-full rounded-lg border border-white/10" />
                    )}
                    <a
                      href={result.blobUrl}
                      download
                      className="inline-flex items-center gap-1.5 text-brand-light text-xs bg-brand/10 px-3 py-1.5 rounded border border-brand/20 hover:bg-brand/20"
                    >
                      <IconDownload className="w-3.5 h-3.5" /> Download Media
                    </a>
                  </div>
                ) : (
                  <pre className="text-zinc-300 whitespace-pre-wrap break-words">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function DevelopersPage() {
  const [endpoints, setEndpoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // State untuk mengontrol modal mana yang terbuka
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setApiKey(stored);

    api
      .listApiEndpoints()
      .then((response) => setEndpoints(response.endpoints))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  function handleKeyChange(value) {
    setApiKey(value);
    if (value) {
      sessionStorage.setItem(STORAGE_KEY, value);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  const categories = useMemo(() => {
    const set = new Set(endpoints.map((endpoint) => categoryOf(endpoint)));
    return ['all', ...Array.from(set).sort()];
  }, [endpoints]);

  // 3. Logic untuk filter DAN grouping endpoints
  const groupedEndpoints = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // Filter terlebih dahulu
    const filtered = endpoints.filter((endpoint) => {
      const matchesCategory = activeCategory === 'all' || categoryOf(endpoint) === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        endpoint.title?.toLowerCase().includes(q) ||
        endpoint.description?.toLowerCase().includes(q) ||
        endpoint.path.toLowerCase().includes(q)
      );
    });

    // Grouping berdasarkan kategori
    const groups = {};
    filtered.forEach(endpoint => {
      const cat = categoryOf(endpoint);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(endpoint);
    });

    return groups;
  }, [endpoints, query, activeCategory]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      {/* Header Info - Tetap Sama */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light shadow-[0_0_15px_rgba(var(--brand-rgb),0.2)]">
          <IconTerminal className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-semibold text-zinc-50 font-display">API Playground</h1>
      </div>
      <p className="text-zinc-400 mb-8">
        Test the public /api/v1 endpoints directly from your browser. Paste your API key below —
        it's kept in this browser tab only and never sent anywhere except in requests you trigger here.
      </p>

      {/* API Key Input */}
      <div className="card-surface p-5 mb-8 border border-zinc-800/80">
        <label className="text-sm text-zinc-400 mb-2 block">Your API Key</label>
        <div className="relative">
          <input
            type={isKeyVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={(event) => handleKeyChange(event.target.value)}
            placeholder="kyy_xxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 pl-3 pr-10 py-2.5 text-sm font-mono-ui text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/50 transition-all"
          />
          <button
            type="button"
            onClick={() => setIsKeyVisible((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {isKeyVisible ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search & Categories Toolbar */}
      <div className="sticky top-16 z-10 -mx-6 px-6 py-3 mb-6 bg-zinc-950/70 backdrop-blur-md border-y border-white/5">
        <div className="relative mb-3">
          <IconSearch className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search endpoints by name, path, or description."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === category
                  ? 'bg-brand/20 text-brand-light border-brand/50 font-medium shadow-[0_0_10px_rgba(var(--brand-rgb),0.2)]'
                  : 'border-zinc-800 text-zinc-400 hover:border-brand/40 hover:text-brand-light hover:bg-brand/5'
              }`}
            >
              {category === 'all' ? 'All' : categoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <p className="text-red-400 mb-6 bg-red-500/10 p-4 rounded-lg border border-red-500/20">{errorMessage}</p>}

      {isLoading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
        </div>
      ) : Object.keys(groupedEndpoints).length === 0 ? (
        <div className="card-surface p-8 text-center text-zinc-500 text-sm">
          No endpoints match "{query}"{activeCategory !== 'all' ? ` in ${categoryLabel(activeCategory)}` : ''}.
        </div>
      ) : (
        <div className="space-y-10">
          {/* Render Endpoint berdasarkan Group Kategori */}
          {Object.entries(groupedEndpoints).map(([category, eps]) => (
            <div key={category} className="space-y-4">
              
              {/* Divider Kategori UI/UX */}
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-zinc-200 capitalize tracking-wide">
                  {category}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-brand/40 to-transparent" />
              </div>
              
              {/* List Card Endpoint */}
              <div className="grid grid-cols-1 gap-3">
                {eps.map((endpoint) => (
                  <EndpointCard 
                    key={endpoint.path} 
                    endpoint={endpoint} 
                    onOpen={setSelectedEndpoint} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Modal secara Dinamis */}
      <AnimatePresence>
        {selectedEndpoint && (
          <EndpointModal
            endpoint={selectedEndpoint}
            apiKey={apiKey}
            onClose={() => setSelectedEndpoint(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
