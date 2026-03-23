/**
 * SF24-T07 — Export module adapter registry.
 *
 * Module singleton following ActivitySourceRegistry pattern: additive
 * registration, freeze-on-write, duplicate rejection. All export module
 * adapters register here at app initialization.
 *
 * Governing: SF24-T07, L-01 (primitive ownership)
 */

import type {
  ExportFormat,
  ExportIntent,
  ExportComplexityTier,
  ExportPayload,
  IExportSourceTruthStamp,
} from '../types/index.js';

// ── Registration Types ───────────────────────────────────────────────────

/**
 * Module truth provider — supplies source truth and payload for exports.
 *
 * Module adapters implement this; the primitive consumes it to build
 * export requests with accurate source truth.
 */
export interface IExportModuleTruthProvider {
  /** Module key matching the registration. */
  moduleKey: string;
  /** Build a source truth stamp for the given record and project. */
  getSourceTruthStamp(recordId: string, projectId: string): IExportSourceTruthStamp;
  /** Build an export payload for the given record, project, and intent. */
  buildPayload(recordId: string, projectId: string, intent: ExportIntent): ExportPayload;
}

/**
 * Module export registration entry.
 *
 * Consuming modules register one entry per module at app initialization.
 */
export interface IExportModuleRegistration {
  /** Unique module key. */
  moduleKey: string;
  /** Human-readable module display name. */
  displayName: string;
  /** Formats this module supports. */
  supportedFormats: ExportFormat[];
  /** Intents this module supports. */
  supportedIntents: ExportIntent[];
  /** Complexity tier governing export surface depth. */
  complexityTier: ExportComplexityTier;
  /** Module truth provider. */
  truthProvider: IExportModuleTruthProvider;
}

// ── Registry Singleton ───────────────────────────────────────────────────

let entries: IExportModuleRegistration[] = [];
let frozen = false;

/**
 * Export module registry singleton.
 *
 * Modules register at app initialization. Registration freezes on first
 * write — no late registration after the app is running.
 */
export const ExportModuleRegistry = {
  /**
   * Register one or more module export adapters.
   *
   * @param newEntries - Module registrations to add.
   * @throws If registry is frozen or duplicate moduleKey detected.
   */
  register(newEntries: IExportModuleRegistration[]): void {
    if (frozen) {
      throw new Error(
        'ExportModuleRegistry is frozen. Registration must happen at app initialization only.',
      );
    }

    for (const entry of newEntries) {
      if (!entry.moduleKey) {
        throw new Error('IExportModuleRegistration.moduleKey is required.');
      }

      if (entry.truthProvider.moduleKey !== entry.moduleKey) {
        throw new Error(
          `Registration moduleKey "${entry.moduleKey}" does not match truthProvider.moduleKey "${entry.truthProvider.moduleKey}".`,
        );
      }

      if (entries.some(e => e.moduleKey === entry.moduleKey)) {
        throw new Error(
          `Duplicate export module: moduleKey "${entry.moduleKey}" is already registered.`,
        );
      }

      entries.push(Object.freeze({ ...entry }) as IExportModuleRegistration);
    }

    frozen = true;
  },

  /** Get all registered module entries. */
  getAll(): IExportModuleRegistration[] {
    return [...entries];
  },

  /** Get a registration by module key. */
  getByModule(moduleKey: string): IExportModuleRegistration | undefined {
    return entries.find(e => e.moduleKey === moduleKey);
  },

  /** Get all registrations (alias for getAll — all registered are enabled). */
  getEnabled(): IExportModuleRegistration[] {
    return [...entries];
  },

  /** Reset registry for testing. NOT for production use. */
  _resetForTesting(): void {
    entries = [];
    frozen = false;
  },
};
