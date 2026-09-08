import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconClose, IconCopy, IconCheck, IconCode, IconShare } from '../lib/icons.jsx';

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <label className="text-xs text-slate mb-1.5 block">{label}</label>
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-line bg-paper-soft px-3.5 py-2.5 text-left hover:border-indigo/40 transition-colors duration-200"
      >
        <span className="font-mono-ui text-xs text-ink truncate">{value}</span>
        {copied ? (
          <IconCheck className="w-4 h-4 text-clover shrink-0" />
        ) : (
          <IconCopy className="w-4 h-4 text-mist shrink-0" />
        )}
      </button>
    </div>
  );
}

export default function ShareSnippetModal({ title, pageUrl, rawUrl, onClose }) {
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  function handleNativeShare() {
    navigator.share({ title, url: pageUrl }).catch(() => {});
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(event) => event.stopPropagation()}
        className="card-surface w-full max-w-sm p-6 relative"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-slate hover:text-ink transition-colors duration-200">
          <IconClose className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo mb-4">
          <IconShare className="w-4.5 h-4.5" />
        </div>
        <h2 className="font-display text-lg font-semibold text-ink mb-1">Share snippet</h2>
        <p className="text-slate text-sm mb-5 truncate">{title}</p>

        <div className="space-y-4">
          <CopyRow label="Page link" value={pageUrl} />
          <CopyRow label="Raw code link" value={rawUrl} />
        </div>

        <div className="flex gap-3 mt-6">
          {canNativeShare && (
            <button onClick={handleNativeShare} className="btn-outline flex-1 text-sm flex items-center justify-center gap-2">
              <IconShare className="w-4 h-4" /> Share via…
            </button>
          )}
          <a
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
          >
            <IconCode className="w-4 h-4" /> Open raw
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
