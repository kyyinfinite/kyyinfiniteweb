import React, { useEffect, useState } from 'react';
import { Navigate, useParams, useLocation, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../lib/api.js';
import { IconArrowRight } from '../lib/icons.jsx';

const STATUS_STYLES = {
  open: 'bg-brand/15 text-brand-light',
  in_progress: 'bg-amber-500/15 text-amber-300',
  resolved: 'bg-emerald-500/15 text-emerald-300',
  closed: 'bg-zinc-800 text-zinc-500',
};

export default function SupportTicketDetail() {
  const { user, idToken, isLoading, refreshToken } = useUser();
  const { id } = useParams();
  const location = useLocation();

  const [ticket, setTicket] = useState(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function loadTicket() {
    const token = (await refreshToken()) || idToken;
    const data = await api.getMyTicket(token, id);
    setTicket(data.ticket);
  }

  useEffect(() => {
    if (!user) return;
    loadTicket()
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingTicket(false));
  }, [user, id]);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  async function handleReply(event) {
    event.preventDefault();
    setIsSending(true);
    setErrorMessage('');
    try {
      const token = (await refreshToken()) || idToken;
      const data = await api.replyToMyTicket(token, id, { message: reply });
      setTicket(data.ticket);
      setReply('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-14 pb-28">
      <Link to="/support" className="inline-flex items-center gap-1.5 text-zinc-500 text-sm mb-6 hover:text-zinc-300">
        <IconArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to tickets
      </Link>

      {isLoadingTicket ? (
        <p className="text-zinc-500 text-sm">Loading.</p>
      ) : errorMessage && !ticket ? (
        <p className="text-red-400 text-sm">{errorMessage}</p>
      ) : ticket ? (
        <>
          <div className="flex items-center justify-between gap-4 mb-1">
            <h1 className="text-xl font-semibold text-zinc-50">{ticket.subject}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[ticket.status]}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-zinc-600 text-xs mb-6 font-mono-ui">
            {ticket.ticketNumber} - {ticket.category}
          </p>

          <div className="space-y-3 mb-6">
            {ticket.replies.map((entry, index) => (
              <div
                key={index}
                className={`card-surface p-4 ${entry.authorType === 'admin' ? 'border-brand/30' : ''}`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span
                    className={`text-xs font-medium ${
                      entry.authorType === 'admin' ? 'text-brand-light' : 'text-zinc-300'
                    }`}
                  >
                    {entry.authorLabel}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {new Date(entry.createdAt).toLocaleString('en-US')}
                  </span>
                </div>
                <p className="text-zinc-200 text-sm whitespace-pre-wrap">{entry.message}</p>
              </div>
            ))}
          </div>

          {ticket.status !== 'closed' ? (
            <form onSubmit={handleReply} className="card-surface p-4">
              {errorMessage && <p className="text-red-400 text-sm mb-3">{errorMessage}</p>}
              <textarea
                required
                rows={3}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Write a reply."
                className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-100 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
              <button type="submit" disabled={isSending} className="btn-primary w-full text-sm">
                {isSending ? 'Sending.' : 'Send reply'}
              </button>
            </form>
          ) : (
            <p className="text-zinc-600 text-sm text-center">This ticket is closed.</p>
          )}
        </>
      ) : null}
    </main>
  );
}
