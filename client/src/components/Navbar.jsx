import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IconMoon, IconSun } from '../lib/icons.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/showcase', label: 'Showcase' },
  { to: '/snippets', label: 'Snippets' },
  { to: '/marketplace', label: 'Marketplace' },
];

// Animasi side drawer menggunakan spring physics agar lebih smooth
const drawerVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 200, 
      staggerChildren: 0.1, 
      delayChildren: 0.1 
    },
  },
  exit: { 
    x: '100%', 
    transition: { type: 'spring', damping: 25, stiffness: 200 } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('kyyinfinite-theme');
    const shouldUseDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('kyyinfinite-theme', next ? 'dark' : 'light');
  }

  const linkClass = ({ isActive }) =>
    `relative text-sm font-semibold transition-all duration-300 group ${
      isActive ? 'text-accent-teal' : 'text-text-muted hover:text-text-charcoal dark:hover:text-white'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center w-full px-4 py-3.5 text-base font-semibold rounded-xl transition-all duration-300 ${
      isActive 
        ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20' 
        : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-charcoal dark:hover:text-white'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/50 backdrop-blur-lg border-b border-border-soft dark:border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo dengan IT Aesthetic */}
          <Link 
            to="/" 
            onClick={() => setIsMenuOpen(false)} 
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-text-charcoal dark:bg-white text-white dark:text-text-charcoal flex items-center justify-center font-mono font-bold text-lg group-hover:bg-accent-teal transition-colors">
              K
            </div>
            <span className="text-lg font-bold text-text-charcoal dark:text-white tracking-tight hidden sm:block">
              kyy<span className="text-accent-teal font-mono">_infinite</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-accent-teal rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Visual Hint ala Developer (Opsional, UI Element) */}
            <div className="hidden lg:flex items-center justify-center px-2 py-1 rounded-md border border-border-soft dark:border-white/10 bg-black/5 dark:bg-white/5 text-[10px] font-mono text-text-muted">
              Ctrl + K
            </div>

            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-border-soft dark:border-white/10 text-text-muted hover:text-accent-teal hover:border-accent-teal/30 hover:bg-accent-teal/5 transition-all duration-300"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-xl border border-border-soft dark:border-white/10 text-text-charcoal dark:text-white active:scale-95 transition-transform"
              aria-label="Toggle menu"
            >
              <div className="w-4 h-3.5 relative flex flex-col justify-between">
                <motion.span
                  className="block h-[1.5px] w-full bg-current rounded-full"
                  animate={isMenuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
                <motion.span
                  className="block h-[1.5px] w-full bg-current rounded-full"
                  animate={isMenuOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                />
                <motion.span
                  className="block h-[1.5px] w-full bg-current rounded-full"
                  animate={isMenuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ============== MOBILE SIDE DRAWER ============== */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay (Klik untuk tutup) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 dark:bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Panel Drawer Samping */}
            <motion.nav
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={drawerVariants}
              className="fixed top-16 right-0 bottom-0 w-[280px] z-50 bg-white dark:bg-black/90 border-l border-border-soft dark:border-white/10 shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex flex-col p-6 gap-2">
                <span className="text-[10px] font-mono font-bold text-accent-teal uppercase tracking-widest mb-4 px-2">
                  Navigation
                </span>
                
                {NAV_ITEMS.map((item) => (
                  <motion.div key={item.to} variants={itemVariants}>
                    <NavLink 
                      to={item.to} 
                      end={item.end} 
                      onClick={() => setIsMenuOpen(false)} 
                      className={mobileLinkClass}
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
