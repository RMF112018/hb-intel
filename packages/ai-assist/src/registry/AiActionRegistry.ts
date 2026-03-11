/**
 * @hbc/ai-assist — AiActionRegistry (D-SF15-T01 scaffold)
 *
 * Extension-point registration surface for named AI actions.
 * Full implementation in SF15-T03.
 */

import type { IAiAction } from '../types/index.js';

const registry = new Map<string, IAiAction>();

/** Register a single AI action definition. */
export function registerAiAction(action: IAiAction): void {
  registry.set(action.actionKey, action);
}

/** Register multiple AI action definitions. */
export function registerAiActions(actions: readonly IAiAction[]): void {
  for (const action of actions) {
    registerAiAction(action);
  }
}

/** Action registry providing access to registered AI actions. */
export const AiActionRegistry = {
  register: registerAiAction,
  registerMany: registerAiActions,
  get: (actionKey: string): IAiAction | undefined => registry.get(actionKey),
  getAll: (): readonly IAiAction[] => [...registry.values()],
  clear: (): void => registry.clear(),
} as const;
