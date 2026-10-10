import { useEffect, useRef } from 'react';

/**
 * Intelligent background auto-refresh hook
 * @param {Function} callback - Async function to run on interval
 * @param {number} intervalMs - Interval in milliseconds (default: 12000ms)
 * @param {boolean} enabled - Whether auto-refresh is active
 */
export function useAutoRefresh(callback, intervalMs = 12000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') savedCallback.current?.();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}

export default useAutoRefresh;
