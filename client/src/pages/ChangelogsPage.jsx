import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';
import NetworkLoader from './NetworkLoader.jsx';
import {
  IconDownload,
  IconWhatsApp,
  IconCode,
  IconGame,
  IconArrowRight,
  IconChevronLeft,
  IconCalendar,
  IconTag,
  IconHistory,
  IconBolt,
} from '../lib/icons.jsx';

/**
 * ChangelogsPage
 * --------------
 * Dynamic per-product changelog & download page.
 *
 * Routing:
 *   /products/:id/changelogs
 *   /products/:slug/changelogs
 *
 * The page:
 *   1. Shows a "Hero Section Produk" with name, category, currentVersion,
 *      and a prominent "Download Latest Version" button.
 *   2. Renders a Git-style vertical timeline by mapping over the `changelogs`
 *      array returned by the backend, each node exposing version, releaseDate,
 *      notes (bullet list), and a small per-version download button.
 *   3. Wraps the initial data fetch in <NetworkLoader /> so visitors on slow
 *      links see a network-aware progress bar instead of a blank page.
 */

const CATEGORY_META = {
  'whatsapp-bot': { label: 'WhatsApp Bot', Icon: IconWhatsApp },
  snippet: { label: 'Code Snippet', Icon: IconCode },
  plugin: { label: 'Game Plugin', Icon: IconGame },
  script: { label: 'Script', Icon: IconCode },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function formatDate(value) {
  if (!value) return 'Unknown date';
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}

function resolveDownloadUrl(asset) {
  // Prefer the new blueprint field, fall back to legacy CDN url.
  return asset.downloadUrl || asset.firebaseCdnUrl || '';
}

function resolveLatestVersion(asset) {
  if (asset.changelogs && asset.changelogs.length > 0) {
    return asset.changelogs[0].version || asset.currentVersion || asset.version || '1.0.0';
  }
  return asset.currentVersion || asset.version || '1.0.0';
}

function resolveLatestFileUrl(asset) {
  if (asset.changelogs && asset.changelogs.length > 0 && asset.changelogs[0].fileUrl) {
    return asset.changelogs[0].fileUrl;
  }
  return resolveDownloadUrl(asset);
}

function triggerDownload(url) {
  if (!url) return;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '');
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function ChangelogsPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadingVersion, setDownloadingVersion] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage('');
    api
      .getAsset(id)
      .then((data) => {
        if (isMounted) setAsset(data);
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(error.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const categoryMeta = useMemo(() => {
    if (!asset) return CATEGORY_META.snippet;
    return CATEGORY_META[asset.category] || CATEGORY_META[asset.assetType] || CATEGORY_META.snippet;
  }, [asset]);

  const sortedChangelogs = useMemo(() => {
    if (!asset || !Array.isArray(asset.changelogs)) return [];
    return [...asset.changelogs].sort(
      (a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0)
    );
  }, [asset]);

  const latestVersion = useMemo(() => (asset ? resolveLatestVersion(asset) : ''), [asset]);
  const latestFileUrl = useMemo(() => (asset ? resolveLatestFileUrl(asset) : ''), [asset]);

  async function handleDownloadLatest() {
    if (!asset) return;
    setDownloadingVersion('latest');
    try {
      // Bump the download counter through the existing endpoint, then trigger the file download.
      try {
        await api.downloadAsset(asset._id);
      } catch {
        /* Counter bump is best-effort; don't block the actual download. */
      }
      triggerDownload(latestFileUrl);
    } finally {
      setDownloadingVersion(null);
    }
  }

  function handleDownloadVersion(entry) {
    if (!entry.fileUrl) return;
    setDownloadingVersion(entry.version);
    triggerDownload(entry.fileUrl);
    setTimeout(() => setDownloadingVersion(null), 800);
  }

  // ---------- Loading state ----------
  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16">
        <NetworkLoader active={isLoading} label="Fetching product changelog" />
      </main>
    );
  }

  // ---------- Error state ----------
  if (errorMessage || !asset) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-red-500 mb-4">{errorMessage || 'Product not found.'}</p>
        <Link to="/showcase" className="text-accent-teal text-sm inline-flex items-center gap-1.5">
          <IconChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const CategoryIcon = categoryMeta.Icon;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <Link
        to="/showcase"
        className="text-text-muted hover:text-accent-teal text-sm inline-flex items-center gap-1.5 mb-8"
      >
        <IconChevronLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {/* ============== HERO SECTION PRODUK ============== */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card-surface p-8 md:p-10 mb-12 relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-teal/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark shrink-0">
            <CategoryIcon className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-teal-glow text-accent-teal-dark">
                <IconTag className="w-3 h-3" /> {categoryMeta.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-border-soft dark:border-white/10 text-text-muted">
                <IconBolt className="w-3 h-3 text-accent-teal" /> v{latestVersion}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold text-text-charcoal dark:text-white">
              {asset.name || asset.title}
            </h1>

            {asset.description && (
              <p className="text-text-muted mt-3 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {asset.description}
              </p>
            )}

            {asset.tags && asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-accent-teal-glow text-accent-teal-dark"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadLatest}
                disabled={!latestFileUrl || downloadingVersion === 'latest'}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <IconDownload className="w-4 h-4" />
                {downloadingVersion === 'latest' ? 'Preparing download...' : 'Download Latest Version'}
              </motion.button>

              <span className="text-xs text-text-light font-mono">
                {asset.downloadCount || 0} downloads
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ============== GIT-STYLE VERTICAL TIMELINE ============== */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <IconHistory className="w-5 h-5 text-accent-teal" />
          <h2 className="text-lg font-semibold text-text-charcoal dark:text-white">Release History</h2>
          <span className="text-xs text-text-light font-mono ml-2">
            {sortedChangelogs.length} release{sortedChangelogs.length === 1 ? '' : 's'}
          </span>
        </div>

        {sortedChangelogs.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <p className="text-text-muted text-sm">
              No changelog entries have been published yet for this product.
            </p>
          </div>
        ) : (
          <motion.ol
            className="relative pl-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Vertical rail */}
            <span
              className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-accent-teal via-accent-teal/40 to-transparent"
              aria-hidden="true"
            />

            {sortedChangelogs.map((entry, index) => {
              const isLatest = index === 0;
              const isDownloading = downloadingVersion === entry.version;
              return (
                <motion.li
                  key={`${entry.version}-${index}`}
                  variants={itemVariants}
                  className="relative pb-10 last:pb-0"
                >
                  {/* Timeline node */}
                  <span
                    className={`absolute -left-[1.4rem] top-1.5 w-4 h-4 rounded-full border-2 ${
                      isLatest
                        ? 'bg-accent-teal border-accent-teal shadow-[0_0_12px_rgba(80,200,194,0.6)]'
                        : 'bg-white dark:bg-text-charcoal border-border-soft dark:border-white/20'
                    }`}
                  />

                  <div className="card-surface p-5 md:p-6">
                    {/* Header row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-base font-semibold font-mono ${
                            isLatest ? 'text-accent-teal' : 'text-text-charcoal dark:text-white'
                          }`}
                        >
                          v{entry.version}
                        </span>
                        {isLatest && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-teal-glow text-accent-teal-dark">
                            Latest
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-text-light font-mono">
                        <IconCalendar className="w-3.5 h-3.5" />
                        {formatDate(entry.releaseDate)}
                      </div>
                    </div>

                    {/* Release notes */}
                    {Array.isArray(entry.notes) && entry.notes.length > 0 ? (
                      <ul className="space-y-1.5 mb-4">
                        {entry.notes.map((note, noteIndex) => (
                          <li
                            key={noteIndex}
                            className="flex items-start gap-2 text-sm text-text-muted leading-relaxed"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-teal/60 shrink-0" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-text-light italic mb-4">
                        No release notes were attached to this version.
                      </p>
                    )}

                    {/* Per-version download */}
                    {entry.fileUrl && (
                      <button
                        onClick={() => handleDownloadVersion(entry)}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-teal hover:text-accent-teal-dark transition-colors disabled:opacity-60"
                      >
                        <IconDownload className="w-3.5 h-3.5" />
                        {isDownloading ? 'Preparing...' : `Download v${entry.version}`}
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>
        )}
      </section>

      {/* ============== FOOTER NAV ============== */}
      <div className="mt-16 flex justify-center">
        <Link
          to="/showcase"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal"
        >
          <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Marketplace
        </Link>
      </div>
    </main>
  );
}
