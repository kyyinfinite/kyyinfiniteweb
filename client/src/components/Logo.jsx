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
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#1D1F1A" />
      <path d="M22 14V50" stroke="#F6F5F1" strokeWidth="6" strokeLinecap="round" />
      <path d="M22 32L40 14" stroke="#F6F5F1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 32L42 50" stroke="#7A73F0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="42" cy="14" r="3" fill="#7A73F0" />
    </svg>
  );
}
