/**
 * W0-G3-T02: Canonical handoff config for the Estimating → Project Hub transition.
 *
 * This config defines how a completed project setup request is handed off
 * to the Project Hub module where a project workspace record is initialized.
 *
 * Wave 0 vs. Wave 1 boundary:
 * - Handoff lifecycle (draft → sent → received → acknowledged) works now.
 * - Destination record creation (onAcknowledged) is a Wave 1 no-op/log seam.
 * - The handoff structure is correct so Wave 1 only implements the callback body.
 *
 * Traceability: docs/architecture/plans/MVP/G3/W0-G3-T02-Ownership-Next-Action-and-Handoff-Contract.md §Part 2
 */
import type { IHandoffConfig } from '@hbc/workflow-handoff';
import type { IProjectSetupRequest, ProjectDepartment } from '@hbc/models';

// ─── Seed Data Shape ─────────────────────────────────────────────────────────

/**
 * Seed data planted into the Project Hub destination record at handoff time.
 * IProjectRecord is a Wave 1 type — this interface defines only the fields
 * the handoff carries from the setup request.
 */
export interface IProjectHubSeedData {
  projectName: string;
  projectNumber: string;
  department: ProjectDepartment;
  siteUrl: string;
  projectLeadId: string;
  groupMembers: string[];
  startDate?: string;
  estimatedValue?: number;
  clientName?: string;
}

// ─── Readiness Validation ────────────────────────────────────────────────────

/**
 * Pre-flight validation for the Estimating → Project Hub handoff.
 * Returns null when ready; returns a specific failure reason otherwise.
 *
 * Exported separately so tests and consuming surfaces can call it directly.
 */
export function validateSetupHandoffReadiness(request: IProjectSetupRequest): string | null {
  if (request.state !== 'Completed') {
    return 'Project setup must be fully completed before handing off to Project Hub.';
  }
  if (!request.siteUrl) {
    return 'Provisioned site URL is not yet available. Wait for provisioning to complete.';
  }
  if (!request.department) {
    return 'Department is not set on this request. Contact your administrator.';
  }
  if (!request.projectLeadId) {
    return 'Project lead is not assigned. Update the project team before handoff.';
  }
  return null;
}

/**
 * W0-G5-T05: Canonical resolver for the Project Hub URL from a completed setup request.
 * Returns the provisioned SharePoint site URL when the request is in Completed state
 * and the URL is available; returns null otherwise.
 *
 * This is the single source of truth for T05 completion surfaces that need the Project Hub link.
 */
export function resolveProjectHubUrl(request: IProjectSetupRequest): string | null {
  if (request.state === 'Completed' && request.siteUrl) {
    return request.siteUrl;
  }
  return null;
}

// ─── Handoff Config ──────────────────────────────────────────────────────────

export const SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG: IHandoffConfig<
  IProjectSetupRequest,
  IProjectHubSeedData
> = {
  sourceModule: 'estimating',
  sourceRecordType: 'project-setup-request',
  destinationModule: 'project-hub',
  destinationRecordType: 'project-record',
  routeLabel: 'Project Setup → Project Hub',
  acknowledgeDescription:
    'Acknowledge to create the Project Hub workspace for this project.',

  mapSourceToDestination: (request): Partial<IProjectHubSeedData> => ({
    projectName: request.projectName,
    projectNumber: request.projectNumber ?? '',
    department: request.department!,
    siteUrl: request.siteUrl ?? '',
    projectLeadId: request.projectLeadId ?? '',
    groupMembers: request.groupMembers ?? [],
    startDate: request.startDate,
    estimatedValue: request.estimatedValue,
    clientName: request.clientName,
  }),

  resolveDocuments: async () => {
    // No documents in Wave 0 handoff — the provisioned SharePoint site
    // is already accessible via siteUrl. Wave 1 can extend this to
    // include the getting-started page or template files.
    return [];
  },

  resolveRecipient: (request) => {
    if (!request.projectLeadId) return null;
    return {
      userId: request.projectLeadId,
      displayName: 'Project Lead',
      role: 'Project Lead',
    };
  },

  validateReadiness: (request): string | null => {
    return validateSetupHandoffReadiness(request);
  },

  onAcknowledged: async (pkg) => {
    // TODO(Wave 1): Create the Project Hub project record with seed data.
    // The Project Hub module's creation API does not exist in Wave 0.
    // When implementing, call: ProjectHubApi.createProject(pkg.destinationSeedData, pkg.handoffId)
    // and return { destinationRecordId: result.id }.
    console.info(
      `[provisioning/handoff] Wave 0 no-op: onAcknowledged for handoff ${pkg.handoffId}. ` +
        `Destination record creation deferred to Wave 1.`,
    );
    return { destinationRecordId: '' };
  },

  onRejected: async (pkg) => {
    // TODO(Wave 1): Return the setup request to coordinator review.
    // When implementing, call: ProjectSetupApi.returnToCoordinatorReview(pkg.sourceRecordId, pkg.rejectionReason)
    console.info(
      `[provisioning/handoff] Wave 0 no-op: onRejected for handoff ${pkg.handoffId}. ` +
        `Rejection reason: ${pkg.rejectionReason ?? 'none'}`,
    );
  },
};
