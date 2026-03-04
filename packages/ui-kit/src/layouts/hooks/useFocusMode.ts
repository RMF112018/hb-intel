/**
 * useFocusMode — Focus Mode hook for CreateUpdateLayout
 * PH4.5 §Step 1 | Blueprint §1f
 *
 * Auto-detect touch → activate immediately.
 * Desktop: read/write localStorage, toggle via button.
 * Dispatches CustomEvent + sets data-focus-mode attribute on shell.
 * Pattern follows useFieldMode.ts (localStorage + DOM attr + matchMedia).
 */
import { useState, useEffect, useCallback } from 'react';
import type { UseFocusModeReturn } from '../types.js';

const STORAGE_KEY = 'hbc-focus-mode-desktop';
const EVENT_NAME = 'hbc-focus-mode-change';
const SHELL_SELECTOR = '[data-hbc-shell="app-shell"]';

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

function getInitialDesktopPreference(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'true';
}

function dispatchFocusEvent(active: boolean): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { active } }),
  );
}

function setShellAttribute(active: boolean): void {
  if (typeof document === 'undefined') return;
  const shell = document.querySelector(SHELL_SELECTOR);
  if (!shell) return;
  if (active) {
    shell.setAttribute('data-focus-mode', 'true');
  } else {
    shell.removeAttribute('data-focus-mode');
  }
}

export function useFocusMode(): UseFocusModeReturn {
  const [isAutoFocus] = useState(isTouchDevice);
  const [isFocusMode, setIsFocusMode] = useState(() =>
    isAutoFocus ? true : getInitialDesktopPreference(),
  );

  // Sync DOM attribute + dispatch event when state changes
  useEffect(() => {
    setShellAttribute(isFocusMode);
    dispatchFocusEvent(isFocusMode);
  }, [isFocusMode]);

  // Cleanup on unmount: deactivate focus mode
  useEffect(() => {
    return () => {
      setShellAttribute(false);
      dispatchFocusEvent(false);
    };
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      const next = !prev;
      if (!isTouchDevice()) {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  return {
    isFocusMode,
    toggleFocusMode,
    isAutoFocus,
  };
}
