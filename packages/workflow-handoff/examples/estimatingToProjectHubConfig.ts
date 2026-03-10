// ─────────────────────────────────────────────────────────────────────────────
// SF08-T07 — P1 Reference Implementation: Estimating → Project Hub Config
//
// Route: Estimating Active Pursuit (Award Confirmed) → Project Hub Record
// Trigger: Award confirmation and project manager assignment
// Pre-flight: workflowStage must be 'award-confirmed';
//             finalBidAmount must be > 0
//
// This config lives in examples/ because the consuming packages
// (estimating, project-hub) are Phase 4/5 scope.
// ─────────────────────────────────────────────────────────────────────────────

import type { IHandoffConfig, IHandoffDocument } from '../src/types';
import type { IVersionedRecordConfig } from '@hbc/versioned-record';
import { VersionApi } from '@hbc/versioned-record';
import type { IEstimatingPursuitRef, IProjectRecordRef } from './reference-types';
import { DocumentApiRef, EstimatingApiRef, ProjectHubApiRef } from './reference-apis';

const estimatingPursuitVersionConfig: IVersionedRecordConfig<IEstimatingPursuitRef> = {
  recordType: 'estimating-pursuit',
  triggers: ['on-handoff'],
  getStakeholders: () => [],
};

export const estimatingToProjectHubConfig: IHandoffConfig<
  IEstimatingPursuitRef,
  IProjectRecordRef
> = {
  sourceModule: 'estimating',
  sourceRecordType: 'estimating-pursuit',
  destinationModule: 'project-hub',
  destinationRecordType: 'project-record',
  routeLabel: 'Estimating Win \u2192 Project Hub Project',
  acknowledgeDescription:
    'A Project Hub project record will be created with all estimating data pre-loaded. ' +
    'The Project Manager will become the new BIC owner.',

  // ── Field mapping (D-04: frozen at assembly time) ──────────────────────────
  mapSourceToDestination: (pursuit) => ({
    projectName: pursuit.projectName,
    clientName: pursuit.clientName,
    location: pursuit.location,
    awardedGMP: pursuit.finalBidAmount,
    projectType: pursuit.projectType,
    estimatingPursuitId: pursuit.id,
    bdScorecardId: pursuit.bdScorecardId,
    estimatingLeadId: pursuit.leadEstimatorId,
    keyContractTerms: pursuit.contractTermsSummary,
  }),

  // ── Document resolution (D-06: async; links only) ─────────────────────────
  resolveDocuments: async (pursuit) => {
    const docs = await DocumentApiRef.list({
      contextId: pursuit.id,
      contextType: 'estimating-pursuit',
    });
    return docs.map(
      (d): IHandoffDocument => ({
        documentId: d.id,
        fileName: d.fileName,
        sharepointUrl: d.sharepointUrl,
        category: d.category ?? 'Estimating Documents',
        fileSizeBytes: d.fileSizeBytes,
      }),
    );
  },

  // ── Recipient resolution ──────────────────────────────────────────────────
  resolveRecipient: (pursuit) => {
    if (!pursuit.assignedProjectManagerId) {
      return null;
    }
    return {
      userId: pursuit.assignedProjectManagerId,
      displayName: pursuit.assignedProjectManagerName ?? 'Project Manager',
      role: 'Project Manager',
    };
  },

  // ── Pre-flight validation (D-03: synchronous) ─────────────────────────────
  validateReadiness: (pursuit) => {
    if (pursuit.workflowStage !== 'award-confirmed') {
      return 'Award must be confirmed before handoff to Project Hub.';
    }
    if (!pursuit.finalBidAmount || pursuit.finalBidAmount <= 0) {
      return 'Final bid amount must be entered before handoff.';
    }
    return null;
  },

  // ── Acknowledgment handler (D-05: creates destination record) ─────────────
  onAcknowledged: async (pkg) => {
    // 1. Create the Project Hub record from the mapped seed data
    const project = await ProjectHubApiRef.createProject(
      pkg.destinationSeedData,
      pkg.handoffId,
    );

    // 2. Create a versioned-record snapshot tagged 'handoff' for audit trail
    await VersionApi.createSnapshot({
      recordType: 'estimating-pursuit',
      recordId: pkg.sourceRecordId,
      config: estimatingPursuitVersionConfig,
      snapshot: pkg.sourceSnapshot,
      tag: 'handoff',
      changeSummary: `Handoff ${pkg.handoffId} acknowledged \u2014 destination record ${project.id} created in project-hub`,
      createdBy: pkg.recipient,
    });

    return { destinationRecordId: project.id };
  },

  // ── Rejection handler (D-07: BIC return to sender) ────────────────────────
  onRejected: async (pkg) => {
    await EstimatingApiRef.returnToRevision(
      pkg.sourceRecordId,
      `Handoff to Project Hub rejected: ${pkg.rejectionReason}`,
    );
  },
};
