/**
 * SF26-T04 — View compatibility check hook.
 *
 * Governing: SF26-T04, L-03
 */

import { useMemo } from 'react';
import type { ISavedViewDefinition, ISavedViewStateMapper, ISavedViewCompatibilityResult } from '../types/index.js';
import { reconcile } from '../model/compatibility.js';

export interface UseViewCompatibilityOptions {
  view: ISavedViewDefinition;
  mapper: ISavedViewStateMapper<unknown>;
}

export interface UseViewCompatibilityResult {
  isChecking: boolean;
  result: ISavedViewCompatibilityResult | undefined;
  canApply: boolean;
  requiresUserConfirmation: boolean;
}

export function useViewCompatibility(options: UseViewCompatibilityOptions): UseViewCompatibilityResult {
  const { view, mapper } = options;

  const result = useMemo(() => {
    if (view.schemaVersion === mapper.currentSchemaVersion()) return undefined;
    return reconcile(view, mapper.currentSchema());
  }, [view, mapper]);

  const canApply = result === undefined || result.status !== 'incompatible';
  const requiresUserConfirmation = result?.status === 'degraded-compatible';

  return { isChecking: false, result, canApply, requiresUserConfirmation };
}
