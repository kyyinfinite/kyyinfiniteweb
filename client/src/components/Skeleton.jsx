import React from 'react';
import Logo from './Logo.jsx';

export function SkeletonCard() {
  return (
    <div className="card-surface p-6 flex flex-col h-full animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-white/5" />
        <div className="w-10 h-3 rounded bg-white/5" />
      </div>
      <div className="w-20 h-5 rounded-full bg-white/5 mb-3" />
      <div className="w-3/4 h-4 rounded bg-white/5 mb-3" />
      <div className="space-y-2 flex-1">
        <div className="w-full h-3 rounded bg-white/5" />
        <div className="w-5/6 h-3 rounded bg-white/5" />
        <div className="w-2/3 h-3 rounded bg-white/5" />
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
        <div className="w-16 h-3 rounded bg-white/5" />
        <div className="w-20 h-3 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, columns = 'md:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid grid-cols-1 ${columns} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="card-surface p-5 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex-1">
        <div className="w-1/3 h-4 rounded bg-white/5 mb-2" />
        <div className="w-1/2 h-3 rounded bg-white/5" />
      </div>
      <div className="w-16 h-6 rounded-full bg-white/5" />
    </div>
  );
}

export function SkeletonTableRow({ columns = 4 }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-5 py-4">
          <div className="w-full h-3 rounded bg-white/5 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="opacity-30 mb-5">
        <Logo size={48} />
      </div>
      <p className="text-zinc-300 font-medium">{title}</p>
      {description && <p className="text-zinc-500 text-sm mt-1.5 max-w-sm">{description}</p>}
    </div>
  );
}
