import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import {
  IconDownload,
  IconPlugin,
  IconScript,
  IconWhatsApp,
  IconArrowRight,
  IconHistory,
} from '../lib/icons.jsx';

function pickCategoryIcon(asset) {
  if (asset.category === 'whatsapp-bot') return IconWhatsApp;
  if (asset.category === 'snippet') return IconScript;
  if (asset.category === 'plugin') return IconPlugin;
  return asset.assetType === 'plugin' ? IconPlugin : IconScript;
}

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
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

  async function handleDownload() {
    if (!asset) return;
    setIsDownloading(true);
    try {
      const result = await api.downloadAsset(asset._id);
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.setAttribute('download', '');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setAsset((previous) => ({ ...previous, downloadCount: result.downloadCount }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return <p className="max-w-3xl mx-auto px-6 py-24 text-text-muted text-center">Loading asset.</p>;
  }

  if (errorMessage || !asset) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-red-500 mb-4">{errorMessage || 'Asset not found.'}</p>
        <Link to="/showcase" className="text-accent-teal text-sm">Back to Showcase</Link>
      </div>
    );
  }

  const Icon = pickCategoryIcon(asset);
  const displayVersion = asset.currentVersion || asset.version;
  const displayCategory = asset.category || asset.assetType;
  const displayName = asset.name || asset.title;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/showcase" className="text-text-muted hover:text-accent-teal text-sm inline-flex items-center gap-2 mb-8">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Marketplace
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card-surface p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-text-charcoal dark:text-white">{displayName}</h1>
              <p className="text-text-light text-sm mt-1">
                {displayCategory} - v{displayVersion} - {asset.downloadCount} downloads
              </p>
            </div>
          </div>
        </div>

        <p className="text-text-muted leading-relaxed whitespace-pre-line">{asset.description}</p>

        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
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

        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <IconDownload className="w-4 h-4" /> {isDownloading ? 'Preparing download.' : 'Download latest version'}
          </motion.button>

          <Link
            to={`/products/${asset._id}/changelogs`}
            className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <IconHistory className="w-4 h-4" /> View changelog & older versions
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
