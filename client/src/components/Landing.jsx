import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconArrowRight,
  IconPlugin,
  IconServer,
  IconScript,
  IconDownload,
  IconTicket,
} from '../lib/icons.jsx';

const highlights = [
  {
    icon: IconScript,
    title: 'Script and Plugin CDN',
    description: 'Instant public downloads served directly from Firebase Storage, indexed and tracked in MongoDB.',
  },
  {
    icon: IconServer,
    title: 'Automated Provisioning',
    description: 'Guest checkout via Midtrans QRIS instantly provisions a live Pterodactyl panel server.',
  },
  {
    icon: IconPlugin,
    title: 'No Login Required',
    description: 'Every visitor browses, downloads, and purchases without creating an account.',
  },
];

const stats = [
  { icon: IconDownload, label: 'Downloads served', value: '12K+' },
  { icon: IconServer, label: 'Servers provisioned', value: '340+' },
  { icon: IconTicket, label: 'Orders completed', value: '520+' },
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

      <motion.section
        className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.p
          variants={itemVariants}
          className="text-accent-teal font-medium tracking-wide uppercase text-xs mb-4"
        >
          kyyinfinite.my.id
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-semibold text-text-charcoal dark:text-white leading-tight"
        >
          Personal Portfolio, CDN and
          <br />
          <span className="relative inline-block text-accent-teal">
            Automated Marketplace
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
          className="mt-6 text-text-muted max-w-2xl mx-auto text-base md:text-lg"
        >
          Explore published plugins and scripts, download instantly, and deploy your own Pterodactyl
          panel server through a fully automated guest checkout.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-4">
          <Link to="/showcase">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2"
            >
              Browse Showcase <IconArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
          <Link to="/marketplace">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-outline inline-block"
            >
              Open Marketplace
            </motion.span>
          </Link>
        </motion.div>
      </motion.section>

      <motion.section
        className="relative max-w-4xl mx-auto px-6 pb-20 grid grid-cols-3 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={containerVariants}
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} className="text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark mb-3">
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl md:text-3xl font-semibold text-text-charcoal dark:text-white">{stat.value}</p>
            <p className="text-text-muted text-xs md:text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        className="relative max-w-6xl mx-auto px-6 pb-28 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {highlights.map((item) => (
          <motion.div
            key={item.title}
            variants={itemVariants}
            whileHover={{ y: -6 }}
            className="card-surface p-6"
          >
            <motion.div
              whileHover={{ rotate: 8, scale: 1.08 }}
              className="w-11 h-11 rounded-xl bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark mb-4"
            >
              <item.icon className="w-5 h-5" />
            </motion.div>
            <h3 className="text-text-charcoal dark:text-white font-semibold mb-2">{item.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </motion.section>
    </main>
  );
}
