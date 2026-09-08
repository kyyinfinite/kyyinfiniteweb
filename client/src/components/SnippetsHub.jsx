import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '../lib/api.js';
import { IconScript, IconArrowRight } from '../lib/icons.jsx';
import { SkeletonGrid, EmptyState } from './Skeleton.jsx';
import { languageBadgeClass, fileNameFor } from '../lib/languageMeta.js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function badgeClass(language) {
  return languageBadgeClass(language);
}

function fileName(snippet) {
  return fileNameFor(snippet.title, snippet.language);
}

export default function SnippetsHub() {
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api
      .listSnippets()
      .then(setSnippets)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="theme-light max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold text-ink">Code Snippets</h1>
        <p className="text-slate mt-2">Reusable pieces of code from the KyyInfinite ecosystem.</p>
      </div>

      {errorMessage && <p className="text-rust mb-6">{errorMessage}</p>}

      {isLoading ? (
        <SkeletonGrid count={4} columns="lg:grid-cols-2" />
      ) : snippets.length === 0 ? (
        <EmptyState title="Belum ada snippet dipublikasikan" />
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {snippets.map((snippet) => (
            <motion.div
              key={snippet._id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="card-surface overflow-hidden flex flex-col"
            >
              <div className="p-5 pb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-soft flex items-center justify-center text-indigo">
                    <IconScript className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-ink font-semibold truncate">{snippet.title}</h3>
                    <p className="text-slate text-xs mt-0.5 truncate">{snippet.description}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-mono-ui font-medium uppercase border ${badgeClass(
                    snippet.language
                  )}`}
                >
                  {snippet.language}
                </span>
              </div>

              <div className="relative mx-5 mb-5 rounded-xl overflow-hidden border border-line">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-paper-soft border-b border-line">
                  <span className="w-2 h-2 rounded-full bg-rust/50" />
                  <span className="w-2 h-2 rounded-full bg-amber/50" />
                  <span className="w-2 h-2 rounded-full bg-clover/50" />
                  <span className="ml-2 text-[10px] text-mist font-mono-ui truncate">{fileName(snippet)}</span>
                </div>
                <div className="relative">
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={oneLight}
                    customStyle={{
                      margin: 0,
                      background: '#FBFAF7',
                      padding: '14px',
                      maxHeight: 190,
                      fontSize: 12,
                    }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                  <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#FBFAF7] to-transparent pointer-events-none" />
                </div>
              </div>

              <Link
                to={`/snippets/${snippet._id}`}
                className="flex items-center justify-between px-5 py-4 mt-auto text-indigo text-sm font-medium border-t border-line hover:bg-indigo-soft transition-colors duration-200"
              >
                View full snippet <IconArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
