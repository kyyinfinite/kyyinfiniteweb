import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { IconKey, IconCopy, IconQr, IconTicket } from '../lib/icons.jsx';
import ApiKeyPurchaseModal from '../components/ApiKeyPurchaseModal.jsx';

const ALLOWED_USER_SCOPES = [
  'tools:search',
  'tools:maker',
  'tools:downloader',
  'tools:utility',
  'tools:news',
  'tools:info',
  'tools:primbon',
];

const SCOPE_INFO = {
  'tools:search': { label: 'Search', description: 'Spotify, TikTok, YouTube, Apple Music search' },
  'tools:maker': { label: 'Image Maker', description: 'Brat, lobby fakes, memes, text effects' },
  'tools:downloader': { label: 'Downloader', description: 'TikTok, Instagram, YouTube, Spotify, and more' },
  'tools:utility': { label: 'Utility', description: 'Translate, text-to-speech, image unblur' },
  'tools:news': { label: 'News', description: 'Kompas, CNN, Tribunnews, and other feeds' },
  'tools:info': { label: 'Info', description: 'Weather, earthquakes, TV schedules' },
  'tools:primbon': { label: 'Primbon', description: 'Name meaning, lucky numbers, dream readings' },
};

function initialsOf(username, email) {
  const source = username || email?.split('@')[0] || '??';
  return source.slice(0, 2).toUpperCase();
}

