import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { IconKey, IconCopy, IconQr, IconTicket } from '../lib/icons.jsx';
import ApiKeyPurchaseModal from '../components/ApiKeyPurchaseModal.jsx';
import Badge from '../components/ui/Badge.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';

const ALLOWED_USER_SCOPES = [
  'tools:search',
  'tools:maker',
  'tools:downloader',
  'tools:utility',
  'tools:news',
  'tools:info',
  'tools:primbon',
  'tools:random',
  'tools:stalker',
];

const SCOPE_INFO = {
  'tools:search': { label: 'Search', description: 'Spotify, TikTok, YouTube, Apple Music search' },
  'tools:maker': { label: 'Image Maker', description: 'Brat, lobby fakes, memes, text effects, quote cards' },
  'tools:downloader': { label: 'Downloader', description: 'TikTok, Instagram, YouTube, Spotify, and more' },
  'tools:utility': { label: 'Utility', description: 'Translate, text-to-speech, image unblur' },
  'tools:news': { label: 'News', description: 'Kompas, CNN, Tribunnews, and other feeds' },
  'tools:info': { label: 'Info', description: 'Weather, earthquakes, TV schedules' },
  'tools:primbon': { label: 'Primbon', description: 'Name meaning, lucky numbers, dream readings' },
  'tools:random': { label: 'Random', description: 'Random anime and Blue Archive images' },
  'tools:stalker': { label: 'Profile Lookup', description: 'Public profile info from TikTok, YouTube, GitHub, and more' },
};

function initialsOf(username, email) {
  const source = username || email?.split('@')[0] || '??';
  return source.slice(0, 2).toUpperCase();
}

function rateLimitFor(key) {
  return key.rateLimitTier === 'pro' ? 120 : 30;
}

