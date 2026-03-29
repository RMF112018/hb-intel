/**
 * HbcThemeContext — single source of truth for Field Mode + theme propagation.
 *
 * PH4C.11 §4C.11 | D-PH4C-21/D-PH4C-22/D-PH4C-23 | D-PH4C-13
 *
 * This provider is the only allowed place to call `useFieldMode()` in a tree.
 * It broadcasts the full state through React Context and owns the single
 * FluentProvider root so every descendant reads the same resolved theme.
 *
 * `forceTheme` prop: when set to `'light'`, the provider ignores OS/field-mode
 * signals and always renders with `hbcLightTheme`. This is used by SPFx-hosted
 * surfaces where the SharePoint host page is always light chrome and dark theme
 * would cause visual incoherence. See estimating-spfx-light-theme-ui-remediation.md.
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { useFieldMode } from './hooks/useFieldMode.js';
import type { UseFieldModeReturn } from './hooks/useFieldMode.js';
import { hbcLightTheme } from '../theme/theme.js';

export interface HbcThemeProviderProps {
  children: React.ReactNode;
  /**
   * When set, overrides the auto-detected theme.
   * - `'light'` — always use hbcLightTheme (ignores OS dark mode and field mode)
   *
   * Use this in SPFx-hosted apps where the SharePoint host is always light chrome.
   */
  forceTheme?: 'light';
}

export type HbcThemeContextValue = UseFieldModeReturn;

export const HbcThemeContext = React.createContext<HbcThemeContextValue | null>(null);

export const HbcThemeProvider: React.FC<HbcThemeProviderProps> = ({ children, forceTheme }) => {
  // D-PH4C-23 invariant: exactly one useFieldMode call per app tree.
  const fieldModeState = useFieldMode();

  // When forceTheme is set, override the resolved theme while preserving
  // the rest of the field-mode state for consumers that inspect mode/toggle.
  const effectiveState = React.useMemo<UseFieldModeReturn>(() => {
    if (forceTheme === 'light') {
      return {
        ...fieldModeState,
        theme: 'light',
        resolvedTheme: hbcLightTheme,
        prefersDarkMode: false,
      };
    }
    return fieldModeState;
  }, [forceTheme, fieldModeState]);

  return (
    <HbcThemeContext.Provider value={effectiveState}>
      {/* D-PH4C-21/D-PH4C-22: one authoritative FluentProvider per application root. */}
      <FluentProvider theme={effectiveState.resolvedTheme}>{children}</FluentProvider>
    </HbcThemeContext.Provider>
  );
};
