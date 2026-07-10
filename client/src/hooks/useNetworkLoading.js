import { useEffect, useRef, useState } from 'react';

function getConnectionProfile() {
  const connection =
    typeof navigator !== 'undefined' &&
    (navigator.connection || navigator.mozConnection || navigator.webkitConnection);

  if (!connection) {
    return { rtt: 100, downlink: 5, effectiveType: '4g', isSupported: false };
  }

  return {
    rtt: connection.rtt ?? 100,
    downlink: connection.downlink ?? 5,
    effectiveType: connection.effectiveType ?? '4g',
    isSupported: true,
  };
}

function computeSpeedMultiplier({ rtt, downlink }) {
  const rttFactor = Math.min(Math.max(rtt / 100, 0.5), 6);
  const downlinkFactor = Math.min(Math.max(1.5 / Math.max(downlink, 0.25), 0.5), 6);
  return (rttFactor + downlinkFactor) / 2;
}

export function useNetworkLoading(loadingData, options = {}) {
  const { stallAt = 90, baseStepMs = 90, baseIncrement = 3 } = options;

  const [progress, setProgress] = useState(0);
  const [connectionProfile, setConnectionProfile] = useState(getConnectionProfile);
  const intervalRef = useRef(null);

  useEffect(() => {
    setConnectionProfile(getConnectionProfile());
  }, []);

  const multiplier = computeSpeedMultiplier(connectionProfile);
  const isNetworkSlow = multiplier > 1.6;

  useEffect(() => {
    if (!loadingData) {
      setProgress(100);
      return undefined;
    }

    setProgress(4);

    intervalRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= stallAt) return current;
        const step = Math.max(baseIncrement / multiplier, 0.4);
        const next = current + step;
        return next >= stallAt ? stallAt : next;
      });
    }, baseStepMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadingData, multiplier, stallAt, baseStepMs, baseIncrement]);

  return {
    progress,
    isNetworkSlow,
    effectiveType: connectionProfile.effectiveType,
    isNetworkApiSupported: connectionProfile.isSupported,
  };
}

export default useNetworkLoading;
