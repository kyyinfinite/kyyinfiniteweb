import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { IconServer } from '../lib/icons.jsx';
import Logo from './Logo.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/showcase', label: 'Products' },
  { to: '/snippets', label: 'Snippets' },
  { to: '/developers', label: 'API' },
  { to: '/docs', label: 'Docs' },
  { to: '/marketplace', label: 'Hosting' },
];

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `relative text-sm font-medium py-1.5 transition-colors duration-200 ${
      isActive ? 'text-ink' : 'text-slate hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-line">
      <div className="max-w-shell mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold text-ink font-display">
          <Logo size={30} />
          <span className="whitespace-nowrap tracking-tight">
            Kyy<span className="text-indigo">Infinite</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-indigo" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/marketplace"
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-full border border-line text-slate hover:text-indigo hover:border-indigo/40 transition-colors duration-200"
          aria-label="Hosting marketplace"
        >
          <IconServer className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
