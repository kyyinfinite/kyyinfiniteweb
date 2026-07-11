import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { IconClose, IconQr, IconCheck } from '../lib/icons.jsx';
import { useToast } from '../context/ToastContext.jsx';

const POLL_INTERVAL_MS = 4000;

export default function AssetPurchaseModal({ asset, onClose }) {
  const [guestEmail, setGuestEmail] = useState('');
  const [stage, setStage] = useState('form');
  const [orderData, setOrderData] = useState(null);
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const showToast = useToast();

  useEffect(() => {
    if (stage !== 'waiting' || !orderData) return undefined;

    const interval = setInterval(async () => {
      try {
        const status = await api.getOrderStatus(orderData.orderId);
        if (status.paymentStatus === 'completed') {
          setLicenseInfo(status);
          setStage('completed');
          clearInterval(interval);
        } else if (status.paymentStatus === 'failed') {
          setStage('failed');
          clearInterval(interval);
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [stage, orderData]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    try {
      const result = await api.createOrder({ guestEmail, assetId: asset._id });
      setOrderData(result);
      setStage('waiting');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function copyLicenseKey() {
    if (!licenseInfo?.licenseKey) return;
    navigator.clipboard.writeText(licenseInfo.licenseKey);
    showToast('License key copied', { type: 'success' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="card-surface w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-50"
        >
          <IconClose />
        </button>

        {stage === 'form' && (
          <form onSubmit={handleSubmit}>
            <h2 className="font-display text-xl font-semibold text-zinc-50 mb-1">{asset.name}</h2>
            <p className="text-zinc-400 text-sm mb-1">
              Rp {asset.price?.toLocaleString('id-ID')} · license berlaku untuk{' '}
              {asset.maxActivations} device{asset.maxActivations > 1 ? 's' : ''}
              {asset.licenseDurationDays ? ` selama ${asset.licenseDurationDays} hari` : ' selamanya'}.
            </p>
            <p className="text-zinc-500 text-xs mb-6">
              Masukkan email aktif — license key dikirim ke sini setelah pembayaran berhasil.
            </p>
            <label className="text-sm text-zinc-400 mb-2 block">Email address</label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-2.5 text-zinc-50 mb-6 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="you@example.com"
            />
            {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <IconQr className="w-4 h-4" /> Continue to QRIS
            </button>
          </form>
        )}

        {stage === 'waiting' && orderData && (
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold text-zinc-50 mb-2">Complete your payment</h2>
            <p className="text-zinc-400 text-sm mb-6">Order ID: {orderData.orderId}</p>
            <a
              href={orderData.redirectUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full inline-flex items-center justify-center gap-2 mb-4"
            >
              <IconQr className="w-4 h-4" /> Open QRIS Payment
            </a>
            <p className="text-xs text-zinc-600">Waiting for settlement confirmation.</p>
          </div>
        )}

        {stage === 'completed' && licenseInfo && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-brand/10 text-brand-light flex items-center justify-center mx-auto mb-4">
              <IconCheck className="w-6 h-6" />
            </div>
            <h2 className="font-display text-xl font-semibold text-zinc-50 mb-2">License key kamu siap</h2>
            <p className="text-zinc-500 text-xs mb-4">
              Juga dikirim ke {guestEmail}. Simpan baik-baik, tempel ke bootstrap verifikasi di script kamu.
            </p>
            <button
              onClick={copyLicenseKey}
              className="w-full font-mono-ui text-brand-light text-lg tracking-wider bg-black/30 border border-brand/20 rounded-xl py-3 hover:border-brand/50 transition-colors duration-200"
            >
              {licenseInfo.licenseKey}
            </button>
            <p className="text-zinc-600 text-xs mt-3">Klik untuk copy</p>
          </div>
        )}

        {stage === 'failed' && (
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold text-zinc-50 mb-2">Payment failed</h2>
            <p className="text-zinc-400 text-sm">The transaction was not completed. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
