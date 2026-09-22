import { supabase } from "@/integrations/supabase/client";

export { supabase };

const REMEMBER_FLAG = "toma-remember-me";

/**
 * Session storage flips between localStorage (persists across browser
 * restarts / days) and sessionStorage (cleared when the browser closes),
 * based on the "Remember me" choice made at sign-in time.
 */
const authStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    const remember = window.localStorage.getItem(REMEMBER_FLAG) !== "false";
    if (remember) {
      window.localStorage.setItem(key, value);
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
      window.localStorage.removeItem(key);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_FLAG, remember ? "true" : "false");
}

