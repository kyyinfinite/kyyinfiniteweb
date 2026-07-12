import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { isConfigValid } from '../firebase.js';
import { IconTerminal } from '../lib/icons.jsx';
import AuthMethods from '../components/AuthMethods.jsx';

export default function Login({ mode = 'login' }) {
  const { user } = useUser();
  const location = useLocation();
  const redirectTo = location.state?.from || '/profile';

  if (user) {
    return <Navigate to={redirectTo} replace />;
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
            ? 'Create an account to get your profile and request your own API key.'
            : 'Sign in to see your profile and manage your API key.'}
        </p>

        {!isConfigValid && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs px-4 py-3 mb-6 leading-relaxed">
            Firebase is not configured. Set all VITE_FIREBASE_* environment variables and redeploy
            before sign-in can work.
          </div>
        )}

        <AuthMethods mode={mode} />

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
