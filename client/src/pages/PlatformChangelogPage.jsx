import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { IconClock, IconArrowRight } from '../lib/icons.jsx';

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PlatformChangelogPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api
      .listChangelog()
      .then(setEntries)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="theme-light max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Changelog</h1>
      <p className="text-slate mb-10">What's new across the KyyInfinite API and platform.</p>

      {errorMessage && <p className="text-rust mb-6">{errorMessage}</p>}

      {isLoading ? (
        <p className="text-slate text-sm">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-slate text-sm">No updates posted yet.</p>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-line" />
          {entries.map((entry) => (
            <div key={entry._id} className="relative mb-10 last:mb-0">
              <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo" />
              <div className="flex items-center justify-between gap-4 mb-1.5">
                <span className="font-mono-ui text-sm text-indigo">v{entry.version}</span>
                <span className="text-xs text-mist flex items-center gap-1.5">
                  <IconClock className="w-3 h-3" /> {formatDate(entry.createdAt)}
                </span>
              </div>
              <h2 className="text-ink font-semibold mb-1.5">{entry.title}</h2>
              <p className="text-slate text-sm leading-relaxed">{entry.description}</p>
              {entry.linkUrl && (
                <a
                  href={entry.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo hover:text-indigo-dark text-sm mt-2 transition-colors duration-200"
                >
                  Learn more <IconArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
