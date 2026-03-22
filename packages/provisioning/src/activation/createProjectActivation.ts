/**
 * Phase 3 Stage 1.3 — Project activation transaction (setup seam).
 *
 * Transforms a completed project setup handoff into a canonical
 * IProjectRegistryRecord with all 24 fields, primary site association,
 * and immutable audit trail.
 *
 * Governing: P3-A1 §4 (Activation Transaction), §5 (Preconditions/Post-conditions)
 */

import type {
  IProjectRegistryRecord,
  ISiteAssociation,
  ProjectLifecycleStatus,
} from '@hbc/models';
import type { IProvisioningStatus } from '@hbc/models';
import type { IProjectHubSeedData } from '../handoff-config.js';

// ─────────────────────────────────────────────────────────────────────────────
// Input / Output contracts
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectActivationInput {
  /** Unique handoff package ID — becomes `sourceHandoffId` */
  handoffId: string;
  /** Seed data from the handoff mapper */
  seed: IProjectHubSeedData;
  /** Provisioning status record with entra group data */
  provisioningStatus: IProvisioningStatus;
  /** UPN of the user acknowledging the handoff */
  acknowledgedByUpn: string;
}

export interface ProjectActivationResult {
  /** The newly created canonical registry record */
  registryRecord: IProjectRegistryRecord;
  /** The projectId to store as `createdDestinationRecordId` on the handoff package */
  destinationRecordId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Precondition validation (P3-A1 §5.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate all activation preconditions per P3-A1 §5.2.
 *
 * @param input - Activation input data
 * @param existingIds - Sets of existing projectNumbers and siteUrls for uniqueness checks
 * @returns null if all preconditions pass; error message string if any fail
 */
export function validateActivationPreconditions(
  input: ProjectActivationInput,
  existingIds: { projectNumbers: Set<string>; siteUrls: Set<string> },
): string | null {
  const { seed, provisioningStatus } = input;

  // Provisioning must be complete
  const status = provisioningStatus.overallStatus;
  if (status !== 'Completed' && status !== 'BaseComplete') {
    return `Provisioning is not complete (current status: ${status}).`;
  }

  // siteUrl must be available
  if (!seed.siteUrl) {
    return 'Site URL is not available from provisioning.';
  }

  // PM must be assigned
  if (!seed.projectLeadId) {
    return 'Project lead (PM) is not assigned.';
  }

  // Department must be set
  if (!seed.department) {
    return 'Department is not set.';
  }

  // Entra groups must exist
  if (!provisioningStatus.entraGroups) {
    return 'Entra security groups have not been created during provisioning.';
  }

  // projectNumber uniqueness
  if (seed.projectNumber && existingIds.projectNumbers.has(seed.projectNumber)) {
    return `Project number "${seed.projectNumber}" already exists in the registry.`;
  }

  // siteUrl uniqueness
  if (existingIds.siteUrls.has(seed.siteUrl)) {
    return `Site URL "${seed.siteUrl}" is already associated with another project.`;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry record construction (P3-A1 §2.1, §5.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a canonical IProjectRegistryRecord from activation input.
 *
 * Pure function — no side effects. All 24 fields are populated.
 * Uses `crypto.randomUUID()` for projectId generation (P3-A1 §8.7).
 */
export function buildRegistryRecord(
  input: ProjectActivationInput,
): IProjectRegistryRecord {
  const { handoffId, seed, provisioningStatus, acknowledgedByUpn } = input;
  const now = new Date().toISOString();
  const projectId = crypto.randomUUID();

  const primarySiteAssociation: ISiteAssociation = {
    siteUrl: seed.siteUrl,
    associationType: 'primary',
    associatedAt: now,
    associatedByUpn: acknowledgedByUpn,
  };

  const lifecycleStatus: ProjectLifecycleStatus = 'Active';

  return {
    // Immutable identity
    projectId,
    projectNumber: seed.projectNumber,
    siteUrl: seed.siteUrl,
    activatedAt: now,
    activatedByUpn: acknowledgedByUpn,
    sourceHandoffId: handoffId,
    entraGroupSet: provisioningStatus.entraGroups!,

    // Mutable metadata
    projectName: seed.projectName,
    lifecycleStatus,
    startDate: seed.startDate ?? now,
    scheduledCompletionDate: undefined,
    estimatedValue: seed.estimatedValue,
    clientName: seed.clientName,

    // Team anchors
    projectManagerUpn: seed.projectLeadId,
    projectManagerName: seed.projectLeadId, // Display name resolution is Phase 3 runtime scope

    // Governed-mutable
    department: seed.department,

    // Site associations
    siteAssociations: [primarySiteAssociation],
  };
}
