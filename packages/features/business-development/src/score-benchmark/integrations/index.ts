/**
 * SF19-T07 reference integrations barrel.
 *
 * Exposes deterministic adapter projections for Tier-1 integration boundaries
 * without introducing runtime side effects in the feature package.
 */
import { projectScoreBenchmarkToBicActions } from './bicNextMoveAdapter.js';
import { gateScoreBenchmarkByComplexity } from './complexityAdapter.js';
import { projectScoreBenchmarkVersionedSnapshot } from './versionedRecordAdapter.js';
import { projectScoreBenchmarkRelatedItems } from './relatedItemsAdapter.js';
import { projectScoreBenchmarkToCanvasPlacement } from './projectCanvasAdapter.js';
import { resolveScoreBenchmarkNotifications } from './notificationAdapter.js';
import { mapScoreBenchmarkToHealthIndicator } from './healthIndicatorAdapter.js';
import { projectInlineHbiActions } from './aiAssistAdapter.js';
import { projectSf22LearningSignals } from './postBidLearningAdapter.js';

export { projectScoreBenchmarkToBicActions } from './bicNextMoveAdapter.js';
export type { IBdBicOwnershipAction } from './bicNextMoveAdapter.js';

export { gateScoreBenchmarkByComplexity } from './complexityAdapter.js';
export type { IScoreBenchmarkComplexityProjection } from './complexityAdapter.js';

export { projectScoreBenchmarkVersionedSnapshot } from './versionedRecordAdapter.js';
export type { IScoreBenchmarkVersionedProjection } from './versionedRecordAdapter.js';

export { projectScoreBenchmarkRelatedItems } from './relatedItemsAdapter.js';
export type { IScoreBenchmarkRelatedItemsProjection } from './relatedItemsAdapter.js';

export { projectScoreBenchmarkToCanvasPlacement } from './projectCanvasAdapter.js';
export type { IScoreBenchmarkCanvasPlacement } from './projectCanvasAdapter.js';

export { resolveScoreBenchmarkNotifications } from './notificationAdapter.js';
export type { IBdScoreBenchmarkNotificationProjection } from './notificationAdapter.js';

export { mapScoreBenchmarkToHealthIndicator } from './healthIndicatorAdapter.js';
export type { IScoreBenchmarkHealthProjection } from './healthIndicatorAdapter.js';

export { projectInlineHbiActions } from './aiAssistAdapter.js';
export type { IHbiActionProjection } from './aiAssistAdapter.js';

export { projectSf22LearningSignals } from './postBidLearningAdapter.js';
export type { IScoreBenchmarkLearningSignalProjection } from './postBidLearningAdapter.js';

export interface IScoreBenchmarkReferenceIntegrations {
  readonly projectToBicActions: typeof projectScoreBenchmarkToBicActions;
  readonly applyComplexityGating: typeof gateScoreBenchmarkByComplexity;
  readonly createVersionedProjection: typeof projectScoreBenchmarkVersionedSnapshot;
  readonly projectRelatedItems: typeof projectScoreBenchmarkRelatedItems;
  readonly projectCanvasPlacement: typeof projectScoreBenchmarkToCanvasPlacement;
  readonly resolveNotifications: typeof resolveScoreBenchmarkNotifications;
  readonly mapToHealthIndicator: typeof mapScoreBenchmarkToHealthIndicator;
  readonly projectHbiActions: typeof projectInlineHbiActions;
  readonly consumeLearningSignals: typeof projectSf22LearningSignals;
}

export function createScoreBenchmarkReferenceIntegrations(): IScoreBenchmarkReferenceIntegrations {
  return {
    projectToBicActions: projectScoreBenchmarkToBicActions,
    applyComplexityGating: gateScoreBenchmarkByComplexity,
    createVersionedProjection: projectScoreBenchmarkVersionedSnapshot,
    projectRelatedItems: projectScoreBenchmarkRelatedItems,
    projectCanvasPlacement: projectScoreBenchmarkToCanvasPlacement,
    resolveNotifications: resolveScoreBenchmarkNotifications,
    mapToHealthIndicator: mapScoreBenchmarkToHealthIndicator,
    projectHbiActions: projectInlineHbiActions,
    consumeLearningSignals: projectSf22LearningSignals,
  };
}
