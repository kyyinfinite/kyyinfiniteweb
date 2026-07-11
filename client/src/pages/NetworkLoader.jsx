import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkLoading } from '../hooks/useNetworkLoading.js';

const LOG_STEPS = [
  { at: 0, prefix: '$', text: "const progress = createLoader('kyyinfinite/cdn');" },
  { at: 14, prefix: '$', text: 'await progress.connect();' },
  { at: 30, prefix: '>', text: "const manifest = await fetch('/product.json');" },
  { at: 48, prefix: '$', text: 'npm install --production --silent' },
  { at: 66, prefix: '>', text: 'const payload = await resolveAssets(manifest);' },
  { at: 84, prefix: '$', text: 'await verify(payload.integrity);' },
  { at: 100, prefix: '#', text: 'ready ✓' },
];

function buildAsciiBar(progress, width = 22) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  const filled = Math.round((clamped / 100) * width);
  return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}] ${Math.round(clamped)}%`;
}

export default function NetworkLoader({ loadingData, label = 'kyyinfinite@cdn' }) {
  const { progress, isNetworkSlow, effectiveType } = useNetworkLoading(loadingData);

  const visibleLines = useMemo(() => LOG_STEPS.filter((step) => progress >= step.at), [progress]);
  const isDone = progress >= 100;

  return (
    <div className="w-full max-w-lg mx-auto py-16 px-6">
      <div className="rounded-xl border border-white/10 glass-panel shadow-glow-brand overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/20">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-zinc-500 font-mono-ui">{label} — zsh</span>
        </div>

        <div className="p-4 font-mono-ui text-xs leading-relaxed min-h-[190px]">
          <AnimatePresence>
            {visibleLines.map((step) => (
              <motion.p
                key={step.text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={step.prefix === '#' ? 'text-brand-light mt-1' : 'text-zinc-400'}
              >
                <span className="text-brand mr-1.5">{step.prefix}</span>
                {step.text}
              </motion.p>
            ))}
          </AnimatePresence>

          <p className="text-brand-light mt-3 flex items-center">
            {buildAsciiBar(progress)}
            {!isDone && (
              <motion.span
                className="inline-block w-1.5 h-3 bg-brand-light ml-2"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
              />
            )}
          </p>

          {isNetworkSlow && (
            <p className="text-yellow-500 mt-2 text-[11px]">
              warning: degraded link detected ({effectiveType})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
