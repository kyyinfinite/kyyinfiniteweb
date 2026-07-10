import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IconServer } from '../lib/icons.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/showcase', label: 'Products' },
  { to: '/snippets', label: 'Snippets' },
  { to: '/marketplace', label: 'Hosting' },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-cyan-400' : 'text-zinc-400 hover:text-cyan-400'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-1 py-3 text-base font-medium transition-colors duration-200 ${
      isActive ? 'text-cyan-400' : 'text-zinc-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-zinc-50 font-mono-ui">
          Kyy<span className="text-cyan-400">Infinite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/marketplace"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors duration-200"
            aria-label="Hosting marketplace"
          >
            <IconServer className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full border border-zinc-800 text-zinc-100"
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
            className="md:hidden overflow-hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md"
          >
            <div className="max-w-6xl mx-auto px-6 py-2 divide-y divide-zinc-800">
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
