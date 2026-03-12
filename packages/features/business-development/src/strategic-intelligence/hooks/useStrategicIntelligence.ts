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

export interface UseStrategicIntelligenceInput extends UseStrategicIntelligenceStateInput {
  actorUserId: string;
  roleContext?: string;
  assignmentTileKey?: string;
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

  return {
    view,
    bicOwnerAvatars,
    canvasAssignments,
    primitive: {
      state,
      approvalQueue,
      handoff,
      suggestions,
    },
  };
};
