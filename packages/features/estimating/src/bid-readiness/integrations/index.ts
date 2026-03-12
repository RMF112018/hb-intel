/**
 * SF18-T07 reference integrations barrel.
 *
 * Exposes deterministic adapter projections for Tier-1 integration boundaries
 * without introducing runtime side effects in the feature package.
 *
 * @design D-SF18-T07
 */
import { projectBidReadinessToBicNextMove } from './bicNextMoveAdapter.js';
import { resolveBidReadinessNotifications } from './notificationDispatchAdapter.js';
import { createBidReadinessVersionedSnapshot } from './versionedRecordAdapter.js';
import { gateBidReadinessByComplexity } from './complexityGatingAdapter.js';
import { resolveBidReadinessApprovalAuthority } from './approvalAuthorityAdapter.js';

export {
  projectBidReadinessToBicNextMove,
} from './bicNextMoveAdapter.js';

export type {
  IBicNextMoveReferenceAction,
  IBidReadinessBicNextMoveProjection,
} from './bicNextMoveAdapter.js';

export {
  resolveBidReadinessNotifications,
} from './notificationDispatchAdapter.js';

export type {
  BidReadinessNotificationType,
  BidReadinessNotificationUrgency,
  IBidReadinessNotificationReference,
} from './notificationDispatchAdapter.js';

export {
  createBidReadinessVersionedSnapshot,
} from './versionedRecordAdapter.js';

export type {
  IBidReadinessVersionedSnapshot,
} from './versionedRecordAdapter.js';

export {
  gateBidReadinessByComplexity,
} from './complexityGatingAdapter.js';

export type {
  BidReadinessComplexityTier,
  BidReadinessGovernanceAudience,
  IBidReadinessComplexityGatedView,
} from './complexityGatingAdapter.js';

export {
  resolveBidReadinessApprovalAuthority,
} from './approvalAuthorityAdapter.js';

export type {
  IBidReadinessApprovalRequirement,
  IBidReadinessApprovalResolution,
} from './approvalAuthorityAdapter.js';

export interface IBidReadinessReferenceIntegrations {
  readonly projectToBicNextMove: typeof projectBidReadinessToBicNextMove;
  readonly resolveNotifications: typeof resolveBidReadinessNotifications;
  readonly createVersionedSnapshot: typeof createBidReadinessVersionedSnapshot;
  readonly applyComplexityGating: typeof gateBidReadinessByComplexity;
  readonly resolveApprovalAuthority: typeof resolveBidReadinessApprovalAuthority;
}

/**
 * Returns a deterministic integration adapter registry for SF18 reference wiring.
 *
 * @design D-SF18-T07
 */
export function createBidReadinessReferenceIntegrations(): IBidReadinessReferenceIntegrations {
  return {
    projectToBicNextMove: projectBidReadinessToBicNextMove,
    resolveNotifications: resolveBidReadinessNotifications,
    createVersionedSnapshot: createBidReadinessVersionedSnapshot,
    applyComplexityGating: gateBidReadinessByComplexity,
    resolveApprovalAuthority: resolveBidReadinessApprovalAuthority,
  };
}
