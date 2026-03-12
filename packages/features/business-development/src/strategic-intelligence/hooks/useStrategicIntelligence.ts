import type { ComplexityTier } from '@hbc/complexity';
import type { IBicOwner } from '@hbc/bic-next-move';
import type { ICanvasTilePlacement } from '@hbc/project-canvas';
import {
  useHandoffReviewWorkflow,
  useStrategicIntelligenceApprovalQueue,
  useStrategicIntelligenceState,
  useSuggestedIntelligence,
  type UseStrategicIntelligenceStateInput,
} from '@hbc/strategic-intelligence';
import {
  mapStrategicIntelligenceStateToBdView,
  type BdStrategicIntelligenceViewModel,
} from '../adapters/index.js';
import {
  createStrategicIntelligenceReferenceIntegrations,
  type IBdStrategicIntelligenceNotificationProjection,
  type IStrategicIntelligenceAcknowledgmentProjection,
  type IStrategicIntelligenceBicOwnershipAction,
  type IStrategicIntelligenceCanvasProjection,
  type IStrategicIntelligenceComplexityProjection,
  type IStrategicIntelligenceHealthProjection,
  type IStrategicIntelligenceLearningSignalProjection,
  type IStrategicIntelligenceRelatedItemsProjection,
  type IStrategicIntelligenceScoreBenchmarkInteropProjection,
  type IStrategicIntelligenceVersionedProjection,
} from '../integrations/index.js';

export interface UseStrategicIntelligenceInput extends UseStrategicIntelligenceStateInput {
  actorUserId: string;
  roleContext?: string;
  assignmentTileKey?: string;
  complexityTier?: ComplexityTier;
  basePath?: string;
}

export interface BdStrategicIntelligenceBicOwnerAvatarProjection {
  commitmentId: string;
  owner: IBicOwner;
}

export interface BdStrategicIntelligenceCanvasAssignmentProjection {
  commitmentId: string;
  assignment: Pick<ICanvasTilePlacement, 'tileKey'> & {
    projectId: string;
    role: string;
  };
}

export interface UseStrategicIntelligenceResult {
  view: BdStrategicIntelligenceViewModel | null;
  bicOwnerAvatars: BdStrategicIntelligenceBicOwnerAvatarProjection[];
  canvasAssignments: BdStrategicIntelligenceCanvasAssignmentProjection[];
  queueSummary: {
    pendingCount: number;
    staleEntryIds: string[];
    openConflictIds: string[];
  };
  formDefaults: {
    metadata: {
      client?: string;
      ownerOrganization?: string;
      projectType?: string;
      sector?: string;
      deliveryMethod?: string;
      geography?: string;
      lifecyclePhase?: string;
      riskCategory?: string;
    };
  };
  handoffSummary: {
    snapshotAligned: boolean;
    unresolvedCommitmentCount: number;
    unacknowledgedParticipantCount: number;
  };
  integrations: {
    bicActions: IStrategicIntelligenceBicOwnershipAction[];
    complexity: IStrategicIntelligenceComplexityProjection;
    versioned: IStrategicIntelligenceVersionedProjection | null;
    relatedItems: IStrategicIntelligenceRelatedItemsProjection;
    projectCanvas: IStrategicIntelligenceCanvasProjection;
    notifications: IBdStrategicIntelligenceNotificationProjection[];
    acknowledgment: IStrategicIntelligenceAcknowledgmentProjection | null;
    health: IStrategicIntelligenceHealthProjection | null;
    scoreBenchmark: IStrategicIntelligenceScoreBenchmarkInteropProjection | null;
    postBidLearning: IStrategicIntelligenceLearningSignalProjection;
    searchIndex: {
      indexableEntryIds: string[];
      excludedEntryIds: string[];
    };
  };
  primitive: {
    state: ReturnType<typeof useStrategicIntelligenceState>;
    approvalQueue: ReturnType<typeof useStrategicIntelligenceApprovalQueue>;
    handoff: ReturnType<typeof useHandoffReviewWorkflow>;
    suggestions: ReturnType<typeof useSuggestedIntelligence>;
  };
}

const toOwnerAvatar = (
  responsibleRole: string,
  fallbackRole?: string
): IBicOwner => ({
  userId: `${responsibleRole.toLowerCase().replace(/\s+/g, '-')}-owner`,
  displayName: responsibleRole,
  role: fallbackRole ?? responsibleRole,
});

