/**
 * SF26-T07 — Saved view module adapter registry.
 *
 * Governing: SF26-T07, L-05
 */

import type { ISavedViewStateMapper, ISavedViewSchemaDescriptor } from '../types/index.js';

export interface ISavedViewModuleRegistration {
  moduleKey: string;
  workspaceKey: string;
  displayName: string;
  mapper: ISavedViewStateMapper<unknown>;
  schema: ISavedViewSchemaDescriptor;
}

let entries: ISavedViewModuleRegistration[] = [];
let frozen = false;

export const SavedViewModuleRegistry = {
  register(newEntries: ISavedViewModuleRegistration[]): void {
    if (frozen) throw new Error('SavedViewModuleRegistry is frozen.');
    for (const entry of newEntries) {
      if (!entry.moduleKey) throw new Error('moduleKey is required.');
      if (entries.some(e => e.moduleKey === entry.moduleKey && e.workspaceKey === entry.workspaceKey)) {
        throw new Error(`Duplicate: "${entry.moduleKey}/${entry.workspaceKey}" already registered.`);
      }
      entries.push(Object.freeze({ ...entry }) as ISavedViewModuleRegistration);
    }
    frozen = true;
  },
  getAll(): ISavedViewModuleRegistration[] { return [...entries]; },
  getByModule(moduleKey: string, workspaceKey: string): ISavedViewModuleRegistration | undefined {
    return entries.find(e => e.moduleKey === moduleKey && e.workspaceKey === workspaceKey);
  },
  _resetForTesting(): void { entries = []; frozen = false; },
};
