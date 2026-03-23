/**
 * SF23-T03 — Record form storage adapter interface.
 *
 * Governing: SF23-T03, L-04 (offline resilience)
 */

import type { IRecordFormState } from '../types/index.js';
import type { IRecordFormAuditEntry } from '../model/governance.js';

/** Stored record form wrapping state with metadata and audit trail. */
export interface IRecordFormStorageRecord {
  /** Draft ID (matches state.draft.draftId). */
  draftId: string;
  /** Full form state. */
  state: IRecordFormState;
  /** ISO 8601 timestamp when first stored. */
  storedAtIso: string;
  /** ISO 8601 timestamp of last update. */
  updatedAtIso: string;
  /** Storage system identifier. */
  storageSystem: string;
  /** Append-only audit trail. */
  auditTrail: IRecordFormAuditEntry[];
}

/** Storage adapter interface for record form persistence. */
export interface IRecordFormStorageAdapter {
  readonly storageSystemId: string;
  save(state: IRecordFormState): Promise<IRecordFormStorageRecord>;
  getByDraftId(draftId: string): Promise<IRecordFormStorageRecord | null>;
  listByProject(projectId: string, limit?: number): Promise<IRecordFormStorageRecord[]>;
  listPendingSync(): Promise<IRecordFormStorageRecord[]>;
  update(draftId: string, state: IRecordFormState): Promise<IRecordFormStorageRecord>;
  appendAudit(draftId: string, entry: IRecordFormAuditEntry): Promise<void>;
}
