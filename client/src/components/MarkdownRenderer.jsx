import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'github-markdown-css/github-markdown-dark.css';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(event) {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`kyy-code-copy ${copied ? 'kyy-code-copy--done' : ''}`}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function CodeBlock({ inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const raw = String(children).replace(/\n$/, '');

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="kyy-code-block">
      <div className="kyy-code-block-header">
        <span className="kyy-code-block-lang">{match ? match[1] : 'text'}</span>
        <CopyButton text={raw} />
      </div>
      <SyntaxHighlighter
        language={match ? match[1] : 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: 13,
          background: 'transparent',
          padding: '1rem',
        }}
      >
        {raw}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  return (
    <div className={`markdown-body kyy-markdown ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
