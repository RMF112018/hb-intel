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
 * Phase 4b.13 follow-up (D-13):
 * - When Field Mode is off, app theme follows OS `prefers-color-scheme`.
 * - When Field Mode is on, app theme is always Field Mode.
 *
 * Backward-compatible: `useFieldMode()` remains the public export.
 */
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile.js';
import { hbcDarkTheme, hbcFieldTheme, hbcLightTheme, type HbcTheme } from '../../theme/theme.js';

const STORAGE_KEY = 'hbc-field-mode';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppMode = 'office' | 'field';
export type AppThemeMode = 'light' | 'dark' | 'field';

export interface UseFieldModeReturn {
  /** true when mode === 'field' (auto-detected OR manually toggled) */
  isFieldMode: boolean;
  /** Resolved mode: 'office' or 'field' */
  mode: AppMode;
  /** Manual override for desktop users (no-op when auto-detected as field) */
  toggleFieldMode: () => void;
  /**
   * Resolved app theme key:
   * - `field` when field mode is enabled
   * - `dark` when office mode + OS prefers dark
   * - `light` when office mode + OS prefers light
   */
  theme: AppThemeMode;
  /** Resolved Fluent theme object consumed by FluentProvider roots */
  resolvedTheme: HbcTheme;
  /** OS preference signal used for D-13 office mode theme resolution */
  prefersDarkMode: boolean;
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
// Hook internals
// ---------------------------------------------------------------------------

function useAppTheme(): UseFieldModeReturn {
  const isMobile = useIsMobile();
  const [isHbSiteControl] = useState(getIsHbSiteControl);
  const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(getOsDarkPreference);
  const [manualToggle, setManualToggle] = useState<boolean>(() => {
    const override = getManualOverride();
    return override ?? getOsDarkPreference();
  });

  // Auto-detect: mobile or HbSiteControl → always field
  const autoDetectedField = isMobile || isHbSiteControl;

  // Resolved mode: auto-detect takes priority; otherwise manual toggle applies
  const mode: AppMode = autoDetectedField ? 'field' : (manualToggle ? 'field' : 'office');
  const isFieldMode = mode === 'field';
  const theme: AppThemeMode = isFieldMode ? 'field' : (prefersDarkMode ? 'dark' : 'light');
  const resolvedTheme: HbcTheme = isFieldMode
    ? hbcFieldTheme
    : prefersDarkMode ? hbcDarkTheme : hbcLightTheme;

  // Sync data-theme attribute on <html> and <meta name="theme-color">
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    // Update <meta name="theme-color"> for mobile browser chrome
    const themeColor = theme === 'field' ? '#0F1419' : theme === 'dark' ? '#111827' : '#FFFFFF';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = themeColor;
  }, [theme]);

  // D-13: Listen for OS theme changes and apply immediately in office mode.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
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
    theme,
    resolvedTheme,
    prefersDarkMode,
  };
}

/**
 * Public compatibility wrapper for field-mode consumers.
 *
 * Internally delegates to useAppTheme() so provider roots and legacy consumers
 * resolve from one canonical D-13-aware source of truth.
 */
export function useFieldMode(): UseFieldModeReturn {
  return useAppTheme();
}
