/**
 * HbcFormGuard — Unsaved changes guard with confirm dialog
 * PH4B.8 §4b.8.3 | Blueprint §1d | D-07
 *
 * Composite component that combines useUnsavedChangesBlocker (browser tab
 * close protection) with HbcConfirmDialog (in-app navigation warning).
 *
 * Wraps form content and renders a warning dialog when the user attempts
 * to navigate away from a dirty form.
 *
 * Usage:
 * ```tsx
 * function EditPage() {
 *   const [isDirty, setIsDirty] = useState(false);
 *   return (
 *     <HbcFormGuard isDirty={isDirty}>
 *       <HbcForm onDirtyChange={setIsDirty} onSubmit={handleSubmit}>
 *         ...fields...
 *       </HbcForm>
 *     </HbcFormGuard>
 *   );
 * }
 * ```
 *
 * The guard handles:
 * 1. Browser `beforeunload` event when isDirty (prevents tab close)
 * 2. In-app navigation blocking via showPrompt/confirmNavigation flow
 * 3. HbcConfirmDialog with "Unsaved Changes" warning
 *
 * Router integration: The consumer's router blocker should call
 * `setShowPrompt(true)` when blocked. This guard exposes the blocker
 * state via HbcFormGuardContext for router integration.
 */
import * as React from 'react';
import { useUnsavedChangesBlocker } from '../hooks/useUnsavedChangesBlocker.js';
import { HbcConfirmDialog } from '../HbcConfirmDialog/index.js';

export interface HbcFormGuardProps {
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Form content */
  children: React.ReactNode;
}

/** Context for router integration — lets child components trigger the prompt */
export interface HbcFormGuardContextValue {
  /** Request showing the unsaved changes prompt (call from router blocker) */
  setShowPrompt: (show: boolean) => void;
  /** Confirm navigation — clears prompt and allows navigation */
  confirmNavigation: () => void;
  /** Cancel navigation — clears prompt and stays on page */
  cancelNavigation: () => void;
}

export const HbcFormGuardContext = React.createContext<HbcFormGuardContextValue>({
  setShowPrompt: () => {},
  confirmNavigation: () => {},
  cancelNavigation: () => {},
});

/**
 * Hook for router integration — access the guard's navigation control.
 *
 * Usage with TanStack Router:
 * ```tsx
 * function MyRouterBlocker() {
 *   const { setShowPrompt } = useFormGuardContext();
 *   // Wire to router's useBlocker
 * }
 * ```
 */
export function useFormGuardContext(): HbcFormGuardContextValue {
  return React.useContext(HbcFormGuardContext);
}

export const HbcFormGuard: React.FC<HbcFormGuardProps> = ({
  isDirty,
  children,
}) => {
  const {
    showPrompt,
    setShowPrompt,
    confirmNavigation,
    cancelNavigation,
  } = useUnsavedChangesBlocker({ isDirty });

  const contextValue = React.useMemo<HbcFormGuardContextValue>(
    () => ({ setShowPrompt, confirmNavigation, cancelNavigation }),
    [setShowPrompt, confirmNavigation, cancelNavigation],
  );

  return (
    <HbcFormGuardContext.Provider value={contextValue}>
      {children}
      <HbcConfirmDialog
        open={showPrompt}
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
        title="Unsaved Changes"
        description="You have unsaved changes. Leave anyway?"
        variant="warning"
        confirmLabel="Leave"
        cancelLabel="Stay"
      />
    </HbcFormGuardContext.Provider>
  );
};
