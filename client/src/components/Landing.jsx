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
    title: 'Plugins',
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

// Animasi ditingkatkan: Menggunakan efek pegas (spring) yang lebih natural
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.15, 
      delayChildren: 0.1 
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 80,
      damping: 15,
      mass: 1
    } 
  },
};

export default function Landing() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-transparent">
     
      {/* Ambient backgrounds yang bergerak */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent-teal/15 blur-[100px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent-teal-light/10 blur-[100px]"
        animate={{ x: [0, -25, 0], y: [0, -25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ============== MARKETPLACE HERO ============== */}
      <motion.section
        className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/20 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
          <span className="text-accent-teal font-semibold tracking-[0.15em] uppercase text-[10px]">
            kyyinfinite.my.id - Digital Asset Marketplace
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-charcoal dark:text-white leading-[1.15] tracking-tight max-w-4xl"
        >
          Premium scripts, snippets &amp; plugins.
          <br />
          <span className="relative inline-block text-accent-teal mt-2">
            Ship faster, automate everything.
            <motion.span
              className="absolute left-0 -bottom-2 h-[4px] rounded-full bg-accent-teal/30 w-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.6, type: "spring", damping: 20 }}
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-soft dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-sm text-xs md:text-sm font-medium text-text-muted shadow-sm"
            >
              <pill.Icon className="w-4 h-4 text-accent-teal" />
              {pill.label}
            </span>
          ))}
        </motion.div>

        {/* Primary CTA */}
        <motion.div variants={itemVariants} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link to="/showcase" className="w-full sm:w-auto group">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-flex items-center justify-center gap-2 w-full text-sm md:text-base py-3 px-8 rounded-xl shadow-lg shadow-accent-teal/20 transition-shadow hover:shadow-accent-teal/40"
            >
              Browse Marketplace 
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>
          <Link to="/snippets" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-outline inline-flex items-center justify-center w-full text-sm md:text-base py-3 px-8 rounded-xl bg-white/50 dark:bg-transparent backdrop-blur-md"
            >
              Open Snippet Library
            </motion.div>
          </Link>
        </motion.div>
      </motion.section>

      {/* ============== CATEGORY NAVIGATION GRID ============== */}
      <motion.section
        className="relative z-10 max-w-5xl mx-auto px-6 pb-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-charcoal dark:text-white">
              Pick a category
            </h2>
            <p className="text-text-muted text-sm md:text-base mt-2">
              Three product verticals. Every release tracked, versioned, and downloadable.
            </p>
          </div>
          <Link
            to="/showcase"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-accent-teal hover:text-accent-teal-dark transition-colors"
          >
            View all <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORY_CARDS.map((card) => (
            <motion.div 
              key={card.key} 
              variants={itemVariants}
            >
              <Link
                to={card.href}
                className="card-surface relative overflow-hidden p-6 md:p-8 flex flex-col h-full group rounded-2xl border border-border-soft bg-white/60 dark:bg-black/20 backdrop-blur-sm hover:shadow-xl hover:shadow-accent-teal/5 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative flex items-start justify-between mb-6">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className="w-12 h-12 rounded-xl bg-accent-teal/10 dark:bg-accent-teal/20 flex items-center justify-center text-accent-teal"
                  >
                    <card.Icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
                    {card.badge}
                  </span>
                </div>

                <h3 className="relative text-xl font-bold text-text-charcoal dark:text-white mb-3">
                  {card.title}
                </h3>
                <p className="relative text-text-muted text-sm leading-relaxed flex-1">
                  {card.description}
                </p>

                <div className="relative mt-8 flex items-center gap-2 text-accent-teal text-sm font-bold">
                  Explore releases
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============== FEATURE STRIP ============== */}
      <motion.section
        className="relative z-10 max-w-5xl mx-auto px-6 pb-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="card-surface p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 rounded-3xl border border-border-soft bg-gradient-to-r from-white/60 to-transparent dark:from-black/40 dark:to-transparent backdrop-blur-md shadow-sm"
        >
          <div className="max-w-xl">
            <h3 className="text-xl md:text-2xl font-bold text-text-charcoal dark:text-white mb-3">
              Every release is a downloadable artifact.
            </h3>
            <p className="text-text-muted text-sm md:text-base leading-relaxed">
              Browse the changelog of any product to download older builds, compare release notes,
              and roll back to a version that worked for your stack. No account, no friction.
            </p>
          </div>
          <Link to="/showcase" className="w-full md:w-auto shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap w-full text-base py-3.5 px-8 rounded-xl shadow-md"
            >
              Open Marketplace 
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>
        </motion.div>
      </motion.section>
    </main>
  );
}
