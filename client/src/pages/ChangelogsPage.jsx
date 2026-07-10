import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import {
  IconDownload,
  IconArrowRight,
  IconArrowLeft,
  IconTag,
  IconCalendar,
  IconGitCommit,
  IconPlugin,
  IconScript,
  IconServer,
  IconAlertTriangle,
} from '../lib/icons.jsx';
import NetworkLoader from '../components/NetworkLoader.jsx';

/**
 * ChangelogsPage
 * ---------------------------------------------------------------------------
 * Halaman dinamis berbasis React Router. Menangkap parameter produk via
 * `:slug` (atau `latest` untuk redirect ke produk terbaru).
 *
 * Layout:
 *   1. Hero Section Produk — Nama, Kategori, Versi Terbaru, tombol mencolok
 *      "Download Latest Version" (ke fileUrl versi terbaru).
 *   2. NetworkLoader — tampil selama fetching API (cyberpunk progress bar).
 *   3. Git-style Vertical Timeline — mapping array `changelogs` dari DB.
 *      Setiap node menampilkan: nomor versi, tanggal rilis, bullet notes,
 *      dan tombol unduh kecil (SVG download) khusus versi lawas.
 */

const CATEGORY_META = {
  'whatsapp-bot': {
    label: 'WhatsApp Bot',
    icon: IconServer,
    accent: 'cyan',
    chip: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30',
    dot: 'bg-cyan-400',
    line: 'from-cyan-400/60 via-sky-400/40 to-indigo-400/60',
  },
  snippet: {
    label: 'Snippet Code',
    icon: IconScript,
    accent: 'sky',
    chip: 'text-sky-300 bg-sky-400/10 border-sky-400/30',
    dot: 'bg-sky-400',
    line: 'from-sky-400/60 via-cyan-400/40 to-indigo-400/60',
  },
  plugin: {
    label: 'Game Plugin',
    icon: IconPlugin,
    accent: 'indigo',
    chip: 'text-indigo-300 bg-indigo-400/10 border-indigo-400/30',
    dot: 'bg-indigo-400',
    line: 'from-indigo-400/60 via-sky-400/40 to-cyan-400/60',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function ChangelogsPage() {
  const { slug } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setAsset(null);

    const fetcher = slug === 'latest' ? api.latestAsset() : api.assetBySlug(slug);

    fetcher
      .then((data) => {
        if (!data) {
          setError('Asset not found.');
        } else {
          setAsset(data);
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load asset.');
      })
      .finally(() => {
        // artificial small delay so the NetworkLoader UX is visible even on
        // fast connections — replace with real fetching time in production.
        setTimeout(() => setIsLoading(false), 300);
      });
  }, [slug]);

  // ----- Loading state -------------------------------------------------------
  if (isLoading) {
    return (
      <main className="relative bg-[#09090b] text-zinc-100 min-h-screen px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-cyan-300 transition-colors"
            >
              <IconArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
            <div className="h-4 w-32 rounded bg-zinc-800 animate-pulse mb-4" />
            <div className="h-8 w-72 rounded bg-zinc-800 animate-pulse mb-2" />
            <div className="h-4 w-96 max-w-full rounded bg-zinc-800 animate-pulse mb-8" />
            <NetworkLoader isLoadingData={true} label="FETCHING ASSET MANIFEST" />
          </div>
        </div>
      </main>
    );
  }

  // ----- Error state ---------------------------------------------------------
  if (error || !asset) {
    return (
      <main className="relative bg-[#09090b] text-zinc-100 min-h-screen px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 mx-auto rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center mb-5">
            <IconAlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Asset not available</h1>
          <p className="text-zinc-400 mb-6">
            {error || 'The asset you are looking for could not be loaded.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 hover:border-cyan-400/60 hover:text-cyan-300 transition-colors text-sm"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  // ----- Success state -------------------------------------------------------
  const meta = CATEGORY_META[asset.category] || CATEGORY_META.plugin;
  const latestChangelog =
    Array.isArray(asset.changelogs) && asset.changelogs.length > 0
      ? asset.changelogs[0]
      : null;
  const latestDownloadUrl = latestChangelog?.fileUrl || asset.downloadUrl || '';

  return (
    <main className="relative bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle, ${meta.accent === 'cyan' ? '#22d3ee' : meta.accent === 'sky' ? '#38bdf8' : '#818cf8'}, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-cyan-300 transition-colors mb-10"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {/* ============================================================
            HERO SECTION PRODUK
           ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-8 md:p-10 mb-14"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Icon block */}
            <div
              className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center bg-zinc-800/80 text-${meta.accent}-300 border border-zinc-700`}
            >
              <meta.icon className="w-8 h-8" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[10px] font-mono tracking-wider uppercase ${meta.chip}`}
                >
                  {meta.label}
                </span>
                {asset.platform && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-zinc-700 text-[10px] font-mono tracking-wider uppercase text-zinc-400">
                    {asset.platform}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-700 text-[10px] font-mono tracking-wider uppercase text-zinc-400">
                  <IconTag className="w-3 h-3" />
                  v{asset.currentVersion || latestChangelog?.version || '—'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100 mb-3">
                {asset.name}
              </h1>

              <p className="text-zinc-400 leading-relaxed max-w-2xl">
                {asset.shortDescription || asset.longDescription || 'No description provided.'}
              </p>

              {/* Tags */}
              {Array.isArray(asset.tags) && asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Download CTA — versi terbaru */}
              <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
                {latestDownloadUrl ? (
                  <a
                    href={latestDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-zinc-950 font-semibold shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)] hover:shadow-[0_0_40px_-6px_rgba(34,211,238,0.8)] transition-shadow"
                  >
                    <IconDownload className="w-5 h-5" />
                    Download Latest Version
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-sm">
                    <IconAlertTriangle className="w-4 h-4" />
                    No download URL for latest version
                  </span>
                )}

                {latestChangelog?.releaseDate && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
                    <IconCalendar className="w-4 h-4" />
                    Released {formatDate(latestChangelog.releaseDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ============================================================
            GIT-STYLE VERTICAL TIMELINE
           ============================================================ */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300/80 mb-1.5">
                // Release History
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">
                Changelog Timeline
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase">
              {asset.changelogs?.length || 0} release(s)
            </span>
          </div>

          {!Array.isArray(asset.changelogs) || asset.changelogs.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-500">
              No changelog entries published yet.
            </div>
          ) : (
            <ol className="relative pl-8">
              {/* Vertical line */}
              <div
                className={`absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b ${meta.line}`}
                aria-hidden="true"
              />

              {asset.changelogs.map((entry, index) => {
                const isLatest = index === 0;
                return (
                  <motion.li
                    key={`${entry.version}-${index}`}
                    variants={itemVariants}
                    className="relative pb-8 last:pb-0"
                  >
                    {/* Node dot */}
                    <div className="absolute -left-[1.45rem] top-1.5 flex items-center justify-center">
                      <span
                        className={`w-3 h-3 rounded-full ring-4 ring-[#09090b] ${meta.dot} ${
                          isLatest ? 'shadow-[0_0_14px_2px_rgba(34,211,238,0.6)]' : 'opacity-80'
                        }`}
                      />
                    </div>

                    {/* Card */}
                    <div
                      className={`rounded-xl border p-5 md:p-6 backdrop-blur transition-colors ${
                        isLatest
                          ? 'border-cyan-400/40 bg-cyan-400/5'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <IconGitCommit className={`w-4 h-4 ${isLatest ? 'text-cyan-300' : 'text-zinc-500'}`} />
                          <span className="font-mono text-base font-semibold text-zinc-100">
                            v{entry.version}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
                              LATEST
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                          <IconCalendar className="w-3.5 h-3.5" />
                          {formatDate(entry.releaseDate)}
                        </span>
                      </div>

                      {/* Notes */}
                      {Array.isArray(entry.notes) && entry.notes.length > 0 ? (
                        <ul className="space-y-1.5 mb-5">
                          {entry.notes.map((note, noteIdx) => (
                            <li
                              key={noteIdx}
                              className="flex items-start gap-2 text-sm text-zinc-300 leading-relaxed"
                            >
                              <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${meta.dot}`} />
                              <span className="font-mono">{note}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-zinc-500 italic mb-5">
                          No release notes provided for this version.
                        </p>
                      )}

                      {/* Per-version download */}
                      <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-zinc-800/70">
                        <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-500">
                          {isLatest ? 'Latest build' : 'Legacy build'}
                        </span>
                        {entry.fileUrl ? (
                          <a
                            href={entry.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isLatest
                                ? 'bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 border border-cyan-400/30'
                                : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 border border-zinc-700'
                            }`}
                          >
                            <IconDownload className="w-3.5 h-3.5" />
                            {isLatest ? 'Download Latest' : 'Download v' + entry.version}
                            <IconArrowRight className="w-3 h-3 -rotate-45" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 font-mono">
                            <IconAlertTriangle className="w-3.5 h-3.5" />
                            Archive unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </motion.section>

        {/* Footer CTA */}
        <div className="mt-14 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-300 font-medium">Need a different product?</p>
            <p className="text-xs text-zinc-500 mt-1">
              Browse the full marketplace for more WhatsApp bots, snippets, and plugins.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 hover:border-cyan-400/60 hover:text-cyan-300 transition-colors text-sm"
          >
            Browse Marketplace
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
