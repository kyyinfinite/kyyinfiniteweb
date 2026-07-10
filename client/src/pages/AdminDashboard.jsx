import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAdmin } from '../context/AdminContext.jsx';
import { firebaseStorage } from '../firebase.js';
import { api } from '../lib/api.js';
import {
  IconChart,
  IconPlugin,
  IconTicket,
  IconUpload,
  IconServer,
  IconDownload,
  IconScript,
} from '../lib/icons.jsx';

const TABS = [
  { key: 'metrics', label: 'Metrics', icon: IconChart },
  { key: 'assets', label: 'Asset Manager', icon: IconPlugin },
  { key: 'snippets', label: 'Snippets', icon: IconScript },
  { key: 'changelog', label: 'Changelog', icon: IconUpload },
  { key: 'orders', label: 'Orders and Tickets', icon: IconTicket },
];

export default function AdminDashboard() {
  const { adminUser, idToken, isLoading, logout, refreshToken } = useAdmin();
  const [activeTab, setActiveTab] = useState('metrics');

  if (isLoading) {
    return <p className="text-center py-24 text-text-muted">Verifying admin session.</p>;
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-text-charcoal dark:text-white">Admin Dashboard</h1>
          <p className="text-text-muted mt-1 text-sm">{adminUser.email}</p>
        </div>
        <button onClick={logout} className="btn-outline w-fit">
          Sign out
        </button>
      </div>

      <div className="flex gap-2 mb-10 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-accent-teal text-white'
                : 'border border-border-soft dark:border-white/10 text-text-muted hover:text-accent-teal'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'metrics' && <MetricsPanel idToken={idToken} refreshToken={refreshToken} />}
      {activeTab === 'assets' && <AssetManagerPanel idToken={idToken} refreshToken={refreshToken} />}
      {activeTab === 'snippets' && <SnippetManagerPanel idToken={idToken} refreshToken={refreshToken} />}
      {activeTab === 'changelog' && <ChangelogPanel idToken={idToken} refreshToken={refreshToken} />}
      {activeTab === 'orders' && <OrdersPanel idToken={idToken} refreshToken={refreshToken} />}
    </main>
  );
}

