import React from 'react';
import useNetworkLoading from '../hooks/useNetworkLoading.js';

/**
 * NetworkLoader
 * ---------------------------------------------------------------------------
 * Cyberpunk progress bar UI yang dikendalikan oleh `useNetworkLoading`.
 *
 * Props:
 *   - isLoadingData: boolean  — status fetching backend
 *   - label: string           — caption di atas bar (default 'LOADING ASSET')
 *   - compact: boolean        — true untuk variant inline (height lebih kecil)
 *
 * Tampilan:
 *   [ LABEL ---------- 42% ]
 *   ███████████░░░░░░░░░░░░  <- progress dengan efek glow cyan
 *   > FETCHING ASSET MANIFEST…   <- status monospaced
 *
 * Tidak menggunakan emoji. Semua icon menggunakan SVG murni.
 */
function IconBolt({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

function IconSignal({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18h2v3H3z" />
      <path d="M8 14h2v7H8z" />
      <path d="M13 10h2v11h-2z" />
      <path d="M18 6h2v15h-2z" />
    </svg>
  );
}

const NETWORK_BADGE = {
  fast: { text: '4G+ / FAST', color: 'text-cyan-300 border-brand-light/40 bg-brand-light/5' },
  medium: { text: '4G / MEDIUM', color: 'text-sky-300 border-sky-400/40 bg-sky-400/5' },
  slow: { text: '3G / SLOW', color: 'text-amber-300 border-amber-400/40 bg-amber-400/5' },
  unknown: { text: 'NET / UNKNOWN', color: 'text-zinc-400 border-zinc-500/40 bg-zinc-500/5' },
};

export default function NetworkLoader({ isLoadingData, label = 'LOADING ASSET', compact = false }) {
  const { progress, statusText, networkLabel } = useNetworkLoading({ isLoadingData });

  const badge = NETWORK_BADGE[networkLabel] || NETWORK_BADGE.unknown;
  const barHeight = compact ? 'h-1.5' : 'h-2.5';
  const padY = compact ? 'py-3' : 'py-5';
  const showBar = progress > 0 && progress < 100;

  return (
    <div className={`w-full ${padY} px-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm font-mono`}>
      {/* Top row: label + network badge */}
      <div className="flex items-center justify-between text-[11px] tracking-[0.18em] uppercase mb-2">
        <div className="flex items-center gap-2 text-zinc-300">
          <IconBolt className="w-3.5 h-3.5 text-cyan-300" />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badge.color}`}>
            <IconSignal className="w-3 h-3" />
            {badge.text}
          </span>
          <span className="text-zinc-500 min-w-[3rem] text-right tabular-nums">
            {String(progress).padStart(3, '0')}%
          </span>
        </div>
      </div>

      {/* Progress bar with cyberpunk glow */}
      <div className={`relative w-full ${barHeight} rounded-full bg-zinc-800 overflow-hidden`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            background:
              'linear-gradient(90deg, rgba(34,211,238,0.95) 0%, rgba(56,189,248,0.95) 60%, rgba(129,140,248,0.95) 100%)',
            boxShadow:
              '0 0 12px rgba(34,211,238,0.55), 0 0 24px rgba(56,189,248,0.35)',
          }}
        />
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 6px, rgba(0,0,0,0.4) 6px 7px)',
          }}
        />
        {/* Tip glow when held at 90% */}
        {progress >= 90 && progress < 100 && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-white/80 animate-pulse"
            style={{ left: `calc(${progress}% - 2px)` }}
          />
        )}
      </div>

      {/* Status text */}
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-cyan-300/80 tracking-wider">&gt; {statusText}</span>
        {showBar && (
          <span className="text-zinc-500 tracking-wider hidden sm:inline">
            HANDSHAKE://{networkLabel.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
