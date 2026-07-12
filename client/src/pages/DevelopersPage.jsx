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

const STORAGE_KEY = 'kyy-playground-api-key';

const METHOD_STYLES = {
  GET: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  POST: 'bg-brand/15 text-brand-light border-brand/30',
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

function EndpointCard({ endpoint, apiKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const showToast = useToast();
  const methodStyle = METHOD_STYLES[endpoint.method] || METHOD_STYLES.GET;

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
    <div className="card-surface overflow-hidden">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left group"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono-ui px-2 py-0.5 rounded border uppercase tracking-wide ${methodStyle}`}>
              {endpoint.method}
            </span>
            <span className="font-mono-ui text-sm text-zinc-200 truncate">/api/v1{endpoint.path}</span>
            {endpoint.cached && (
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <IconClock className="w-3 h-3" /> cached
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm mt-1.5">{endpoint.description}</p>
        </div>
        <span className="text-zinc-500 text-xs shrink-0 group-hover:text-brand-light transition-colors">
          {isOpen ? 'Close' : 'Try it'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-5 space-y-4">
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
                    className="w-full rounded-lg border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              ))}

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRun}
                  disabled={isRunning}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <IconPlay className="w-3.5 h-3.5" /> {isRunning ? 'Running.' : 'Run'}
                </motion.button>
                <button
                  onClick={copyAsCurl}
                  className="text-xs text-zinc-500 hover:text-brand-light flex items-center gap-1.5"
                >
                  <IconCopy className="w-3.5 h-3.5" /> Copy as curl
                </button>
              </div>

              {result && (
                <div className="terminal-mockup overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                    <span className="w-2 h-2 rounded-full bg-red-500/70" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                    <span className="w-2 h-2 rounded-full bg-green-500/70" />
                    <span className="ml-2 text-[11px] text-zinc-500 font-mono-ui">
                      response — {result.status || (result.ok ? 200 : 'error')}
                    </span>
                    {result.rateLimit?.remaining !== null && result.rateLimit?.remaining !== undefined && (
                      <span className="ml-auto text-[10px] text-zinc-600 font-mono-ui">
                        {result.rateLimit.remaining}/{result.rateLimit.limit} requests left
                      </span>
                    )}
                  </div>
                  <div className="p-4 font-mono-ui text-xs">
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
                          className="inline-flex items-center gap-1.5 text-brand-light text-xs"
                        >
                          <IconDownload className="w-3.5 h-3.5" /> Download response
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
        )}
      </AnimatePresence>
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

  const filteredEndpoints = useMemo(() => {
    const q = query.trim().toLowerCase();
    return endpoints.filter((endpoint) => {
      const matchesCategory = activeCategory === 'all' || categoryOf(endpoint) === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        endpoint.title?.toLowerCase().includes(q) ||
        endpoint.description?.toLowerCase().includes(q) ||
        endpoint.path.toLowerCase().includes(q)
      );
    });
  }, [endpoints, query, activeCategory]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light">
          <IconTerminal className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-semibold text-zinc-50 font-display">API Playground</h1>
      </div>
      <p className="text-zinc-400 mb-8">
        Test the public /api/v1 endpoints directly from your browser. Paste your API key below —
        it's kept in this browser tab only and never sent anywhere except in requests you trigger here.
      </p>

      <div className="card-surface p-5 mb-8">
        <label className="text-sm text-zinc-400 mb-2 block">Your API Key</label>
        <div className="relative">
          <input
            type={isKeyVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={(event) => handleKeyChange(event.target.value)}
            placeholder="kyy_xxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-lg border border-zinc-800 bg-transparent pl-3 pr-10 py-2.5 text-sm font-mono-ui text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            onClick={() => setIsKeyVisible((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {isKeyVisible ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Don't have a key yet? Reach out to the site owner to have one issued for your scopes.
        </p>
      </div>

      {/* Search + category toolbar */}
      <div className="sticky top-16 z-10 -mx-6 px-6 py-3 mb-6 bg-zinc-950/70 backdrop-blur-md border-y border-white/5">
        <div className="relative mb-3">
          <IconSearch className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search endpoints by name, path, or description."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === category
                  ? 'bg-brand text-zinc-950 border-brand font-medium'
                  : 'border-zinc-800 text-zinc-400 hover:border-brand/40 hover:text-brand-light'
              }`}
            >
              {category === 'all' ? 'All' : categoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <p className="text-red-400 mb-6">{errorMessage}</p>}

      {isLoading ? (
        <p className="text-zinc-400">Loading endpoints.</p>
      ) : filteredEndpoints.length === 0 ? (
        <div className="card-surface p-8 text-center text-zinc-500 text-sm">
          No endpoints match "{query}"{activeCategory !== 'all' ? ` in ${categoryLabel(activeCategory)}` : ''}.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEndpoints.map((endpoint) => (
            <EndpointCard key={endpoint.path} endpoint={endpoint} apiKey={apiKey} />
          ))}
        </div>
      )}
    </main>
  );
}
