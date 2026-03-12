/**
 * Integration adapters barrel export.
 *
 * @design SF17-T07
 */

// BIC Next-Move
export type { IBicBlockingContext, IBicNextMoveAdapter } from './bicNextMoveAdapter.js';
export { ReferenceBicNextMoveAdapter } from './bicNextMoveAdapter.js';

// Notification Dispatch
export type { IAdminNotificationEvent, INotificationDispatchAdapter } from './notificationDispatchAdapter.js';
export { ReferenceNotificationDispatchAdapter } from './notificationDispatchAdapter.js';

// Acknowledgment
export type { IApprovalPartyResolution, IAcknowledgmentApprovalAdapter } from './acknowledgmentAdapter.js';
export { ReferenceAcknowledgmentAdapter } from './acknowledgmentAdapter.js';

// Versioned Record
export type { IGovernanceSnapshotPayload, IGovernanceSnapshotAdapter } from './versionedRecordAdapter.js';
export { ReferenceGovernanceSnapshotAdapter } from './versionedRecordAdapter.js';

// Complexity Gating
export type { AdminComplexityTier, IAdminComplexityGating, IAdminComplexityGatingAdapter } from './complexityGatingAdapter.js';
export { ReferenceComplexityGatingAdapter } from './complexityGatingAdapter.js';
