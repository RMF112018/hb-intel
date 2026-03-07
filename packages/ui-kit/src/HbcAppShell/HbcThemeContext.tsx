/**
 * HbcThemeContext — single source of truth for Field Mode + theme propagation.
 *
 * PH4C.11 §4C.11 | D-PH4C-21/D-PH4C-22/D-PH4C-23 | D-PH4C-13
 *
 * This provider is the only allowed place to call `useFieldMode()` in a tree.
 * It broadcasts the full state through React Context and owns the single
 * FluentProvider root so every descendant reads the same resolved theme.
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { useFieldMode } from './hooks/useFieldMode.js';
import type { UseFieldModeReturn } from './hooks/useFieldMode.js';

export interface HbcThemeProviderProps {
  children: React.ReactNode;
}

export type HbcThemeContextValue = UseFieldModeReturn;

export const HbcThemeContext = React.createContext<HbcThemeContextValue | null>(null);

export const HbcThemeProvider: React.FC<HbcThemeProviderProps> = ({ children }) => {
  // D-PH4C-23 invariant: exactly one useFieldMode call per app tree.
  const fieldModeState = useFieldMode();

  return (
    <HbcThemeContext.Provider value={fieldModeState}>
      {/* D-PH4C-21/D-PH4C-22: one authoritative FluentProvider per application root. */}
      <FluentProvider theme={fieldModeState.resolvedTheme}>{children}</FluentProvider>
    </HbcThemeContext.Provider>
  );
};
