import { projectStrategicIntelligenceToBicActions } from './bicNextMoveAdapter.js';
import { gateStrategicIntelligenceByComplexity } from './complexityAdapter.js';
import { projectStrategicIntelligenceVersionedSnapshot } from './versionedRecordAdapter.js';
import { projectStrategicIntelligenceRelatedItems } from './relatedItemsAdapter.js';
import { projectStrategicIntelligenceToCanvasPlacement } from './projectCanvasAdapter.js';
import { resolveStrategicIntelligenceNotifications } from './notificationAdapter.js';
import { projectStrategicIntelligenceAcknowledgment } from './acknowledgmentAdapter.js';
import { mapStrategicIntelligenceToHealthIndicator } from './healthIndicatorAdapter.js';
import { projectStrategicIntelligenceToScoreBenchmark } from './scoreBenchmarkAdapter.js';
import { projectStrategicIntelligenceToPostBidLearning } from './postBidLearningAdapter.js';

export { projectStrategicIntelligenceToBicActions } from './bicNextMoveAdapter.js';
export type {
  IStrategicIntelligenceBicOwnerAvatarProjection,
  IStrategicIntelligenceBicOwnershipAction,
} from './bicNextMoveAdapter.js';

export { gateStrategicIntelligenceByComplexity } from './complexityAdapter.js';
export type { IStrategicIntelligenceComplexityProjection } from './complexityAdapter.js';

export { projectStrategicIntelligenceVersionedSnapshot } from './versionedRecordAdapter.js';
export type { IStrategicIntelligenceVersionedProjection } from './versionedRecordAdapter.js';

export { projectStrategicIntelligenceRelatedItems } from './relatedItemsAdapter.js';
export type { IStrategicIntelligenceRelatedItemsProjection } from './relatedItemsAdapter.js';

export { projectStrategicIntelligenceToCanvasPlacement } from './projectCanvasAdapter.js';
export type {
  IStrategicIntelligenceCanvasProjection,
  IStrategicIntelligenceCanvasTask,
  StrategicIntelligenceCanvasTaskType,
} from './projectCanvasAdapter.js';

export { resolveStrategicIntelligenceNotifications } from './notificationAdapter.js';
export type { IBdStrategicIntelligenceNotificationProjection } from './notificationAdapter.js';

export { projectStrategicIntelligenceAcknowledgment } from './acknowledgmentAdapter.js';
export type { IStrategicIntelligenceAcknowledgmentProjection } from './acknowledgmentAdapter.js';

export { mapStrategicIntelligenceToHealthIndicator } from './healthIndicatorAdapter.js';
export type { IStrategicIntelligenceHealthProjection } from './healthIndicatorAdapter.js';

export { projectStrategicIntelligenceToScoreBenchmark } from './scoreBenchmarkAdapter.js';
export type { IStrategicIntelligenceScoreBenchmarkInteropProjection } from './scoreBenchmarkAdapter.js';

export { projectStrategicIntelligenceToPostBidLearning } from './postBidLearningAdapter.js';
export type { IStrategicIntelligenceLearningSignalProjection } from './postBidLearningAdapter.js';

export interface IStrategicIntelligenceReferenceIntegrations {
  readonly projectToBicActions: typeof projectStrategicIntelligenceToBicActions;
  readonly applyComplexityGating: typeof gateStrategicIntelligenceByComplexity;
  readonly createVersionedProjection: typeof projectStrategicIntelligenceVersionedSnapshot;
  readonly projectRelatedItems: typeof projectStrategicIntelligenceRelatedItems;
  readonly projectCanvasPlacement: typeof projectStrategicIntelligenceToCanvasPlacement;
  readonly resolveNotifications: typeof resolveStrategicIntelligenceNotifications;
  readonly projectAcknowledgment: typeof projectStrategicIntelligenceAcknowledgment;
  readonly mapToHealthIndicator: typeof mapStrategicIntelligenceToHealthIndicator;
  readonly projectScoreBenchmarkInterop: typeof projectStrategicIntelligenceToScoreBenchmark;
  readonly consumeLearningSignals: typeof projectStrategicIntelligenceToPostBidLearning;
}

export function createStrategicIntelligenceReferenceIntegrations(): IStrategicIntelligenceReferenceIntegrations {
  return {
    projectToBicActions: projectStrategicIntelligenceToBicActions,
    applyComplexityGating: gateStrategicIntelligenceByComplexity,
    createVersionedProjection: projectStrategicIntelligenceVersionedSnapshot,
    projectRelatedItems: projectStrategicIntelligenceRelatedItems,
    projectCanvasPlacement: projectStrategicIntelligenceToCanvasPlacement,
    resolveNotifications: resolveStrategicIntelligenceNotifications,
    projectAcknowledgment: projectStrategicIntelligenceAcknowledgment,
    mapToHealthIndicator: mapStrategicIntelligenceToHealthIndicator,
    projectScoreBenchmarkInterop: projectStrategicIntelligenceToScoreBenchmark,
    consumeLearningSignals: projectStrategicIntelligenceToPostBidLearning,
  };
}
