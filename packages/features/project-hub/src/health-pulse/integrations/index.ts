import { canEditHealthPulseMetric, canManageHealthPulseAdminConfig, canViewHealthPulseApproval } from './authAdapter.js';
import { projectHealthPulseToBicItem } from './bicNextMoveAdapter.js';
import { projectHealthPulseByComplexity } from './complexityAdapter.js';
import { projectHealthPulseToNotificationPayloads } from './notificationAdapter.js';
import { projectHealthPulseToCanvasTile } from './projectCanvasAdapter.js';
import { projectHealthPulseToTelemetryPayload } from './telemetryAdapter.js';
import {
  projectManualOverrideToVersionedProvenance,
  projectMetricFreshness,
  projectPolicyChangeLineage,
} from './versionedRecordAdapter.js';

export { projectHealthPulseToBicItem } from './bicNextMoveAdapter.js';
export type {
  IProjectHealthPulseBicProjection,
  IProjectHealthPulseBicProjectionInput,
} from './bicNextMoveAdapter.js';

export { projectHealthPulseToNotificationPayloads } from './notificationAdapter.js';
export type {
  IProjectHealthNotificationProjection,
  IProjectHealthNotificationProjectionInput,
} from './notificationAdapter.js';

export {
  canEditHealthPulseMetric,
  canManageHealthPulseAdminConfig,
  canViewHealthPulseApproval,
} from './authAdapter.js';
export type {
  IHealthPulseApprovalVisibilityInput,
  IHealthPulseAuthContext,
  IHealthPulseInlineEditGateInput,
} from './authAdapter.js';

export { projectHealthPulseByComplexity } from './complexityAdapter.js';
export type { IHealthPulseComplexityProjection } from './complexityAdapter.js';

export { projectHealthPulseToCanvasTile } from './projectCanvasAdapter.js';
export type {
  IProjectHealthPulseCanvasProjection,
  IProjectHealthPulseCanvasProjectionInput,
} from './projectCanvasAdapter.js';

export { projectHealthPulseToTelemetryPayload } from './telemetryAdapter.js';
export type { IHealthPulseTelemetryProjection } from './telemetryAdapter.js';

export {
  projectManualOverrideToVersionedProvenance,
  projectMetricFreshness,
  projectPolicyChangeLineage,
} from './versionedRecordAdapter.js';
export type {
  IHealthPulseFreshnessProjection,
  IHealthPulsePolicyLineageProjection,
  IHealthPulseVersionedProvenanceProjection,
} from './versionedRecordAdapter.js';

export interface IProjectHealthPulseReferenceIntegrations {
  readonly projectToBic: typeof projectHealthPulseToBicItem;
  readonly projectNotifications: typeof projectHealthPulseToNotificationPayloads;
  readonly canEditMetric: typeof canEditHealthPulseMetric;
  readonly canViewApproval: typeof canViewHealthPulseApproval;
  readonly canManageAdminConfig: typeof canManageHealthPulseAdminConfig;
  readonly projectByComplexity: typeof projectHealthPulseByComplexity;
  readonly projectToCanvas: typeof projectHealthPulseToCanvasTile;
  readonly projectTelemetry: typeof projectHealthPulseToTelemetryPayload;
  readonly projectOverrideProvenance: typeof projectManualOverrideToVersionedProvenance;
  readonly projectPolicyLineage: typeof projectPolicyChangeLineage;
  readonly projectFreshness: typeof projectMetricFreshness;
}

export const createProjectHealthPulseReferenceIntegrations =
  (): IProjectHealthPulseReferenceIntegrations => ({
    projectToBic: projectHealthPulseToBicItem,
    projectNotifications: projectHealthPulseToNotificationPayloads,
    canEditMetric: canEditHealthPulseMetric,
    canViewApproval: canViewHealthPulseApproval,
    canManageAdminConfig: canManageHealthPulseAdminConfig,
    projectByComplexity: projectHealthPulseByComplexity,
    projectToCanvas: projectHealthPulseToCanvasTile,
    projectTelemetry: projectHealthPulseToTelemetryPayload,
    projectOverrideProvenance: projectManualOverrideToVersionedProvenance,
    projectPolicyLineage: projectPolicyChangeLineage,
    projectFreshness: projectMetricFreshness,
  });

/**
 * SF21-T07 reference integration boundary.
 */
export const HEALTH_PULSE_INTEGRATIONS_SCOPE = 'health-pulse/integrations';
