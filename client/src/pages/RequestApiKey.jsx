import React, { useEffect, useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { IconKey, IconCopy, IconTerminal } from '../lib/icons.jsx';

const SCOPE_DESCRIPTIONS = {
  'tools:search': 'Search endpoints (Spotify, TikTok, YouTube, Apple Music.)',
  'tools:maker': 'Image/meme maker endpoints',
  'tools:downloader': 'Downloader endpoints (TikTok, Instagram, YouTube.)',
};

export default function RequestApiKey() {
  const { user, idToken, isLoading, refreshToken, logout } = useUser();
  const location = useLocation();
  const showToast = useToast();

  const [keys, setKeys] = useState([]);
  const [limit, setLimit] = useState(2);
  const [allowedScopes, setAllowedScopes] = useState([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [label, setLabel] = useState('');
  const [scopes, setScopes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);

  async function loadKeys() {
    const token = (await refreshToken()) || idToken;
    const data = await api.listMyApiKeys(token);
    setKeys(data.keys);
    setLimit(data.limit);
    setAllowedScopes(data.allowedScopes);
  }

  useEffect(() => {
    if (!user) return;
    loadKeys()
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingKeys(false));
  }, [user]);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

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
      const result = await api.requestMyApiKey(token, { label, scopes });
      setNewlyCreatedKey(result.apiKey);
      setLabel('');
      setScopes([]);
      await loadKeys();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRevoke(id) {
    const token = (await refreshToken()) || idToken;
    await api.revokeMyApiKey(token, id);
    await loadKeys();
  }

  function copyKey() {
    navigator.clipboard.writeText(newlyCreatedKey);
    showToast('API key copied', { type: 'success' });
  }

  const activeCount = keys.filter((k) => k.status === 'active').length;
  const canCreate = activeCount < limit;

  return (
    <main className="max-w-2xl mx-auto px-6 py-14">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light">
          <IconKey className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-50 font-display">Your API Key</h1>
      </div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <p className="text-zinc-400 text-sm">
          Signed in as {user?.email}. You can have up to {limit} active key(s).
        </p>
        <button onClick={logout} className="text-xs text-zinc-500 hover:text-red-400 shrink-0">
          Sign out
        </button>
      </div>

      {canCreate ? (
        <form onSubmit={handleSubmit} className="card-surface p-6 mb-8">
          <h2 className="text-zinc-50 font-semibold mb-5">Request a new key</h2>

          <label className="text-sm text-zinc-400 mb-2 block">Label</label>
          <input
            required
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. my-personal-bot"
            className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
          />

          <label className="text-sm text-zinc-400 mb-2 block">Scopes</label>
          <div className="space-y-2 mb-4">
            {allowedScopes.map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => toggleScope(scope)}
                className={`w-full text-left px-4 py-2.5 rounded-xl border transition-colors duration-200 ${
                  scopes.includes(scope)
                    ? 'bg-brand/10 border-brand text-brand-light'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-sm font-mono-ui">{scope}</span>
                <p className="text-xs text-zinc-500 mt-0.5">{SCOPE_DESCRIPTIONS[scope] || ''}</p>
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-600 mb-4">
            Self-serve keys are capped at the default rate limit (30 requests/min).
          </p>

          {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

          <button type="submit" disabled={isSaving} className="btn-primary w-full">
            {isSaving ? 'Creating.' : 'Create key'}
          </button>

          {newlyCreatedKey && (
            <div className="mt-5 pt-5 border-t border-zinc-800">
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
        <div className="card-surface p-6 mb-8 text-sm text-zinc-400">
          You've reached your limit of {limit} active key(s). Revoke one below to create a new one.
        </div>
      )}

      <h2 className="text-zinc-50 font-semibold mb-4">Your keys</h2>
      {isLoadingKeys ? (
        <p className="text-zinc-500 text-sm">Loading.</p>
      ) : keys.length === 0 ? (
        <p className="text-zinc-500 text-sm">No API keys yet.</p>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div key={key._id} className="card-surface p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-zinc-50 font-medium">{key.label}</p>
                <p className="text-zinc-500 text-xs mt-1 font-mono-ui">
                  kyy_{key.keyId}... - {key.scopes.join(', ')}
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
          ))}
        </div>
      )}

      <Link to="/developers" className="inline-flex items-center gap-1.5 text-brand-light text-sm mt-8">
        <IconTerminal className="w-4 h-4" /> Go to API Playground
      </Link>
    </main>
  );
}
