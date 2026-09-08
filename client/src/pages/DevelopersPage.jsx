import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  IconClose,
  IconArrowRight,
  IconSearch,
} from '../lib/icons.jsx';

const STORAGE_KEY = 'kyy-playground-api-key';

const CATEGORY_LABELS = {
  search: 'Search',
  maker: 'Maker',
  downloader: 'Downloader',
  ai: 'AI',
  anime: 'Anime',
  stalker: 'Profile Lookup',
  info: 'Info',
  news: 'News',
  primbon: 'Primbon',
  random: 'Random',
  tools: 'Utility',
};

function categoryOf(endpoint) {
  const segment = endpoint.path.split('/').filter(Boolean)[0];
  return segment || 'other';
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

const METHOD_TONES = {
  GET: 'bg-indigo-soft text-indigo-dark',
  POST: 'bg-clover-soft text-clover',
  DELETE: 'bg-rust-soft text-rust',
};

function MethodBadge({ method }) {
  return (
    <span className={`text-[10px] font-mono-ui px-2 py-0.5 rounded uppercase font-medium shrink-0 ${METHOD_TONES[method] || 'bg-paper-soft text-slate'}`}>
      {method}
    </span>
  );
}

function EndpointTestModal({ endpoint, apiKey, onClose }) {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const showToast = useToast();

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(event) => event.stopPropagation()}
        className="glass-panel w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-line sticky top-0 bg-paper rounded-t-[20px]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <MethodBadge method={endpoint.method} />
              <span className="font-mono-ui text-sm text-ink truncate">/api/v1{endpoint.path}</span>
            </div>
            <p className="text-slate text-sm mt-1.5">{endpoint.description}</p>
          </div>
          <button onClick={onClose} className="text-slate hover:text-ink shrink-0">
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {endpoint.params.map((param) => (
            <div key={param.name}>
              <label className="text-xs text-slate mb-1.5 block">
                {param.name}
                {param.required && <span className="text-rust ml-1">*</span>}
              </label>
              <input
                value={values[param.name] || ''}
                onChange={(event) => setValues((prev) => ({ ...prev, [param.name]: event.target.value }))}
                placeholder={param.description || param.name}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo"
              />
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button onClick={handleRun} disabled={isRunning} className="btn-primary text-sm flex items-center gap-2">
              <IconPlay className="w-3.5 h-3.5" /> {isRunning ? 'Running…' : 'Run'}
            </button>
            <button onClick={copyAsCurl} className="text-xs text-slate hover:text-indigo flex items-center gap-1.5">
              <IconCopy className="w-3.5 h-3.5" /> Copy as curl
            </button>
          </div>

          {result && (
            <div className="terminal-mockup overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line">
                <span className="text-[11px] text-slate font-mono-ui">
                  Response · {result.status || (result.ok ? 200 : 'error')}
                </span>
                {result.rateLimit?.remaining !== null && result.rateLimit?.remaining !== undefined && (
                  <span className="ml-auto text-[10px] text-mist font-mono-ui">
                    {result.rateLimit.remaining}/{result.rateLimit.limit} left
                  </span>
                )}
              </div>
              <div className="p-4 font-mono-ui text-xs">
                {result.kind === 'binary' ? (
                  <div className="space-y-3">
                    {result.contentType?.startsWith('image/') && (
                      <img src={result.blobUrl} alt="Response preview" className="max-w-full rounded-lg border border-line" />
                    )}
                    {result.contentType?.startsWith('video/') && (
                      <video src={result.blobUrl} controls className="max-w-full rounded-lg border border-line" />
                    )}
                    <a href={result.blobUrl} download className="inline-flex items-center gap-1.5 text-indigo-dark text-xs">
                      <IconDownload className="w-3.5 h-3.5" /> Download response
                    </a>
                  </div>
                ) : (
                  <pre className="text-ink whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EndpointRow({ endpoint, onTry }) {
  return (
    <button
      onClick={() => onTry(endpoint)}
      className="w-full card-surface p-4 flex items-center justify-between gap-4 text-left"
    >
      <div className="min-w-0 flex items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <div className="min-w-0">
          <p className="font-mono-ui text-sm text-ink truncate">/api/v1{endpoint.path}</p>
          <p className="text-slate text-xs truncate mt-0.5">{endpoint.title}</p>
        </div>
        {endpoint.cached && (
          <span className="text-mist shrink-0" title="Cached">
            <IconClock className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <span className="text-indigo text-xs font-medium flex items-center gap-1 shrink-0">
        Try it <IconArrowRight className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}

export default function DevelopersPage() {
  const [endpoints, setEndpoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState(null);
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

  const groupedEndpoints = useMemo(() => {
    const groups = new Map();
    filteredEndpoints.forEach((endpoint) => {
      const category = categoryOf(endpoint);
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(endpoint);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredEndpoints]);

  return (
    <main className="theme-light max-w-3xl mx-auto px-6 py-14 min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo">
          <IconTerminal className="w-4.5 h-4.5" />
        </div>
        <h1 className="text-2xl font-semibold text-ink font-display">API playground</h1>
      </div>
      <p className="text-slate text-sm mb-6">
        Tap any endpoint to test it in a popup — your key stays in this tab only.
      </p>
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-indigo text-sm mb-6 hover:underline">
        Don't have a key? Sign in to request one <IconArrowRight className="w-3.5 h-3.5" />
      </Link>

      <div className="card-surface p-4 mb-8">
        <label className="text-xs text-slate mb-1.5 block">Your API key</label>
        <div className="relative">
          <input
            type={isKeyVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={(event) => handleKeyChange(event.target.value)}
            placeholder="kyy_xxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-md border border-line bg-paper pl-3 pr-10 py-2 text-sm font-mono-ui text-ink focus:outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo"
          />
          <button
            type="button"
            onClick={() => setIsKeyVisible((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
          >
            {isKeyVisible ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="relative mb-3">
          <IconSearch className="w-4 h-4 text-mist absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search endpoints by name, path, or description"
            className="w-full rounded-md border border-line bg-paper pl-9 pr-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                activeCategory === category
                  ? 'bg-indigo text-white border-indigo font-medium'
                  : 'border-line text-slate hover:border-indigo/40 hover:text-indigo'
              }`}
            >
              {category === 'all' ? 'All' : categoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <p className="text-rust mb-6">{errorMessage}</p>}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card-surface p-4 h-16 animate-pulse bg-paper-soft" />
          ))}
        </div>
      ) : groupedEndpoints.length === 0 ? (
        <div className="card-surface p-8 text-center text-slate text-sm">
          No endpoints match "{query}"{activeCategory !== 'all' ? ` in ${categoryLabel(activeCategory)}` : ''}.
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEndpoints.map(([category, categoryEndpoints]) => (
            <section key={category}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-mist">
                  {categoryLabel(category)}
                </h2>
                <span className="text-[10px] text-slate bg-paper-soft border border-line rounded-full px-2 py-0.5">
                  {categoryEndpoints.length}
                </span>
                <div className="h-px flex-1 bg-line" />
              </div>
              <div className="space-y-3">
                {categoryEndpoints.map((endpoint) => (
                  <EndpointRow key={endpoint.path} endpoint={endpoint} onTry={setActiveEndpoint} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <AnimatePresence>
        {activeEndpoint && (
          <EndpointTestModal
            endpoint={activeEndpoint}
            apiKey={apiKey}
            onClose={() => setActiveEndpoint(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
