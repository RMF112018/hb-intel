import type { IBicOwner } from '@hbc/bic-next-move';

import type {
  IHealthPulseAdminConfig,
  IHealthMetric,
  IManualOverrideMetadata,
  IProjectHealthPulse,
} from '../types/index.js';
import { toStableProjectionId } from './helpers.js';

export interface IHealthPulseVersionedProvenanceProjection {
  metadata: IHealthPulseVersionedMetadataProjection;
  reasonCode: string;
  lineageRef: string;
}

export interface IHealthPulseVersionedMetadataProjection {
  snapshotId: string;
  version: number;
  createdAt: string;
  createdBy: IBicOwner;
  changeSummary: string;
  tag: 'submitted' | 'approved';
}

export interface IHealthPulsePolicyLineageProjection {
  lineageRef: string;
  changedPaths: string[];
  changedAt: string;
}

export interface IHealthPulseFreshnessProjection {
  metricKey: string;
  source: 'manual-entry' | 'integration-feed' | 'unknown';
  freshness: 'fresh' | 'stale' | 'missing';
  ageDays: number | null;
}

const toOwner = (enteredBy: string): IBicOwner => ({
  userId: enteredBy,
  displayName: enteredBy,
  role: 'Project Health Override Editor',
});

const toVersionMetadata = (
  projectId: string,
  reasonCode: string,
  override: IManualOverrideMetadata
): IHealthPulseVersionedMetadataProjection => ({
  snapshotId: toStableProjectionId('project-health-pulse-override', projectId, `${override.enteredAt}:${reasonCode}`),
  version: 1,
  createdAt: override.enteredAt,
  createdBy: toOwner(override.enteredBy),
  changeSummary: override.reason,
  tag: override.approvedAt ? 'approved' : 'submitted',
});

export const projectManualOverrideToVersionedProvenance = (
  pulse: IProjectHealthPulse,
  metric: IHealthMetric,
  reasonCode: string
): IHealthPulseVersionedProvenanceProjection | null => {
  if (!metric.manualOverride) {
    return null;
  }

  return {
    metadata: toVersionMetadata(pulse.projectId, reasonCode, metric.manualOverride),
    reasonCode,
    lineageRef: toStableProjectionId('project-health-pulse-lineage', pulse.projectId, metric.key),
  };
};

export const projectPolicyChangeLineage = (
  projectId: string,
  previousConfig: IHealthPulseAdminConfig,
  nextConfig: IHealthPulseAdminConfig,
  changedAt: string
): IHealthPulsePolicyLineageProjection => {
  const changedPaths: string[] = [];

  if (JSON.stringify(previousConfig.weights) !== JSON.stringify(nextConfig.weights)) {
    changedPaths.push('weights');
  }

  if (previousConfig.stalenessThresholdDays !== nextConfig.stalenessThresholdDays) {
    changedPaths.push('stalenessThresholdDays');
  }

  if (
    JSON.stringify(previousConfig.metricStalenessOverrides) !==
    JSON.stringify(nextConfig.metricStalenessOverrides)
  ) {
    changedPaths.push('metricStalenessOverrides');
  }

  if (
    JSON.stringify(previousConfig.manualEntryGovernance) !==
    JSON.stringify(nextConfig.manualEntryGovernance)
  ) {
    changedPaths.push('manualEntryGovernance');
  }

  if (
    JSON.stringify(previousConfig.officeHealthSuppression) !==
    JSON.stringify(nextConfig.officeHealthSuppression)
  ) {
    changedPaths.push('officeHealthSuppression');
  }

  if (
    JSON.stringify(previousConfig.portfolioTriageDefaults) !==
    JSON.stringify(nextConfig.portfolioTriageDefaults)
  ) {
    changedPaths.push('portfolioTriageDefaults');
  }

  return {
    lineageRef: toStableProjectionId('project-health-pulse-policy-lineage', projectId),
    changedPaths,
    changedAt,
  };
};

export const projectMetricFreshness = (
  metric: IHealthMetric,
  stalenessThresholdDays: number,
  nowIso: string
): IHealthPulseFreshnessProjection => {
  if (metric.value === null) {
    return {
      metricKey: metric.key,
      source: metric.isManualEntry ? 'manual-entry' : 'unknown',
      freshness: 'missing',
      ageDays: null,
    };
  }

  const lastUpdated = metric.lastUpdatedAt ? Date.parse(metric.lastUpdatedAt) : Number.NaN;
  const now = Date.parse(nowIso);
  const ageDays =
    Number.isFinite(lastUpdated) && Number.isFinite(now)
      ? Math.max(0, Math.floor((now - lastUpdated) / (24 * 60 * 60 * 1000)))
      : null;

  const stale = metric.isStale || (ageDays !== null && ageDays > stalenessThresholdDays);
  return {
    metricKey: metric.key,
    source: metric.isManualEntry ? 'manual-entry' : 'integration-feed',
    freshness: stale ? 'stale' : 'fresh',
    ageDays,
  };
};
