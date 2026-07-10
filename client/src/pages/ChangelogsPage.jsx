import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { IconDownload, IconWhatsapp, IconTerminal, IconGamepad, IconArrowRight } from '../lib/icons.jsx';
import NetworkLoader from './NetworkLoader.jsx';

const CATEGORY_ICON = {
  'whatsapp-bot': IconWhatsapp,
  snippet: IconTerminal,
  plugin: IconGamepad,
};

const CATEGORY_LABEL = {
  'whatsapp-bot': 'WhatsApp Bot',
  snippet: 'Code Snippet',
  plugin: 'Game Plugin',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ChangelogsPage() {
  const { slug } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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

  function triggerDownload(url) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  if (isLoading) {
    return <NetworkLoader loadingData label="LOADING PRODUCT DATA" />;
  }

  if (errorMessage || !asset) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-red-400 mb-4 font-mono-ui text-sm">{errorMessage || 'Product not found.'}</p>
        <Link to="/showcase" className="text-cyan-400 text-sm">Back to Products</Link>
      </div>
    );
  }

  const Icon = CATEGORY_ICON[asset.category] || IconTerminal;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/showcase" className="text-zinc-500 hover:text-cyan-400 text-sm inline-flex items-center gap-2 mb-8">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Products
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card-surface p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

        <div className="relative flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-mono-ui text-xs text-cyan-400 uppercase tracking-widest">
                {CATEGORY_LABEL[asset.category] || asset.category}
              </p>
              <h1 className="text-2xl font-semibold text-zinc-50 mt-1">{asset.name}</h1>
              <p className="text-zinc-500 text-sm mt-1">
                v{asset.currentVersion} - {asset.downloadCount} downloads
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-zinc-400 leading-relaxed">{asset.description}</p>

        {asset.tags && asset.tags.length > 0 && (
          <div className="relative flex flex-wrap gap-2 mt-6">
            {asset.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {tag}
              </span>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadLatest}
          className="relative btn-primary w-full md:w-auto flex items-center justify-center gap-2 mt-10"
        >
          <IconDownload className="w-4 h-4" /> Download Latest Version
        </motion.button>
      </motion.section>

      <div className="mt-14">
        <h2 className="text-lg font-semibold text-zinc-100 mb-8 font-mono-ui uppercase tracking-wide text-sm">
          Version History
        </h2>

        <div className="relative pl-6">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-zinc-800" />

          {asset.changelogs.map((entry, index) => (
            <motion.div
              key={entry._id || index}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative mb-10 last:mb-0"
            >
              <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-cyan-400 shadow-glow-cyan" />

              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="font-mono-ui text-sm text-cyan-400">v{entry.version}</span>
                <span className="text-xs text-zinc-500">{formatDate(entry.releaseDate)}</span>
              </div>

              {entry.notes && entry.notes.length > 0 && (
                <ul className="space-y-1.5 mb-3">
                  {entry.notes.map((note, noteIndex) => (
                    <li key={noteIndex} className="text-sm text-zinc-400 flex gap-2">
                      <span className="text-cyan-500">-</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => handleDownloadVersion(entry._id)}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 transition-colors duration-200"
              >
                <IconDownload className="w-3.5 h-3.5" /> Download this version
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
