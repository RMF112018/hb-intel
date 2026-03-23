/**
 * SF24-T03 — Export storage adapters.
 *
 * Interface-driven persistence for export requests and audit trails.
 *
 * Governing: SF24-T03, L-04 (offline resilience)
 */

export type { IExportStorageAdapter, IExportStorageRecord } from './IExportStorageAdapter.js';
export { InMemoryExportStorageAdapter } from './InMemoryExportStorageAdapter.js';
