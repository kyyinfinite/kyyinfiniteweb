import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSignal, IconBolt } from '../lib/icons.jsx';
import useNetworkLoading from '../hooks/useNetworkLoading.js';

/**
 * NetworkLoader
 * -------------
 * Cyberpunk-styled, network-aware loading bar. Pair it with a backend fetch:
 *
 *   <NetworkLoader active={isLoading} />
 *
 * Internally it boots up `useNetworkLoading` which uses the Network Information
 * API to read `rtt` / `downlink` and artificially slows the progress bar on
 * bad connections, holding at 90% until `active` flips to false — at which
 * point the bar sprints to 100% and the loader fades out.
 *
 * No emojis — all visuals are SVG + Tailwind. The accent color inherits the
 * existing teal/charcoal theme so the marketplace revamp stays on-brand.
 */
export default function NetworkLoader({ active = false, label = 'Loading asset', onComplete }) {
  const loader = useNetworkLoading();

  // Start a new loading cycle whenever `active` becomes true.
  useEffect(() => {
    if (active) loader.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Tell the hook the data has resolved when `active` flips back to false.
  useEffect(() => {
    if (!active && loader.phase !== 'idle' && loader.phase !== 'complete') {
      loader.complete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Fire the optional onComplete callback once the bar reaches 100.
  useEffect(() => {
    if (loader.phase === 'complete' && typeof onComplete === 'function') {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader.phase]);

  const isSlow = loader.rtt >= 400 || (loader.downlink > 0 && loader.downlink <= 1.5);

  return (
    <AnimatePresence>
      {(active || loader.phase !== 'complete' && loader.phase !== 'idle') && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="card-surface p-5">
            {/* Header row: label + live network metrics */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSlow ? 'bg-amber-400' : 'bg-accent-teal'} animate-pulse`} />
                <span className="text-sm font-medium text-text-charcoal dark:text-white">{label}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-text-light">
                <span className="inline-flex items-center gap-1">
                  <IconSignal className="w-3 h-3" />
                  {loader.effectiveType || 'unknown'}
                </span>
                <span>{loader.rtt || 0}ms</span>
                <span>{loader.downlink || 0}Mbps</span>
              </div>
            </div>

            {/* The progress track itself */}
            <div className="relative h-2 rounded-full bg-border-soft dark:bg-white/10 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-teal-dark via-accent-teal to-accent-teal-light"
                style={{
                  width: `${loader.progress}%`,
                  boxShadow:
                    '0 0 12px rgba(80, 200, 194, 0.55), 0 0 24px rgba(80, 200, 194, 0.25)',
                }}
                transition={{ duration: 0.18, ease: 'linear' }}
              />
              {/* Scanning highlight overlay for the cyberpunk feel */}
              <motion.div
                className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-3rem', '20rem'] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatType: 'loop',
                }}
              />
            </div>

            {/* Status footer (monospaced) */}
            <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-text-muted">
                <IconBolt className="w-3 h-3 text-accent-teal" />
                {loader.statusText}
              </span>
              <span className="text-text-charcoal dark:text-white tabular-nums">
                {String(loader.progress).padStart(3, '0')}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
