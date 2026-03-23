/**
 * SF25-T03 — Storage adapter interface.
 */
import type { IPublishRequest } from '../types/index.js';
import type { IPublishAuditEntry } from '../model/governance.js';

export interface IPublishStorageRecord {
  publishRequestId: string;
  request: IPublishRequest;
  storedAtIso: string;
  updatedAtIso: string;
  storageSystem: string;
  auditTrail: IPublishAuditEntry[];
}

export interface IPublishStorageAdapter {
  readonly storageSystemId: string;
  save(request: IPublishRequest): Promise<IPublishStorageRecord>;
  getByRequestId(id: string): Promise<IPublishStorageRecord | null>;
  listByProject(projectId: string, limit?: number): Promise<IPublishStorageRecord[]>;
  listPendingSync(): Promise<IPublishStorageRecord[]>;
  update(id: string, request: IPublishRequest): Promise<IPublishStorageRecord>;
  appendAudit(id: string, entry: IPublishAuditEntry): Promise<void>;
}