export const useStrategicIntelligence = (
  input: UseStrategicIntelligenceInput
): UseStrategicIntelligenceResult => {
  const integrationAdapters = createStrategicIntelligenceReferenceIntegrations();
  const basePath = input.basePath ?? '/bd/strategic-intelligence';
  const complexityTier = input.complexityTier ?? 'standard';

  const state = useStrategicIntelligenceState({
    projectId: input.projectId,
    visibilityContext: input.visibilityContext,
    scorecardId: input.scorecardId,
  });

  const approvalQueue = useStrategicIntelligenceApprovalQueue({
    projectId: input.projectId,
    scorecardId: input.scorecardId,
    actorUserId: input.actorUserId,
  });

  const handoff = useHandoffReviewWorkflow({
    projectId: input.projectId,
    scorecardId: input.scorecardId,
    actorUserId: input.actorUserId,
  });

  const suggestions = useSuggestedIntelligence({
    projectId: input.projectId,
    scorecardId: input.scorecardId,
  });

  if (!state.state) {
    return {
      view: null,
      bicOwnerAvatars: [],
      canvasAssignments: [],
      queueSummary: {
        pendingCount: 0,
        staleEntryIds: [],
        openConflictIds: [],
      },
      formDefaults: {
        metadata: {},
      },
      handoffSummary: {
        snapshotAligned: false,
        unresolvedCommitmentCount: 0,
        unacknowledgedParticipantCount: 0,
      },
      integrations: {
        bicActions: [],
        complexity: integrationAdapters.applyComplexityGating(complexityTier),
        versioned: null,
        relatedItems: {
          entryLinks: [],
        },
        projectCanvas: {
          tileKey: 'bic-my-items',
          tasks: [],
        },
        notifications: [],
        acknowledgment: null,
        health: null,
        scoreBenchmark: null,
        postBidLearning: {
          consumedCount: 0,
          approvedSignalCount: 0,
          signalIds: [],
        },
        searchIndex: {
          indexableEntryIds: [],
          excludedEntryIds: [],
        },
      },
      primitive: {
        state,
        approvalQueue,
        handoff,
        suggestions,
      },
    };
  }

  const view = mapStrategicIntelligenceStateToBdView(state.state);
  const bicOwnerAvatars = state.state.commitmentRegister.map((commitment) => ({
    commitmentId: commitment.commitmentId,
    owner: toOwnerAvatar(commitment.responsibleRole, input.roleContext),
  }));

  const canvasAssignments = state.state.commitmentRegister.map((commitment) => ({
    commitmentId: commitment.commitmentId,
    assignment: {
      tileKey: input.assignmentTileKey ?? 'bd-strategic-intelligence',
      projectId: input.projectId,
      role: commitment.responsibleRole,
    },
  }));
  const fallbackMetadata = state.state.livingEntries[0]?.metadata ?? {};
  const openConflictIds = state.state.livingEntries
    .flatMap((entry) => entry.conflicts)
    .filter((conflict) => conflict.resolutionStatus === 'open')
    .map((conflict) => conflict.conflictId);
  const unacknowledgedParticipantCount =
    handoff.review?.participants.filter((participant) => participant.acknowledgedAt === null).length ?? 0;

  return {
    view,
    bicOwnerAvatars,
    canvasAssignments,
    queueSummary: {
      pendingCount: approvalQueue.queue.filter((item) => item.approvalStatus === 'pending').length,
      staleEntryIds: state.state.livingEntries
        .filter((entry) => entry.trust.isStale)
        .map((entry) => entry.entryId),
      openConflictIds,
    },
    formDefaults: {
      metadata: {
        client: fallbackMetadata.client,
        ownerOrganization: fallbackMetadata.ownerOrganization,
        projectType: fallbackMetadata.projectType,
        sector: fallbackMetadata.sector,
        deliveryMethod: fallbackMetadata.deliveryMethod,
        geography: fallbackMetadata.geography,
        lifecyclePhase: fallbackMetadata.lifecyclePhase,
        riskCategory: fallbackMetadata.riskCategory,
      },
    },
    handoffSummary: {
      snapshotAligned: handoff.snapshotAligned,
      unresolvedCommitmentCount: handoff.completionGate.unresolvedCommitments.length,
      unacknowledgedParticipantCount,
    },
    integrations: {
      bicActions: integrationAdapters.projectToBicActions(state.state.livingEntries, bicOwnerAvatars),
      complexity: integrationAdapters.applyComplexityGating(complexityTier),
      versioned: integrationAdapters.createVersionedProjection(state.state),
      relatedItems: integrationAdapters.projectRelatedItems(
        state.state.livingEntries,
        state.policy.redactedProjections,
        basePath
      ),
      projectCanvas: integrationAdapters.projectCanvasPlacement(
        input.projectId,
        basePath,
        state.state.livingEntries,
        state.state.commitmentRegister
      ),
      notifications: integrationAdapters.resolveNotifications(
        state.state.livingEntries,
        state.state.approvalQueue
      ),
      acknowledgment: integrationAdapters.projectAcknowledgment(state.state.handoffReview),
      health: integrationAdapters.mapToHealthIndicator(state.state),
      scoreBenchmark: integrationAdapters.projectScoreBenchmarkInterop(state.state),
      postBidLearning: integrationAdapters.consumeLearningSignals(state.state),
      searchIndex: {
        indexableEntryIds: state.policy.indexableEntryIds,
        excludedEntryIds: state.policy.excludedEntryIds,
      },
    },
    primitive: {
      state,
      approvalQueue,
      handoff,
      suggestions,
    },
  };
};
