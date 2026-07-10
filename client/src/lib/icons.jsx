import React from 'react';

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function IconDownload({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function IconPlugin({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M9 3v3" />
      <path d="M15 3v3" />
      <path d="M7 8h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V8z" />
      <path d="M12 17v4" />
      <path d="M9 21h6" />
    </svg>
  );
}

export function IconScript({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2" />
      <path d="M16 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2" />
      <path d="M9 8l3 4-3 4" />
      <path d="M15 16h-3" />
    </svg>
  );
}

export function IconServer({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="4" width="18" height="7" rx="1.5" />
      <rect x="3" y="13" width="18" height="7" rx="1.5" />
      <circle cx="7" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="7" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCart({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" />
    </svg>
  );
}

export function IconMoon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export function IconSun({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2" />
      <path d="M12 19.5v2" />
      <path d="M4.2 4.2l1.4 1.4" />
      <path d="M18.4 18.4l1.4 1.4" />
      <path d="M2.5 12h2" />
      <path d="M19.5 12h2" />
      <path d="M4.2 19.8l1.4-1.4" />
      <path d="M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function IconChart({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 20V10" />
      <path d="M11 20V4" />
      <path d="M18 20v-7" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function IconTicket({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
      <path d="M9 6v12" strokeDasharray="2 3" />
    </svg>
  );
}

export function IconClose({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function IconQr({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3z" />
      <path d="M20 14h1v1h-1z" />
      <path d="M14 20h1v1h-1z" />
      <path d="M18 18h3v3h-3z" />
    </svg>
  );
}

export function IconCheck({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 12.5l5 5L20 6" />
    </svg>
  );
}

export function IconArrowRight({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 12h16" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

export function IconUpload({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 15V3" />
      <path d="M7 8l5-5 5 5" />
      <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

export function IconLock({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* =========================================================
 *  Marketplace-specific icons (added for the blueprint revamp)
 *  Pure inline SVG, no emoji. All inherit `base` stroke style.
 * ========================================================= */

export function IconWhatsApp({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3L3 21z" />
      <path d="M9 9.5c.2 2.5 3.2 5.3 5.5 5.5l1.3-1.4a.6.6 0 0 1 .7-.1l1.8.7a.5.5 0 0 1 .3.6l-.3 1.6a.8.8 0 0 1-.8.6c-3.6.1-8.4-4.6-8.5-8.3a.8.8 0 0 1 .6-.8l1.6-.3a.5.5 0 0 1 .6.3l.7 1.8a.6.6 0 0 1-.1.7L9 9.5z" />
    </svg>
  );
}

export function IconCode({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8 7l-5 5 5 5" />
      <path d="M16 7l5 5-5 5" />
      <path d="M13.5 4.5l-3 15" />
    </svg>
  );
}

export function IconGame({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="2" y="8" width="20" height="9" rx="4.5" />
      <path d="M7 12.5v0" />
      <path d="M5.5 12.5h3" />
      <path d="M7 11v3" />
      <circle cx="15.5" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="14" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconHistory({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4h4" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconTag({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 12l8-8h7a3 3 0 0 1 3 3v7l-8 8a2 2 0 0 1-3 0l-6-6a2 2 0 0 1 0-3z" />
      <circle cx="15" cy="9" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCalendar({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </svg>
  );
}

export function IconBolt({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

export function IconShield({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3l8 3v6c0 4.5-3 7.5-8 9-5-1.5-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconChevronLeft({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function IconClock({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconSignal({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 20h2v-4H3z" />
      <path d="M8 20h2v-9H8z" />
      <path d="M13 20h2v-13h-2z" />
      <path d="M18 20h2V4h-2z" />
    </svg>
  );
}

export function IconPackage({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}
