// ─────────────────────────────────────────────────────────────────────────────
// SF08-T07 — P0 Reference Implementation: BD → Estimating Handoff Config
//
// Route: BD Go/No-Go Scorecard (Won) → Estimating Active Pursuit
// Trigger: Director approval of Go decision
// Pre-flight: workflowStage must be 'director-approved';
//             all departmental sections complete
//
// This config lives in examples/ because the consuming packages
// (business-development, estimating) are Phase 4/5 scope.
// ─────────────────────────────────────────────────────────────────────────────

import type { IHandoffConfig, IHandoffDocument } from '../src/types';
import type { IVersionedRecordConfig } from '@hbc/versioned-record';
import { VersionApi } from '@hbc/versioned-record';
import type { IGoNoGoScorecardRef, IEstimatingPursuitRef } from './reference-types';
import { DocumentApiRef, EstimatingApiRef, ScorecardApiRef } from './reference-apis';

const bdScorecardVersionConfig: IVersionedRecordConfig<IGoNoGoScorecardRef> = {
  recordType: 'bd-scorecard',
  triggers: ['on-handoff'],
  getStakeholders: () => [],
};

export const bdToEstimatingHandoffConfig: IHandoffConfig<
  IGoNoGoScorecardRef,
  IEstimatingPursuitRef
> = {
  sourceModule: 'business-development',
  sourceRecordType: 'bd-scorecard',
  destinationModule: 'estimating',
  destinationRecordType: 'estimating-pursuit',
  routeLabel: 'BD Win \u2192 Estimating Pursuit',
  acknowledgeDescription:
    'An Estimating Pursuit will be created and pre-populated with the project data below. ' +
    'The Estimating Coordinator will become the new BIC owner.',

  // ── Field mapping (D-04: frozen at assembly time) ──────────────────────────
  mapSourceToDestination: (scorecard) => ({
    projectName: scorecard.projectName,
    clientName: scorecard.ownerName,
    location: scorecard.projectLocation,
    estimatedGMP: scorecard.estimatedProjectValue,
    bidDueDate: scorecard.bidDueDate,
    projectType: scorecard.projectType,
    bdScorecardId: scorecard.id,
    bdHeritageNotes: scorecard.strategicIntelligenceSummary,
    keyOwnerContactName: scorecard.keyOwnerContactName,
    keyOwnerContactEmail: scorecard.keyOwnerContactEmail,
  }),

  // ── Document resolution (D-06: async; links only) ─────────────────────────
  resolveDocuments: async (scorecard) => {
    const docs = await DocumentApiRef.list({
      contextId: scorecard.id,
      contextType: 'bd-scorecard',
    });
    return docs.map(
      (d): IHandoffDocument => ({
        documentId: d.id,
        fileName: d.fileName,
        sharepointUrl: d.sharepointUrl,
        category: d.category ?? 'General',
        fileSizeBytes: d.fileSizeBytes,
      }),
    );
  },

  // ── Recipient resolution ──────────────────────────────────────────────────
  resolveRecipient: (scorecard) => {
    if (!scorecard.estimatingCoordinatorId || !scorecard.estimatingCoordinatorName) {
      return null;
    }
    return {
      userId: scorecard.estimatingCoordinatorId,
      displayName: scorecard.estimatingCoordinatorName,
      role: 'Estimating Coordinator',
    };
  },

  // ── Pre-flight validation (D-03: synchronous) ─────────────────────────────
  validateReadiness: (scorecard) => {
    if (scorecard.workflowStage !== 'director-approved') {
      return 'Scorecard must be approved by the Director of Preconstruction before handoff.';
    }
    if ((scorecard.incompleteDepartmentalSections?.length ?? 0) > 0) {
      return (
        'All departmental sections must be complete. ' +
        `Incomplete: ${scorecard.incompleteDepartmentalSections.join(', ')}.`
      );
    }
    return null;
  },

  // ── Acknowledgment handler (D-05: creates destination record) ─────────────
  onAcknowledged: async (pkg) => {
    // 1. Create the Estimating pursuit from the mapped seed data
    const pursuit = await EstimatingApiRef.createPursuit(
      pkg.destinationSeedData,
      pkg.handoffId,
    );

    // 2. Create a versioned-record snapshot tagged 'handoff' for audit trail
    await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: pkg.sourceRecordId,
      config: bdScorecardVersionConfig,
      snapshot: pkg.sourceSnapshot,
      tag: 'handoff',
      changeSummary: `Handoff ${pkg.handoffId} acknowledged \u2014 destination record ${pursuit.id} created in ${pkg.destinationModule}`,
      createdBy: pkg.recipient,
    });

    return { destinationRecordId: pursuit.id };
  },

  // ── Rejection handler (D-07: BIC return to sender) ────────────────────────
  onRejected: async (pkg) => {
    await ScorecardApiRef.returnToRevision(
      pkg.sourceRecordId,
      `Handoff rejected: ${pkg.rejectionReason}`,
    );
  },
};
