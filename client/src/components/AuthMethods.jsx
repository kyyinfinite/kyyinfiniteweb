import React, { useState } from 'react';
import { useUser } from '../context/UserContext.jsx';

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

const inputClass =
  'w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand';

export default function AuthMethods({ mode = 'login' }) {
  const { loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail, sendOtp, confirmOtp } = useUser();
  const [method, setMethod] = useState('social'); // 'social' | 'email' | 'phone'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // phone OTP state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const isRegister = mode === 'register';

  async function run(fn) {
    setErrorMessage('');
    setInfoMessage('');
    setIsSubmitting(true);
    try {
      await fn();
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEmailSubmit(event) {
    event.preventDefault();
    run(async () => {
      if (isRegister) {
        await registerWithEmail(email, password);
        setInfoMessage('Account created — check your inbox to verify your email.');
      } else {
        await loginWithEmail(email, password);
      }
    });
  }

  function handleSendOtp(event) {
    event.preventDefault();
    run(async () => {
      const result = await sendOtp(phone);
      setConfirmationResult(result);
      setInfoMessage('Code sent — check your SMS.');
    });
  }

  function handleConfirmOtp(event) {
    event.preventDefault();
    run(() => confirmOtp(confirmationResult, otpCode));
  }

  return (
    <div>
      <div className="space-y-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => run(loginWithGoogle)}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-white/5 hover:bg-white/10 text-zinc-100 text-sm font-medium py-2.5 transition-colors duration-200"
        >
          <GoogleGlyph /> Continue with Google
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => run(loginWithGithub)}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-white/5 hover:bg-white/10 text-zinc-100 text-sm font-medium py-2.5 transition-colors duration-200"
        >
          <GithubGlyph /> Continue with GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] text-zinc-600 uppercase tracking-wider">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
            method === 'email' ? 'border-brand text-brand-light bg-brand/10' : 'border-zinc-800 text-zinc-400'
          }`}
        >
          Email & password
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
            method === 'phone' ? 'border-brand text-brand-light bg-brand/10' : 'border-zinc-800 text-zinc-400'
          }`}
        >
          Phone (OTP)
        </button>
      </div>

      {errorMessage && <p className="text-red-400 text-sm mb-3">{errorMessage}</p>}
      {infoMessage && <p className="text-emerald-400 text-sm mb-3">{infoMessage}</p>}

      {method === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password (min. 6 characters)"
            className={inputClass}
          />
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm">
            {isSubmitting ? 'Please wait.' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>
      )}

      {method === 'phone' && !confirmationResult && (
        <form onSubmit={handleSendOtp} className="space-y-3">
          <input
            type="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+6281234567890"
            className={inputClass}
          />
          <p className="text-xs text-zinc-600">Use international format, e.g. +62 for Indonesia.</p>
          <div id="recaptcha-container" />
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm">
            {isSubmitting ? 'Sending.' : 'Send code'}
          </button>
        </form>
      )}

      {method === 'phone' && confirmationResult && (
        <form onSubmit={handleConfirmOtp} className="space-y-3">
          <input
            type="text"
            required
            inputMode="numeric"
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value)}
            placeholder="6-digit code"
            className={inputClass}
          />
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm">
            {isSubmitting ? 'Verifying.' : 'Verify code'}
          </button>
        </form>
      )}
    </div>
  );
}
