/**
 * SF24-T03 — Export storage adapter interface.
 *
 * All storage implementations (InMemory, SharePoint, IndexedDB) implement
 * this contract. The primitive owns persistence orchestration; implementations
 * own the storage mechanism.
 *
 * Governing: SF24-T03, L-04 (offline resilience)
 */

import type { IExportRequest } from '../types/index.js';
import type { IExportAuditEntry } from '../model/governance.js';

/**
 * Stored export record wrapping a request with storage metadata
 * and append-only audit trail.
 */
export interface IExportStorageRecord {
  /** Export request ID (matches request.requestId). */
  requestId: string;
  /** Full export request state at time of last update. */
  request: IExportRequest;
  /** ISO 8601 timestamp when this record was first stored. */
  storedAtIso: string;
  /** ISO 8601 timestamp of the last update. */
  updatedAtIso: string;
  /** Storage system identifier. */
  storageSystem: string;
  /** Append-only audit trail for this export. */
  auditTrail: IExportAuditEntry[];
}

/**
 * Storage adapter interface for export request persistence.
 *
 * Implementations:
 * - `InMemoryExportStorageAdapter` — dev/test (this package)
 * - SharePoint-backed adapter — production (future)
 * - IndexedDB-backed adapter — offline persistence via @hbc/session-state (future)
 */
export interface IExportStorageAdapter {
  /** Identifier for this storage system (e.g. 'in-memory', 'sharepoint', 'indexeddb'). */
  readonly storageSystemId: string;

  /** Persist a new export request. */
  save(request: IExportRequest): Promise<IExportStorageRecord>;

  /** Retrieve a stored record by request ID. Returns null if not found. */
  getByRequestId(requestId: string): Promise<IExportStorageRecord | null>;

  /** List stored records for a project, newest first. */
  listByProject(projectId: string, limit?: number): Promise<IExportStorageRecord[]>;

  /** List records in pending sync states (saved-locally, queued-to-sync). */
  listPendingSync(): Promise<IExportStorageRecord[]>;

  /** Update a stored record with new request state. */
  update(requestId: string, request: IExportRequest): Promise<IExportStorageRecord>;

  /** Append an audit entry to a stored record. */
  appendAudit(requestId: string, entry: IExportAuditEntry): Promise<void>;
}