function MetricsPanel({ idToken, refreshToken }) {
  const [metrics, setMetrics] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const token = (await refreshToken()) || idToken;
        const data = await api.getMetrics(token);
        if (isMounted) setMetrics(data);
      } catch (error) {
        if (isMounted) setErrorMessage(error.message);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [idToken, refreshToken]);

  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;
  if (!metrics) return <p className="text-text-muted">Loading metrics.</p>;

  const cards = [
    { label: 'Total Downloads', value: metrics.totalDownloads, icon: IconDownload },
    { label: 'Gross Revenue', value: `Rp ${metrics.grossRevenue.toLocaleString('id-ID')}`, icon: IconChart },
    { label: 'Active Servers', value: metrics.activeServers, icon: IconServer },
    { label: 'Total Orders', value: metrics.totalOrders, icon: IconTicket },
    { label: 'Published Assets', value: metrics.totalAssets, icon: IconPlugin },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="card-surface p-6">
          <div className="w-10 h-10 rounded-lg bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark mb-4">
            <card.icon className="w-5 h-5" />
          </div>
          <p className="text-text-muted text-sm">{card.label}</p>
          <p className="text-2xl font-semibold text-text-charcoal dark:text-white mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function AssetManagerPanel({ idToken, refreshToken }) {
  const [assets, setAssets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [assetType, setAssetType] = useState('plugin');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadAssets() {
    const token = (await refreshToken()) || idToken;
    const data = await api.listAssetsAdmin(token);
    setAssets(data);
  }

  useEffect(() => {
    loadAssets().catch((error) => setErrorMessage(error.message));
  }, []);

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) {
      setErrorMessage('Please select a file to upload');
      return;
    }
    setErrorMessage('');
    setIsUploading(true);

    try {
      const token = (await refreshToken()) || idToken;
      const { signedUrl, storagePath, publicUrl } = await api.getUploadUrl(token, {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        assetType,
      });

      await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });

      await api.createAsset(token, {
        title,
        description,
        version,
        assetType,
        firebaseCdnUrl: publicUrl,
        firebaseStoragePath: storagePath,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });

      setTitle('');
      setDescription('');
      setVersion('1.0.0');
      setTags('');
      setFile(null);
      setUploadProgress(0);
      await loadAssets();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDirectFirebaseUpload(event) {
    event.preventDefault();
    if (!file) {
      setErrorMessage('Please select a file to upload');
      return;
    }
    setErrorMessage('');
    setIsUploading(true);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `assets/${assetType}/${Date.now()}-${safeName}`;
      const storageRef = ref(firebaseStorage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
          },
          reject,
          resolve
        );
      });

      const publicUrl = await getDownloadURL(storageRef);
      const token = (await refreshToken()) || idToken;

      await api.createAsset(token, {
        title,
        description,
        version,
        assetType,
        firebaseCdnUrl: publicUrl,
        firebaseStoragePath: storagePath,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });

      setTitle('');
      setDescription('');
      setVersion('1.0.0');
      setTags('');
      setFile(null);
      setUploadProgress(0);
      await loadAssets();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id) {
    const token = (await refreshToken()) || idToken;
    await api.deleteAsset(token, id);
    await loadAssets();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <form onSubmit={handleDirectFirebaseUpload} className="card-surface p-6 lg:col-span-2 h-fit">
        <h2 className="text-text-charcoal dark:text-white font-semibold mb-5">Upload New Asset</h2>

        <label className="text-sm text-text-muted mb-2 block">Title</label>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Description</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-text-muted mb-2 block">Version</label>
            <input
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted mb-2 block">Type</label>
            <select
              value={assetType}
              onChange={(event) => setAssetType(event.target.value)}
              className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
            >
              <option value="plugin">Plugin</option>
              <option value="script">Script</option>
            </select>
          </div>
        </div>

        <label className="text-sm text-text-muted mb-2 block">Tags (comma separated)</label>
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">File</label>
        <input
          type="file"
          required
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="w-full text-sm text-text-muted mb-4"
        />

        {isUploading && (
          <div className="w-full h-2 rounded-full bg-border-soft dark:bg-white/10 mb-4 overflow-hidden">
            <div
              className="h-full bg-accent-teal transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        <button type="submit" disabled={isUploading} className="btn-primary w-full flex items-center justify-center gap-2">
          <IconUpload className="w-4 h-4" /> {isUploading ? 'Uploading.' : 'Upload asset'}
        </button>
      </form>

      <div className="lg:col-span-3 space-y-4">
        {assets.map((asset) => (
          <div key={asset._id} className="card-surface p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-text-charcoal dark:text-white font-medium">{asset.title}</p>
              <p className="text-text-light text-xs mt-1">
                {asset.assetType} - v{asset.version} - {asset.downloadCount} downloads
              </p>
            </div>
            <button
              onClick={() => handleDelete(asset._id)}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SnippetManagerPanel({ idToken, refreshToken }) {
  const [snippets, setSnippets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function loadSnippets() {
    const token = (await refreshToken()) || idToken;
    const data = await api.listSnippetsAdmin(token);
    setSnippets(data);
  }

  useEffect(() => {
    loadSnippets().catch((error) => setErrorMessage(error.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      const token = (await refreshToken()) || idToken;
      await api.createSnippet(token, {
        title,
        description,
        language,
        code,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      setTitle('');
      setDescription('');
      setCode('');
      setTags('');
      await loadSnippets();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    const token = (await refreshToken()) || idToken;
    await api.deleteSnippet(token, id);
    await loadSnippets();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <form onSubmit={handleSubmit} className="card-surface p-6 lg:col-span-2 h-fit">
        <h2 className="text-text-charcoal dark:text-white font-semibold mb-5">Publish Snippet</h2>

        <label className="text-sm text-text-muted mb-2 block">Title</label>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Description</label>
        <textarea
          required
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Language</label>
        <input
          required
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          placeholder="javascript"
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Code</label>
        <textarea
          required
          rows={8}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Tags (comma separated)</label>
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        <button type="submit" disabled={isSaving} className="btn-primary w-full">
          {isSaving ? 'Publishing.' : 'Publish snippet'}
        </button>
      </form>

      <div className="lg:col-span-3 space-y-4">
        {snippets.map((snippet) => (
          <div key={snippet._id} className="card-surface p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-text-charcoal dark:text-white font-medium">{snippet.title}</p>
              <p className="text-text-light text-xs mt-1 uppercase">{snippet.language}</p>
            </div>
            <button
              onClick={() => handleDelete(snippet._id)}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChangelogPanel({ idToken, refreshToken }) {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadEntries() {
    const data = await api.listChangelog();
    setEntries(data);
  }

  useEffect(() => {
    loadEntries().catch((error) => setErrorMessage(error.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const token = (await refreshToken()) || idToken;
      await api.createChangelog(token, { title, description, version, linkUrl });
      setTitle('');
      setDescription('');
      setVersion('');
      setLinkUrl('');
      await loadEntries();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <form onSubmit={handleSubmit} className="card-surface p-6 lg:col-span-2 h-fit">
        <h2 className="text-text-charcoal dark:text-white font-semibold mb-5">Broadcast Update</h2>

        <label className="text-sm text-text-muted mb-2 block">Title</label>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Description</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Version</label>
        <input
          required
          value={version}
          onChange={(event) => setVersion(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Link URL</label>
        <input
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        <button type="submit" className="btn-primary w-full">Publish update</button>
      </form>

      <div className="lg:col-span-3 space-y-4">
        {entries.map((entry) => (
          <div key={entry._id} className="card-surface p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-text-charcoal dark:text-white font-medium">{entry.title}</p>
              <span className="text-xs text-text-light">v{entry.version}</span>
            </div>
            <p className="text-text-muted text-sm">{entry.description}</p>
            {entry.linkUrl && (
              <a href={entry.linkUrl} className="text-accent-teal text-sm mt-2 inline-block">
                View details
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersPanel({ idToken, refreshToken }) {
  const [orders, setOrders] = useState([]);
  const [panels, setPanels] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const token = (await refreshToken()) || idToken;
        const [orderData, panelData] = await Promise.all([
          api.listOrders(token),
          api.listPanels(token),
        ]);
        if (isMounted) {
          setOrders(orderData);
          setPanels(panelData);
        }
      } catch (error) {
        if (isMounted) setErrorMessage(error.message);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [idToken, refreshToken]);

  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-text-charcoal dark:text-white font-semibold mb-4">Orders</h2>
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border-soft dark:border-white/10">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-border-soft dark:border-white/10 last:border-0">
                  <td className="px-5 py-3 text-text-charcoal dark:text-white">{order.orderId}</td>
                  <td className="px-5 py-3 text-text-muted">{order.guestEmail}</td>
                  <td className="px-5 py-3 text-text-muted">{order.product?.name}</td>
                  <td className="px-5 py-3 text-text-muted">Rp {order.grossAmount.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.paymentStatus === 'completed'
                          ? 'bg-accent-teal-glow text-accent-teal-dark'
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-text-charcoal dark:text-white font-semibold mb-4">Active Panels</h2>
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border-soft dark:border-white/10">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Server Identifier</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {panels.map((panel) => (
                <tr key={panel._id} className="border-b border-border-soft dark:border-white/10 last:border-0">
                  <td className="px-5 py-3 text-text-charcoal dark:text-white">{panel.guestEmail}</td>
                  <td className="px-5 py-3 text-text-muted">{panel.serverIdentifier}</td>
                  <td className="px-5 py-3 text-text-muted">{panel.order?.product?.name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        panel.status === 'active' ? 'bg-accent-teal-glow text-accent-teal-dark' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {panel.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
