export const LANGUAGE_STYLE = {
  javascript: 'bg-amber-soft text-amber border-amber/30',
  typescript: 'bg-indigo-soft text-indigo-dark border-indigo/30',
  python: 'bg-clover-soft text-clover border-clover/30',
  bash: 'bg-paper-soft text-slate border-line',
  json: 'bg-rust-soft text-rust border-rust/30',
};

export const LANGUAGE_EXT = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  bash: 'sh',
  json: 'json',
};

export function languageBadgeClass(language) {
  return LANGUAGE_STYLE[language] || 'bg-indigo-soft text-indigo-dark border-indigo/30';
}

export function fileNameFor(title, language) {
  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${slug || 'snippet'}.${LANGUAGE_EXT[language] || 'txt'}`;
}
