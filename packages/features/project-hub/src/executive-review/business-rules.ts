/**
 * Stage 8.4 executive-review business rules.
 * Push-to-team enforcement per P3-D3 S13 and P3-A2 S3.4.
 */

import type { ClosureLoopState, PushAssigneeDefault, PushPriority } from './enums.js';
import type { IPushProvenanceContract } from './types.js';
import { PUSH_CLOSURE_LOOP_TRANSITIONS } from './constants.js';

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
