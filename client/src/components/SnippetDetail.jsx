import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '../lib/api.js';
import { IconArrowRight, IconCheck } from '../lib/icons.jsx';

export default function SnippetDetail() {
  const { id } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    api
      .getSnippet(id)
      .then(setSnippet)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleCopy() {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  if (isLoading) {
    return <p className="max-w-4xl mx-auto px-6 py-24 text-zinc-400 text-center">Loading snippet.</p>;
  }

  if (errorMessage || !snippet) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-red-400 mb-4">{errorMessage || 'Snippet not found.'}</p>
        <Link to="/snippets" className="text-brand-light text-sm">Back to Snippets</Link>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <Link to="/snippets" className="text-zinc-400 hover:text-brand-light text-sm inline-flex items-center gap-2 mb-8">
        <IconArrowRight className="w-4 h-4 rotate-180" /> Back to Snippets
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card-surface overflow-hidden"
      >
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-zinc-50 ">{snippet.title}</h1>
            <span className="text-xs text-zinc-600 uppercase">{snippet.language}</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">{snippet.description}</p>

          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {snippet.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-brand/10 text-brand-light">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors duration-200"
          >
            {isCopied ? (
              <>
                <IconCheck className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              'Copy code'
            )}
          </button>
          <SyntaxHighlighter
            language={snippet.language}
            style={isDark ? oneDark : oneLight}
            customStyle={{ margin: 0, borderRadius: 0, fontSize: 13, padding: 24 }}
            showLineNumbers
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
      </motion.div>
    </main>
  );
}
