import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useUser } from '../context/UserContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { IconClose, IconQr, IconCheck, IconCopy } from '../lib/icons.jsx';

const POLL_INTERVAL_MS = 4000;

const PLANS = [
  { id: '1000', title: '1,000 requests', price: 'Rp5.000' },
  { id: '10000', title: '10,000 requests', price: 'Rp10.000' },
  { id: 'unlimited', title: 'Unlimited requests', price: 'Rp15.000' },
];

const SCOPE_DESCRIPTIONS = {
  'tools:search': 'Search endpoints',
  'tools:maker': 'Maker endpoints',
  'tools:downloader': 'Downloader endpoints',
};
const ALLOWED_SCOPES = Object.keys(SCOPE_DESCRIPTIONS);

export default function ApiKeyPurchaseModal({ onClose, onIssued }) {
  const { idToken, refreshToken } = useUser();
  const showToast = useToast();

  const [stage, setStage] = useState('form'); // form | waiting | completed | failed
  const [plan, setPlan] = useState('1000');
  const [label, setLabel] = useState('');
  const [scopes, setScopes] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [issuedKey, setIssuedKey] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (stage !== 'waiting' || !orderData) return undefined;

    const interval = setInterval(async () => {
      try {
        const token = (await refreshToken()) || idToken;
        const status = await api.getApiKeyOrderStatus(token, orderData.orderId);
        if (status.paymentStatus === 'completed') {
          clearInterval(interval);
          const revealed = await api.revealApiKeyOrderKey(token, orderData.orderId);
          setIssuedKey(revealed.apiKey);
          setStage('completed');
          onIssued?.();
        } else if (status.paymentStatus === 'failed') {
          clearInterval(interval);
          setStage('failed');
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [stage, orderData]);

  function toggleScope(scope) {
    setScopes((current) => (current.includes(scope) ? current.filter((s) => s !== scope) : [...current, scope]));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (scopes.length === 0) {
      setErrorMessage('Select at least one scope');
      return;
    }
    setErrorMessage('');
    try {
      const token = (await refreshToken()) || idToken;
      const result = await api.createApiKeyOrder(token, { plan, label, scopes });
      setOrderData(result);
      setStage('waiting');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(issuedKey);
    showToast('API key copied', { type: 'success' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="card-surface w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-50">
          <IconClose />
        </button>

        {stage === 'form' && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-zinc-50 mb-1">Buy a premium API key</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Pay once via QRIS, key is generated automatically the moment payment settles.
            </p>

            <label className="text-sm text-zinc-400 mb-2 block">Plan</label>
            <div className="space-y-2 mb-4">
              {PLANS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPlan(option.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors duration-200 ${
                    plan === option.id ? 'border-brand bg-brand/10 text-brand-light' : 'border-zinc-800 text-zinc-300'
                  }`}
                >
                  <span className="text-sm font-medium">{option.title}</span>
                  <span className="text-sm font-mono-ui">{option.price}</span>
                </button>
              ))}
            </div>

            <label className="text-sm text-zinc-400 mb-2 block">Label</label>
            <input
              required
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="e.g. my-premium-bot"
              className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-4 focus:outline-none focus:ring-2 focus:ring-brand"
            />

            <label className="text-sm text-zinc-400 mb-2 block">Scopes</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {ALLOWED_SCOPES.map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => toggleScope(scope)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                    scopes.includes(scope)
                      ? 'bg-brand text-white border-brand'
                      : 'border-zinc-800 text-zinc-400 hover:text-brand-light'
                  }`}
                >
                  {SCOPE_DESCRIPTIONS[scope]}
                </button>
              ))}
            </div>

            {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <IconQr className="w-4 h-4" /> Generate QRIS
            </button>
          </form>
        )}

        {stage === 'waiting' && orderData && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-zinc-50 mb-2">Scan to pay</h2>
            <p className="text-zinc-400 text-sm mb-4">Order ID: {orderData.orderId}</p>
            {orderData.qrCodeUrl && (
              <img
                src={orderData.qrCodeUrl}
                alt="QRIS payment code"
                className="w-56 h-56 mx-auto rounded-xl border border-zinc-800 bg-white p-2 mb-4"
              />
            )}
            <p className="text-zinc-300 text-sm mb-1">Total: Rp{orderData.grossAmount?.toLocaleString('id-ID')}</p>
            <p className="text-xs text-zinc-600">Waiting for payment confirmation. Do not close this window.</p>
          </div>
        )}

        {stage === 'completed' && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-brand/10 text-brand-light flex items-center justify-center mx-auto mb-4">
              <IconCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-50 mb-2">Payment confirmed</h2>
            <p className="text-zinc-400 text-sm mb-4">Copy this now — it won't be shown again.</p>
            <button
              onClick={copyKey}
              className="w-full font-mono-ui text-brand-light text-xs tracking-wide bg-black/30 border border-brand/20 rounded-xl py-3 px-3 flex items-center justify-between gap-2 hover:border-brand/50 transition-colors duration-200 mb-4"
            >
              <span className="truncate">{issuedKey}</span>
              <IconCopy className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button onClick={onClose} className="btn-primary w-full">
              Done
            </button>
          </div>
        )}

        {stage === 'failed' && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-zinc-50 mb-2">Payment failed</h2>
            <p className="text-zinc-400 text-sm mb-6">The transaction was not completed. Please try again.</p>
            <button onClick={onClose} className="btn-outline w-full">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
