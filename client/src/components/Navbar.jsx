import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconServer } from '../lib/icons.jsx';
import { useUser } from '../context/UserContext.jsx';
import Logo from './Logo.jsx';

function IconUserOutline({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.3-3.5 4.2-5.5 7.5-5.5s6.2 2 7.5 5.5" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/showcase', label: 'Products' },
  { to: '/snippets', label: 'Snippets' },
  { to: '/developers', label: 'API' },
  { to: '/marketplace', label: 'Hosting' },
];

export default function Navbar() {
  const { user } = useUser();

  const linkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 py-1.5 ${
      isActive ? 'text-[var(--kyy-text)]' : 'text-[var(--kyy-text-secondary)] hover:text-[var(--kyy-text)]'
    }`;

  return (
    <header className="sticky top-0 z-40 kyy-ambient kyy-nav">
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold text-[var(--kyy-text)] font-display">
          <Logo size={30} />
          <span className="whitespace-nowrap tracking-tight">
            Kyy<span className="text-[var(--kyy-primary)]">Infinite</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {({ isActive }) => (
                <span className="relative inline-block">
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="kyy-nav-underline"
                      className="absolute -bottom-[7px] left-0 right-0 h-[2px] rounded-full bg-[var(--kyy-primary)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/marketplace"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--kyy-border)] text-[var(--kyy-text-secondary)] hover:text-[var(--kyy-primary-dark)] hover:border-[var(--kyy-primary)]/40 transition-colors duration-200"
            aria-label="Hosting marketplace"
          >
            <IconServer className="w-4 h-4" />
          </Link>

          {user ? (
            <Link to="/profile" className="kyy-btn-secondary !py-2 !px-3.5 text-sm">
              <span className="w-6 h-6 rounded-full bg-[var(--kyy-primary-soft)] text-[var(--kyy-primary-dark)] flex items-center justify-center text-xs font-semibold uppercase">
                {(user.displayName || user.email || '?').charAt(0)}
              </span>
              Profile
            </Link>
          ) : (
            <>
              <Link to="/login" className="kyy-btn-ghost text-sm">
                Log in
              </Link>
              <Link to="/register" className="kyy-btn-primary !py-2 !px-4 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile primary navigation lives in <BottomNav />; keep the top bar
            minimal here so the two don't duplicate the same links. */}
        <Link
          to={user ? '/profile' : '/login'}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-[var(--kyy-border)] text-[var(--kyy-text-secondary)]"
          aria-label={user ? 'Profile' : 'Log in'}
        >
          {user ? (
            <span className="w-6 h-6 rounded-full bg-[var(--kyy-primary-soft)] text-[var(--kyy-primary-dark)] flex items-center justify-center text-[11px] font-semibold uppercase">
              {(user.displayName || user.email || '?').charAt(0)}
            </span>
          ) : (
            <IconUserOutline className="w-4 h-4" />
          )}
        </Link>
      </div>
    </header>
  );
}
