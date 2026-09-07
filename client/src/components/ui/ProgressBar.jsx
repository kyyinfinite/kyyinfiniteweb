import React from 'react';

/**
 * Lifetime-quota usage bar. `percentage` is 0-100; `tone` shifts color as
 * usage climbs (see thresholds where this is called) without ever using
 * a saturated/neon red.
 */
export default function ProgressBar({ percentage = 0, tone = 'indigo' }) {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const fill =
    tone === 'danger' ? 'bg-rust' : tone === 'warning' ? 'bg-amber' : 'bg-indigo';

  return (
    <div className="w-full h-1.5 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`h-full rounded-full ${fill} transition-[width] duration-500 ease-soft`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
