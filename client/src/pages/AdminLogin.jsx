import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';
import { isConfigValid } from '../firebase.js';
import { IconLock } from '../lib/icons.jsx';

export default function AdminLogin() {
  const { adminUser, login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (adminUser) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      setErrorMessage(error.message || 'Invalid credentials or unauthorized account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="card-surface w-full max-w-sm p-8">
        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
          <IconLock className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-semibold text-zinc-50 mb-1">Admin Access</h1>
        <p className="text-zinc-400 text-sm mb-6">Restricted to the authorized administrator account.</p>

        {!isConfigValid && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs px-4 py-3 mb-6 leading-relaxed">
            Firebase is not configured. Set all VITE_FIREBASE_* environment variables and redeploy
            before admin login can work.
          </div>
        )}

        <label className="text-sm text-zinc-400 mb-2 block">Email</label>
        <input
          type="email"
          required
          disabled={!isConfigValid}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
        />

        <label className="text-sm text-zinc-400 mb-2 block">Password</label>
        <input
          type="password"
          required
          disabled={!isConfigValid}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
        />

        {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !isConfigValid}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting ? 'Signing in.' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
