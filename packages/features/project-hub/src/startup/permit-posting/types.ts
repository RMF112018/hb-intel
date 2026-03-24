/**
 * P3-E11-T10 Stage 4 Project Startup Permit Posting Verification TypeScript contracts.
 * PermitVerificationDetail companion records for Section 4 task instances.
 */

import type { StartupPermitType } from './enums.js';

// -- PermitVerificationDetail (T07 §9.1) ------------------------------------

/** Permit verification companion record per T07 §9.1. One per Section 4 task instance. */
export interface IPermitVerificationDetail {
  readonly detailId: string;
  readonly taskInstanceId: string;
  readonly projectId: string;
  readonly permitType: StartupPermitType;
  readonly physicalEvidenceAttachmentIds: readonly string[];
  readonly verifiedBy: string | null;
  readonly verifiedAt: string | null;
  readonly discrepancyReason: string | null;
  readonly permitModuleRecordRef: string | null;
  readonly permitStatusFromModule: string | null;
  readonly permitExpirationFromModule: string | null;
  readonly lastCrossRefreshedAt: string | null;
  readonly createdAt: string;
  readonly lastModifiedAt: string;
}

// -- Supporting Types -------------------------------------------------------

/** Task-to-permit-type mapping entry per T07 §9.2. */
export interface IStartupPermitTypeMapping {
  readonly taskNumber: string;
  readonly permitType: StartupPermitType;
  readonly label: string;
  readonly applicabilityNote: string | null;
}

/** Stage 4 Activity Spine event definition per T10 §2 Stage 4. */
export interface IStage4ActivityEventDef {
  readonly event: string;
  readonly description: string;
}

/** Stage 4 Work Queue item definition per T10 §2 Stage 4. */
export interface IStage4WorkQueueItemDef {
  readonly item: string;
  readonly description: string;
  readonly assignedTo: string;
}
