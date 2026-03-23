/** SF27-T07 — Bulk action module registry. */
import type { IBulkActionDefinition } from '../types/index.js';

export interface IBulkActionModuleRegistration {
  moduleKey: string;
  displayName: string;
  actions: IBulkActionDefinition<unknown>[];
}

let entries: IBulkActionModuleRegistration[] = [];
let frozen = false;

export const BulkActionModuleRegistry = {
  register(newEntries: IBulkActionModuleRegistration[]): void {
    if (frozen) throw new Error('BulkActionModuleRegistry is frozen.');
    for (const entry of newEntries) {
      if (!entry.moduleKey) throw new Error('moduleKey is required.');
      if (entries.some(e => e.moduleKey === entry.moduleKey)) throw new Error(`Duplicate: "${entry.moduleKey}".`);
      entries.push(Object.freeze({ ...entry }) as IBulkActionModuleRegistration);
    }
    frozen = true;
  },
  getAll(): IBulkActionModuleRegistration[] { return [...entries]; },
  getByModule(moduleKey: string): IBulkActionModuleRegistration | undefined { return entries.find(e => e.moduleKey === moduleKey); },
  getActionsForModule(moduleKey: string): IBulkActionDefinition<unknown>[] { return this.getByModule(moduleKey)?.actions ?? []; },
  _resetForTesting(): void { entries = []; frozen = false; },
};
