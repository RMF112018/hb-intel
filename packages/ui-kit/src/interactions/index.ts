/**
 * Interaction Pattern Library — Convenience barrel
 * PH4.12 §Step 8 | Blueprint §1d
 *
 * Re-exports all PH4.12 hooks, components, and types for consumers
 * who prefer a single import path: `import { ... } from '@hbc/ui-kit/interactions'`
 */

// Hooks
export { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
export { useOptimisticMutation } from '../hooks/useOptimisticMutation.js';
export type {
  UseOptimisticMutationOptions,
  UseOptimisticMutationReturn,
} from '../hooks/useOptimisticMutation.js';
export { useUnsavedChangesBlocker } from '../hooks/useUnsavedChangesBlocker.js';
export type {
  UseUnsavedChangesBlockerOptions,
  UseUnsavedChangesBlockerReturn,
} from '../hooks/useUnsavedChangesBlocker.js';

// Components
export { HbcConfirmDialog } from '../HbcConfirmDialog/index.js';
export type { HbcConfirmDialogProps } from '../HbcConfirmDialog/types.js';
