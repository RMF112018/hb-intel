/**
 * Phase 3 Stage 3.2 — Project Activity Registry.
 *
 * Module singleton that manages activity source adapter registrations.
 * Follows the MyWorkRegistry pattern: freeze-on-write, app-initialization-only
 * registration, adapter isolation.
 *
 * Governing: P3-D1 §4 (Activity Registry Contract)
 */

import type {
  IActivitySourceRegistration,
  IActivityRuntimeContext,
} from '@hbc/models';

let entries: IActivitySourceRegistration[] = [];
let frozen = false;

/**
 * Singleton registry for Activity spine source adapters.
 *
 * Module adapters register during app initialization. Once any adapter
 * is registered, the registry is frozen and no further registrations
 * are accepted.
 */
export const ProjectActivityRegistry = {
  /**
   * Register one or more activity source adapters.
   *
   * @throws Error if duplicate moduleKey is detected
   * @throws Error if registry is already frozen
   */
  register(newEntries: IActivitySourceRegistration[]): void {
    if (frozen) {
      throw new Error(
        'ProjectActivityRegistry is frozen. Registration must happen at app initialization only.',
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
          `Duplicate activity source registration: moduleKey "${entry.moduleKey}" is already registered.`,
        );
      }

      entries.push(Object.freeze({ ...entry }) as IActivitySourceRegistration);
    }

    frozen = true;
  },

  /** Get all registered activity source adapters. */
  getAll(): IActivitySourceRegistration[] {
    return [...entries];
  },

  /** Lookup a specific adapter by module key. */
  getByModule(moduleKey: string): IActivitySourceRegistration | undefined {
    return entries.find((e) => e.moduleKey === moduleKey);
  },

  /** Get adapters that are enabled in the current runtime context. */
  getEnabledSources(context: IActivityRuntimeContext): IActivitySourceRegistration[] {
    return entries.filter(
      (e) => e.enabledByDefault && e.adapter.isEnabled(context),
    );
  },

  /** Number of registered adapters. */
  size(): number {
    return entries.length;
  },

  /** Reset registry for testing only. */
  _clearForTesting(): void {
    entries = [];
    frozen = false;
  },
} as const;
