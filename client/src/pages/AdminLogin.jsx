import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';
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
      setErrorMessage('Invalid credentials or unauthorized account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="card-surface w-full max-w-sm p-8">
        <div className="w-11 h-11 rounded-xl bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark mb-6">
          <IconLock className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-semibold text-text-charcoal dark:text-white mb-1">Admin Access</h1>
        <p className="text-text-muted text-sm mb-6">Restricted to the authorized administrator account.</p>

        <label className="text-sm text-text-muted mb-2 block">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        <label className="text-sm text-text-muted mb-2 block">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-border-soft dark:border-white/10 bg-transparent px-4 py-2.5 text-text-charcoal dark:text-white mb-6 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        />

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Signing in.' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
