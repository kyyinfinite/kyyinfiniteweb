import React from 'react';

export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#0B1220" />
      <rect x="2" y="2" width="60" height="60" rx="16" stroke="#2563EB" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M22 14V50" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
      <path d="M22 32L40 14" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 32L42 50" stroke="#60A5FA" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="42" cy="14" r="3" fill="#60A5FA" />
    </svg>
  );
}
