import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconWhatsapp, IconServer, IconKey, IconBook, IconScript, IconTicket, IconMore, IconClose, IconCheck } from '../lib/icons.jsx';
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
];

// Destinations that don't get a dedicated bottom-nav slot live here instead —
// this is the "more" sheet the platform keeps growing into (docs, snippets,
// support, and whatever comes next) without the tab bar getting cramped.
const MORE_LINKS = [
  { to: '/docs', label: 'Documentation', description: 'Guides for the API, snippets, and hosting', icon: IconBook },
  { to: '/snippets', label: 'Code Snippets', description: 'Browse and submit reusable snippets', icon: IconScript },
  { to: '/marketplace', label: 'Hosting', description: 'Deploy a Pterodactyl panel server', icon: IconServer },
  { to: '/support', label: 'Support', description: 'Open a ticket or check on one', icon: IconTicket },
  { to: '/status', label: 'System Status', description: 'API uptime and recent incidents', icon: IconCheck },
];

export default function BottomNav() {
  const { user } = useUser();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const profileTab = { to: user ? '/profile' : '/login', label: 'Profile', icon: IconProfile };
  const tabs = [...STATIC_TABS.slice(0, 2), profileTab, STATIC_TABS[2]];
  const isMoreActive = MORE_LINKS.some((link) => location.pathname.startsWith(link.to));

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
                  <tab.icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo' : 'text-mist'}`} />
                  <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-ink' : 'text-mist'}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => setShowMore(true)}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl z-10 tap-highlight-transparent"
          >
            {isMoreActive && (
              <div className="absolute inset-1.5 bg-indigo-soft rounded-xl -z-10" />
            )}
            <IconMore className={`w-5 h-5 transition-colors duration-200 ${isMoreActive ? 'text-indigo' : 'text-mist'}`} />
            <span className={`text-[10px] font-medium transition-colors duration-200 ${isMoreActive ? 'text-ink' : 'text-mist'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl border-t border-line px-5 pt-3 pb-6"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
            >
              <div className="w-10 h-1 rounded-full bg-line mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <p className="font-display text-ink font-semibold">More on KyyInfinite</p>
                <button onClick={() => setShowMore(false)} className="text-slate hover:text-ink transition-colors duration-200">
                  <IconClose className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                {MORE_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-paper-soft transition-colors duration-200"
                  >
                    <span className="w-10 h-10 shrink-0 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo">
                      <link.icon className="w-4.5 h-4.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-ink font-medium text-sm">{link.label}</span>
                      <span className="block text-mist text-xs truncate">{link.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
