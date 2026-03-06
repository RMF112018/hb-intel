/**
 * useFieldMode — Manages Office / Field Mode switching
 * PH4B.10 §13 (4b.10.1) | Binding Decision D-09
 *
 * Auto-detects field mode from:
 * - Mobile viewport (≤ 767px) via useIsMobile()
 * - HB Site Control app context (data-hbc-app="hb-site-control" on <html>)
 *
 * Desktop users retain manual toggle via toggleFieldMode() (stored in localStorage).
 * When auto-detected as field (mobile or HbSiteControl), manual toggle is ignored.
 *
 * Backward-compatible: `isFieldMode` and `theme` behave identically to V1.
 */
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile.js';

const STORAGE_KEY = 'hbc-field-mode';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppMode = 'office' | 'field';

export interface UseFieldModeReturn {
  /** true when mode === 'field' (auto-detected OR manually toggled) */
  isFieldMode: boolean;
  /** Resolved mode: 'office' or 'field' */
  mode: AppMode;
  /** Manual override for desktop users (no-op when auto-detected as field) */
  toggleFieldMode: () => void;
  /** Derived theme key: field mode → 'field', office mode → 'light' */
  theme: 'light' | 'field';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if running inside HB Site Control app via HTML attribute marker */
function getIsHbSiteControl(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.hbcApp === 'hb-site-control';
}

/** Read manual toggle preference from localStorage */
function getManualOverride(): boolean | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return null;
  return stored === 'true';
}

/** Read OS dark-mode preference */
function getOsDarkPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFieldMode(): UseFieldModeReturn {
  const isMobile = useIsMobile();
  const [isHbSiteControl] = useState(getIsHbSiteControl);
  const [manualToggle, setManualToggle] = useState<boolean>(() => {
    const override = getManualOverride();
    return override ?? getOsDarkPreference();
  });

  // Auto-detect: mobile or HbSiteControl → always field
  const autoDetectedField = isMobile || isHbSiteControl;

  // Resolved mode: auto-detect takes priority; otherwise manual toggle applies
  const mode: AppMode = autoDetectedField ? 'field' : (manualToggle ? 'field' : 'office');
  const isFieldMode = mode === 'field';

  // Sync data-theme attribute on <html> and <meta name="theme-color">
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (isFieldMode) {
      root.setAttribute('data-theme', 'field');
    } else {
      root.removeAttribute('data-theme');
    }

    // Update <meta name="theme-color"> for mobile browser chrome
    const themeColor = isFieldMode ? '#0F1419' : '#FFFFFF';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = themeColor;
  }, [isFieldMode]);

  // Listen for OS theme changes (only when no explicit preference stored)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setManualToggle(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleFieldMode = useCallback(() => {
    // No-op when auto-detected as field (mobile / HbSiteControl)
    if (autoDetectedField) return;
    setManualToggle((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, [autoDetectedField]);

  return {
    isFieldMode,
    mode,
    toggleFieldMode,
    theme: isFieldMode ? 'field' : 'light',
  };
}