function quotaTone(percentage) {
  if (percentage >= 90) return 'danger';
  if (percentage >= 80) return 'warning';
  return 'indigo';
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
    <main className="theme-light max-w-2xl mx-auto px-6 py-14 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" className="w-14 h-14 rounded-full border border-line" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-soft border border-indigo/20 flex items-center justify-center text-indigo font-semibold text-lg">
              {initialsOf(profile?.username, profile?.email)}
            </div>
          )}
          <div>
            <p className="font-display text-ink font-semibold text-lg">
              {profile?.displayName || profile?.username || 'Your profile'}
            </p>
            <p className="text-slate text-sm">{profile?.email || profile?.phoneNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/support" className="text-xs text-slate hover:text-indigo flex items-center gap-1 transition-colors duration-200">
            <IconTicket className="w-3.5 h-3.5" /> Support
          </Link>
          <button onClick={logout} className="text-xs text-slate hover:text-rust transition-colors duration-200">
            Sign out
          </button>
        </div>
      </div>

      {errorMessage && <p className="text-rust text-sm mb-6">{errorMessage}</p>}

      {isLoadingData ? (
        <p className="text-slate text-sm">Loading…</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card-surface p-4">
              <p className="text-slate text-xs">Total requests</p>
              <p className="font-display text-ink text-xl font-semibold mt-1">{usage?.totalRequests ?? 0}</p>
            </div>
            <div className="card-surface p-4">
              <p className="text-slate text-xs">Active keys</p>
              <p className="font-display text-ink text-xl font-semibold mt-1">
                {usage?.activeKeys ?? 0}/{limit}
              </p>
            </div>
            <div className="card-surface p-4">
              <p className="text-slate text-xs">Last 14 days</p>
              <p className="font-display text-ink text-xl font-semibold mt-1">{usage?.requestsLast14Days ?? 0}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="card-surface p-6 mb-8">
            <p className="font-display text-ink font-semibold mb-1">Usage</p>
            <p className="text-slate text-xs mb-4">Requests per day, last 14 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5850E6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#5850E6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#9C9E93" fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="#9C9E93" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <CartesianGrid stroke="#E6E3D8" vertical={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E6E3D8',
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: '0 8px 24px rgba(29,31,26,0.08)',
                  }}
                  labelStyle={{ color: '#6B6D64' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#5850E6" strokeWidth={2} fill="url(#usageGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Create free key */}
          {canCreateFree ? (
            <form onSubmit={handleCreateFreeKey} className="card-surface p-6 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <IconKey className="w-4 h-4 text-indigo" />
                <h2 className="font-display text-ink font-semibold">Free API key</h2>
              </div>
              <p className="text-slate text-xs mb-4">
                {freePlanRequestLimit} requests, lifetime — up to {limit} free keys.
              </p>

              <input
                required
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Label, e.g. my-bot"
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-ink text-sm mb-3 placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-indigo/40 focus:border-indigo/60 transition-colors duration-200"
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
                        ? 'bg-indigo text-white border-indigo'
                        : 'border-line text-slate hover:text-indigo hover:border-indigo/40'
                    }`}
                  >
                    {SCOPE_INFO[scope]?.label || scope}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={isSaving} className="btn-primary w-full text-sm">
                {isSaving ? 'Creating…' : 'Create free key'}
              </button>

              {newlyCreatedKey && (
                <div className="mt-4 pt-4 border-t border-line">
                  <p className="text-xs text-amber mb-2">Copy this now — it won't be shown again.</p>
                  <button
                    onClick={copyKey}
                    className="w-full font-mono-ui text-indigo-dark text-xs tracking-wide bg-indigo-soft border border-indigo/20 rounded-xl py-3 px-3 flex items-center justify-between gap-2 hover:border-indigo/40 transition-colors duration-200"
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
                <IconKey className="w-4 h-4 text-mist" />
                <h2 className="font-display text-ink font-semibold">Free API key</h2>
              </div>
              <p className="text-slate text-sm mt-2 leading-relaxed">
                You've used all {limit} of your free lifetime key slots. This counts every key you've
                ever created — revoking a key doesn't return the slot. Buy a premium key below to keep going.
              </p>
            </div>
          )}

          {/* Buy premium key */}
          <button
            onClick={() => setShowPurchase(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo/25 bg-indigo-soft text-indigo-dark text-sm font-medium py-3 mb-8 hover:border-indigo/40 transition-colors duration-200"
          >
            <IconQr className="w-4 h-4" /> Buy a premium key (from Rp5.000)
          </button>

          {/* Key list */}
          <h2 className="font-display text-ink font-semibold mb-4">Your keys</h2>
          {keys.length === 0 ? (
            <p className="text-slate text-sm">No API keys yet.</p>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => {
                const hasQuota = key.requestLimit !== null && key.requestLimit !== undefined;
                const percentage = hasQuota
                  ? Math.min((key.requestCount / key.requestLimit) * 100, 100)
                  : 0;

                return (
                  <div key={key._id} className="card-surface p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-ink font-medium">{key.label}</p>
                          <Badge tone="neutral">{key.plan}</Badge>
                        </div>
                        <p className="text-slate text-xs mt-1 font-mono-ui">
                          kyy_{key.keyId}… · {key.scopes.map((scope) => SCOPE_INFO[scope]?.label || scope).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge tone={key.status === 'active' ? 'indigo' : 'danger'}>{key.status}</Badge>
                        {key.status === 'active' && (
                          <button
                            onClick={() => handleRevoke(key._id)}
                            className="text-rust hover:text-rust/80 text-sm font-medium transition-colors duration-200"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-mist">Lifetime quota</span>
                          <span className="text-slate">
                            {hasQuota ? `${key.requestCount} / ${key.requestLimit}` : `${key.requestCount} used · Unlimited`}
                          </span>
                        </div>
                        {hasQuota && <ProgressBar percentage={percentage} tone={quotaTone(percentage)} />}
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-mist">Rate limit</span>
                          <span className="text-slate">{rateLimitFor(key)} requests/min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
