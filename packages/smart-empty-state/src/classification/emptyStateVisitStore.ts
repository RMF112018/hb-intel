import type { IEmptyStateVisitStore } from '../types/ISmartEmptyState.js';
import { EMPTY_STATE_VISIT_KEY_PREFIX } from '../constants/emptyStateDefaults.js';

/**
 * No-op visit store implementation.
 * Always reports not visited and discards mark calls.
 */
export const noopVisitStore: IEmptyStateVisitStore = {
  hasVisited: (_module: string, _view: string): boolean => false,
  markVisited: (_module: string, _view: string): void => {},
};

function buildKey(module: string, view: string): string {
  return `${EMPTY_STATE_VISIT_KEY_PREFIX}::${module}::${view}`;
}

/**
 * Creates a visit store backed by a Storage instance (e.g. localStorage).
 * Falls back to in-memory Set when storage is unavailable or throws.
 * Only exact `'true'` string is treated as visited (corrupted-value safety).
 *
 * In development mode, throws if module or view is empty to catch misuse early.
 */
export function createEmptyStateVisitStore(storage?: Storage): IEmptyStateVisitStore {
  const memoryFallback = new Set<string>();

  return {
    hasVisited(module: string, view: string): boolean {
      if (process.env.NODE_ENV !== 'production') {
        if (!module) throw new Error('createEmptyStateVisitStore: module must not be empty');
        if (!view) throw new Error('createEmptyStateVisitStore: view must not be empty');
      }

      if (!storage) return memoryFallback.has(buildKey(module, view));

      try {
        return storage.getItem(buildKey(module, view)) === 'true';
      } catch {
        return memoryFallback.has(buildKey(module, view));
      }
    },

    markVisited(module: string, view: string): void {
      if (process.env.NODE_ENV !== 'production') {
        if (!module) throw new Error('createEmptyStateVisitStore: module must not be empty');
        if (!view) throw new Error('createEmptyStateVisitStore: view must not be empty');
      }

      const key = buildKey(module, view);

      if (!storage) {
        memoryFallback.add(key);
        return;
      }

      try {
        storage.setItem(key, 'true');
      } catch {
        memoryFallback.add(key);
      }
    },
  };
}
