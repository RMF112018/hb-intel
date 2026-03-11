/**
 * @hbc/ai-assist — Hooks (D-SF15-T01 scaffold)
 *
 * React hooks for AI action discovery and invocation.
 * Full implementation in SF15-T04.
 */

import type { IAiAction, IAiActionResult } from '../types/index.js';

/** Result shape for the useAiAction hook. */
export interface UseAiActionResult {
  readonly invoke: (context: Record<string, unknown>) => Promise<IAiActionResult | null>;
  readonly isLoading: boolean;
  readonly result: IAiActionResult | null;
  readonly error: Error | null;
  readonly cancel: () => void;
}

/** Result shape for the useAiActions hook. */
export interface UseAiActionsResult {
  readonly actions: readonly IAiAction[];
  readonly isLoading: boolean;
}

/** Hook for invoking a single AI action. Scaffold stub — SF15-T04. */
export function useAiAction(_actionKey: string): UseAiActionResult {
  return {
    invoke: async () => null,
    isLoading: false,
    result: null,
    error: null,
    cancel: () => {},
  };
}

/** Hook for discovering available AI actions. Scaffold stub — SF15-T04. */
export function useAiActions(_recordType?: string): UseAiActionsResult {
  return {
    actions: [],
    isLoading: false,
  };
}
