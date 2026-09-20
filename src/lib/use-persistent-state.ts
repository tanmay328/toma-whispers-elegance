import { useEffect, useState } from "react";

/**
 * Like useState, but persists the value to localStorage so it survives page
 * reloads, sign-in/sign-out, and closing the browser. SSR-safe: reads the
 * initial value only after mount, so the server-rendered HTML always matches
 * the fallback value on first paint.
 */
export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // Ignore malformed/blocked storage; fall back to initialValue.
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable (e.g. private browsing) — fail silently.
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}
