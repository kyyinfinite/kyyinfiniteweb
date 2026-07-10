import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '../lib/api.js';
import { IconScript, IconArrowRight } from '../lib/icons.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function SnippetsHub() {
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    api
      .listSnippets()
      .then(setSnippets)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-zinc-50 ">Code Snippets</h1>
        <p className="text-zinc-400 mt-2">Reusable pieces of code from the KyyInfinite ecosystem.</p>
      </div>

      {errorMessage && <p className="text-red-400 mb-6">{errorMessage}</p>}

      {isLoading ? (
        <p className="text-zinc-400">Loading snippets.</p>
      ) : snippets.length === 0 ? (
        <p className="text-zinc-400">No snippets published yet.</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {snippets.map((snippet) => (
            <motion.div key={snippet._id} variants={itemVariants} whileHover={{ y: -4 }} className="card-surface overflow-hidden flex flex-col">
              <div className="p-6 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <IconScript className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-zinc-50  font-semibold">{snippet.title}</h3>
                    <span className="text-xs text-zinc-600 uppercase">{snippet.language}</span>
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 text-sm px-6 pt-4 pb-2 leading-relaxed">{snippet.description}</p>
              <div className="text-xs">
                <SyntaxHighlighter
                  language={snippet.language}
                  style={isDark ? oneDark : oneLight}
                  customStyle={{ margin: 0, borderRadius: 0, maxHeight: 220, fontSize: 12.5 }}
                >
                  {snippet.code}
                </SyntaxHighlighter>
              </div>
              <Link
                to={`/snippets/${snippet._id}`}
                className="flex items-center justify-between px-6 py-4 text-cyan-400 text-sm font-medium border-t border-zinc-800 "
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
