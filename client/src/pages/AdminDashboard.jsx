import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';
import { api, cancelActiveUpload } from '../lib/api.js';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { SkeletonRow, SkeletonTableRow } from '../components/Skeleton.jsx';
import {
 IconChart,
 IconPlugin,
 IconTicket,
 IconUpload,
 IconServer,
 IconDownload,
 IconScript,
 IconKey,
 IconCopy,
 IconRefresh,
 IconLock,
} from '../lib/icons.jsx';

const TABS = [
 { key: 'metrics', label: 'Metrics', icon: IconChart },
 { key: 'assets', label: 'Asset Manager', icon: IconPlugin },
 { key: 'snippets', label: 'Snippets', icon: IconScript },
 { key: 'hosting', label: 'Hosting Products', icon: IconServer },
 { key: 'apikeys', label: 'API Keys', icon: IconKey },
 { key: 'licenses', label: 'License Keys', icon: IconLock },
 { key: 'changelog', label: 'Changelog', icon: IconUpload },
 { key: 'orders', label: 'Orders and Tickets', icon: IconTicket },
];

export default function AdminDashboard() {
 const { adminUser, idToken, isLoading, logout, refreshToken, refreshAdminUser, sendVerificationEmail } = useAdmin();
 const [activeTab, setActiveTab] = useState('metrics');

 if (isLoading) {
 return <p className="text-center py-24 text-zinc-400">Verifying admin session.</p>;
 }

 if (!adminUser) {
 return <Navigate to="/admin/login" replace />;
 }

 if (!adminUser.emailVerified) {
 return <VerifyEmailGate adminUser={adminUser} logout={logout} refreshAdminUser={refreshAdminUser} sendVerificationEmail={sendVerificationEmail} />;
 }

 return (
 <main className="max-w-6xl mx-auto px-6 py-12">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
 <div>
 <h1 className="text-3xl font-semibold text-zinc-50">Admin Dashboard</h1>
 <p className="text-zinc-400 mt-1 text-sm">{adminUser.email}</p>
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
 ? 'bg-brand text-white'
 : 'border border-zinc-800 text-zinc-400 hover:text-brand-light'
 }`}
 >
 <tab.icon className="w-4 h-4" /> {tab.label}
 </button>
 ))}
 </div>

 {activeTab === 'metrics' && <MetricsPanel idToken={idToken} refreshToken={refreshToken} />}
 {activeTab === 'assets' && <AssetManagerPanel idToken={idToken} refreshToken={refreshToken} />}
 {activeTab === 'snippets' && <SnippetManagerPanel idToken={idToken} refreshToken={refreshToken} />}
 {activeTab === 'hosting' && <HostingProductsPanel idToken={idToken} refreshToken={refreshToken} />}
 {activeTab === 'apikeys' && <ApiKeysPanel idToken={idToken} refreshToken={refreshToken} />}
 {activeTab === 'licenses' && <LicenseKeysPanel idToken={idToken} refreshToken={refreshToken} />}
 {activeTab === 'changelog' && <ChangelogPanel idToken={idToken} refreshToken={refreshToken} />}
 {activeTab === 'orders' && <OrdersPanel idToken={idToken} refreshToken={refreshToken} />}
 </main>
 );
}

function VerifyEmailGate({ adminUser, logout, refreshAdminUser, sendVerificationEmail }) {
 const [status, setStatus] = useState('idle');
 const [errorMessage, setErrorMessage] = useState('');
 const [isChecking, setIsChecking] = useState(false);

 async function handleSendEmail() {
 setStatus('sending');
 setErrorMessage('');
 try {
 await sendVerificationEmail();
 setStatus('sent');
 } catch (error) {
 setErrorMessage(error.message);
 setStatus('idle');
 }
 }

 async function handleCheckVerified() {
 setIsChecking(true);
 setErrorMessage('');
 try {
 await refreshAdminUser();
 } catch (error) {
 setErrorMessage(error.message);
 } finally {
 setIsChecking(false);
 }
 }

 return (
 <main className="min-h-[70vh] flex items-center justify-center px-6">
 <div className="card-surface w-full max-w-sm p-8 text-center">
 <h1 className="text-xl font-semibold text-zinc-50 mb-2">Verify your email</h1>
 <p className="text-zinc-400 text-sm leading-relaxed mb-6">
 {adminUser.email} is signed in, but Firebase hasn't verified this email yet. Send a
 verification link, click it from your inbox, then come back and continue.
 </p>

 {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}
 {status === 'sent' && (
 <p className="text-brand-light text-sm mb-4">Verification email sent. Check your inbox.</p>
 )}

 <button
 onClick={handleSendEmail}
 disabled={status === 'sending'}
 className="btn-primary w-full mb-3"
 >
 {status === 'sending' ? 'Sending.' : 'Send verification email'}
 </button>

 <button
 onClick={handleCheckVerified}
 disabled={isChecking}
 className="btn-outline w-full mb-3"
 >
 {isChecking ? 'Checking.' : "I've verified, continue"}
 </button>

 <button onClick={logout} className="text-zinc-500 hover:text-zinc-300 text-sm">
 Sign out
 </button>
 </div>
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

 if (errorMessage) return <p className="text-red-400">{errorMessage}</p>;
 if (!metrics) return <p className="text-zinc-400">Loading metrics.</p>;

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
 <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand-light mb-4">
 <card.icon className="w-5 h-5" />
 </div>
 <p className="text-zinc-400 text-sm">{card.label}</p>
 <p className="text-2xl font-semibold text-zinc-50 mt-1">{card.value}</p>
 </div>
 ))}
 </div>
 );
}

function AssetManagerPanel({ idToken, refreshToken }) {
 const [assets, setAssets] = useState([]);
 const [name, setName] = useState('');
 const [description, setDescription] = useState('');
 const [descriptionTab, setDescriptionTab] = useState('write');
 const [currentVersion, setCurrentVersion] = useState('1.0.0');
 const [category, setCategory] = useState('whatsapp-bot');
 const [tags, setTags] = useState('');
 const [file, setFile] = useState(null);
 const [uploadProgress, setUploadProgress] = useState(0);
 const [isUploading, setIsUploading] = useState(false);
 const [errorMessage, setErrorMessage] = useState('');
 const [expandedAssetId, setExpandedAssetId] = useState(null);
 const [newVersion, setNewVersion] = useState('');
 const [newNotes, setNewNotes] = useState('');
 const [newFile, setNewFile] = useState(null);
 const [newVersionProgress, setNewVersionProgress] = useState(0);
 const [isSavingChangelog, setIsSavingChangelog] = useState(false);

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
 setUploadProgress(0);

 try {
 const token = (await refreshToken()) || idToken;
 const formData = new FormData();
 formData.append('file', file);
 formData.append('name', name);
 formData.append('description', description);
 formData.append('currentVersion', currentVersion);
 formData.append('category', category);
 formData.append(
 'tags',
 JSON.stringify(tags.split(',').map((tag) => tag.trim()).filter(Boolean))
 );
 formData.append('releaseNotes', JSON.stringify(['Initial release']));

 await api.createAssetWithFile(token, formData, setUploadProgress);

 setName('');
 setDescription('');
 setCurrentVersion('1.0.0');
 setTags('');
 setFile(null);
 setUploadProgress(0);
 await loadAssets();
 } catch (error) {
 setErrorMessage(error.message || 'Upload failed');
 } finally {
 setIsUploading(false);
 }
 }

 function handleCancelUpload() {
 cancelActiveUpload();
 }

 async function handleDelete(id) {
 const token = (await refreshToken()) || idToken;
 await api.deleteAsset(token, id);
 await loadAssets();
 }

 async function handleAddChangelog(event, assetId) {
 event.preventDefault();
 if (!newFile) {
 setErrorMessage('Please select a file for the new version');
 return;
 }
 setIsSavingChangelog(true);
 setNewVersionProgress(0);
 setErrorMessage('');
 try {
 const token = (await refreshToken()) || idToken;
 const formData = new FormData();
 formData.append('file', newFile);
 formData.append('version', newVersion);
 formData.append(
 'notes',
 JSON.stringify(newNotes.split('\n').map((line) => line.trim()).filter(Boolean))
 );

 await api.addChangelogEntryWithFile(token, assetId, formData, setNewVersionProgress);

 setNewVersion('');
 setNewNotes('');
 setNewFile(null);
 setNewVersionProgress(0);
 setExpandedAssetId(null);
 await loadAssets();
 } catch (error) {
 setErrorMessage(error.message);
 } finally {
 setIsSavingChangelog(false);
 }
 }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
 <form onSubmit={handleUpload} className="card-surface p-6 lg:col-span-2 h-fit">
 <h2 className="text-zinc-50 font-semibold mb-5">Publish New Product</h2>

 <label className="text-sm text-zinc-400 mb-2 block">Name</label>
 <input
 required
 value={name}
 onChange={(event) => setName(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <div className="flex items-center justify-between mb-2">
 <label className="text-sm text-zinc-400 block">Description (Markdown supported)</label>
 <div className="flex gap-1 text-xs">
 <button
 type="button"
 onClick={() => setDescriptionTab('write')}
 className={`px-2.5 py-1 rounded-md ${descriptionTab === 'write' ? 'bg-zinc-800 text-brand-light' : 'text-zinc-500'}`}
 >
 Write
 </button>
 <button
 type="button"
 onClick={() => setDescriptionTab('preview')}
 className={`px-2.5 py-1 rounded-md ${descriptionTab === 'preview' ? 'bg-zinc-800 text-brand-light' : 'text-zinc-500'}`}
 >
 Preview
 </button>
 </div>
 </div>
 {descriptionTab === 'write' ? (
 <textarea
 required
 rows={5}
 value={description}
 onChange={(event) => setDescription(event.target.value)}
 placeholder="Supports full Markdown: headings, lists, tables, fenced code blocks."
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand"
 />
 ) : (
 <div className="mb-4">
 {description ? (
 <MarkdownRenderer content={description} />
 ) : (
 <p className="text-zinc-600 text-sm px-4 py-6 border border-zinc-800 rounded-xl">Nothing to preview yet.</p>
 )}
 </div>
 )}

 <div className="grid grid-cols-2 gap-4 mb-4">
 <div>
 <label className="text-sm text-zinc-400 mb-2 block">Version</label>
 <input
 value={currentVersion}
 onChange={(event) => setCurrentVersion(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 </div>
 <div>
 <label className="text-sm text-zinc-400 mb-2 block">Category</label>
 <select
 value={category}
 onChange={(event) => setCategory(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 >
 <option value="whatsapp-bot">WhatsApp Bot</option>
 <option value="plugin">Plugin</option>
 </select>
 </div>
 </div>

 <label className="text-sm text-zinc-400 mb-2 block">Tags (comma separated)</label>
 <input
 value={tags}
 onChange={(event) => setTags(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">File</label>
 <input
 type="file"
 required
 onChange={(event) => setFile(event.target.files?.[0] || null)}
 className="w-full text-sm text-zinc-400 mb-4"
 />

 {isUploading && (
 <div className="mb-4">
 <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
 <div
 className="h-full bg-brand-light shadow-glow-brand transition-all duration-300"
 style={{ width: `${uploadProgress}%` }}
 />
 </div>
 <div className="flex items-center justify-between mt-2">
 <span className="text-xs text-zinc-500 font-mono-ui">{uploadProgress}% uploaded</span>
 <button type="button" onClick={handleCancelUpload} className="text-xs text-red-400 hover:text-red-300">
 Cancel upload
 </button>
 </div>
 </div>
 )}

 {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

 <button type="submit" disabled={isUploading} className="btn-primary w-full flex items-center justify-center gap-2">
 <IconUpload className="w-4 h-4" /> {isUploading ? 'Uploading.' : 'Publish product'}
 </button>
 </form>

 <div className="lg:col-span-3 space-y-4">
 {assets.map((asset) => (
 <div key={asset._id} className="card-surface p-5">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-zinc-50 font-medium">{asset.name}</p>
 <p className="text-zinc-500 text-xs mt-1">
 {asset.category} - v{asset.currentVersion} - {asset.downloadCount} downloads
 </p>
 </div>
 <div className="flex items-center gap-4">
 <button
 onClick={() => setExpandedAssetId(expandedAssetId === asset._id ? null : asset._id)}
 className="text-brand-light hover:text-cyan-300 text-sm font-medium"
 >
 {expandedAssetId === asset._id ? 'Close' : 'Add version'}
 </button>
 <button
 onClick={() => handleDelete(asset._id)}
 className="text-red-400 hover:text-red-300 text-sm font-medium"
 >
 Delete
 </button>
 </div>
 </div>

 {expandedAssetId === asset._id && (
 <form onSubmit={(event) => handleAddChangelog(event, asset._id)} className="mt-5 pt-5 border-t border-zinc-800">
 <div className="grid grid-cols-2 gap-4 mb-3">
 <input
 required
 placeholder="New version, e.g. 1.1.0"
 value={newVersion}
 onChange={(event) => setNewVersion(event.target.value)}
 className="rounded-xl border border-zinc-800 bg-transparent px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 <input
 type="file"
 required
 onChange={(event) => setNewFile(event.target.files?.[0] || null)}
 className="text-xs text-zinc-400 self-center"
 />
 </div>
 <textarea
 rows={3}
 placeholder="Release notes, one per line"
 value={newNotes}
 onChange={(event) => setNewNotes(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2 text-sm text-zinc-100 mb-3 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 {isSavingChangelog && (
 <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-3">
 <div
 className="h-full bg-brand-light shadow-glow-brand transition-all duration-300"
 style={{ width: `${newVersionProgress}%` }}
 />
 </div>
 )}
 <button type="submit" disabled={isSavingChangelog} className="btn-primary text-sm">
 {isSavingChangelog ? 'Publishing.' : 'Publish version'}
 </button>
 </form>
 )}
 </div>
 ))}
 </div>
 </div>
 );
}


const EXTENSION_LANGUAGE_MAP = {
 js: 'javascript',
 jsx: 'jsx',
 ts: 'typescript',
 tsx: 'tsx',
 py: 'python',
 java: 'java',
 rb: 'ruby',
 go: 'go',
 rs: 'rust',
 php: 'php',
 c: 'c',
 h: 'c',
 cpp: 'cpp',
 cs: 'csharp',
 sh: 'bash',
 bash: 'bash',
 json: 'json',
 yml: 'yaml',
 yaml: 'yaml',
 md: 'markdown',
 html: 'markup',
 css: 'css',
 sql: 'sql',
 kt: 'kotlin',
 swift: 'swift',
};

function guessLanguageFromFilename(filename) {
 const extension = filename.split('.').pop().toLowerCase();
 return EXTENSION_LANGUAGE_MAP[extension] || 'text';
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
 const [isReadingFile, setIsReadingFile] = useState(false);

 async function loadSnippets() {
 const token = (await refreshToken()) || idToken;
 const data = await api.listSnippetsAdmin(token);
 setSnippets(data);
 }

 useEffect(() => {
 loadSnippets().catch((error) => setErrorMessage(error.message));
 }, []);

 function handleFileChosen(event) {
 const chosenFile = event.target.files?.[0];
 if (!chosenFile) return;

 setIsReadingFile(true);
 setErrorMessage('');

 const reader = new FileReader();
 reader.onload = () => {
 setCode(String(reader.result || ''));
 setLanguage(guessLanguageFromFilename(chosenFile.name));
 if (!title) {
 setTitle(chosenFile.name.replace(/\.[^.]+$/, ''));
 }
 setIsReadingFile(false);
 };
 reader.onerror = () => {
 setErrorMessage('Could not read that file as text');
 setIsReadingFile(false);
 };
 reader.readAsText(chosenFile);
 event.target.value = '';
 }

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
 <h2 className="text-zinc-50 font-semibold mb-5">Publish Snippet</h2>

 <label className="text-sm text-zinc-400 mb-2 block">Load from file (optional)</label>
 <input
 type="file"
 onChange={handleFileChosen}
 className="w-full text-xs text-zinc-400 mb-4"
 />
 {isReadingFile && <p className="text-xs text-brand-light mb-4">Reading file.</p>}

 <label className="text-sm text-zinc-400 mb-2 block">Title</label>
 <input
 required
 value={title}
 onChange={(event) => setTitle(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Description</label>
 <textarea
 required
 rows={2}
 value={description}
 onChange={(event) => setDescription(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Language</label>
 <input
 required
 value={language}
 onChange={(event) => setLanguage(event.target.value)}
 placeholder="javascript"
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Code</label>
 <textarea
 required
 rows={8}
 value={code}
 onChange={(event) => setCode(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Tags (comma separated)</label>
 <input
 value={tags}
 onChange={(event) => setTags(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

 <button type="submit" disabled={isSaving} className="btn-primary w-full">
 {isSaving ? 'Publishing.' : 'Publish snippet'}
 </button>
 </form>

 <div className="lg:col-span-3 space-y-4">
 {snippets.map((snippet) => (
 <div key={snippet._id} className="card-surface p-5 flex items-center justify-between gap-4">
 <div>
 <p className="text-zinc-50 font-medium">{snippet.title}</p>
 <p className="text-zinc-600 text-xs mt-1 uppercase">{snippet.language}</p>
 </div>
 <button
 onClick={() => handleDelete(snippet._id)}
 className="text-red-400 hover:text-red-300 text-sm font-medium"
 >
 Delete
 </button>
 </div>
 ))}
 </div>
 </div>
 );
}

function HostingProductsPanel({ idToken, refreshToken }) {
 const [products, setProducts] = useState([]);
 const [name, setName] = useState('');
 const [description, setDescription] = useState('');
 const [price, setPrice] = useState('');
 const [cpuLimit, setCpuLimit] = useState('100');
 const [ramLimit, setRamLimit] = useState('1024');
 const [diskLimit, setDiskLimit] = useState('5120');
 const [eggId, setEggId] = useState('');
 const [nestId, setNestId] = useState('');
 const [locationId, setLocationId] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const [isSaving, setIsSaving] = useState(false);

 async function loadProducts() {
 const token = (await refreshToken()) || idToken;
 const data = await api.listProductsAdmin(token);
 setProducts(data);
 }

 useEffect(() => {
 loadProducts().catch((error) => setErrorMessage(error.message));
 }, []);

 async function handleSubmit(event) {
 event.preventDefault();
 setIsSaving(true);
 setErrorMessage('');
 try {
 const token = (await refreshToken()) || idToken;
 await api.createProduct(token, {
 name,
 description,
 price: Number(price),
 cpuLimit: Number(cpuLimit),
 ramLimit: Number(ramLimit),
 diskLimit: Number(diskLimit),
 eggId: Number(eggId),
 nestId: Number(nestId),
 locationId: Number(locationId),
 });
 setName('');
 setDescription('');
 setPrice('');
 setEggId('');
 setNestId('');
 setLocationId('');
 await loadProducts();
 } catch (error) {
 setErrorMessage(error.message);
 } finally {
 setIsSaving(false);
 }
 }

 async function handleToggleActive(product) {
 const token = (await refreshToken()) || idToken;
 await api.updateProduct(token, product._id, { isActive: !product.isActive });
 await loadProducts();
 }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
 <form onSubmit={handleSubmit} className="card-surface p-6 lg:col-span-2 h-fit">
 <h2 className="text-zinc-50 font-semibold mb-5">Add Hosting Product</h2>

 <label className="text-sm text-zinc-400 mb-2 block">Name</label>
 <input
 required
 value={name}
 onChange={(event) => setName(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Description</label>
 <textarea
 required
 rows={2}
 value={description}
 onChange={(event) => setDescription(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Price (IDR)</label>
 <input
 required
 type="number"
 min="0"
 value={price}
 onChange={(event) => setPrice(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <div className="grid grid-cols-3 gap-3 mb-4">
 <div>
 <label className="text-xs text-zinc-400 mb-2 block">CPU %</label>
 <input
 required
 type="number"
 min="0"
 value={cpuLimit}
 onChange={(event) => setCpuLimit(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 </div>
 <div>
 <label className="text-xs text-zinc-400 mb-2 block">RAM MB</label>
 <input
 required
 type="number"
 min="0"
 value={ramLimit}
 onChange={(event) => setRamLimit(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 </div>
 <div>
 <label className="text-xs text-zinc-400 mb-2 block">Disk MB</label>
 <input
 required
 type="number"
 min="0"
 value={diskLimit}
 onChange={(event) => setDiskLimit(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 </div>
 </div>

 <p className="text-xs text-zinc-500 mb-2">Pterodactyl identifiers, from your panel's admin area</p>
 <div className="grid grid-cols-3 gap-3 mb-4">
 <div>
 <label className="text-xs text-zinc-400 mb-2 block">Egg ID</label>
 <input
 required
 type="number"
 value={eggId}
 onChange={(event) => setEggId(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 </div>
 <div>
 <label className="text-xs text-zinc-400 mb-2 block">Nest ID</label>
 <input
 required
 type="number"
 value={nestId}
 onChange={(event) => setNestId(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 </div>
 <div>
 <label className="text-xs text-zinc-400 mb-2 block">Location ID</label>
 <input
 required
 type="number"
 value={locationId}
 onChange={(event) => setLocationId(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand"
 />
 </div>
 </div>

 {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

 <button type="submit" disabled={isSaving} className="btn-primary w-full">
 {isSaving ? 'Saving.' : 'Add product'}
 </button>
 </form>

 <div className="lg:col-span-3 space-y-4">
 {products.map((product) => (
 <div key={product._id} className="card-surface p-5 flex items-center justify-between gap-4">
 <div>
 <p className="text-zinc-50 font-medium">{product.name}</p>
 <p className="text-zinc-500 text-xs mt-1">
 Rp {product.price.toLocaleString('id-ID')} - {product.cpuLimit}% CPU - {product.ramLimit}MB RAM - {product.diskLimit}MB Disk
 </p>
 <p className="text-zinc-600 text-xs mt-1">
 egg {product.eggId} - nest {product.nestId} - location {product.locationId}
 </p>
 </div>
 <button
 onClick={() => handleToggleActive(product)}
 className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
 product.isActive ? 'bg-brand/10 text-brand-light' : 'bg-zinc-800 text-zinc-500'
 }`}
 >
 {product.isActive ? 'Active' : 'Inactive'}
 </button>
 </div>
 ))}
 </div>
 </div>
 );
}

