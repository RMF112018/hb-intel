/**
 * @hbc/ai-assist — AiActionRegistry (SF15-T03)
 *
 * Composite-key registry for named AI actions.
 * Pattern: RelationshipRegistry (composite keys, duplicate protection, validation, _clearForTests).
 */

import type { IAiAction, IAiActionInvokeContext, IAiActionRegistration, IAiAssistPolicy } from '../types/index.js';
import { tierRank } from '@hbc/complexity';

/** Internal-only wrapper stored in the registry Map. */
interface IRegisteredAction {
  readonly recordType: string;
  readonly action: IAiAction;
}

const registry = new Map<string, IRegisteredAction>();
let currentPolicy: IAiAssistPolicy | undefined;

function buildKey(recordType: string, actionKey: string): string {
  return `${recordType}::${actionKey}`;
}

function validateAction(action: IAiAction): void {
  if (!action.actionKey) {
    throw new Error('[ai-assist] Action validation failed: actionKey must be non-empty');
  }
  if (!action.label) {
    throw new Error('[ai-assist] Action validation failed: label must be non-empty');
  }
  if (!action.modelKey) {
    throw new Error('[ai-assist] Action validation failed: modelKey must be non-empty');
  }
  if (typeof action.buildPrompt !== 'function') {
    throw new Error('[ai-assist] Action validation failed: buildPrompt must be a function');
  }
  if (typeof action.parseResponse !== 'function') {
    throw new Error('[ai-assist] Action validation failed: parseResponse must be a function');
  }
}

function register(recordType: string, action: IAiAction): void {
  validateAction(action);
  const key = buildKey(recordType, action.actionKey);
  if (registry.has(key)) {
    throw new Error(`[ai-assist] Duplicate action registration: "${recordType}::${action.actionKey}"`);
  }
  registry.set(key, { recordType, action });
}

function registerMany(recordType: string, actions: readonly IAiAction[]): void {
  for (const action of actions) {
    register(recordType, action);
  }
}

function registerActions(registration: IAiActionRegistration): void {
  registerMany(registration.recordType, registration.actions);
}

function get(actionKey: string, recordType?: string): IAiAction | undefined {
  if (recordType !== undefined) {
    return registry.get(buildKey(recordType, actionKey))?.action;
  }
  for (const entry of registry.values()) {
    if (entry.action.actionKey === actionKey) {
      return entry.action;
    }
  }
  return undefined;
}

function getAll(): readonly IAiAction[] {
  return [...registry.values()].map((e) => e.action);
}

function getByRecordType(recordType: string): readonly IAiAction[] {
  return [...registry.values()]
    .filter((e) => e.recordType === recordType || e.recordType === '*')
    .map((e) => e.action)
    .sort((a, b) => {
      const scoreDiff = (b.basePriorityScore ?? 0) - (a.basePriorityScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return a.actionKey.localeCompare(b.actionKey);
    });
}

function getForContext(context: IAiActionInvokeContext, policy?: IAiAssistPolicy): readonly IAiAction[] {
  const effectivePolicy = policy ?? currentPolicy;
  return [...registry.values()]
    .filter((e) => e.recordType === context.recordType || e.recordType === '*')
    .map((e) => e.action)
    .filter((action) => {
      if (action.allowedRoles && !action.allowedRoles.includes(context.role)) {
        return false;
      }
      if (action.minComplexity && tierRank(context.complexity) < tierRank(action.minComplexity)) {
        return false;
      }
      if (effectivePolicy?.disableActions?.includes(action.actionKey)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const scoreDiff = (b.basePriorityScore ?? 0) - (a.basePriorityScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return a.actionKey.localeCompare(b.actionKey);
    });
}

function setPolicy(policy: IAiAssistPolicy): void {
  currentPolicy = policy;
}

function clear(): void {
  registry.clear();
  currentPolicy = undefined;
}

/** Register a single AI action with wildcard recordType ('*'). */
export function registerAiAction(action: IAiAction): void {
  register('*', action);
}

/** Register multiple AI actions with wildcard recordType ('*'). */
export function registerAiActions(actions: readonly IAiAction[]): void {
  registerMany('*', actions);
}

/** Action registry providing composite-key access to registered AI actions. */
export const AiActionRegistry = {
  register,
  registerMany,
  registerActions,
  get,
  getAll,
  getByRecordType,
  getForContext,
  setPolicy,
  clear,
  _clearForTests: clear,
} as const;
