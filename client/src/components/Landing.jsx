import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight, IconWhatsapp, IconTerminal, IconPlugin, IconDownload, IconServer } from '../lib/icons.jsx';
import { api } from '../lib/api.js';
import LiveTerminal from './LiveTerminal.jsx';

const categories = [
  {
    icon: IconWhatsapp,
    title: 'WhatsApp bots',
    description: 'Premium automation scripts built on Baileys, ready to deploy on your own panel.',
    to: '/showcase?category=whatsapp-bot',
  },
  {
    icon: IconTerminal,
    title: 'Code snippets',
    description: 'Battle-tested utility snippets and reusable modules across the stack.',
    to: '/snippets',
  },
  {
    icon: IconPlugin,
    title: 'Plugins & libraries',
    description: 'Custom libraries and plugins built for real projects, from npm packages to bot modules.',
    to: '/showcase?category=plugin',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
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
    <main className="theme-light relative overflow-hidden">
      {/* Ambient light, not glow: one soft gradient behind the hero, low opacity, no motion */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] ambient-blob"
        style={{
          background:
            'radial-gradient(circle, rgba(88,80,230,0.10) 0%, rgba(88,80,230,0) 60%)',
        }}
      />

      <motion.section
        className="relative max-w-shell mx-auto px-6 pt-20 pb-20 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div>
          <motion.p variants={itemVariants} className="text-indigo font-medium text-sm mb-4">
            Automation marketplace
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl md:text-[3.4rem] font-semibold text-ink leading-[1.08]"
          >
            Premium scripts and plugins, built for production
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-6 text-slate max-w-lg text-base md:text-lg leading-relaxed">
            WhatsApp automation scripts, reusable code snippets, and custom libraries built for
            real projects. Download instantly — no account required.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-9 flex items-center gap-4">
            <Link to="/showcase" className="btn-primary inline-flex items-center gap-2">
              Browse products <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/marketplace" className="btn-outline inline-flex items-center gap-2">
              <IconServer className="w-4 h-4" /> Deploy a panel
            </Link>
          </motion.div>

          {stats && (
            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8">
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{stats.totalAssets}</p>
                <p className="text-slate text-xs mt-1">Products & snippets</p>
              </div>
              <div className="w-px h-9 bg-line" />
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{stats.totalDownloads}</p>
                <p className="text-slate text-xs mt-1">Total downloads</p>
              </div>
              <div className="w-px h-9 bg-line" />
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{stats.totalPanels}</p>
                <p className="text-slate text-xs mt-1">Hosting plans</p>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div variants={itemVariants}>
          <LiveTerminal />
        </motion.div>
      </motion.section>

      <motion.section
        className="relative max-w-shell mx-auto px-6 pb-28 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {categories.map((item) => (
          <motion.div key={item.title} variants={itemVariants}>
            <Link to={item.to} className="card-surface p-6 flex flex-col h-full group">
              <div className="w-11 h-11 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-ink font-semibold mb-2">{item.title}</h3>
              <p className="text-slate text-sm leading-relaxed flex-1">{item.description}</p>
              <span className="flex items-center gap-1.5 text-indigo text-sm font-medium mt-5 group-hover:gap-2.5 transition-all duration-200">
                Browse category <IconArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        className="relative max-w-shell mx-auto px-6 pb-24 flex items-center justify-center gap-2.5 text-slate text-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <IconDownload className="w-4 h-4" />
        <span>All downloads served directly — no login wall, no waiting page.</span>
      </motion.section>
    </main>
  );
}
