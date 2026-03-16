/**
 * useUnsavedChangesBlocker — Browser tab close protection + in-app nav blocking state
 * PH4.12 §Step 6 | Blueprint §1d
 *
 * Router-agnostic: handles `beforeunload` for browser navigation.
 * Exposes showPrompt/confirmNavigation/cancelNavigation for consumers
 * to wire to their router's useBlocker + HbcConfirmDialog.
 */
import { useState, useEffect, useCallback } from 'react';

export interface UseUnsavedChangesBlockerOptions {
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Optional callback invoked when the user confirms navigation */
  onConfirm?: () => void;
  /** Optional callback invoked when the user cancels navigation */
  onCancel?: () => void;
}

export interface UseUnsavedChangesBlockerReturn {
  /** Whether the confirmation prompt should be shown */
  showPrompt: boolean;
  /** Call to request showing the prompt (from router blocker) */
  setShowPrompt: (show: boolean) => void;
  /** Confirm navigation — clears prompt and lets navigation proceed */
  confirmNavigation: () => void;
  /** Cancel navigation — clears prompt, stays on page */
  cancelNavigation: () => void;
}

export function useUnsavedChangesBlocker(
  options: UseUnsavedChangesBlockerOptions,
): UseUnsavedChangesBlockerReturn {
  const { isDirty, onConfirm, onCancel } = options;
  const [showPrompt, setShowPrompt] = useState(false);

  // Browser tab close / refresh protection
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const confirmNavigation = useCallback(() => {
    onConfirm?.();
    setShowPrompt(false);
  }, [onConfirm]);

  const cancelNavigation = useCallback(() => {
    onCancel?.();
    setShowPrompt(false);
  }, [onCancel]);

  return {
    showPrompt,
    setShowPrompt,
    confirmNavigation,
    cancelNavigation,
  };
}
