import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconServer, IconKey } from '../lib/icons.jsx';
import { useUser } from '../context/UserContext.jsx';
import ExplorerSheet from './ExplorerSheet.jsx';

function IconHome({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function IconProfile({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.3-3.5 4.2-5.5 7.5-5.5s6.2 2 7.5 5.5" />
    </svg>
  );
}

function IconGrid({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const STATIC_TABS = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/developers', label: 'API', icon: IconKey },
  { to: '/marketplace', label: 'Hosting', icon: IconServer },
];

export default function BottomNav() {
  const { user } = useUser();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const profileTab = { to: user ? '/profile' : '/login', label: 'Profile', icon: IconProfile };
  const tabs = [STATIC_TABS[0], STATIC_TABS[1], profileTab, STATIC_TABS[2]];

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-line"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1.5">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl z-10 tap-highlight-transparent"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-1.5 bg-indigo-soft rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <tab.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-indigo' : 'text-mist'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors duration-200 ${
                      isActive ? 'text-ink' : 'text-mist'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setIsExploreOpen(true)}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl z-10 tap-highlight-transparent"
          >
            <IconGrid className="w-5 h-5 text-mist" />
            <span className="text-[10px] font-medium text-mist">Explore</span>
          </button>
        </div>
      </nav>
      {isExploreOpen && <ExplorerSheet onClose={() => setIsExploreOpen(false)} />}
    </>
  );
}
