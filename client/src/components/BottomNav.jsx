import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconTerminal, IconWhatsapp, IconServer, IconKey } from '../lib/icons.jsx';
import { useUser } from '../context/UserContext.jsx';

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

const STATIC_TABS = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/showcase', label: 'Products', icon: IconWhatsapp },
  { to: '/developers', label: 'API', icon: IconKey },
  { to: '/marketplace', label: 'Hosting', icon: IconServer },
];

export default function BottomNav() {
  const { user } = useUser();
  const profileTab = { to: user ? '/profile' : '/login', label: 'Profile', icon: IconProfile };
  const tabs = [...STATIC_TABS.slice(0, 2), profileTab, ...STATIC_TABS.slice(2)];

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50">
      
      {/* Efek Glassmorphism & Cyber/Edgy Dark Style */}
      <div className="bg-zinc-950/75 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-2xl flex items-center justify-around px-2 py-2">
        
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className="relative flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl z-10 tap-highlight-transparent"
          >
            {({ isActive }) => (
              <>
                {/* Animasi Pill Background Framer Motion */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-zinc-800/80 rounded-xl -z-10 border border-zinc-700/50 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Transisi Warna Ikon yang Smooth */}
                <tab.icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-brand-light drop-shadow-md' : 'text-zinc-500 hover:text-zinc-400'
                  }`} 
                />
                
                {/* Teks dengan Font Weight dan Tracking disesuaikan */}
                <span 
                  className={`text-[10px] font-semibold tracking-wider transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-zinc-500'
                  }`}
                >
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
