/**
 * @hbc/publish-workflow
 *
 * Shared publication workflow primitive for HB Intel.
 * State machine, readiness/approval flow, supersession/revocation,
 * receipt traceability, and module adapter seams.
 *
 * @see docs/architecture/plans/shared-features/SF25-Publish-Workflow.md
 */

// Types — SF25-T01 foundation + T02 canonical contracts
export type {
  PublishState,
  PublicationStatus,
  IReadinessState,
  IApprovalState,
  ISupersessionState,
  IRevocationState,
  IPublicationRecord,
  IPublicationReceipt,
  IReadinessRule,
  IApprovalRule,
  IPublishTarget,
  IPublishApprovalRule,
  IPublishBicStepConfig,
  IPublishTelemetryState,
  IPublishReceiptContextStamp,
  IPublishRequest,
} from './types/index.js';

// Constants
export {
  PUBLISH_STATES,
  PUBLICATION_STATUSES,
  PUBLISH_WORKFLOW_SYNC_QUEUE_KEY,
  PUBLISH_WORKFLOW_SYNC_STATUSES,
  PUBLISH_WORKFLOW_VISIBILITY_POLICY,
} from './types/index.js';

// Model (SF25-T03) // export * from './model/index.js';
// API (SF25-T03)   // export * from './api/index.js';
// Hooks (SF25-T04) // export * from './hooks/index.js';
// Components (SF25-T05/T06) // export * from './components/index.js';
// Rules (SF25-T03) // export * from './rules/index.js';
// Adapters (SF25-T07) // export * from './adapters/index.js';
