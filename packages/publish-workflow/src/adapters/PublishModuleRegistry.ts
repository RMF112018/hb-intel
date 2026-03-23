/** SF25-T07 — Publish module adapter registry. */
import type { IPublishTarget, IPublishApprovalRule } from '../types/index.js';

export interface IPublishModuleRegistration {
  moduleKey: string;
  displayName: string;
  defaultTargets: IPublishTarget[];
  approvalRules: IPublishApprovalRule[];
  supportsSupersession: boolean;
  supportsRevocation: boolean;
}

let entries: IPublishModuleRegistration[] = [];
let frozen = false;

export const PublishModuleRegistry = {
  register(newEntries: IPublishModuleRegistration[]): void {
    if (frozen) throw new Error('PublishModuleRegistry is frozen.');
    for (const entry of newEntries) {
      if (!entry.moduleKey) throw new Error('moduleKey is required.');
      if (entries.some(e => e.moduleKey === entry.moduleKey)) throw new Error(`Duplicate: "${entry.moduleKey}".`);
      entries.push(Object.freeze({ ...entry }) as IPublishModuleRegistration);
    }
    frozen = true;
  },
  getAll(): IPublishModuleRegistration[] { return [...entries]; },
  getByModule(moduleKey: string): IPublishModuleRegistration | undefined { return entries.find(e => e.moduleKey === moduleKey); },
  _resetForTesting(): void { entries = []; frozen = false; },
};
