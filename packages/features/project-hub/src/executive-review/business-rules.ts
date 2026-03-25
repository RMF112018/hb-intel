/**
 * Stage 8.4 executive-review business rules.
 * Push-to-team enforcement per P3-D3 S13 and P3-A2 S3.4.
 */

import type { ClosureLoopState, EscalationTriggerCase, PushAssigneeDefault, PushPriority, ReviewCapability } from './enums.js';
import type { ApplicationLane } from '../subcontract-readiness/lanes-permissions/enums.js';
import type { IEscalationDeepLink, ILaneDepthEnforcementResult, IPushProvenanceContract } from './types.js';
import { LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS, PUSH_CLOSURE_LOOP_TRANSITIONS, REVIEW_LANE_CAPABILITY_MATRIX } from './constants.js';

export const canPerPushToTeam = (): true => true;

export const canWorkQueueAutoCloseReviewArtifact = (): false => false;

export const isReviewArtifactConvertedByPush = (): false => false;

export const isPushItemSeparateFromReviewThread = (): true => true;

export const getDefaultPushAssignee = (): PushAssigneeDefault => 'PROJECT_MANAGER';

export const getDefaultPushPriority = (): PushPriority => 'SOON';

export const isClosureLoopRequired = (): true => true;

export const canTeamResponseAutoCloseReview = (): false => false;

export const isValidClosureLoopTransition = (from: ClosureLoopState, to: ClosureLoopState): boolean =>
  PUSH_CLOSURE_LOOP_TRANSITIONS.some((t) => t.from === from && t.to === to);

export const requiresPerConfirmationForClosure = (): true => true;

export const isPushProvenanceComplete = (provenance: IPushProvenanceContract): boolean =>
  provenance.originRole === 'PORTFOLIO_EXECUTIVE_REVIEWER' &&
  provenance.pushTimestamp !== '' &&
  provenance.isSeparateArtifact === true &&
  provenance.isReviewArtifactConverted === false;

export const getWorkItemClassForPush = (): 'queued-follow-up' => 'queued-follow-up';

export const getWorkItemSourceForPush = (): 'module' => 'module';

export const getOriginatingModuleForPush = (): 'executive-review' => 'executive-review';

// -- Stage 8.5 Lane Depth Enforcement Rules ---------------------------------------

export const isCapabilityAvailableInLane = (
  capability: ReviewCapability,
  lane: ApplicationLane,
): boolean => {
  const entry = REVIEW_LANE_CAPABILITY_MATRIX.find((c) => c.capability === capability);
  if (!entry) return false;
  if (lane === 'PWA') return true; // PWA always supports all capabilities
  return entry.spfxDepth === 'SPFX_BROAD';
};

export const requiresEscalationToPWA = (capability: ReviewCapability): boolean => {
  const entry = REVIEW_LANE_CAPABILITY_MATRIX.find((c) => c.capability === capability);
  return entry !== undefined && entry.requiresEscalation;
};

export const isInLaneForSpfx = (capability: ReviewCapability): boolean =>
  !requiresEscalationToPWA(capability);

export const getEscalationDeepLinkTemplate = (triggerCase: EscalationTriggerCase): string | null => {
  const def = LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS.find((d) => d.triggerCase === triggerCase);
  return def ? def.deepLinkTemplate : null;
};

export const buildEscalationDeepLink = (
  triggerCase: EscalationTriggerCase,
  projectId: string,
  reviewArtifactId: string | null,
  returnToSpfxSurface: string | null,
): IEscalationDeepLink => {
  const def = LANE_DEPTH_ESCALATION_TRIGGER_DEFINITIONS.find((d) => d.triggerCase === triggerCase);
  if (!def) {
    return { projectId, reviewArtifactId, view: 'THREAD', returnToSpfxSurface, resolvedUrl: '', contextPreserved: false };
  }
  let url = def.deepLinkTemplate.replace('{projectId}', projectId);
  if (reviewArtifactId) {
    url = url.replace('{reviewArtifactId}', reviewArtifactId);
  }
  if (returnToSpfxSurface) {
    url += `&returnTo=${encodeURIComponent(returnToSpfxSurface)}`;
  }
  return {
    projectId,
    reviewArtifactId,
    view: def.deepLinkView,
    returnToSpfxSurface,
    resolvedUrl: url,
    contextPreserved: true,
  };
};

export const isContextPreservationRequired = (): true => true;

export const enforceLaneDepth = (
  capability: ReviewCapability,
  lane: ApplicationLane,
): ILaneDepthEnforcementResult => ({
  capability,
  currentLane: lane,
  isAllowedInLane: isCapabilityAvailableInLane(capability, lane),
  escalationRequired: lane === 'SPFX' && requiresEscalationToPWA(capability),
});

export const isPwaFullDepthForAllCapabilities = (): true => true;

export const isSpfxBroadForCommonOperations = (): true => true;

export const isNonPerUserAffectedByLaneDepth = (): false => false;
