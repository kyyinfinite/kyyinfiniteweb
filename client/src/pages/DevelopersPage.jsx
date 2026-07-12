import React, { useEffect, useState } from 'react';
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
} from '../lib/icons.jsx';

const STORAGE_KEY = 'kyy-playground-api-key';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(event) => event.stopPropagation()}
        className="glass-panel rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10 sticky top-0 glass-panel">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono-ui px-2 py-0.5 rounded bg-brand/15 text-brand-light uppercase">
                {endpoint.method}
              </span>
              <span className="font-mono-ui text-sm text-zinc-200 truncate">/api/v1{endpoint.path}</span>
            </div>
            <p className="text-zinc-400 text-sm mt-1.5">{endpoint.description}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 shrink-0">
            <IconClose className="w-5 h-5" />
          </button>
        </div>

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
                    {result.rateLimit.remaining}/{result.rateLimit.limit} left
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
                    <a href={result.blobUrl} download className="inline-flex items-center gap-1.5 text-brand-light text-xs">
                      <IconDownload className="w-3.5 h-3.5" /> Download response
                    </a>
                  </div>
                ) : (
                  <pre className="text-zinc-300 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
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
    <motion.button
      onClick={() => onTry(endpoint)}
      whileHover={{ x: 2 }}
      className="w-full card-surface p-4 flex items-center justify-between gap-4 text-left"
    >
      <div className="min-w-0 flex items-center gap-3">
        <span className="text-[10px] font-mono-ui px-2 py-0.5 rounded bg-brand/15 text-brand-light uppercase shrink-0">
          {endpoint.method}
        </span>
        <div className="min-w-0">
          <p className="font-mono-ui text-sm text-zinc-200 truncate">/api/v1{endpoint.path}</p>
          <p className="text-zinc-500 text-xs truncate mt-0.5">{endpoint.title}</p>
        </div>
        {endpoint.cached && (
          <span className="text-zinc-600 shrink-0" title="Cached">
            <IconClock className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <span className="text-brand-light text-xs font-medium flex items-center gap-1 shrink-0">
        Try it <IconArrowRight className="w-3.5 h-3.5" />
      </span>
    </motion.button>
  );
}

export default function DevelopersPage() {
  const [endpoints, setEndpoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState(null);

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

  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light">
          <IconTerminal className="w-4.5 h-4.5" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-50 font-display">API Playground</h1>
      </div>
      <p className="text-zinc-400 text-sm mb-6">
        Tap any endpoint to test it in a popup — your key stays in this tab only.
      </p>

      <div className="card-surface p-4 mb-8">
        <div className="relative">
          <input
            type={isKeyVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={(event) => handleKeyChange(event.target.value)}
            placeholder="kyy_xxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-lg border border-zinc-800 bg-transparent pl-3 pr-10 py-2 text-sm font-mono-ui text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
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

      {errorMessage && <p className="text-red-400 mb-6">{errorMessage}</p>}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card-surface p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {endpoints.map((endpoint) => (
            <EndpointRow key={endpoint.path} endpoint={endpoint} onTry={setActiveEndpoint} />
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
