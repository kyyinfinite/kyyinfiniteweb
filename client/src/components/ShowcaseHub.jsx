import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { IconDownload, IconWhatsapp, IconPlugin } from '../lib/icons.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { SkeletonGrid, EmptyState } from './Skeleton.jsx';
import AssetPurchaseModal from './AssetPurchaseModal.jsx';

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
  plugin: IconPlugin,
};

const CATEGORY_BADGE = {
  'whatsapp-bot': { label: 'WhatsApp Bot', className: 'bg-clover-soft text-clover border-clover/30' },
  plugin: { label: 'Plugin', className: 'bg-indigo-soft text-indigo-dark border-indigo/30' },
};

function toPlainExcerpt(markdown, maxLength = 150) {
  if (!markdown) return '';
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength).trim()}...` : plain;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'whatsapp-bot', label: 'WhatsApp Bots' },
  { key: 'plugin', label: 'Plugins' },
  { key: 'snippets', label: 'Snippets', external: '/snippets' },
];

export default function ShowcaseHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [purchaseAsset, setPurchaseAsset] = useState(null);
  const showToast = useToast();

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

  function setFilter(item) {
    if (item.external) {
      navigate(item.external);
      return;
    }
    if (item.key === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: item.key });
    }
  }

  async function handleDownload(event, asset) {
    event.preventDefault();
    event.stopPropagation();
    try {
      let licenseKey;
      if (asset.isPremium) {
        licenseKey = window.prompt(`Enter your license key for ${asset.name}`);
        if (!licenseKey) return;
      }
      const result = await api.downloadAsset(asset._id, licenseKey);
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
      showToast(`${asset.name} downloaded`, { type: 'success' });
    } catch (error) {
      setErrorMessage(error.message);
      showToast(error.message, { type: 'error' });
    }
  }

  return (
    <main className="theme-light max-w-6xl mx-auto px-6 py-16 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Products</h1>
          <p className="text-slate mt-2">WhatsApp bots, libraries, and reusable plugins, ready to download.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                !item.external && filter === item.key
                  ? 'bg-indigo text-white'
                  : 'border border-line text-slate hover:text-indigo hover:border-indigo/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <p className="text-rust mb-6 font-mono-ui text-sm">{errorMessage}</p>}

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : assets.length === 0 ? (
        <EmptyState
          title="Belum ada produk di kategori ini"
          description="Coba pilih kategori lain atau kembali lagi nanti."
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {assets.map((asset) => {
            const Icon = CATEGORY_ICON[asset.category] || IconPlugin;
            const badge = CATEGORY_BADGE[asset.category];
            return (
              <motion.div key={asset._id} variants={itemVariants} whileHover={{ y: -2 }}>
                <Link to={`/product/${asset.slug}`} className="card-surface p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-soft flex items-center justify-center text-indigo">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-mist font-mono-ui">v{asset.currentVersion}</span>
                  </div>

                  {badge && (
                    <span
                      className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full text-[11px] font-medium border mb-3 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}

                  {asset.isPremium && (
                    <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-amber-soft text-amber border-amber/30 mb-3">
                      Premium · Rp {asset.price?.toLocaleString('id-ID')}
                    </span>
                  )}

                  <h3 className="font-display text-ink font-semibold mb-2">{asset.name}</h3>
                  <p
                    className="text-slate text-sm leading-relaxed flex-1"
                    style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {toPlainExcerpt(asset.description)}
                  </p>

                  {asset.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {asset.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-paper-soft border border-line text-slate text-[11px] font-mono-ui">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
                    <span className="text-xs text-mist">{asset.downloadCount} downloads</span>
                    {asset.isPremium ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(event) => handleDownload(event, asset)}
                          className="text-slate hover:text-ink text-xs transition-colors duration-200"
                        >
                          Punya key?
                        </button>
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setPurchaseAsset(asset);
                          }}
                          className="flex items-center gap-2 text-indigo hover:text-indigo-dark text-sm font-medium transition-colors duration-200"
                        >
                          <IconDownload className="w-4 h-4" /> Beli License
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(event) => handleDownload(event, asset)}
                        className="flex items-center gap-2 text-indigo hover:text-indigo-dark text-sm font-medium transition-colors duration-200"
                      >
                        <IconDownload className="w-4 h-4" /> Download
                      </button>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {purchaseAsset && (
        <AssetPurchaseModal asset={purchaseAsset} onClose={() => setPurchaseAsset(null)} />
      )}
    </main>
  );
}
