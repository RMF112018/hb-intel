/**
 * SF18-T06 readiness profile configuration resolution.
 *
 * Canonical config resolution runtime is owned by `@hbc/health-indicator` and
 * consumed here through a deterministic adapter wrapper for SF18 compatibility.
 *
 * @design D-SF18-T06, D-SF18-T03, D-SF18-T02
 */
import {
  resolveHealthIndicatorProfileConfig,
  type IHealthIndicatorAdminOverride,
  type IHealthIndicatorCriterionOverride,
  type IHealthIndicatorResolvedConfig,
} from '@hbc/health-indicator';
import { TELEMETRY_KEYS } from '../../constants/index.js';
import type {
  IEstimatingBidReadinessProfile,
  IReadinessGovernanceMetadata,
  VersionedRecord,
} from '../../types/index.js';
import { estimatingBidReadinessProfile } from './estimatingBidReadinessProfile.js';

export interface ICriterionOverride extends IHealthIndicatorCriterionOverride {
  readonly criterionId: string;
}

export interface IEstimatingBidReadinessAdminOverride extends IHealthIndicatorAdminOverride {
  readonly profileId?: IEstimatingBidReadinessProfile['profileId'];
  readonly criteria?: readonly ICriterionOverride[];
  readonly thresholds?: Partial<IEstimatingBidReadinessProfile['thresholds']>;
  readonly governance?: Partial<IReadinessGovernanceMetadata>;
  readonly version?: VersionedRecord;
}

export interface IResolvedBidReadinessConfig extends Omit<IHealthIndicatorResolvedConfig, 'profile' | 'governance' | 'version'> {
  readonly profile: IEstimatingBidReadinessProfile;
  readonly governance: IReadinessGovernanceMetadata;
  readonly version: VersionedRecord;
}

function buildDefaultVersion(): VersionedRecord {
  return {
    recordId: 'sf18-profile-estimating-bid-readiness',
    version: 1,
    updatedAt: new Date(0).toISOString(),
    updatedBy: 'system:sf18-baseline',
    source: 'baseline-profile',
    correlationId: 'sf18-t06-baseline',
  };
}

function buildDefaultGovernance(nowIso: string): Omit<IReadinessGovernanceMetadata, 'telemetryKeys'> {
  return {
    governanceState: 'approved',
    recordedAt: nowIso,
    recordedBy: 'system:sf18-profile-resolver',
    traceId: 'sf18-t06-profile-resolver',
    immutableSnapshotId: 'sf18-estimating-bid-readiness-baseline',
  };
}

/**
 * Resolves effective profile config with deterministic validation and fallback.
 *
 * @design D-SF18-T06
 */
export function resolveBidReadinessProfileConfig(
  override?: IEstimatingBidReadinessAdminOverride | null,
): IResolvedBidReadinessConfig {
  const nowIso = new Date().toISOString();

  const resolved = resolveHealthIndicatorProfileConfig({
    baseline: estimatingBidReadinessProfile,
    override,
    telemetryKeys: TELEMETRY_KEYS,
    defaultVersion: buildDefaultVersion(),
    defaultGovernance: buildDefaultGovernance(nowIso),
  });

  return {
    ...resolved,
    profile: resolved.profile as IEstimatingBidReadinessProfile,
    governance: resolved.governance as IReadinessGovernanceMetadata,
    version: resolved.version as VersionedRecord,
  };
}
