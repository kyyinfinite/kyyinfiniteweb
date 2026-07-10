import React from 'react';
import { motion } from 'framer-motion';
import { useNetworkLoading } from '../hooks/useNetworkLoading.js';

function getStatusText(progress, isNetworkSlow) {
  if (progress < 25) return 'INITIALIZING CONNECTION';
  if (progress < 55) return isNetworkSlow ? 'FETCHING DATA / DEGRADED LINK' : 'FETCHING DATA';
  if (progress < 90) return 'SYNCING PAYLOAD';
  if (progress < 100) return 'FINALIZING';
  return 'READY';
}

export default function NetworkLoader({ loadingData, label = 'LOADING PRODUCT DATA' }) {
  const { progress, isNetworkSlow, effectiveType } = useNetworkLoading(loadingData);
  const statusText = getStatusText(progress, isNetworkSlow);

  return (
    <div className="w-full max-w-md mx-auto py-16 px-6 text-center">
      <p className="font-mono-ui text-xs tracking-widest text-cyan-400 mb-3">{label}</p>

      <div className="relative h-2 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-cyan-400 shadow-glow-cyan"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.2 }}
        />
        <motion.div
          className="absolute inset-y-0 w-8 bg-cyan-200/40 blur-sm"
          animate={{ left: [`${Math.max(progress - 8, 0)}%`, `${progress}%`] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 font-mono-ui text-[11px] text-zinc-500">
        <span>{statusText}</span>
        <span>{Math.min(Math.round(progress), 100)}%</span>
      </div>

      <p className="font-mono-ui text-[10px] text-zinc-600 mt-2 uppercase">
        Link: {effectiveType} {isNetworkSlow ? '// throttled render' : ''}
      </p>
    </div>
  );
}
