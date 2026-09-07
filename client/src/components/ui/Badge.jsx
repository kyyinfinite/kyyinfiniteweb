import React from 'react';

const TONES = {
  neutral: 'bg-paper-soft text-slate border border-line',
  indigo: 'bg-indigo-soft text-indigo-dark',
  success: 'bg-clover-soft text-clover',
  warning: 'bg-amber-soft text-amber',
  danger: 'bg-rust-soft text-rust',
};

/**
 * Small status label. Tones map to the design-system's restrained accent
 * palette (see tailwind.config.js) — never a saturated/neon color.
 */
export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
