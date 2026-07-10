import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconArrowRight,
  IconPlugin,
  IconScript,
  IconServer,
  IconDownload,
  IconShieldCheck,
  IconBolt,
} from '../lib/icons.jsx';

/**
 * Landing (Marketplace Hero)
 * ---------------------------------------------------------------------------
 * Halaman depan Kyyinfinite setelah transformasi murni menjadi Marketplace &
 * Project Sharing Platform.
 *
 * Struktur:
 *   1. Hero — value proposition + dual CTA (Browse / Latest Releases)
 *   2. Category Grid — kartu navigasi instan ke 3 kategori produk:
 *      WhatsApp Bots / Snippet Code / Game Plugins (SVG murni, no emoji)
 *   3. Feature Strip — 3 pilar produk (Premium Automation / Versioned
 *      Releases / No Login Required)
 *   4. CTA Band — ajakan langsung ke halaman changelog terbaru
 *
 * Tema: Cyberpunk Dark Modern (#09090b base, zinc-800 surface, cyan/sky/indigo
 * accent). Tidak menggunakan emoji sama sekali.
 */

const categories = [
  {
    to: '/marketplace?category=whatsapp-bot',
    icon: IconServer,
    name: 'WhatsApp Bots',
    blurb: 'Script otomasi Baileys & ESM, siap deploy ke VPS atau panel Pterodactyl.',
    accent: 'cyan',
    stat: '24 builds',
  },
  {
    to: '/marketplace?category=snippet',
    icon: IconScript,
    name: 'Snippet Code',
    blurb: 'Modul reusable Node.js, helper browser, dan utilitas dev-produksi.',
    accent: 'sky',
    stat: '138 snippets',
  },
  {
    to: '/marketplace?category=plugin',
    icon: IconPlugin,
    name: 'Game Plugins',
    blurb: 'Plugin TheoTown dan Minecraft, lengkap dengan changelog per versi.',
    accent: 'indigo',
    stat: '17 plugins',
  },
];

const ACCENT_MAP = {
  cyan: {
    ring: 'group-hover:border-cyan-400/60',
    glow: 'group-hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.55)]',
    chip: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30',
    iconBg: 'bg-cyan-400/10 text-cyan-300 group-hover:bg-cyan-400/20',
  },
  sky: {
    ring: 'group-hover:border-sky-400/60',
    glow: 'group-hover:shadow-[0_0_40px_-12px_rgba(56,189,248,0.55)]',
    chip: 'text-sky-300 bg-sky-400/10 border-sky-400/30',
    iconBg: 'bg-sky-400/10 text-sky-300 group-hover:bg-sky-400/20',
  },
  indigo: {
    ring: 'group-hover:border-indigo-400/60',
    glow: 'group-hover:shadow-[0_0_40px_-12px_rgba(129,140,248,0.55)]',
    chip: 'text-indigo-300 bg-indigo-400/10 border-indigo-400/30',
    iconBg: 'bg-indigo-400/10 text-indigo-300 group-hover:bg-indigo-400/20',
  },
};

