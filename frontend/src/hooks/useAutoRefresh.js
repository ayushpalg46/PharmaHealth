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

    const tick = () => {
      // Only execute if page/tab is currently visible
      if (document.visibilityState === 'visible') {
        savedCallback.current?.();
      }
    };

    const id = setInterval(tick, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, enabled]);
}

export default useAutoRefresh;
