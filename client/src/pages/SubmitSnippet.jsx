import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../lib/api.js';
import { IconScript, IconCheck, IconArrowRight } from '../lib/icons.jsx';
import { languageBadgeClass } from '../lib/languageMeta.js';

const LANGUAGES = ['javascript', 'typescript', 'python', 'bash', 'json'];

export default function SubmitSnippet() {
  const { user, idToken, isLoading, refreshToken } = useUser();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(null);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      const token = (await refreshToken()) || idToken;
      const result = await api.submitMySnippet(token, {
        title,
        description,
        language,
        code,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      setSubmitted(result);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (submitted) {
    return (
      <main className="theme-light max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-indigo-soft text-indigo flex items-center justify-center mx-auto mb-5">
          <IconCheck className="w-6 h-6" />
        </div>
        <h1 className="font-display text-xl font-semibold text-ink mb-2">Submitted for review</h1>
        <p className="text-slate mb-6">
          "{submitted.snippet.title}" is waiting on an admin to review it before it goes public. You can
          check on it from your profile any time.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/profile" className="btn-primary text-sm">View your submissions</Link>
          <Link to="/snippets" className="btn-outline text-sm">Back to Snippets</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="theme-light max-w-4xl mx-auto px-6 py-14">
      <Link to="/snippets" className="text-slate hover:text-indigo text-sm inline-flex items-center gap-2 mb-6 transition-colors duration-200">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Snippets
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo">
          <IconScript className="w-5 h-5" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink">Submit a snippet</h1>
      </div>
      <p className="text-slate mb-8 max-w-2xl">
        Share something reusable with the community. New submissions are reviewed before they go public —
        you'll be able to see the status from your profile.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="card-surface p-6">
          <label className="text-sm text-slate mb-2 block">Title</label>
          <input
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. debounce helper"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-ink text-sm mb-4 placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-indigo/40 focus:border-indigo/60 transition-colors duration-200"
          />

          <label className="text-sm text-slate mb-2 block">Description</label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does it do, and why is it useful?"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-ink text-sm mb-4 placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-indigo/40 focus:border-indigo/60 resize-none transition-colors duration-200"
          />

          <label className="text-sm text-slate mb-2 block">Language</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {LANGUAGES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLanguage(option)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                  language === option ? 'bg-indigo text-white border-indigo' : 'border-line text-slate hover:text-indigo'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <label className="text-sm text-slate mb-2 block">Code</label>
          <textarea
            required
            rows={12}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Paste your code here"
            spellCheck={false}
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-ink text-xs font-mono-ui mb-4 placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-indigo/40 focus:border-indigo/60 resize-y transition-colors duration-200"
          />

          <label className="text-sm text-slate mb-2 block">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="utility, performance"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-ink text-sm mb-5 placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-indigo/40 focus:border-indigo/60 transition-colors duration-200"
          />

          {errorMessage && <p className="text-rust text-sm mb-4">{errorMessage}</p>}

          <button type="submit" disabled={isSaving} className="btn-primary w-full text-sm">
            {isSaving ? 'Submitting…' : 'Submit for review'}
          </button>
        </form>

        <div className="card-surface overflow-hidden h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-paper-soft">
            <span className="font-mono-ui text-xs text-slate">Preview</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono-ui font-medium uppercase border ${languageBadgeClass(language)}`}>
              {language}
            </span>
          </div>
          <div className="code-scroll overflow-x-auto max-h-[420px]">
            {code ? (
              <SyntaxHighlighter
                language={language}
                style={oneLight}
                showLineNumbers
                customStyle={{ margin: 0, background: '#FBFAF7', fontSize: 12.5, padding: 18 }}
              >
                {code}
              </SyntaxHighlighter>
            ) : (
              <p className="text-mist text-sm p-6">Your code will preview here as you type.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
