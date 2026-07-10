import { useEffect, useRef, useState } from 'react';

/**
 * useNetworkLoading
 * -----------------
 * Real-time network-aware loading progress hook built on top of the
 * Network Information API (`navigator.connection`).
 *
 * The hook produces an artificially-paced progress value (0 -> 90) that
 * creeps slower when the user is on a slow connection (high `rtt`,
 * low `downlink`). The final 90 -> 100 jump is intentionally held back
 * until the caller flips `loadingData` to `false`, signalling that the
 * real backend fetch has resolved.
 *
 * Returned shape:
 * {
 *   progress,         // 0..100 integer
 *   phase,            // 'idle' | 'fetching' | 'finalizing' | 'complete'
 *   statusText,       // monospaced status string for the loader UI
 *   effectiveType,    // 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
 *   rtt,              // ms latency estimate
 *   downlink,         // Mbps estimate
 *   start(),          // begin a new loading cycle
 *   complete(),       // mark the data fetch as finished (causes the 90->100 jump)
 *   reset(),          // reset progress back to 0
 * }
 *
 * Usage:
 *   const loader = useNetworkLoading();
 *   loader.start();
 *   try { const data = await api.getAsset(id); } finally { loader.complete(); }
 */

const MIN_TICK_MS = 60;       // never update faster than this
const MAX_TICK_MS = 700;      // never update slower than this
const SLOW_RTT_MS = 400;      // rtt above this is considered "slow"
const SLOW_DOWNLINK = 1.5;    // downlink (Mbps) below this is considered "slow"

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function classifyConnection(connection) {
  if (!connection) return { effectiveType: 'unknown', rtt: 0, downlink: 0 };
  return {
    effectiveType: connection.effectiveType || 'unknown',
    rtt: Number(connection.rtt) || 0,
    downlink: Number(connection.downlink) || 0,
  };
}

export default function useNetworkLoading() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [netInfo, setNetInfo] = useState(() => classifyConnection(typeof navigator !== 'undefined' ? navigator.connection : null));

  const intervalRef = useRef(null);
  const progressRef = useRef(0);
  const phaseRef = useRef('idle');
  const loadingDataRef = useRef(true);
  const lastTickRef = useRef(0);

  // ---- Live network info subscription ----
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.connection) return undefined;
    const conn = navigator.connection;
    const handle = () => setNetInfo(classifyConnection(conn));
    handle();
    conn.addEventListener?.('change', handle);
    return () => conn.removeEventListener?.('change', handle);
  }, []);

  /**
   * Compute the per-tick parameters based on the user's current network.
   * Slow networks (high rtt / low downlink) produce slower, longer pauses
   * between increments to make the loader feel "honest" about the lag.
   */
  function computeTickParams() {
    const { rtt, downlink, effectiveType } = netInfo;
    const isSlow =
      rtt >= SLOW_RTT_MS ||
      downlink > 0 && downlink <= SLOW_DOWNLINK ||
      effectiveType === 'slow-2g' ||
      effectiveType === '2g';

    // Multiplier: 1.0 on fast networks, up to 3.5x slower on bad ones.
    const multiplier = isSlow
      ? clamp(1 + rtt / 250, 1.8, 3.5)
      : clamp(1 - downlink / 20, 0.6, 1.0);

    const tickInterval = clamp(MIN_TICK_MS * multiplier, MIN_TICK_MS, MAX_TICK_MS);
    // Per-tick increment shrinks as progress climbs (typical asymptote behaviour).
    const baseIncrement = isSlow ? 1.5 : 4;
    return { tickInterval, baseIncrement, isSlow, multiplier };
  }

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function setPhaseSafe(next) {
    phaseRef.current = next;
    setPhase(next);
  }

  function tick() {
    const now = Date.now();
    if (now - lastTickRef.current < 30) return; // debounce
    lastTickRef.current = now;

    const { tickInterval, baseIncrement, isSlow } = computeTickParams();

    setProgress((current) => {
      let next = current;

      if (phaseRef.current === 'fetching') {
        // Asymptotic creep towards 90 — never cross it until data resolves.
        if (next < 90) {
          const remaining = 90 - next;
          const delta = Math.max(0.5, baseIncrement * (remaining / 90));
          next = clamp(next + delta, 0, 90);
        }
      } else if (phaseRef.current === 'finalizing') {
        // Backend has confirmed the fetch — sprint from 90 to 100.
        next = clamp(next + (isSlow ? 4 : 12), 0, 100);
        if (next >= 100) {
          setPhaseSafe('complete');
          clearTimer();
        }
      }

      progressRef.current = next;
      return next;
    });

    // Reschedule with the freshly computed interval so slow networks
    // keep the long pause and fast networks keep ticking smoothly.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, tickInterval);
    }
  }

  function start() {
    clearTimer();
    progressRef.current = 0;
    loadingDataRef.current = true;
    setProgress(0);
    setPhaseSafe('fetching');
    const { tickInterval } = computeTickParams();
    intervalRef.current = setInterval(tick, tickInterval);
  }

  function complete() {
    if (phaseRef.current === 'complete') return;
    loadingDataRef.current = false;
    setPhaseSafe('finalizing');
    // Kick an immediate tick so the jump is visible without waiting for the next interval.
    tick();
  }

  function reset() {
    clearTimer();
    progressRef.current = 0;
    loadingDataRef.current = true;
    setProgress(0);
    setPhaseSafe('idle');
  }

  // Cleanup on unmount
  useEffect(() => clearTimer, []);

  const statusText = (() => {
    switch (phase) {
      case 'idle':
        return 'Awaiting handshake';
      case 'fetching': {
        if (progress < 30) return 'Resolving asset manifest';
        if (progress < 60) return 'Streaming project asset';
        if (progress < 90) return 'Verifying package integrity';
        return 'Stabilizing on slow link';
      }
      case 'finalizing':
        return 'Sealing download pipeline';
      case 'complete':
        return 'Asset ready';
      default:
        return '';
    }
  })();

  return {
    progress: Math.round(progress),
    phase,
    statusText,
    effectiveType: netInfo.effectiveType,
    rtt: netInfo.rtt,
    downlink: netInfo.downlink,
    start,
    complete,
    reset,
  };
}
