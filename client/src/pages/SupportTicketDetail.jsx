import React, { useEffect, useState } from 'react';
import { Navigate, useParams, useLocation, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../lib/api.js';
import { IconArrowRight } from '../lib/icons.jsx';

const STATUS_STYLES = {
  open: 'bg-indigo-soft text-indigo-dark',
  in_progress: 'bg-amber-soft text-amber',
  resolved: 'bg-clover-soft text-clover',
  closed: 'bg-paper-soft text-mist',
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
    <main className="theme-light max-w-2xl mx-auto px-6 py-14 pb-28">
      <Link to="/support" className="inline-flex items-center gap-1.5 text-slate text-sm mb-6 hover:text-indigo transition-colors duration-200">
        <IconArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to tickets
      </Link>

      {isLoadingTicket ? (
        <p className="text-slate text-sm">Loading…</p>
      ) : errorMessage && !ticket ? (
        <p className="text-rust text-sm">{errorMessage}</p>
      ) : ticket ? (
        <>
          <div className="flex items-center justify-between gap-4 mb-1">
            <h1 className="font-display text-xl font-semibold text-ink">{ticket.subject}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[ticket.status]}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-mist text-xs mb-6 font-mono-ui">
            {ticket.ticketNumber} - {ticket.category}
          </p>

          <div className="space-y-3 mb-6">
            {ticket.replies.map((entry, index) => (
              <div
                key={index}
                className={`card-surface p-4 ${entry.authorType === 'admin' ? 'border-indigo/30' : ''}`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span
                    className={`text-xs font-medium ${
                      entry.authorType === 'admin' ? 'text-indigo' : 'text-ink'
                    }`}
                  >
                    {entry.authorLabel}
                  </span>
                  <span className="text-[10px] text-mist">
                    {new Date(entry.createdAt).toLocaleString('en-US')}
                  </span>
                </div>
                <p className="text-slate text-sm whitespace-pre-wrap">{entry.message}</p>
              </div>
            ))}
          </div>

          {ticket.status !== 'closed' ? (
            <form onSubmit={handleReply} className="card-surface p-4">
              {errorMessage && <p className="text-rust text-sm mb-3">{errorMessage}</p>}
              <textarea
                required
                rows={3}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Write a reply."
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-ink text-sm mb-3 placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-indigo/40 focus:border-indigo/60 resize-none transition-colors duration-200"
              />
              <button type="submit" disabled={isSending} className="btn-primary w-full text-sm">
                {isSending ? 'Sending…' : 'Send reply'}
              </button>
            </form>
          ) : (
            <p className="text-mist text-sm text-center">This ticket is closed.</p>
          )}
        </>
      ) : null}
    </main>
  );
}
