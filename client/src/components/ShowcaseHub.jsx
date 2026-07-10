import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { IconDownload, IconPlugin, IconScript } from '../lib/icons.jsx';

export default function ShowcaseHub() {
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    api
      .listAssets(filter !== 'all' ? { assetType: filter } : {})
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
      { key: 'plugin', label: 'Plugins' },
      { key: 'script', label: 'Scripts' },
    ],
    []
  );

  async function handleDownload(asset) {
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
          <h1 className="text-3xl font-semibold text-text-charcoal dark:text-white">Showcase Hub</h1>
          <p className="text-text-muted mt-2">Published plugins and scripts, ready for instant download.</p>
        </div>
        <div className="flex gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const Icon = asset.assetType === 'plugin' ? IconPlugin : IconScript;
            return (
              <div key={asset._id} className="card-surface p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-text-light">v{asset.version}</span>
                </div>
                <h3 className="text-text-charcoal dark:text-white font-semibold mb-2">{asset.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-1">{asset.description}</p>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-xs text-text-light">{asset.downloadCount} downloads</span>
                  <button
                    onClick={() => handleDownload(asset)}
                    className="flex items-center gap-2 text-accent-teal hover:text-accent-teal-dark text-sm font-medium"
                  >
                    <IconDownload className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
