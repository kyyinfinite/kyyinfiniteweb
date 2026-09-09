import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { IconArrowRight, IconScript } from '../lib/icons.jsx';
import { languageBadgeClass } from '../lib/languageMeta.js';

function initialsOf(name) {
  return (name || '?').slice(0, 2).toUpperCase();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export default function ContributorProfile() {
  const { uid } = useParams();
  const [contributor, setContributor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api
      .getContributor(uid)
      .then(setContributor)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [uid]);

  if (isLoading) {
    return <p className="theme-light max-w-3xl mx-auto px-6 py-24 text-slate text-center">Loading…</p>;
  }

  if (errorMessage || !contributor) {
    return (
      <div className="theme-light max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-rust mb-4">{errorMessage || 'Contributor not found.'}</p>
        <Link to="/snippets" className="text-indigo text-sm">Back to Snippets</Link>
      </div>
    );
  }

  const name = contributor.displayName || contributor.username || 'Anonymous';

  return (
    <main className="theme-light max-w-3xl mx-auto px-6 py-16">
      <Link to="/snippets" className="text-slate hover:text-indigo text-sm inline-flex items-center gap-2 mb-8 transition-colors duration-200">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Snippets
      </Link>

      <div className="card-surface p-6 md:p-7 mb-8 flex items-center gap-4">
        {contributor.photoURL ? (
          <img src={contributor.photoURL} alt="" className="w-16 h-16 rounded-full border border-line" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-soft border border-indigo/20 flex items-center justify-center text-indigo font-semibold text-xl">
            {initialsOf(name)}
          </div>
        )}
        <div>
          <p className="font-display text-xl font-semibold text-ink">{name}</p>
          <p className="text-slate text-sm mt-1">
            Contributor since {formatDate(contributor.joinedAt)} · {contributor.snippets.length} snippet
            {contributor.snippets.length === 1 ? '' : 's'} published
          </p>
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold text-ink mb-4">Published snippets</h2>
      {contributor.snippets.length === 0 ? (
        <p className="text-slate text-sm">No published snippets yet.</p>
      ) : (
        <div className="space-y-3">
          {contributor.snippets.map((snippet) => (
            <Link
              key={snippet._id}
              to={`/snippets/${snippet._id}`}
              className="card-surface p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex items-center gap-3">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-indigo-soft flex items-center justify-center text-indigo">
                  <IconScript className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-ink font-medium truncate">{snippet.title}</p>
                  <p className="text-slate text-xs mt-0.5 truncate">{snippet.description}</p>
                </div>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono-ui font-medium uppercase border ${languageBadgeClass(snippet.language)}`}>
                {snippet.language}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