const SCOPE_OPTIONS = ['tools:search', 'tools:maker', '*'];

function ApiKeysPanel({ idToken, refreshToken }) {
 const [keys, setKeys] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [label, setLabel] = useState('');
 const [ownerEmail, setOwnerEmail] = useState('');
 const [scopes, setScopes] = useState([]);
 const [rateLimitTier, setRateLimitTier] = useState('default');
 const [errorMessage, setErrorMessage] = useState('');
 const [isSaving, setIsSaving] = useState(false);
 const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
 const showToast = useToast();

 async function loadKeys() {
 const token = (await refreshToken()) || idToken;
 const data = await api.listApiKeys(token);
 setKeys(data);
 }

 useEffect(() => {
 loadKeys()
 .catch((error) => setErrorMessage(error.message))
 .finally(() => setIsLoading(false));
 }, []);

 function toggleScope(scope) {
 setScopes((current) =>
 current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]
 );
 }

 async function handleSubmit(event) {
 event.preventDefault();
 if (scopes.length === 0) {
 setErrorMessage('Select at least one scope');
 return;
 }
 setIsSaving(true);
 setErrorMessage('');
 try {
 const token = (await refreshToken()) || idToken;
 const result = await api.createApiKey(token, { label, ownerEmail, scopes, rateLimitTier });
 setNewlyCreatedKey(result.apiKey);
 setLabel('');
 setOwnerEmail('');
 setScopes([]);
 setRateLimitTier('default');
 await loadKeys();
 } catch (error) {
 setErrorMessage(error.message);
 } finally {
 setIsSaving(false);
 }
 }

 async function handleRevoke(id) {
 const token = (await refreshToken()) || idToken;
 await api.revokeApiKey(token, id);
 await loadKeys();
 }

 function copyKey() {
 navigator.clipboard.writeText(newlyCreatedKey);
 showToast('API key copied', { type: 'success' });
 }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
 <form onSubmit={handleSubmit} className="card-surface p-6 lg:col-span-2 h-fit">
 <h2 className="text-zinc-50 font-semibold mb-5">Create API Key</h2>

 <label className="text-sm text-zinc-400 mb-2 block">Label</label>
 <input
 required
 value={label}
 onChange={(event) => setLabel(event.target.value)}
 placeholder="e.g. my-whatsapp-bot"
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Owner email (optional)</label>
 <input
 type="email"
 value={ownerEmail}
 onChange={(event) => setOwnerEmail(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Scopes</label>
 <div className="flex flex-wrap gap-2 mb-4">
 {SCOPE_OPTIONS.map((scope) => (
 <button
 key={scope}
 type="button"
 onClick={() => toggleScope(scope)}
 className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
 scopes.includes(scope)
 ? 'bg-brand text-white border-brand'
 : 'border-zinc-800 text-zinc-400 hover:text-brand-light'
 }`}
 >
 {scope}
 </button>
 ))}
 </div>

 <label className="text-sm text-zinc-400 mb-2 block">Rate limit tier</label>
 <select
 value={rateLimitTier}
 onChange={(event) => setRateLimitTier(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 >
 <option value="default">Default (30/min)</option>
 <option value="pro">Pro (120/min)</option>
 </select>

 {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

 <button type="submit" disabled={isSaving} className="btn-primary w-full">
 {isSaving ? 'Creating.' : 'Create key'}
 </button>

 {newlyCreatedKey && (
 <div className="mt-5 pt-5 border-t border-zinc-800">
 <p className="text-xs text-yellow-400 mb-2">
 Copy this now — it won't be shown again.
 </p>
 <button
 onClick={copyKey}
 className="w-full font-mono-ui text-brand-light text-xs tracking-wide bg-black/30 border border-brand/20 rounded-xl py-3 px-3 flex items-center justify-between gap-2 hover:border-brand/50 transition-colors duration-200"
 >
 <span className="truncate">{newlyCreatedKey}</span>
 <IconCopy className="w-3.5 h-3.5 shrink-0" />
 </button>
 </div>
 )}
 </form>

 <div className="lg:col-span-3 space-y-4">
 {isLoading ? (
 <>
 <SkeletonRow />
 <SkeletonRow />
 </>
 ) : keys.length === 0 ? (
 <p className="text-zinc-500 text-sm">No API keys created yet.</p>
 ) : (
 keys.map((key) => (
 <div key={key._id} className="card-surface p-5 flex items-center justify-between gap-4">
 <div className="min-w-0">
 <p className="text-zinc-50 font-medium">{key.label}</p>
 <p className="text-zinc-500 text-xs mt-1 font-mono-ui">
 kyy_{key.keyId}... - {key.scopes.join(', ')} - {key.rateLimitTier}
 </p>
 <p className="text-zinc-600 text-xs mt-1">
 {key.requestCount} requests
 {key.lastUsedAt ? ` - last used ${new Date(key.lastUsedAt).toLocaleDateString('en-US')}` : ' - never used'}
 </p>
 </div>
 <div className="flex items-center gap-3 shrink-0">
 <span
 className={`text-xs px-2.5 py-1 rounded-full ${
 key.status === 'active' ? 'bg-brand/15 text-brand-light' : 'bg-red-500/10 text-red-400'
 }`}
 >
 {key.status}
 </span>
 {key.status === 'active' && (
 <button
 onClick={() => handleRevoke(key._id)}
 className="text-red-400 hover:text-red-300 text-sm font-medium"
 >
 Revoke
 </button>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
}

function LicenseKeysPanel({ idToken, refreshToken }) {
 const [licenses, setLicenses] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [statusFilter, setStatusFilter] = useState('all');
 const [errorMessage, setErrorMessage] = useState('');

 async function loadLicenses() {
 const token = (await refreshToken()) || idToken;
 const params = statusFilter !== 'all' ? { status: statusFilter } : {};
 const data = await api.listLicenseKeys(token, params);
 setLicenses(data);
 }

 useEffect(() => {
 setIsLoading(true);
 loadLicenses()
 .catch((error) => setErrorMessage(error.message))
 .finally(() => setIsLoading(false));
 }, [statusFilter]);

 async function handleRevoke(id) {
 const token = (await refreshToken()) || idToken;
 await api.revokeLicenseKey(token, id);
 await loadLicenses();
 }

 async function handleResetActivations(id) {
 const token = (await refreshToken()) || idToken;
 await api.resetLicenseActivations(token, id);
 await loadLicenses();
 }

 return (
 <div>
 <div className="flex gap-2 mb-6">
 {['all', 'active', 'revoked', 'expired'].map((status) => (
 <button
 key={status}
 onClick={() => setStatusFilter(status)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors duration-200 ${
 statusFilter === status
 ? 'bg-brand text-white'
 : 'border border-zinc-800 text-zinc-400 hover:text-brand-light'
 }`}
 >
 {status}
 </button>
 ))}
 </div>

 {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

 <div className="card-surface overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-zinc-400 border-b border-zinc-800">
 <th className="px-5 py-3">License Key</th>
 <th className="px-5 py-3">Asset</th>
 <th className="px-5 py-3">Buyer</th>
 <th className="px-5 py-3">Activations</th>
 <th className="px-5 py-3">Status</th>
 <th className="px-5 py-3">Actions</th>
 </tr>
 </thead>
 <tbody>
 {isLoading ? (
 <>
 <SkeletonTableRow columns={6} />
 <SkeletonTableRow columns={6} />
 <SkeletonTableRow columns={6} />
 </>
 ) : licenses.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
 No license keys found.
 </td>
 </tr>
 ) : (
 licenses.map((license) => (
 <tr key={license._id} className="border-b border-white/5 last:border-0">
 <td className="px-5 py-3 font-mono-ui text-zinc-100 text-xs">{license.key}</td>
 <td className="px-5 py-3 text-zinc-400">{license.asset?.name}</td>
 <td className="px-5 py-3 text-zinc-400">{license.buyerEmail}</td>
 <td className="px-5 py-3 text-zinc-400">
 {license.activations.length}/{license.maxActivations}
 </td>
 <td className="px-5 py-3">
 <span
 className={`text-xs px-2 py-1 rounded-full ${
 license.status === 'active'
 ? 'bg-brand/15 text-brand-light'
 : license.status === 'expired'
 ? 'bg-yellow-500/10 text-yellow-400'
 : 'bg-red-500/10 text-red-400'
 }`}
 >
 {license.status}
 </span>
 </td>
 <td className="px-5 py-3">
 <div className="flex items-center gap-3">
 <button
 onClick={() => handleResetActivations(license._id)}
 className="text-zinc-400 hover:text-brand-light flex items-center gap-1"
 title="Reset activations"
 >
 <IconRefresh className="w-3.5 h-3.5" />
 </button>
 {license.status !== 'revoked' && (
 <button
 onClick={() => handleRevoke(license._id)}
 className="text-red-400 hover:text-red-300 text-xs font-medium"
 >
 Revoke
 </button>
 )}
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
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
 <h2 className="text-zinc-50 font-semibold mb-5">Broadcast Update</h2>

 <label className="text-sm text-zinc-400 mb-2 block">Title</label>
 <input
 required
 value={title}
 onChange={(event) => setTitle(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Description</label>
 <textarea
 required
 rows={3}
 value={description}
 onChange={(event) => setDescription(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Version</label>
 <input
 required
 value={version}
 onChange={(event) => setVersion(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 <label className="text-sm text-zinc-400 mb-2 block">Link URL</label>
 <input
 value={linkUrl}
 onChange={(event) => setLinkUrl(event.target.value)}
 className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
 />

 {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

 <button type="submit" className="btn-primary w-full">Publish update</button>
 </form>

 <div className="lg:col-span-3 space-y-4">
 {entries.map((entry) => (
 <div key={entry._id} className="card-surface p-5">
 <div className="flex items-center justify-between mb-1">
 <p className="text-zinc-50 font-medium">{entry.title}</p>
 <span className="text-xs text-zinc-600">v{entry.version}</span>
 </div>
 <p className="text-zinc-400 text-sm">{entry.description}</p>
 {entry.linkUrl && (
 <a href={entry.linkUrl} className="text-brand-light text-sm mt-2 inline-block">
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

 if (errorMessage) return <p className="text-red-400">{errorMessage}</p>;

 return (
 <div className="space-y-10">
 <div>
 <h2 className="text-zinc-50 font-semibold mb-4">Orders</h2>
 <div className="card-surface overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-zinc-400 border-b border-zinc-800">
 <th className="px-5 py-3">Order ID</th>
 <th className="px-5 py-3">Email</th>
 <th className="px-5 py-3">Product</th>
 <th className="px-5 py-3">Amount</th>
 <th className="px-5 py-3">Status</th>
 </tr>
 </thead>
 <tbody>
 {orders.map((order) => (
 <tr key={order._id} className="border-b border-zinc-800 last:border-0">
 <td className="px-5 py-3 text-zinc-50">{order.orderId}</td>
 <td className="px-5 py-3 text-zinc-400">{order.guestEmail}</td>
 <td className="px-5 py-3 text-zinc-400">{order.product?.name}</td>
 <td className="px-5 py-3 text-zinc-400">Rp {order.grossAmount.toLocaleString('id-ID')}</td>
 <td className="px-5 py-3">
 <span
 className={`text-xs px-2 py-1 rounded-full ${
 order.paymentStatus === 'completed'
 ? 'bg-brand/10 text-brand-light'
 : order.paymentStatus === 'failed'
 ? 'bg-red-500/10 text-red-400'
 : 'bg-yellow-500/10 text-yellow-400'
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
 <h2 className="text-zinc-50 font-semibold mb-4">Active Panels</h2>
 <div className="card-surface overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-zinc-400 border-b border-zinc-800">
 <th className="px-5 py-3">Email</th>
 <th className="px-5 py-3">Server Identifier</th>
 <th className="px-5 py-3">Product</th>
 <th className="px-5 py-3">Status</th>
 </tr>
 </thead>
 <tbody>
 {panels.map((panel) => (
 <tr key={panel._id} className="border-b border-zinc-800 last:border-0">
 <td className="px-5 py-3 text-zinc-50">{panel.guestEmail}</td>
 <td className="px-5 py-3 text-zinc-400">{panel.serverIdentifier}</td>
 <td className="px-5 py-3 text-zinc-400">{panel.order?.product?.name}</td>
 <td className="px-5 py-3">
 <span
 className={`text-xs px-2 py-1 rounded-full ${
 panel.status === 'active' ? 'bg-brand/10 text-brand-light' : 'bg-red-500/10 text-red-400'
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