export default function Profile() {
  const { user, idToken, isLoading, refreshToken, logout } = useUser();
  const location = useLocation();
  const showToast = useToast();

  const [profile, setProfile] = useState(null);
  const [usage, setUsage] = useState(null);
  const [keys, setKeys] = useState([]);
  const [limit, setLimit] = useState(2);
  const [freePlanRequestLimit, setFreePlanRequestLimit] = useState(40);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [label, setLabel] = useState('');
  const [scopes, setScopes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [showPurchase, setShowPurchase] = useState(false);

  async function loadAll() {
    const token = (await refreshToken()) || idToken;
    const [profileData, usageData, keysData] = await Promise.all([
      api.getMyProfile(token),
      api.getMyUsage(token),
      api.listMyApiKeys(token),
    ]);
    setProfile(profileData);
    setUsage(usageData);
    setKeys(keysData.keys);
    setLimit(keysData.limit);
    setFreePlanRequestLimit(keysData.freePlanRequestLimit);
  }

  useEffect(() => {
    if (!user) return;
    loadAll()
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingData(false));
  }, [user]);

  const chartData = useMemo(() => {
    if (!usage) return [];
    return usage.series.map((point) => ({
      label: point.date.slice(5), // MM-DD
      requests: point.requests,
    }));
  }, [usage]);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  function toggleScope(scope) {
    setScopes((current) => (current.includes(scope) ? current.filter((s) => s !== scope) : [...current, scope]));
  }

  async function handleCreateFreeKey(event) {
    event.preventDefault();
    if (scopes.length === 0) {
      setErrorMessage('Select at least one scope');
      return;
    }
    setIsSaving(true);
    setErrorMessage('');
    try {
      const token = (await refreshToken()) || idToken;
      const result = await api.requestMyApiKey(token, { label, scopes });
      setNewlyCreatedKey(result.apiKey);
      setLabel('');
      setScopes([]);
      await loadAll();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRevoke(id) {
    const token = (await refreshToken()) || idToken;
    await api.revokeMyApiKey(token, id);
    await loadAll();
  }

  function copyKey() {
    navigator.clipboard.writeText(newlyCreatedKey);
    showToast('API key copied', { type: 'success' });
  }

  const activeCount = keys.filter((k) => k.status === 'active').length;
  const canCreateFree = keys.length < limit;

  return (
    <main className="max-w-2xl mx-auto px-6 py-14 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" className="w-14 h-14 rounded-full border border-zinc-800" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light font-semibold text-lg">
              {initialsOf(profile?.username, profile?.email)}
            </div>
          )}
          <div>
            <p className="text-zinc-50 font-semibold text-lg">
              {profile?.displayName || profile?.username || 'Your profile'}
            </p>
            <p className="text-zinc-500 text-sm">{profile?.email || profile?.phoneNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/support" className="text-xs text-zinc-500 hover:text-brand-light flex items-center gap-1">
            <IconTicket className="w-3.5 h-3.5" /> Support
          </Link>
          <button onClick={logout} className="text-xs text-zinc-500 hover:text-red-400">
            Sign out
          </button>
        </div>
      </div>

      {errorMessage && <p className="text-red-400 text-sm mb-6">{errorMessage}</p>}

      {isLoadingData ? (
        <p className="text-zinc-500 text-sm">Loading.</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card-surface p-4">
              <p className="text-zinc-500 text-xs">Total requests</p>
              <p className="text-zinc-50 text-xl font-semibold mt-1">{usage?.totalRequests ?? 0}</p>
            </div>
            <div className="card-surface p-4">
              <p className="text-zinc-500 text-xs">Active keys</p>
              <p className="text-zinc-50 text-xl font-semibold mt-1">
                {usage?.activeKeys ?? 0}/{limit}
              </p>
            </div>
            <div className="card-surface p-4">
              <p className="text-zinc-500 text-xs">Last 14 days</p>
              <p className="text-zinc-50 text-xl font-semibold mt-1">{usage?.requestsLast14Days ?? 0}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="card-surface p-6 mb-8">
            <p className="text-zinc-50 font-semibold mb-1">Usage</p>
            <p className="text-zinc-500 text-xs mb-4">Requests per day, last 14 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(9,9,11,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fill="url(#usageGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Create free key */}
          {canCreateFree ? (
            <form onSubmit={handleCreateFreeKey} className="card-surface p-6 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <IconKey className="w-4 h-4 text-brand-light" />
                <h2 className="text-zinc-50 font-semibold">Free API key</h2>
              </div>
              <p className="text-zinc-500 text-xs mb-4">
                {freePlanRequestLimit} requests, lifetime — up to {limit} free keys.
              </p>

              <input
                required
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Label, e.g. my-bot"
                className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <div className="flex flex-wrap gap-2 mb-4">
                {ALLOWED_USER_SCOPES.map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    title={SCOPE_INFO[scope]?.description}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                      scopes.includes(scope)
                        ? 'bg-brand text-white border-brand'
                        : 'border-zinc-800 text-zinc-400 hover:text-brand-light'
                    }`}
                  >
                    {SCOPE_INFO[scope]?.label || scope}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={isSaving} className="btn-primary w-full text-sm">
                {isSaving ? 'Creating.' : 'Create free key'}
              </button>

              {newlyCreatedKey && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-xs text-yellow-400 mb-2">Copy this now — it won't be shown again.</p>
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
          ) : (
            <div className="card-surface p-6 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <IconKey className="w-4 h-4 text-zinc-500" />
                <h2 className="text-zinc-50 font-semibold">Free API key</h2>
              </div>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                You've used all {limit} of your free lifetime key slots. This counts every key you've
                ever created — revoking a key doesn't return the slot. Buy a premium key below to keep going.
              </p>
            </div>
          )}

          {/* Buy premium key */}
          <button
            onClick={() => setShowPurchase(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/5 text-brand-light text-sm font-medium py-3 mb-8 hover:bg-brand/10 transition-colors duration-200"
          >
            <IconQr className="w-4 h-4" /> Buy a premium key (from Rp5.000)
          </button>

          {/* Key list */}
          <h2 className="text-zinc-50 font-semibold mb-4">Your keys</h2>
          {keys.length === 0 ? (
            <p className="text-zinc-500 text-sm">No API keys yet.</p>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div key={key._id} className="card-surface p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-zinc-50 font-medium">{key.label}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-400 uppercase">
                        {key.plan}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1 font-mono-ui">
                      kyy_{key.keyId}... - {key.scopes.map((scope) => SCOPE_INFO[scope]?.label || scope).join(', ')}
                    </p>
                    <p className="text-zinc-600 text-xs mt-1">
                      {key.requestCount}
                      {key.requestLimit !== null ? `/${key.requestLimit}` : ''} requests used
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
              ))}
            </div>
          )}
        </>
      )}

      {showPurchase && (
        <ApiKeyPurchaseModal onClose={() => setShowPurchase(false)} onIssued={loadAll} />
      )}
    </main>
  );
}
