import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconArrowRight,
  IconWhatsApp,
  IconCode,
  IconGame,
  IconBolt,
  IconShield,
  IconDownload,
} from '../lib/icons.jsx';

/**
 * Marketplace category cards.
 * Each card routes the visitor directly into the Showcase filtered by category,
 * which is the canonical entry-point for browsing product downloads.
 *
 * No emojis — every visual is a pure inline SVG.
 */
const CATEGORY_CARDS = [
  {
    key: 'whatsapp-bot',
    Icon: IconWhatsApp,
    title: 'WhatsApp Bots',
    description:
      'Production-grade automation scripts: auto-reply, multi-device sessions, group managers, and AI-powered conversation flows.',
    accent: 'from-accent-teal/20 to-accent-teal/0',
    href: '/showcase?category=whatsapp-bot',
    badge: 'Most Popular',
  },
  {
    key: 'snippet',
    Icon: IconCode,
    title: 'Snippet Code',
    description:
      'Reusable, copy-paste modules for Node.js, React, and Express. Drop them straight into your own project without reinventing the wheel.',
    accent: 'from-accent-teal-light/20 to-accent-teal-light/0',
    href: '/snippets',
    badge: 'Free Forever',
  },
  {
    key: 'plugin',
    Icon: IconGame,
    title: 'Game Plugins',
    description:
      'Custom plugins for TheoTown, Minecraft, and beyond — map generators, economy systems, and gameplay overhauls ready to deploy.',
    accent: 'from-accent-teal-dark/20 to-accent-teal-dark/0',
    href: '/showcase?category=plugin',
    badge: 'Curated',
  },
];

const VALUE_PILLS = [
  { Icon: IconBolt, label: 'Instant download' },
  { Icon: IconShield, label: 'Versioned & tracked' },
  { Icon: IconDownload, label: 'No login required' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing() {
  return (
    <main className="relative overflow-hidden">
      {/* Ambient teal glow orbs — kept on-brand with the existing palette */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent-teal/25 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute top-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent-teal-light/20 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ============== MARKETPLACE HERO ============== */}
      <motion.section
        className="relative max-w-6xl mx-auto px-6 pt-24 pb-12 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.p
          variants={itemVariants}
          className="text-accent-teal font-medium tracking-[0.25em] uppercase text-[11px] mb-5"
        >
          kyyinfinite.my.id - Digital Asset Marketplace
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-semibold text-text-charcoal dark:text-white leading-[1.1] tracking-tight"
        >
          Premium scripts, snippets &amp; plugins.
          <br />
          <span className="relative inline-block text-accent-teal">
            Ship faster, automate everything.
            <motion.span
              className="absolute left-0 -bottom-1 h-1 rounded-full bg-accent-teal/40 w-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            />
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-text-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
        >
          A curated marketplace for high-quality digital products. Download the latest version of
          every WhatsApp bot, code snippet, and game plugin instantly — with full release history,
          changelogs, and per-version rollbacks.
        </motion.p>

        {/* Value pills */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {VALUE_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-white/10 bg-white/60 dark:bg-white/5 text-xs font-medium text-text-muted"
            >
              <pill.Icon className="w-3.5 h-3.5 text-accent-teal" />
              {pill.label}
            </span>
          ))}
        </motion.div>

        {/* Primary CTA */}
        <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-4">
          <Link to="/showcase">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-flex items-center gap-2"
            >
              Browse Marketplace <IconArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
          <Link to="/snippets">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-outline inline-block"
            >
              Open Snippet Library
            </motion.span>
          </Link>
        </motion.div>
      </motion.section>

      {/* ============== CATEGORY NAVIGATION GRID ============== */}
      <motion.section
        className="relative max-w-6xl mx-auto px-6 pb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-text-charcoal dark:text-white">
              Pick a category
            </h2>
            <p className="text-text-muted text-sm mt-1.5">
              Three product verticals. Every release tracked, versioned, and downloadable.
            </p>
          </div>
          <Link
            to="/showcase"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-accent-teal hover:text-accent-teal-dark"
          >
            View all <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORY_CARDS.map((card) => (
            <motion.div key={card.key} variants={itemVariants} whileHover={{ y: -6 }}>
              <Link
                to={card.href}
                className="card-surface relative overflow-hidden p-6 flex flex-col h-full group"
              >
                {/* Gradient wash on hover */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative flex items-start justify-between mb-5">
                  <motion.div
                    whileHover={{ rotate: 6, scale: 1.08 }}
                    className="w-12 h-12 rounded-xl bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark"
                  >
                    <card.Icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-teal-glow text-accent-teal-dark">
                    {card.badge}
                  </span>
                </div>

                <h3 className="relative text-lg font-semibold text-text-charcoal dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="relative text-text-muted text-sm leading-relaxed flex-1">
                  {card.description}
                </p>

                <div className="relative mt-6 flex items-center gap-2 text-accent-teal text-sm font-medium">
                  Explore releases
                  <motion.span
                    className="inline-flex"
                    whileHover={{ x: 4 }}
                  >
                    <IconArrowRight className="w-4 h-4" />
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============== FEATURE STRIP ============== */}
      <motion.section
        className="relative max-w-6xl mx-auto px-6 pb-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="card-surface p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="max-w-xl">
            <h3 className="text-xl md:text-2xl font-semibold text-text-charcoal dark:text-white mb-2">
              Every release is a downloadable artifact.
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Browse the changelog of any product to download older builds, compare release notes,
              and roll back to a version that worked for your stack. No account, no friction.
            </p>
          </div>
          <Link to="/showcase">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
            >
              Open Marketplace <IconArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>
      </motion.section>
    </main>
  );
}
