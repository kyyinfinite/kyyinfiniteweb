import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { IconDownload, IconWhatsApp, IconCode, IconGame, IconHistory } from '../lib/icons.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const CATEGORY_META = {
  'whatsapp-bot': { label: 'WhatsApp Bots', Icon: IconWhatsApp },
  snippet: { label: 'Snippets', Icon: IconCode },
  plugin: { label: 'Game Plugins', Icon: IconGame },
  all: { label: 'All', Icon: IconDownload },
};

function pickCategoryIcon(asset) {
  if (asset.category === 'whatsapp-bot') return IconWhatsApp;
  if (asset.category === 'snippet') return IconCode;
  if (asset.category === 'plugin') return IconGame;
  if (asset.assetType === 'script') return IconCode;
  if (asset.assetType === 'plugin') return IconGame;
  return IconCode;
}

export default function ShowcaseHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('category') || 'all';
  const [filter, setFilter] = useState(initialFilter);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep the URL query string in sync with the active filter so deep-links
  // from the Landing page category cards keep working.
  useEffect(() => {
    if (filter === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', filter);
    }
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const params = filter !== 'all' ? { category: filter } : {};
    api
      .listAssets(params)
      .then((data) => {
        if (isMounted) setAssets(data);
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
  }, [filter]);

  const filters = useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'whatsapp-bot', label: 'WhatsApp Bots' },
      { key: 'snippet', label: 'Snippets' },
      { key: 'plugin', label: 'Game Plugins' },
    ],
    []
  );

  async function handleDownload(event, asset) {
    event.preventDefault();
    event.stopPropagation();
    try {
      const result = await api.downloadAsset(asset._id);
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.setAttribute('download', '');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setAssets((previous) =>
        previous.map((item) =>
          item._id === asset._id ? { ...item, downloadCount: result.downloadCount } : item
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-text-charcoal dark:text-white">Marketplace</h1>
          <p className="text-text-muted mt-2">
            Browse every published asset, then open its changelog page for downloads and release history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === item.key
                  ? 'bg-accent-teal text-white'
                  : 'border border-border-soft dark:border-white/10 text-text-muted hover:text-accent-teal'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <p className="text-red-500 mb-6">{errorMessage}</p>}

      {isLoading ? (
        <p className="text-text-muted">Loading assets.</p>
      ) : assets.length === 0 ? (
        <p className="text-text-muted">No assets published yet in this category.</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {assets.map((asset) => {
            const Icon = pickCategoryIcon(asset);
            const displayVersion = asset.currentVersion || asset.version;
            return (
              <motion.div key={asset._id} variants={itemVariants} whileHover={{ y: -6 }}>
                <Link
                  to={`/products/${asset._id}/changelogs`}
                  className="card-surface p-6 flex flex-col h-full group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-text-light">v{displayVersion}</span>
                  </div>
                  <h3 className="text-text-charcoal dark:text-white font-semibold mb-2">
                    {asset.name || asset.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed flex-1 line-clamp-3">
                    {asset.description}
                  </p>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-xs text-text-light">{asset.downloadCount} downloads</span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-accent-teal">
                        <IconHistory className="w-3.5 h-3.5" /> Changelog
                      </span>
                      <button
                        onClick={(event) => handleDownload(event, asset)}
                        className="flex items-center gap-2 text-accent-teal hover:text-accent-teal-dark text-sm font-medium"
                      >
                        <IconDownload className="w-4 h-4" /> Latest
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </main>
  );
}
