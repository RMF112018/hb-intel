/**
 * SF18-T06 admin configuration contracts for readiness criteria governance.
 *
 * @design D-SF18-T06
 */
import type { IEstimatingBidReadinessProfile } from './IEstimatingBidReadinessProfile.js';
import type { IReadinessGovernanceMetadata } from './IReadinessGovernanceMetadata.js';
import type { VersionedRecord } from './VersionedRecord.js';

export interface IBidReadinessChecklistDefinition {
  readonly checklistItemId: string;
  readonly criterionId: string;
  readonly required: boolean;
  readonly blocking: boolean;
  readonly order: number;
}

export interface IBidReadinessAdminConfigSnapshot {
  readonly profile: IEstimatingBidReadinessProfile;
  readonly checklistDefinitions: readonly IBidReadinessChecklistDefinition[];
  readonly governance: IReadinessGovernanceMetadata;
  readonly version: VersionedRecord;
  readonly savedAt: string;
}

export interface IBidReadinessAdminConfigDraft {
  readonly profile: IEstimatingBidReadinessProfile;
  readonly checklistDefinitions: readonly IBidReadinessChecklistDefinition[];
  readonly governance: IReadinessGovernanceMetadata;
  readonly version: VersionedRecord;
  readonly dirty: boolean;
}
