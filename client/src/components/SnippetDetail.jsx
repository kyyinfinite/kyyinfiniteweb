import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api, rawUrlFor } from '../lib/api.js';
import {
  IconArrowRight,
  IconCheck,
  IconCopy,
  IconDownload,
  IconMaximize,
  IconClose,
  IconClock,
  IconFile,
  IconCode,
  IconShare,
} from '../lib/icons.jsx';
import { languageBadgeClass, fileNameFor } from '../lib/languageMeta.js';
import ShareSnippetModal from './ShareSnippetModal.jsx';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function CodeView({ language, code, showLineNumbers = true }) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneLight}
      showLineNumbers={showLineNumbers}
      customStyle={{ margin: 0, background: '#FBFAF7', fontSize: 13, padding: 20 }}
    >
      {code}
    </SyntaxHighlighter>
  );
}

export default function SnippetDetail() {
  const { id } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    api
      .getSnippet(id)
      .then(setSnippet)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isFullscreen) return undefined;
    function handleKey(event) {
      if (event.key === 'Escape') setIsFullscreen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  async function handleCopy() {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  function handleDownload() {
    if (!snippet) return;
    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileNameFor(snippet.title, snippet.language);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return <p className="theme-light max-w-4xl mx-auto px-6 py-24 text-slate text-center">Loading snippet…</p>;
  }

  if (errorMessage || !snippet) {
    return (
      <div className="theme-light max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-rust mb-4">{errorMessage || 'Snippet not found.'}</p>
        <Link to="/snippets" className="text-indigo text-sm">Back to Snippets</Link>
      </div>
    );
  }

  const rawUrl = rawUrlFor(snippet._id);
  const pageUrl = `${window.location.origin}/snippets/${snippet._id}`;

  return (
    <main className="theme-light max-w-4xl mx-auto px-6 py-16">
      <Link to="/snippets" className="text-slate hover:text-indigo text-sm inline-flex items-center gap-2 mb-8 transition-colors duration-200">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Snippets
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Meta card */}
        <div className="card-surface p-6 md:p-7 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl font-semibold text-ink">{snippet.title}</h1>
                {snippet.source === 'community' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-clover-soft text-clover font-medium">
                    Community{snippet.ownerLabel ? ` · ${snippet.ownerLabel}` : ''}
                  </span>
                )}
              </div>
              {snippet.description && (
                <p className="text-slate mt-2 leading-relaxed">{snippet.description}</p>
              )}
            </div>
            <span
              className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-mono-ui font-medium uppercase border ${languageBadgeClass(
                snippet.language
              )}`}
            >
              {snippet.language}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-xs text-mist">
            <span className="flex items-center gap-1.5">
              <IconClock className="w-3.5 h-3.5" /> Updated {formatDate(snippet.updatedAt || snippet.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <IconFile className="w-3.5 h-3.5" /> {snippet.code.split('\n').length} lines
            </span>
            <span>{formatBytes(new Blob([snippet.code]).size)}</span>
          </div>

          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {snippet.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-indigo-soft text-indigo-dark">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-5 border-t border-line">
            <button onClick={handleCopy} className="btn-primary text-sm flex items-center gap-2">
              {isCopied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
              {isCopied ? 'Copied' : 'Copy code'}
            </button>
            <button onClick={() => setShowShare(true)} className="btn-outline text-sm flex items-center gap-2">
              <IconShare className="w-4 h-4" /> Share
            </button>
            <a
              href={rawUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-sm flex items-center gap-2"
            >
              <IconCode className="w-4 h-4" /> Raw
            </a>
            <button onClick={handleDownload} className="icon-btn-outline" title="Download">
              <IconDownload className="w-4 h-4" />
            </button>
            <button onClick={() => setIsFullscreen(true)} className="icon-btn-outline" title="Fullscreen">
              <IconMaximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code panel */}
        <div className="card-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-paper-soft">
            <span className="font-mono-ui text-xs text-slate truncate">
              {fileNameFor(snippet.title, snippet.language)}
            </span>
            <a href={rawUrl} target="_blank" rel="noreferrer" className="text-xs text-mist hover:text-indigo transition-colors duration-200 shrink-0">
              view raw
            </a>
          </div>
          <div className="code-scroll overflow-x-auto">
            <CodeView language={snippet.language} code={snippet.code} />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showShare && (
          <ShareSnippetModal
            title={snippet.title}
            pageUrl={pageUrl}
            rawUrl={rawUrl}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="theme-light fixed inset-0 z-[60] bg-paper flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-white shrink-0">
              <div className="min-w-0 flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-ui font-medium uppercase border ${languageBadgeClass(
                    snippet.language
                  )}`}
                >
                  {snippet.language}
                </span>
                <span className="font-mono-ui text-sm text-ink truncate">{snippet.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleCopy} className="icon-btn-outline" title="Copy">
                  {isCopied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsFullscreen(false)} className="icon-btn-outline" title="Close">
                  <IconClose className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="code-scroll flex-1 overflow-auto">
              <CodeView language={snippet.language} code={snippet.code} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
