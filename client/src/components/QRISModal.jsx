import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { IconClose, IconQr, IconCheck } from '../lib/icons.jsx';

const POLL_INTERVAL_MS = 4000;

export default function QRISModal({ product, onClose }) {
 const [guestEmail, setGuestEmail] = useState('');
 const [stage, setStage] = useState('form');
 const [orderData, setOrderData] = useState(null);
 const [errorMessage, setErrorMessage] = useState('');

 useEffect(() => {
 if (stage !== 'waiting' || !orderData) return undefined;

 const interval = setInterval(async () => {
 try {
 const status = await api.getOrderStatus(orderData.orderId);
 if (status.paymentStatus === 'completed') {
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
 const result = await api.createOrder({ guestEmail, productId: product._id });
 setOrderData(result);
 setStage('waiting');
 } catch (error) {
 setErrorMessage(error.message);
 }
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
 <div className="card-surface w-full max-w-md p-8 relative">
 <button
 onClick={onClose}
 className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-50 dark:hover:text-white"
 >
 <IconClose />
 </button>

 {stage === 'form' && (
 <form onSubmit={handleSubmit}>
 <h2 className="text-xl font-semibold text-zinc-50 mb-1">{product.name}</h2>
 <p className="text-zinc-400 text-sm mb-6">
 Enter your active email to receive panel access and continue with QRIS payment.
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
 <h2 className="text-xl font-semibold text-zinc-50 mb-2">Complete your payment</h2>
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

 {stage === 'completed' && (
 <div className="text-center">
 <div className="w-14 h-14 rounded-full bg-brand/10 text-brand-light flex items-center justify-center mx-auto mb-4">
 <IconCheck className="w-6 h-6" />
 </div>
 <h2 className="text-xl font-semibold text-zinc-50 mb-2">Server provisioned</h2>
 <p className="text-zinc-400 text-sm">
 Your Pterodactyl panel access has been sent to {guestEmail}.
 </p>
 </div>
 )}

 {stage === 'failed' && (
 <div className="text-center">
 <h2 className="text-xl font-semibold text-zinc-50 mb-2">Payment failed</h2>
 <p className="text-zinc-400 text-sm">The transaction was not completed. Please try again.</p>
 </div>
 )}
 </div>
 </div>
 );
}
