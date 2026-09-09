import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { IconCheck, IconClock } from '../lib/icons.jsx';

const CHECKS = [
  { key: 'api', label: 'API', run: () => api.checkHealth() },
  { key: 'snippets', label: 'Snippets directory', run: () => api.listSnippets() },
  { key: 'products', label: 'Products directory', run: () => api.listAssets() },
];

const SEVERITY_STYLE = {
  minor: 'bg-amber-soft text-amber',
  major: 'bg-rust-soft text-rust',
  critical: 'bg-rust text-white',
};

const STATUS_LABEL = {
  investigating: 'Investigating',
  identified: 'Identified',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
};

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function StatusPage() {
  const [checks, setChecks] = useState(CHECKS.map((check) => ({ ...check, state: 'checking', latency: null })));
  const [incidents, setIncidents] = useState([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);

  useEffect(() => {
    CHECKS.forEach(async (check, index) => {
      const startedAt = performance.now();
      try {
        await check.run();
        const latency = Math.round(performance.now() - startedAt);
        setChecks((current) => {
          const next = [...current];
          next[index] = { ...next[index], state: latency > 1200 ? 'degraded' : 'operational', latency };
          return next;
        });
      } catch (error) {
        setChecks((current) => {
          const next = [...current];
          next[index] = { ...next[index], state: 'down', latency: null };
          return next;
        });
      }
    });

    api
      .listIncidents()
      .then(setIncidents)
      .finally(() => setIsLoadingIncidents(false));
  }, []);

  const activeIncidents = incidents.filter((incident) => incident.status !== 'resolved');
  const resolvedIncidents = incidents.filter((incident) => incident.status === 'resolved').slice(0, 8);

  const anyDown = checks.some((check) => check.state === 'down');
  const anyDegraded = checks.some((check) => check.state === 'degraded');
  const allChecked = checks.every((check) => check.state !== 'checking');

  let bannerTone = 'checking';
  if (allChecked) {
    bannerTone = anyDown || activeIncidents.some((i) => i.severity === 'critical') ? 'down' : anyDegraded || activeIncidents.length > 0 ? 'degraded' : 'operational';
  }

  const BANNER_COPY = {
    checking: { text: 'Checking systems…', className: 'bg-paper-soft text-slate' },
    operational: { text: 'All systems operational', className: 'bg-clover-soft text-clover' },
    degraded: { text: 'Some systems are degraded', className: 'bg-amber-soft text-amber' },
    down: { text: 'A system is down', className: 'bg-rust-soft text-rust' },
  };

  return (
    <main className="theme-light max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">System Status</h1>
      <p className="text-slate mb-8">Live checks against the API and public directories, plus recent incidents.</p>

      <div className={`rounded-xl px-5 py-4 font-medium mb-8 ${BANNER_COPY[bannerTone].className}`}>
        {BANNER_COPY[bannerTone].text}
      </div>

      <div className="card-surface divide-y divide-line mb-10">
        {checks.map((check) => (
          <div key={check.key} className="flex items-center justify-between px-5 py-4">
            <span className="text-ink text-sm font-medium">{check.label}</span>
            <div className="flex items-center gap-2.5">
              {check.latency !== null && <span className="text-xs text-mist">{check.latency}ms</span>}
              <span
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  check.state === 'operational'
                    ? 'bg-clover-soft text-clover'
                    : check.state === 'degraded'
                    ? 'bg-amber-soft text-amber'
                    : check.state === 'down'
                    ? 'bg-rust-soft text-rust'
                    : 'bg-paper-soft text-slate'
                }`}
              >
                {check.state === 'checking' ? (
                  'Checking…'
                ) : (
                  <>
                    <IconCheck className="w-3 h-3" />
                    {check.state === 'operational' ? 'Operational' : check.state === 'degraded' ? 'Degraded' : 'Down'}
                  </>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg font-semibold text-ink mb-4">Active incidents</h2>
      {isLoadingIncidents ? (
        <p className="text-slate text-sm mb-10">Loading…</p>
      ) : activeIncidents.length === 0 ? (
        <p className="text-slate text-sm mb-10">No active incidents.</p>
      ) : (
        <div className="space-y-3 mb-10">
          {activeIncidents.map((incident) => (
            <div key={incident._id} className="card-surface p-4">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SEVERITY_STYLE[incident.severity]}`}>
                  {incident.severity}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-soft text-indigo-dark font-medium">
                  {STATUS_LABEL[incident.status]}
                </span>
              </div>
              <p className="text-ink font-medium">{incident.title}</p>
              {incident.description && <p className="text-slate text-sm mt-1">{incident.description}</p>}
              <p className="text-mist text-xs mt-2 flex items-center gap-1.5">
                <IconClock className="w-3 h-3" /> {formatDateTime(incident.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-lg font-semibold text-ink mb-4">Recent history</h2>
      {resolvedIncidents.length === 0 ? (
        <p className="text-slate text-sm">No resolved incidents to show.</p>
      ) : (
        <div className="space-y-2">
          {resolvedIncidents.map((incident) => (
            <div key={incident._id} className="flex items-center justify-between gap-4 py-2.5 border-b border-line last:border-0">
              <span className="text-slate text-sm truncate">{incident.title}</span>
              <span className="text-mist text-xs shrink-0">{formatDateTime(incident.resolvedAt || incident.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
