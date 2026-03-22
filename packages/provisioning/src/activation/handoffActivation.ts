/**
 * Phase 3 Stage 1.4 — Project activation transaction (handoff seam).
 *
 * Activates projects pre-existing in other systems into the canonical
 * IProjectRegistryRecord. Unlike the setup seam (1.3), this path does
 * not depend on IProvisioningStatus — all required fields are provided
 * directly in the HandoffActivationInput.
 *
 * Both seams produce the same IProjectRegistryRecord output.
 *
 * Governing: P3-A1 §4 (Activation Transaction), §5 (Preconditions/Post-conditions)
 */

import type {
  IProjectRegistryRecord,
  ISiteAssociation,
  ProjectLifecycleStatus,
  IEntraGroupSet,
  ProjectDepartment,
} from '@hbc/models';

// ─────────────────────────────────────────────────────────────────────────────
// Input contract
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Activation input for projects pre-existing in other systems.
 *
 * Carries all required registry fields directly, without depending
 * on IProvisioningStatus or IProjectHubSeedData.
 */
export interface HandoffActivationInput {
  /** Unique handoff package ID — becomes `sourceHandoffId` */
  handoffId: string;

  // Required fields
  projectName: string;
  projectNumber: string;
  siteUrl: string;
  department: ProjectDepartment;
  projectManagerUpn: string;
  entraGroupSet: IEntraGroupSet;
  acknowledgedByUpn: string;

  // Optional fields
  projectManagerName?: string;
  startDate?: string;
  scheduledCompletionDate?: string;
  estimatedValue?: number;
  clientName?: string;
  projectType?: string;
  projectLocation?: string;
  superintendentUpn?: string;
  superintendentName?: string;
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Precondition validation (P3-A1 §5.2 — handoff seam variant)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate handoff activation preconditions per P3-A1 §5.2.
 *
 * Unlike the setup seam, this does not check provisioning status —
 * the caller guarantees the project is ready for activation.
 */
export function validateHandoffActivationPreconditions(
  input: HandoffActivationInput,
  existingIds: { projectNumbers: Set<string>; siteUrls: Set<string> },
): string | null {
  if (!input.projectName) {
    return 'Project name is required.';
  }

  if (!input.projectNumber) {
    return 'Project number is required.';
  }

  if (!input.siteUrl) {
    return 'Site URL is required.';
  }

  if (!input.department) {
    return 'Department is required.';
  }

  if (!input.projectManagerUpn) {
    return 'Project Manager UPN is required.';
  }

  if (!input.entraGroupSet) {
    return 'Entra security group set is required.';
  }

  if (
    !input.entraGroupSet.leadersGroupId ||
    !input.entraGroupSet.teamGroupId ||
    !input.entraGroupSet.viewersGroupId
  ) {
    return 'All three Entra security groups (leaders, team, viewers) must be populated.';
  }

  // Uniqueness checks
  if (existingIds.projectNumbers.has(input.projectNumber)) {
    return `Project number "${input.projectNumber}" already exists in the registry.`;
  }

  if (existingIds.siteUrls.has(input.siteUrl)) {
    return `Site URL "${input.siteUrl}" is already associated with another project.`;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry record construction (P3-A1 §2.1, §5.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a canonical IProjectRegistryRecord from handoff activation input.
 *
 * Pure function — no side effects. All 24 fields are populated.
 * Uses `crypto.randomUUID()` for projectId generation (P3-A1 §8.7).
 */
export function buildRegistryRecordFromHandoff(
  input: HandoffActivationInput,
): IProjectRegistryRecord {
  const now = new Date().toISOString();
  const projectId = crypto.randomUUID();

  const primarySiteAssociation: ISiteAssociation = {
    siteUrl: input.siteUrl,
    associationType: 'primary',
    associatedAt: now,
    associatedByUpn: input.acknowledgedByUpn,
  };

  const lifecycleStatus: ProjectLifecycleStatus = 'Active';

  return {
    // Immutable identity
    projectId,
    projectNumber: input.projectNumber,
    siteUrl: input.siteUrl,
    activatedAt: now,
    activatedByUpn: input.acknowledgedByUpn,
    sourceHandoffId: input.handoffId,
    entraGroupSet: input.entraGroupSet,

    // Mutable metadata
    projectName: input.projectName,
    lifecycleStatus,
    projectType: input.projectType,
    projectLocation: input.projectLocation,
    startDate: input.startDate ?? now,
    scheduledCompletionDate: input.scheduledCompletionDate,
    estimatedValue: input.estimatedValue,
    clientName: input.clientName,

    // Team anchors
    projectManagerUpn: input.projectManagerUpn,
    projectManagerName: input.projectManagerName ?? input.projectManagerUpn,
    superintendentUpn: input.superintendentUpn,
    superintendentName: input.superintendentName,
    projectExecutiveUpn: input.projectExecutiveUpn,
    projectExecutiveName: input.projectExecutiveName,

    // Governed-mutable
    department: input.department,

    // Site associations
    siteAssociations: [primarySiteAssociation],
  };
}
