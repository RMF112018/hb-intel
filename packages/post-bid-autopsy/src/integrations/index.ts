import { projectAutopsyToBicActions } from './bicNextMoveAdapter.js';
import { projectAutopsyToHealthIndicatorTelemetry } from './healthIndicatorAdapter.js';
import {
  createAutopsyIntegrationDedupeKey,
  createAutopsyPublishEnvelope,
  createAutopsyReasonCodes,
  createAutopsyRedactionMode,
  createAutopsyWizardSections,
  isAutopsyPublishEligible,
  redactAutopsyText,
} from './helpers.js';
import { projectAutopsyToNotificationPayloads } from './notificationAdapter.js';
import { projectAutopsyToCanvasTasks } from './projectCanvasAdapter.js';
import { projectAutopsyToRelatedItems } from './relatedItemsAdapter.js';
import { projectAutopsyToScoreBenchmarkSignal } from './scoreBenchmarkAdapter.js';
import { createAutopsyStepWizardConfig } from './stepWizardAdapter.js';
import { projectAutopsyToStrategicIntelligenceSeed } from './strategicIntelligenceAdapter.js';

export { projectAutopsyToBicActions, projectAutopsySectionToBicAction } from './bicNextMoveAdapter.js';
export type { IAutopsyBicActionProjection } from './bicNextMoveAdapter.js';

export { projectAutopsyToCanvasTasks } from './projectCanvasAdapter.js';
export type { AutopsyCanvasTaskType, IAutopsyCanvasTaskProjection } from './projectCanvasAdapter.js';

export { projectAutopsyToRelatedItems } from './relatedItemsAdapter.js';
export type { IAutopsyRelatedItemProjection } from './relatedItemsAdapter.js';

export { projectAutopsyToNotificationPayloads } from './notificationAdapter.js';
export type { IAutopsyNotificationProjection } from './notificationAdapter.js';

export { projectAutopsyToStrategicIntelligenceSeed } from './strategicIntelligenceAdapter.js';
export type { IAutopsyStrategicIntelligenceSeedProjection } from './strategicIntelligenceAdapter.js';

export { projectAutopsyToScoreBenchmarkSignal } from './scoreBenchmarkAdapter.js';
export type { IAutopsyScoreBenchmarkProjection } from './scoreBenchmarkAdapter.js';

export { projectAutopsyToHealthIndicatorTelemetry } from './healthIndicatorAdapter.js';
export type { IAutopsyHealthIndicatorTelemetryProjection } from './healthIndicatorAdapter.js';

export { createAutopsyStepWizardConfig } from './stepWizardAdapter.js';
export type { IAutopsyWizardModel, IAutopsyStepWizardConfig, IAutopsyStepWizardStep } from './stepWizardAdapter.js';

export {
  createAutopsyIntegrationDedupeKey,
  createAutopsyPublishEnvelope,
  createAutopsyReasonCodes,
  createAutopsyRedactionMode,
  createAutopsyWizardSections,
  isAutopsyPublishEligible,
  redactAutopsyText,
} from './helpers.js';
export type {
  AutopsyIntegrationRedactionMode,
  IAutopsyPublishEnvelope,
  IAutopsyWizardSectionProjection,
} from './helpers.js';

export interface IPostBidAutopsyReferenceIntegrations {
  readonly projectToBicActions: typeof projectAutopsyToBicActions;
  readonly projectToCanvasTasks: typeof projectAutopsyToCanvasTasks;
  readonly projectRelatedItems: typeof projectAutopsyToRelatedItems;
  readonly resolveNotifications: typeof projectAutopsyToNotificationPayloads;
  readonly projectStrategicIntelligenceSeed: typeof projectAutopsyToStrategicIntelligenceSeed;
  readonly projectScoreBenchmarkSignal: typeof projectAutopsyToScoreBenchmarkSignal;
  readonly projectHealthIndicatorTelemetry: typeof projectAutopsyToHealthIndicatorTelemetry;
  readonly createWizardConfig: typeof createAutopsyStepWizardConfig;
}

export const createPostBidAutopsyReferenceIntegrations =
  (): IPostBidAutopsyReferenceIntegrations => ({
    projectToBicActions: projectAutopsyToBicActions,
    projectToCanvasTasks: projectAutopsyToCanvasTasks,
    projectRelatedItems: projectAutopsyToRelatedItems,
    resolveNotifications: projectAutopsyToNotificationPayloads,
    projectStrategicIntelligenceSeed: projectAutopsyToStrategicIntelligenceSeed,
    projectScoreBenchmarkSignal: projectAutopsyToScoreBenchmarkSignal,
    projectHealthIndicatorTelemetry: projectAutopsyToHealthIndicatorTelemetry,
    createWizardConfig: createAutopsyStepWizardConfig,
  });

export const POST_BID_AUTOPSY_INTEGRATIONS_SCOPE = 'post-bid-autopsy/integrations';
