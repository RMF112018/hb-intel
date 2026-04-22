/**
 * ForceOfficeMode — Safety Phase-2 Wave-1 patch (G-01).
 *
 * `HbcThemeProvider forceTheme="light"` locks the Fluent theme but does
 * **not** override `isFieldMode`, `mode`, or `theme` in the ambient
 * `HbcThemeContext`. Consumers like `WorkspacePageShell`, `HbcDataTable`,
 * and `HbcCommandPalette` still read `isFieldMode` via `useHbcTheme()` and
 * engage field-mode UI variants (FAB, touch density, field palette). On
 * touch devices or when a dev has persisted a field-mode override in
 * localStorage, the Safety surface would therefore still surface field
 * behavior despite the office-only plan decision.
 *
 * This component re-provides the context with the office-mode posture
 * hard-wired: `isFieldMode: false`, `mode: 'office'`, `theme: 'light'`.
 * `toggleFieldMode` becomes a no-op so any UI that tries to flip the
 * switch has no effect on the Safety surface.
 *
 * Scoped to the Safety app; does not touch shared ui-kit exports.
 */
import * as React from 'react';
import { HbcThemeContext } from '@hbc/ui-kit/app-shell';
import { hbcLightTheme } from '@hbc/ui-kit/theme';

export function ForceOfficeMode({ children }: { children: React.ReactNode }): React.ReactNode {
  const ambient = React.useContext(HbcThemeContext);
  const value = React.useMemo(() => {
    // Retain any ambient providers' API shape; override only the
    // mode-surfacing fields + theme to coerce office-only behavior.
    const base = ambient ?? {
      isFieldMode: false,
      mode: 'office' as const,
      toggleFieldMode: () => undefined,
      theme: 'light' as const,
      resolvedTheme: hbcLightTheme,
      prefersDarkMode: false,
    };
    return {
      ...base,
      isFieldMode: false,
      mode: 'office' as const,
      theme: 'light' as const,
      resolvedTheme: hbcLightTheme,
      prefersDarkMode: false,
      toggleFieldMode: () => undefined,
    };
  }, [ambient]);
  return <HbcThemeContext.Provider value={value}>{children}</HbcThemeContext.Provider>;
}
