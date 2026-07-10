import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight } from '../lib/icons.jsx';

export default function ErrorPage({ code = 'Error', title, message, showRetry = false }) {
  return (
    <main className="relative min-h-[75vh] flex items-center justify-center px-6 overflow-hidden">
      <motion.div
        className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-accent-teal/20 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 -right-24 w-80 h-80 rounded-full bg-accent-teal-light/20 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative text-center max-w-md">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-7xl font-semibold text-accent-teal"
        >
          {code}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="text-2xl font-semibold text-text-charcoal dark:text-white mt-4"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="text-text-muted mt-3 leading-relaxed"
        >
          {message}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Link to="/">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
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
