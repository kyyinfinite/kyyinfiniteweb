import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconClose, IconWhatsapp, IconScript, IconBook, IconServer, IconTicket } from '../lib/icons.jsx';

const EXPLORE_ITEMS = [
  { to: '/showcase', label: 'Products', description: 'Everything I\'ve built and shipped', icon: IconWhatsapp },
  { to: '/snippets', label: 'Snippets', description: 'Reusable code shared by the community', icon: IconScript },
  { to: '/docs', label: 'Docs', description: 'API guide, auth, rate limits, errors', icon: IconBook },
  { to: '/marketplace', label: 'Hosting', description: 'Game server hosting marketplace', icon: IconServer },
  { to: '/support', label: 'Support', description: 'Open a ticket or check on one', icon: IconTicket },
];

export default function ExplorerSheet({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="md:hidden fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          onClick={(event) => event.stopPropagation()}
          className="absolute bottom-0 inset-x-0 bg-white rounded-t-[24px] border-t border-line px-5 pt-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
        >
          <div className="w-10 h-1 rounded-full bg-line mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-ink font-semibold">Explore</h2>
            <button onClick={onClose} className="text-slate hover:text-ink p-1" aria-label="Close">
              <IconClose className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-1 pb-2">
            {EXPLORE_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-paper-soft transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo shrink-0">
                  <item.icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-ink text-sm font-medium">{item.label}</p>
                  <p className="text-slate text-xs truncate">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
