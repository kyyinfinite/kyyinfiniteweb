import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight } from '../lib/icons.jsx';

export default function ErrorPage({ code = 'Error', title, message, showRetry = false }) {
  return (
    <main className="theme-light relative min-h-[75vh] flex items-center justify-center px-6 overflow-hidden">
      {/* Ambient light, not glow: static, low-opacity, no continuous motion */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[420px] ambient-blob"
        style={{
          background: 'radial-gradient(circle, rgba(88,80,230,0.10) 0%, rgba(88,80,230,0) 60%)',
        }}
      />

      <div className="relative text-center max-w-md">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="font-display text-7xl font-semibold text-indigo"
        >
          {code}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className="font-display text-2xl font-semibold text-ink mt-4"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
          className="text-slate mt-3 leading-relaxed"
        >
          {message}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24, ease: 'easeOut' }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Link to="/">
            <motion.span
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2"
            >
              Back to Home <IconArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
          {showRetry && (
            <button onClick={() => window.location.reload()} className="btn-outline">
              Try again
            </button>
          )}
        </motion.div>
      </div>
    </main>
  );
}
