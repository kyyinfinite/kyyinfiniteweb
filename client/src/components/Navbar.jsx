import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { IconMoon, IconSun } from '../lib/icons.jsx';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('kyyinfinite-theme');
    const shouldUseDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

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

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-text-charcoal/80 backdrop-blur-md border-b border-border-soft dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-text-charcoal dark:text-white">
          Kyy<span className="text-accent-teal">Infinite</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/showcase" className={linkClass}>Showcase</NavLink>
          <NavLink to="/snippets" className={linkClass}>Snippets</NavLink>
          <NavLink to="/marketplace" className={linkClass}>Marketplace</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-border-soft dark:border-white/10 text-text-muted hover:text-accent-teal transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </div>
    </header>
  );
}
