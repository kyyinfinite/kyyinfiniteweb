import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { IconDownload, IconWhatsapp, IconTerminal, IconGamepad } from '../lib/icons.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const CATEGORY_ICON = {
  'whatsapp-bot': IconWhatsapp,
  snippet: IconTerminal,
  plugin: IconGamepad,
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'whatsapp-bot', label: 'WhatsApp Bots' },
  { key: 'snippet', label: 'Snippets' },
  { key: 'plugin', label: 'Game Plugins' },
];

export default function ShowcaseHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const filter = searchParams.get('category') || 'all';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    api
      .listAssets(filter !== 'all' ? { category: filter } : {})
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

  function setFilter(key) {
    if (key === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: key });
    }
  }

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
    <main className="max-w-6xl mx-auto px-6 py-16 bg-zinc-950 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-50">Products</h1>
          <p className="text-zinc-400 mt-2">WhatsApp bots, code snippets, and game plugins, ready to download.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === item.key
                  ? 'bg-cyan-500 text-zinc-950 shadow-glow-cyan'
                  : 'border border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <p className="text-red-400 mb-6 font-mono-ui text-sm">{errorMessage}</p>}

      {isLoading ? (
        <p className="text-zinc-500 font-mono-ui text-sm">Loading products.</p>
      ) : assets.length === 0 ? (
        <p className="text-zinc-500">No products published yet in this category.</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {assets.map((asset) => {
            const Icon = CATEGORY_ICON[asset.category] || IconTerminal;
            return (
              <motion.div key={asset._id} variants={itemVariants} whileHover={{ y: -6 }}>
                <Link to={`/product/${asset.slug}`} className="card-surface p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-zinc-600 font-mono-ui">v{asset.currentVersion}</span>
                  </div>
                  <h3 className="text-zinc-50 font-semibold mb-2">{asset.name}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed flex-1">{asset.description}</p>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-xs text-zinc-600">{asset.downloadCount} downloads</span>
                    <button
                      onClick={(event) => handleDownload(event, asset)}
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      <IconDownload className="w-4 h-4" /> Download
                    </button>
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