const pillars = [
  {
    icon: IconBolt,
    title: 'Premium Automation Scripts',
    description:
      'Bot WhatsApp dan plugin yang ditulis dengan standar production-grade: error handling, modular commands, dan dokumentasi lengkap. Bukan script copas biasa.',
  },
  {
    icon: IconDownload,
    title: 'Versioned Releases',
    description:
      'Setiap produk punya changelog Git-style. Anda bisa download versi lawas, lihat breaking changes, dan upgrade di waktu yang Anda pilih.',
  },
  {
    icon: IconShieldCheck,
    title: 'No Login Required',
    description:
      'Browse, download, dan deploy tanpa bikin akun. Semua asset publik di-serve langsung dari CDN dengan tracking download real-time.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing() {
  return (
    <main className="relative bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Background ambient glows */}
      <motion.div
        className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-cyan-500/15 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute top-32 -right-40 w-[34rem] h-[34rem] rounded-full bg-indigo-500/15 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ============================================================
          1. HERO SECTION
         ============================================================ */}
      <motion.section
        className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700/60 bg-zinc-900/60 backdrop-blur text-[11px] font-mono tracking-[0.18em] uppercase text-cyan-300 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          kyyinfinite.my.id / marketplace
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight"
        >
          Premium Automation Scripts
          <br />
          <span className="relative inline-block bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            & Game Plugins Marketplace
            <motion.span
              className="absolute left-0 -bottom-2 h-px w-full bg-gradient-to-r from-cyan-400/0 via-cyan-400/60 to-indigo-400/0"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
            />
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-7 max-w-2xl mx-auto text-base md:text-lg text-zinc-400 leading-relaxed"
        >
          Download script bot WhatsApp, code snippet reusable, dan plugin
          TheoTown / Minecraft. Setiap rilis dipaket dengan changelog
          Git-style, siap di-deploy tanpa akun.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/marketplace">
            <motion.span
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-zinc-950 font-semibold shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)] hover:shadow-[0_0_40px_-6px_rgba(34,211,238,0.8)] transition-shadow"
            >
              Browse Marketplace
              <IconArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
          <Link to="/changelogs/latest">
            <motion.span
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-cyan-400/60 hover:text-cyan-300 transition-colors font-medium"
            >
              <IconDownload className="w-4 h-4" />
              Latest Releases
            </motion.span>
          </Link>
        </motion.div>

        {/* Hero metric strip */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { label: 'Total Assets', value: '179+' },
            { label: 'Downloads Served', value: '12.4K' },
            { label: 'Active Versions', value: '420+' },
            { label: 'Avg Release Cycle', value: '7 days' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur px-4 py-3 text-left"
            >
              <p className="text-xl md:text-2xl font-semibold text-zinc-100 tabular-nums">
                {stat.value}
              </p>
              <p className="text-[11px] tracking-wider uppercase text-zinc-500 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ============================================================
          2. CATEGORY GRID — instant navigation cards (SVG only)
         ============================================================ */}
      <motion.section
        className="relative max-w-6xl mx-auto px-6 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300/80 mb-2">
              // 01 — Product Categories
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
              Pilih kategori produk digital
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-sm text-zinc-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
          >
            Lihat semua
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const accent = ACCENT_MAP[cat.accent];
            return (
              <motion.div key={cat.name} variants={itemVariants}>
                <Link to={cat.to} className="group block h-full">
                  <div
                    className={`relative h-full p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur transition-all duration-300 ${accent.ring} ${accent.glow}`}
                  >
                    {/* Decorative corner mark */}
                    <div className="absolute top-3 right-3 text-zinc-700 group-hover:text-cyan-400/60 transition-colors">
                      <IconArrowRight className="w-4 h-4 -rotate-45" />
                    </div>

                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${accent.iconBg}`}
                    >
                      <cat.icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                      {cat.blurb}
                    </p>

                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[10px] font-mono tracking-wider uppercase ${accent.chip}`}
                      >
                        {cat.stat}
                      </span>
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        Browse →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ============================================================
          3. PILLAR STRIP
         ============================================================ */}
      <motion.section
        className="relative max-w-6xl mx-auto px-6 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.p
          variants={itemVariants}
          className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300/80 mb-2"
        >
          // 02 — Why Kyyinfinite
        </motion.p>
        <motion.h2
          variants={itemVariants}
          className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-10"
        >
          Dibangun untuk developer & power user
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((p) => (
            <motion.div
              key={p.title}
              variants={itemVariants}
              className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-cyan-400/10 text-cyan-300">
                <p.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============================================================
          4. CTA BAND
         ============================================================ */}
      <motion.section
        className="relative max-w-6xl mx-auto px-6 pb-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-cyan-950/40 px-8 py-12 md:px-14 md:py-16"
        >
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(129,140,248,0.15), transparent 40%)',
            }}
          />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300/80 mb-2">
                // 03 — Ready to deploy?
              </p>
              <h2 className="text-2xl md:text-4xl font-semibold text-zinc-100 max-w-xl">
                Mulai dari changelog terbaru. Tanpa registrasi.
              </h2>
              <p className="text-zinc-400 mt-3 max-w-lg">
                Setiap halaman produk menyertakan timeline rilis lengkap dan
                tombol download langsung untuk setiap versi.
              </p>
            </div>
            <Link to="/changelogs/latest">
              <motion.span
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-zinc-950 font-semibold shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)]"
              >
                Open Changelog Hub
                <IconArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
