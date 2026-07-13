import React, { useEffect, useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../lib/api.js';
import { IconTicket } from '../lib/icons.jsx';

const CATEGORIES = [
  { id: 'billing', label: 'Billing' },
  { id: 'api', label: 'API' },
  { id: 'technical', label: 'Technical' },
  { id: 'other', label: 'Other' },
];

const STATUS_STYLES = {
  open: 'bg-brand/15 text-brand-light',
  in_progress: 'bg-amber-500/15 text-amber-300',
  resolved: 'bg-emerald-500/15 text-emerald-300',
  closed: 'bg-zinc-800 text-zinc-500',
};

export default function Support() {
  const { user, idToken, isLoading, refreshToken } = useUser();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('other');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadTickets() {
    const token = (await refreshToken()) || idToken;
    const data = await api.listMyTickets(token);
    setTickets(data.tickets);
  }

  useEffect(() => {
    if (!user) return;
    loadTickets()
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingTickets(false));
  }, [user]);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      const token = (await refreshToken()) || idToken;
      await api.createTicket(token, { subject, category, message });
      setSubject('');
      setMessage('');
      setCategory('other');
      setShowForm(false);
      await loadTickets();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-14 pb-28">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light">
          <IconTicket className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-50 font-display">Support</h1>
      </div>

      {errorMessage && <p className="text-red-400 text-sm mb-6">{errorMessage}</p>}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full mb-8">
          Open a new ticket
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-surface p-6 mb-8">
          <h2 className="text-zinc-50 font-semibold mb-4">New ticket</h2>

          <label className="text-sm text-zinc-400 mb-2 block">Subject</label>
          <input
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Briefly describe your issue"
            className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
          />

          <label className="text-sm text-zinc-400 mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setCategory(option.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                  category === option.id
                    ? 'bg-brand text-white border-brand'
                    : 'border-zinc-800 text-zinc-400 hover:text-brand-light'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="text-sm text-zinc-400 mb-2 block">Message</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Explain what's going on."
            className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary flex-1 text-sm">
              {isSaving ? 'Submitting.' : 'Submit ticket'}
            </button>
          </div>
        </form>
      )}

      <h2 className="text-zinc-50 font-semibold mb-4">Your tickets</h2>
      {isLoadingTickets ? (
        <p className="text-zinc-500 text-sm">Loading.</p>
      ) : tickets.length === 0 ? (
        <p className="text-zinc-500 text-sm">No tickets yet.</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/support/${ticket._id}`}
              className="card-surface p-4 flex items-center justify-between gap-4 block"
            >
              <div className="min-w-0">
                <p className="text-zinc-50 font-medium truncate">{ticket.subject}</p>
                <p className="text-zinc-600 text-xs mt-1 font-mono-ui">
                  {ticket.ticketNumber} - {ticket.category}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[ticket.status]}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
