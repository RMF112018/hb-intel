/**
 * SF28-T07 — Activity source adapter registry.
 *
 * Module singleton following MyWorkRegistry pattern: additive registration,
 * freeze-on-write, duplicate rejection. All activity source adapters
 * register here at app initialization.
 *
 * Governing: SF28-T07
 */

import type {
  IActivitySourceRegistration,
  IActivityRuntimeContext,
} from '../types/index.js';

let entries: IActivitySourceRegistration[] = [];
let frozen = false;

export const ActivitySourceRegistry = {
  register(newEntries: IActivitySourceRegistration[]): void {
    if (frozen) {
      throw new Error(
        'ActivitySourceRegistry is frozen. Registration must happen at app initialization only.',
      );
    }

    for (const entry of newEntries) {
      if (!entry.moduleKey) {
        throw new Error('IActivitySourceRegistration.moduleKey is required.');
      }

      if (entry.adapter.moduleKey !== entry.moduleKey) {
        throw new Error(
          `Registration moduleKey "${entry.moduleKey}" does not match adapter.moduleKey "${entry.adapter.moduleKey}".`,
        );
      }

      if (entries.some((e) => e.moduleKey === entry.moduleKey)) {
        throw new Error(
          `Duplicate activity source: moduleKey "${entry.moduleKey}" is already registered.`,
        );
      }

      entries.push(Object.freeze({ ...entry }) as IActivitySourceRegistration);
    }

    frozen = true;
  },

  getAll(): IActivitySourceRegistration[] {
    return [...entries];
  },

  getByModule(moduleKey: string): IActivitySourceRegistration | undefined {
    return entries.find((e) => e.moduleKey === moduleKey);
  },

  getEnabled(context: IActivityRuntimeContext): IActivitySourceRegistration[] {
    return entries.filter(
      (e) => e.enabledByDefault && e.adapter.isEnabled(context),
    );
  },

  size(): number {
    return entries.length;
  },

  _clearForTesting(): void {
    entries = [];
    frozen = false;
  },
} as const;
