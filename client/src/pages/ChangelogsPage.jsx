import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';
import {
  IconDownload,
  IconWhatsapp,
  IconPlugin,
  IconArrowRight,
  IconFile,
  IconClock,
} from '../lib/icons.jsx';
import NetworkLoader from './NetworkLoader.jsx';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';

const CATEGORY_ICON = {
  'whatsapp-bot': IconWhatsapp,
  plugin: IconPlugin,
};

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(value) {
  const diffMs = Date.now() - new Date(value).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function ChangelogsPage() {
  const { slug } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('readme');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    api
      .getAssetBySlug(slug)
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
  }, [slug]);

  function triggerDownload(url) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleDownloadLatest() {
    if (!asset) return;
    try {
      const result = await api.downloadAsset(asset._id);
      triggerDownload(result.downloadUrl);
      setAsset((previous) => ({ ...previous, downloadCount: result.downloadCount }));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDownloadVersion(changelogId) {
    if (!asset) return;
    try {
      const result = await api.downloadChangelogVersion(asset._id, changelogId);
      triggerDownload(result.downloadUrl);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (isLoading) {
    return <NetworkLoader loadingData label="LOADING PRODUCT DATA" />;
  }

  if (errorMessage || !asset) {
    return (
      <div className="theme-light max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-rust mb-4 font-mono-ui text-sm">{errorMessage || 'Product not found.'}</p>
        <Link to="/showcase" className="text-indigo text-sm">Back to Products</Link>
      </div>
    );
  }

  const Icon = CATEGORY_ICON[asset.category] || IconPlugin;
  const latestChangelog = asset.changelogs && asset.changelogs[0];

  return (
    <main className="theme-light min-h-screen">
      <div className="relative overflow-hidden border-b border-line">
        <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-6">
          <Link to="/showcase" className="text-slate hover:text-indigo text-sm inline-flex items-center gap-2 mb-6 transition-colors duration-200">
            <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Products
          </Link>

          <p className="font-mono-ui text-xs text-mist mb-3">
            kyyinfinite / <span className="text-indigo">{asset.category}</span> / {asset.slug}
          </p>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="min-w-0">
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink flex items-center gap-3 flex-wrap">
                <span className="w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo">
                  <Icon className="w-5 h-5" />
                </span>
                {asset.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-sm text-slate">
                <span className="text-indigo font-mono-ui">v{asset.currentVersion}</span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <IconDownload className="w-3.5 h-3.5" /> {asset.downloadCount} downloads
                </span>
                {latestChangelog && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <IconClock className="w-3.5 h-3.5" /> Updated {timeAgo(latestChangelog.releaseDate)}
                    </span>
                  </>
                )}
              </div>

              {asset.tags && asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full bg-indigo-soft text-indigo-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadLatest}
              className="btn-primary shrink-0 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <IconDownload className="w-4 h-4" /> Download Latest Version
            </motion.button>
          </div>

          <div className="flex gap-6 mt-8 -mb-px">
            {[
              { key: 'readme', label: 'README' },
              { key: 'releases', label: `Releases (${asset.changelogs ? asset.changelogs.length : 0})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative pb-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.key ? 'text-ink' : 'text-mist hover:text-slate'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute left-0 right-0 -bottom-px h-0.5 bg-indigo rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'readme' ? (
          <motion.div
            key="readme"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="max-w-5xl mx-auto px-4 md:px-6 py-8"
          >
            <div className="rounded-t-xl border border-line bg-paper-soft px-4 py-3 flex items-center gap-2 text-sm text-slate">
              <IconFile className="w-4 h-4" />
              README.md
            </div>
            {asset.description ? (
              <MarkdownRenderer content={asset.description} className="kyy-markdown--attached" />
            ) : (
              <div className="kyy-markdown kyy-markdown--attached text-mist text-sm">
                No README provided for this product yet.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="releases"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="max-w-4xl mx-auto px-6 py-8"
          >
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-line" />

              {(asset.changelogs || []).map((entry, index) => (
                <motion.div
                  key={entry._id || index}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="relative mb-10 last:mb-0"
                >
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo" />

                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="font-mono-ui text-sm text-indigo">v{entry.version}</span>
                    <span className="text-xs text-mist">{formatDate(entry.releaseDate)}</span>
                  </div>

                  {entry.notes && entry.notes.length > 0 && (
                    <ul className="space-y-1.5 mb-3">
                      {entry.notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="text-sm text-slate flex gap-2">
                          <span className="text-indigo">-</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => handleDownloadVersion(entry._id)}
                    className="flex items-center gap-1.5 text-xs text-mist hover:text-indigo transition-colors duration-200"
                  >
                    <IconDownload className="w-3.5 h-3.5" /> Download this version
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
