import type { IProjectHealthPulse, IProjectHealthTelemetry } from '../types/index.js';
import { hasModerateOrHigherCompoundRisk, toStableProjectionId } from './helpers.js';

export interface IHealthPulseTelemetryProjection {
  eventType: 'project-health-pulse.snapshot';
  eventId: string;
  projectId: string;
  computedAt: string;
  overallStatus: IProjectHealthPulse['overallStatus'];
  overallConfidenceTier: IProjectHealthPulse['overallConfidence']['tier'];
  confidenceReasons: string[];
  triageBucket: IProjectHealthPulse['triage']['bucket'];
  topActionReasonCode: string | null;
  hasCompoundRiskEscalation: boolean;
  metrics: IProjectHealthTelemetry;
}

export const projectHealthPulseToTelemetryPayload = (
  pulse: IProjectHealthPulse,
  telemetry: IProjectHealthTelemetry
): IHealthPulseTelemetryProjection => {
  return {
    eventType: 'project-health-pulse.snapshot',
    eventId: toStableProjectionId('project-health-pulse-telemetry', pulse.projectId, pulse.computedAt),
    projectId: pulse.projectId,
    computedAt: pulse.computedAt,
    overallStatus: pulse.overallStatus,
    overallConfidenceTier: pulse.overallConfidence.tier,
    confidenceReasons: pulse.overallConfidence.reasons,
    triageBucket: pulse.triage.bucket,
    topActionReasonCode: pulse.topRecommendedAction?.reasonCode ?? null,
    hasCompoundRiskEscalation: hasModerateOrHigherCompoundRisk(pulse.compoundRisks),
    metrics: telemetry,
  };
};
