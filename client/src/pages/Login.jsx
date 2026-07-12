import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { isConfigValid } from '../firebase.js';
import { IconTerminal } from '../lib/icons.jsx';

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.55-5.17 3.55-8.66z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function GithubGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export default function Login({ mode = 'login' }) {
  const { user, loginWithGoogle, loginWithGithub } = useUser();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const redirectTo = location.state?.from || '/developers/request-key';

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleProvider(fn) {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await fn();
    } catch (error) {
      setErrorMessage(error.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRegister = mode === 'register';

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-14">
      <div className="card-surface w-full max-w-sm p-8">
        <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-brand-light mb-6">
          <IconTerminal className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-semibold text-zinc-50 mb-1">
          {isRegister ? 'Create your account' : 'Sign in'}
        </h1>
        <p className="text-zinc-400 text-sm mb-6">
          {isRegister
            ? 'Create an account to request your own API key. Signing in for the first time creates it automatically.'
            : 'Sign in to request and manage your own API key.'}
        </p>

        {!isConfigValid && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs px-4 py-3 mb-6 leading-relaxed">
            Firebase is not configured. Set all VITE_FIREBASE_* environment variables and redeploy
            before sign-in can work.
          </div>
        )}

        {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

        <div className="space-y-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleProvider(loginWithGoogle)}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-white/5 hover:bg-white/10 text-zinc-100 text-sm font-medium py-2.5 transition-colors duration-200"
          >
            <GoogleGlyph /> Continue with Google
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleProvider(loginWithGithub)}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-white/5 hover:bg-white/10 text-zinc-100 text-sm font-medium py-2.5 transition-colors duration-200"
          >
            <GithubGlyph /> Continue with GitHub
          </button>
        </div>

        <p className="text-zinc-600 text-xs mt-6 text-center">
          {isRegister ? (
            <>
              Already have an account? <Link to="/login" className="text-brand-light hover:underline">Sign in</Link>
            </>
          ) : (
            <>
              New here? <Link to="/register" className="text-brand-light hover:underline">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
