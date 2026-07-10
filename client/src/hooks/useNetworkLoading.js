import { useEffect, useRef, useState } from 'react';

export default function useNetworkLoading({ isLoadingData, baseDurationMs = 1200 } = {}) {
  const [progress, setProgress] = useState(0);
  const [networkLabel, setNetworkLabel] = useState('unknown');
  const [multiplier, setMultiplier] = useState(1);

  // Refs agar interval callback selalu membaca nilai terbaru tanpa restart timer.
  const isLoadingRef = useRef(Boolean(isLoadingData));
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const finishedRef = useRef(false);

  // Keep ref in sync with prop
  useEffect(() => {
    isLoadingRef.current = Boolean(isLoadingData);
  }, [isLoadingData]);

  /**
   * Hitung multiplier berdasarkan rtt (latency, ms) & downlink (Mbps).
   * Logika:
   *  - rtt <= 50ms  & downlink >= 5 Mbps => fast    (multiplier 0.6)
   *  - rtt <= 200ms & downlink >= 1.5    => medium  (multiplier 1.2)
   *  - di atasnya                          => slow    (multiplier 2.4)
   * multiplier kecil = progress lebih cepat. multiplier besar = progress
   * sengaja diperlambat agar UX lebih jujur di koneksi lambat.
   */
  function readConnection() {
    if (typeof navigator === 'undefined' || !navigator.connection) {
      return { multiplier: 1, label: 'unknown' };
    }
    const conn = navigator.connection;
    const rtt = typeof conn.rtt === 'number' ? conn.rtt : 100;
    const downlink = typeof conn.downlink === 'number' ? conn.downlink : 5;
    const effectiveType = conn.effectiveType || '';

    // Override kasus 3G / 2G eksplisit
    if (effectiveType === '2g' || effectiveType === 'slow-2g') {
      return { multiplier: 3.2, label: 'slow' };
    }
    if (effectiveType === '3g') {
      return { multiplier: 2.0, label: 'slow' };
    }

    if (rtt <= 50 && downlink >= 5) return { multiplier: 0.6, label: 'fast' };
    if (rtt <= 200 && downlink >= 1.5) return { multiplier: 1.2, label: 'medium' };
    return { multiplier: 2.4, label: 'slow' };
  }

  // Update label & multiplier tiap kali koneksi berubah
  useEffect(() => {
    const apply = () => {
      const { multiplier: m, label } = readConnection();
      setMultiplier(m);
      setNetworkLabel(label);
    };
    apply();

    if (typeof navigator !== 'undefined' && navigator.connection) {
      navigator.connection.addEventListener('change', apply);
      return () => navigator.connection.removeEventListener('change', apply);
    }
    return undefined;
  }, []);

  // Main progress engine
  useEffect(() => {
    // Reset state ketika mulai loading
    if (isLoadingData) {
      finishedRef.current = false;
      startRef.current = performance.now();
      setProgress(0);
    }

    const step = (now) => {
      const elapsed = now - startRef.current;
      // Durasi efektif ke 90% = baseDuration * multiplier
      const targetDuration = baseDurationMs * multiplier;
      const ratio = Math.min(elapsed / targetDuration, 1);
      // Easing ease-out cubic supaya awal cepat lalu melambat
      const eased = 1 - Math.pow(1 - ratio, 3);
      const target = Math.round(eased * 90);

      // Cek apakah backend fetching sudah selesai
      if (!isLoadingRef.current) {
        // Jika fetching selesai sebelum progress mencapai 90, langsung lompat
        setProgress((prev) => Math.max(prev, target));
        // Lompat ke 100%
        setProgress(100);
        finishedRef.current = true;
        // Beri delay visual lalu reset
        setTimeout(() => setProgress(0), 600);
        return; // stop loop
      }

      // Cap di 90% — menunggu backend selesai
      if (target >= 90) {
        setProgress(90);
        // Tetap poll — begitu isLoadingRef false, cabang di atas akan menyala
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      setProgress(target);
      rafRef.current = requestAnimationFrame(step);
    };

    if (isLoadingData) {
      rafRef.current = requestAnimationFrame(step);
    } else if (!finishedRef.current) {
      // Fetching selesai sebelum effect ini sempat start — langsung selesai
      setProgress(100);
      finishedRef.current = true;
      setTimeout(() => setProgress(0), 600);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingData, multiplier, baseDurationMs]);

  // Status text monospaced sinkron dengan progress
  let statusText;
  if (progress === 0) {
    statusText = 'IDLE / AWAITING HANDSHAKE';
  } else if (progress < 30) {
    statusText = 'INITIALIZING STREAM…';
  } else if (progress < 60) {
    statusText = 'FETCHING ASSET MANIFEST…';
  } else if (progress < 90) {
    statusText = 'DECRYPTING PAYLOAD…';
  } else if (progress < 100) {
    statusText = 'HOLDING AT 90% — AWAITING BACKEND ACK';
  } else {
    statusText = 'STREAM COMPLETE';
  }

  return { progress, statusText, multiplier, networkLabel };
}
