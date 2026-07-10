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

const menuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], when: 'beforeChildren', staggerChildren: 0.06 },
  },
  exit: { opacity: 0, height: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
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
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-accent-teal' : 'text-text-muted hover:text-accent-teal'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-1 py-3 text-base font-medium transition-colors duration-200 ${
      isActive ? 'text-accent-teal' : 'text-text-charcoal dark:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-text-charcoal/80 backdrop-blur-md border-b border-border-soft dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-text-charcoal dark:text-white">
          Kyy<span className="text-accent-teal">Infinite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-border-soft dark:border-white/10 text-text-muted hover:text-accent-teal transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>

          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full border border-border-soft dark:border-white/10 text-text-charcoal dark:text-white"
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

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="md:hidden overflow-hidden border-t border-border-soft dark:border-white/10 bg-white/95 dark:bg-text-charcoal/95 backdrop-blur-md"
          >
            <div className="max-w-6xl mx-auto px-6 py-2 divide-y divide-border-soft dark:divide-white/10">
              {NAV_ITEMS.map((item) => (
                <motion.div key={item.to} variants={itemVariants}>
                  <NavLink to={item.to} end={item.end} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass}>
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
