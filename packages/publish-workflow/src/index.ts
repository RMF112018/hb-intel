/**
 * @hbc/publish-workflow
 *
 * Shared publication workflow primitive for HB Intel.
 * State machine, readiness/approval flow, supersession/revocation,
 * receipt traceability, and module adapter seams.
 *
 * @see docs/architecture/plans/shared-features/SF25-Publish-Workflow.md
 */

export type {
  PublicationStatus, IReadinessState, IApprovalState, ISupersessionState, IRevocationState,
  IPublicationRecord, IPublicationReceipt, IReadinessRule, IApprovalRule,
} from './types/index.js';

export { PUBLICATION_STATUSES } from './types/index.js';

// Model (SF25-T03) // export * from './model/index.js';
// API (SF25-T03)   // export * from './api/index.js';
// Hooks (SF25-T04) // export * from './hooks/index.js';
// Components (SF25-T05/T06) // export * from './components/index.js';
// Rules (SF25-T03) // export * from './rules/index.js';
// Adapters (SF25-T07) // export * from './adapters/index.js';
