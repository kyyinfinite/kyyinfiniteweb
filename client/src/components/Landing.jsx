import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight, IconWhatsapp, IconTerminal, IconPlugin, IconDownload, IconServer } from '../lib/icons.jsx';
import { api } from '../lib/api.js';
import LiveTerminal from './LiveTerminal.jsx';

const categories = [
  {
    icon: IconWhatsapp,
    title: 'WhatsApp Bots',
    description: 'Premium automation scripts built on Baileys, ready to deploy on your own panel.',
    to: '/showcase?category=whatsapp-bot',
  },
  {
    icon: IconTerminal,
    title: 'Code Snippets',
    description: 'Battle-tested utility snippets and reusable modules across the stack.',
    to: '/snippets',
  },
  {
    icon: IconPlugin,
    title: 'Plugins & Libraries',
    description: 'Custom libraries and plugins built for real projects, from npm packages to bot modules.',
    to: '/showcase?category=plugin',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.listAssets(), api.listProducts()])
      .then(([assets, products]) => {
        if (!isMounted) return;
        setStats({
          totalAssets: assets.length,
          totalDownloads: assets.reduce((sum, asset) => sum + (asset.downloadCount || 0), 0),
          totalPanels: products.length,
        });
      })
      .catch(() => {
        if (isMounted) setStats(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="relative kyy-ambient overflow-hidden">
      {/* Ambient decorative blobs — soft ambient lighting, not neon glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[26rem] h-[26rem] rounded-full bg-[#6D6AE8]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#8F8CF0]/10 blur-3xl"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <motion.section
        className="relative max-w-[1240px] mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="text-center lg:text-left">
          <motion.span variants={itemVariants} className="kyy-badge-soft">
            kyyinfinite.my.id
            <span className="opacity-50">/</span>
            automation marketplace
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl md:text-5xl lg:text-[3.4rem] font-semibold text-[var(--kyy-text)] leading-[1.12] mt-6"
          >
            Premium scripts and plugins
            <br />
            <span className="kyy-underline-sketch text-[var(--kyy-primary)]">built for production</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-[var(--kyy-text-secondary)] max-w-xl mx-auto lg:mx-0 text-base md:text-lg leading-relaxed"
          >
            WhatsApp automation scripts, reusable code snippets, and custom libraries and plugins
            built for real projects. Download instantly, no account required.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
          >
            <Link to="/showcase" className="w-full sm:w-auto">
              <motion.span
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="kyy-btn-primary w-full sm:w-auto"
              >
                Browse Products <IconArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto">
              <motion.span
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="kyy-btn-secondary w-full sm:w-auto"
              >
                <IconServer className="w-4 h-4" /> Deploy a Panel
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex items-center justify-center lg:justify-start gap-2 text-[var(--kyy-text-muted)] font-mono-ui text-xs"
          >
            <IconDownload className="w-4 h-4" />
            <span>No login wall, no waiting page — downloads served directly.</span>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="relative">
          <LiveTerminal />
        </motion.div>
      </motion.section>

      {/* ---------------------------------------------------------------- */}
      {/* Category cards                                                   */}
      {/* ---------------------------------------------------------------- */}
      <motion.section
        className="relative max-w-[1240px] mx-auto px-4 md:px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {categories.map((item) => (
          <motion.div key={item.title} variants={itemVariants}>
            <Link to={item.to} className="kyy-card p-6 flex flex-col h-full group">
              <div className="w-11 h-11 rounded-xl bg-[var(--kyy-primary-soft)] flex items-center justify-center text-[var(--kyy-primary-dark)] mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-[var(--kyy-text)] font-semibold mb-2">{item.title}</h3>
              <p className="text-[var(--kyy-text-secondary)] text-sm leading-relaxed flex-1">{item.description}</p>
              <span className="flex items-center gap-1.5 text-[var(--kyy-primary-dark)] text-sm font-medium mt-5 group-hover:gap-2.5 transition-all duration-200">
                Browse category <IconArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      {/* ---------------------------------------------------------------- */}
      {/* Stats                                                            */}
      {/* ---------------------------------------------------------------- */}
      {stats && (
        <motion.section
          className="relative max-w-4xl mx-auto px-4 md:px-6 pb-24"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <div className="kyy-card grid grid-cols-3 divide-x divide-[var(--kyy-border)]">
            <div className="text-center py-7">
              <p className="font-display text-2xl md:text-3xl font-semibold text-[var(--kyy-text)]">{stats.totalAssets}</p>
              <p className="text-[var(--kyy-text-muted)] text-xs mt-1">Products & Snippets</p>
            </div>
            <div className="text-center py-7">
              <p className="font-display text-2xl md:text-3xl font-semibold text-[var(--kyy-text)]">{stats.totalDownloads}</p>
              <p className="text-[var(--kyy-text-muted)] text-xs mt-1">Total Downloads</p>
            </div>
            <div className="text-center py-7">
              <p className="font-display text-2xl md:text-3xl font-semibold text-[var(--kyy-text)]">{stats.totalPanels}</p>
              <p className="text-[var(--kyy-text-muted)] text-xs mt-1">Hosting Plans</p>
            </div>
          </div>
        </motion.section>
      )}
    </main>
  );
}
