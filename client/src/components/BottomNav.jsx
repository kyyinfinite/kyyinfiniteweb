import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconTerminal, IconWhatsapp, IconServer } from '../lib/icons.jsx';

function IconHome({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

const TABS = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/showcase', label: 'Products', icon: IconWhatsapp },
  { to: '/snippets', label: 'Snippets', icon: IconTerminal },
  { to: '/marketplace', label: 'Hosting', icon: IconServer },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-2">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-glow"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-brand-light rounded-full shadow-glow-brand"
                  />
                )}
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-brand-light' : 'text-zinc-500'}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-brand-light' : 'text-zinc-500'}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
