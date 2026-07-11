import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight, IconWhatsapp, IconTerminal, IconPlugin, IconDownload, IconServer } from '../lib/icons.jsx';
import { api } from '../lib/api.js';

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
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
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
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
      <motion.div
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute top-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-indigo-500/10 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.section
        className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.p
          variants={itemVariants}
          className="font-mono-ui text-brand-light tracking-widest uppercase text-xs mb-4"
        >
          // kyyinfinite.my.id / automation marketplace
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="font-display text-4xl md:text-6xl font-semibold text-zinc-50 leading-tight"
        >
          Premium Scripts and Plugins
          <br />
          <span className="text-brand-light">Built for Production</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-zinc-400 max-w-2xl mx-auto text-base md:text-lg"
        >
          WhatsApp automation scripts, reusable code snippets, and custom libraries and plugins
          built for real projects. Download instantly, no account required.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-4">
          <Link to="/showcase">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2"
            >
              Browse Products <IconArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
          <Link to="/marketplace">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-outline inline-flex items-center gap-2"
            >
              <IconServer className="w-4 h-4" /> Deploy a Panel
            </motion.span>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="terminal-mockup mt-16 max-w-2xl mx-auto text-left overflow-hidden"
        >
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-zinc-500 font-mono-ui">bash</span>
          </div>
          <div className="p-5 font-mono-ui text-sm leading-relaxed">
            <p className="text-zinc-500">$ npm install @kyyinfinite/baileys</p>
            <p className="text-brand-light mt-1">✓ installed in 1.2s</p>
            <p className="text-zinc-500 mt-3">$ node bot.js</p>
            <p className="text-zinc-400 mt-1">
              <span className="text-brand-light">[kyyinfinite]</span> socket connected, ready for pairing
            </p>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        className="relative max-w-6xl mx-auto px-6 pb-28 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {categories.map((item) => (
          <motion.div key={item.title} variants={itemVariants} whileHover={{ y: -6 }}>
            <Link to={item.to} className="card-surface p-6 flex flex-col h-full group">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.08 }}
                className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light mb-4"
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <h3 className="font-display text-zinc-50 font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed flex-1">{item.description}</p>
              <span className="flex items-center gap-1.5 text-brand-light text-sm font-medium mt-5 group-hover:gap-2.5 transition-all duration-200">
                Browse category <IconArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      {stats && (
        <motion.section
          className="relative max-w-4xl mx-auto px-6 pb-24"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <div className="terminal-mockup grid grid-cols-3 divide-x divide-white/5">
            <div className="text-center py-6">
              <p className="font-display text-2xl md:text-3xl font-semibold text-brand-light">{stats.totalAssets}</p>
              <p className="text-zinc-500 text-xs mt-1">Products & Snippets</p>
            </div>
            <div className="text-center py-6">
              <p className="font-display text-2xl md:text-3xl font-semibold text-brand-light">{stats.totalDownloads}</p>
              <p className="text-zinc-500 text-xs mt-1">Total Downloads</p>
            </div>
            <div className="text-center py-6">
              <p className="font-display text-2xl md:text-3xl font-semibold text-brand-light">{stats.totalPanels}</p>
              <p className="text-zinc-500 text-xs mt-1">Hosting Plans</p>
            </div>
          </div>
        </motion.section>
      )}

      <motion.section
        className="relative max-w-4xl mx-auto px-6 pb-24 flex items-center justify-center gap-3 text-zinc-600 font-mono-ui text-xs"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <IconDownload className="w-4 h-4" />
        <span>All downloads served directly, no login wall, no waiting page.</span>
      </motion.section>
    </main>
  );
}
