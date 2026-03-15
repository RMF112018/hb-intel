/**
 * MyWorkRegistry — SF29-T03
 * Module singleton for work-item source registration.
 *
 * Each source adapter registers once at initialization:
 *   MyWorkRegistry.register([{ source: 'bic-next-move', adapter, ... }]);
 *
 * Follows the NotificationRegistry pattern (module singleton, additive, freeze-on-write).
 */

import type {
  IMyWorkRegistryEntry,
  IMyWorkRuntimeContext,
  MyWorkSource,
} from '../types/index.js';

const _registry = new Map<MyWorkSource, IMyWorkRegistryEntry>();

function register(entries: IMyWorkRegistryEntry[]): void {
  for (const entry of entries) {
    if (!entry.source || typeof entry.source !== 'string') {
      throw new Error('MyWorkRegistry: source must be a non-empty string.');
    }

    if (entry.adapter.source !== entry.source) {
      throw new Error(
        `MyWorkRegistry: adapter.source "${entry.adapter.source}" does not match entry source "${entry.source}".`
      );
    }

    if (entry.rankingWeight !== undefined && (entry.rankingWeight < 0 || entry.rankingWeight > 1)) {
      throw new Error(
        `MyWorkRegistry: rankingWeight must be between 0 and 1 for source "${entry.source}". Got ${entry.rankingWeight}.`
      );
    }

    if (_registry.has(entry.source)) {
      throw new Error(
        `MyWorkRegistry: duplicate source "${entry.source}". Sources are unique once registered.`
      );
    }

    const frozen = Object.freeze({
      ...entry,
      rankingWeight: entry.rankingWeight ?? 0.5,
      enabledByDefault: entry.enabledByDefault ?? true,
    });
    _registry.set(entry.source, frozen);
  }
}

function getAll(): IMyWorkRegistryEntry[] {
  return Array.from(_registry.values());
}

function getBySource(source: MyWorkSource): IMyWorkRegistryEntry | undefined {
  return _registry.get(source);
}

function getEnabledSources(context: IMyWorkRuntimeContext): IMyWorkRegistryEntry[] {
  return Array.from(_registry.values()).filter((entry) => {
    if (!entry.enabledByDefault) return false;
    return entry.adapter.isEnabled(context);
  });
}

function size(): number {
  return _registry.size;
}

function _clearForTesting(): void {
  _registry.clear();
}

export const MyWorkRegistry = {
  register,
  getAll,
  getBySource,
  getEnabledSources,
  size,
  _clearForTesting,
} as const;
