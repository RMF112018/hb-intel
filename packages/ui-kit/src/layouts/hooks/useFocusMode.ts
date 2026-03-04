/**
 * useFocusMode — Focus Mode hook for CreateUpdateLayout
 * PH4.5 §Step 1, PH4.12 §Step 3 | Blueprint §1f
 *
 * Auto-detect touch → activate immediately.
 * Desktop: read/write localStorage, toggle via button or Cmd/Ctrl+Shift+F.
 * Dispatches CustomEvent + sets data-focus-mode attribute on shell.
 * PH4.12: adds deactivate() callback and keyboard shortcut.
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

  /** PH4.12: Explicitly deactivate focus mode */
  const deactivate = useCallback(() => {
    setIsFocusMode(false);
    if (!isTouchDevice()) {
      localStorage.setItem(STORAGE_KEY, 'false');
    }
  }, []);

  // PH4.12: Cmd/Ctrl+Shift+F keyboard shortcut (desktop only)
  useEffect(() => {
    if (isAutoFocus) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        toggleFocusMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAutoFocus, toggleFocusMode]);

  return {
    isFocusMode,
    toggleFocusMode,
    isAutoFocus,
    deactivate,
  };
}
