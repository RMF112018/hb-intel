/**
 * useHbcTheme — Canonical theme hook
 * PH4.16 §Step 6 | Blueprint §1d
 *
 * Canonical context reader for app mode + Fluent theme state.
 * PH4C.11 rewires this hook to HbcThemeContext (single-source invariant).
 */
import * as React from 'react';
import { HbcThemeContext } from '../HbcAppShell/HbcThemeContext.js';
import type { HbcThemeContextValue } from '../HbcAppShell/HbcThemeContext.js';

export type UseHbcThemeReturn = HbcThemeContextValue;

/**
 * Access the current HBC theme state.
 *
 * @returns D-13-aware theme state including:
 * - `theme` key (`light` | `dark` | `field`)
 * - `resolvedTheme` Fluent theme object for provider roots
 * - mode + field toggle compatibility fields
 */
export function useHbcTheme(): UseHbcThemeReturn {
  const context = React.useContext(HbcThemeContext);
  if (!context) {
    throw new Error(
      '[HBC] useHbcTheme must be called inside <HbcThemeProvider>. Wrap your application root with HbcThemeProvider.',
    );
  }
  return context;
}
