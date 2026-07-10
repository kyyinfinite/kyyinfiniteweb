import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight, IconWhatsapp, IconTerminal, IconGamepad, IconDownload, IconServer } from '../lib/icons.jsx';

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
    to: '/showcase?category=snippet',
  },
  {
    icon: IconGamepad,
    title: 'Game Plugins',
    description: 'TheoTown and Minecraft plugins engineered for stability at scale.',
    to: '/showcase?category=plugin',
  },
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
    <main className="relative overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
      <motion.div
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"
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
          className="font-mono-ui text-cyan-400 tracking-widest uppercase text-xs mb-4"
        >
          // kyyinfinite.my.id / automation marketplace
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-semibold text-zinc-50 leading-tight"
        >
          Premium Scripts and Plugins
          <br />
          <span className="text-cyan-400">Built for Production</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-zinc-400 max-w-2xl mx-auto text-base md:text-lg"
        >
          WhatsApp automation scripts, reusable code snippets, and game plugins for TheoTown and
          Minecraft. Download instantly, no account required.
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
                className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4"
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <h3 className="text-zinc-50 font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed flex-1">{item.description}</p>
              <span className="flex items-center gap-1.5 text-cyan-400 text-sm font-medium mt-5 group-hover:gap-2.5 transition-all duration-200">
                Browse category <IconArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.section>

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
