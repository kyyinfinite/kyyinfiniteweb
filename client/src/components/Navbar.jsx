import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { IconServer } from '../lib/icons.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/showcase', label: 'Products' },
  { to: '/snippets', label: 'Snippets' },
  { to: '/marketplace', label: 'Hosting' },
];

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-cyan-400' : 'text-zinc-400 hover:text-cyan-400'
    }`;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-zinc-50 font-mono-ui">
          Kyy<span className="text-cyan-400">Infinite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/marketplace"
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors duration-200"
          aria-label="Hosting marketplace"
        >
          <IconServer className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
