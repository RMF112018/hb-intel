/**
 * useHbcTheme — Canonical theme hook
 * PH4.16 §Step 6 | Blueprint §1d
 *
 * Thin wrapper that provides a canonical import path from @hbc/ui-kit/theme.
 * Delegates to useFieldMode from HbcAppShell/hooks.
 */
import { useFieldMode } from '../HbcAppShell/hooks/useFieldMode.js';
import type { UseFieldModeReturn } from '../HbcAppShell/hooks/useFieldMode.js';

export type UseHbcThemeReturn = UseFieldModeReturn;

/**
 * Access the current HBC theme state.
 *
 * @returns `{ theme, isFieldMode, toggleFieldMode }` matching the useFieldMode interface
 */
export function useHbcTheme(): UseHbcThemeReturn {
  return useFieldMode();
}
