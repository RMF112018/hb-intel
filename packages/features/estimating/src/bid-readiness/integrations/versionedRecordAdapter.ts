/**
 * SF18-T07 versioned-record reference integration adapter.
 *
 * Produces immutable snapshot payloads suitable for persistence through
 * versioned-record infrastructure without writing runtime side effects.
 *
 * @design D-SF18-T07
 */
import type {
  IBidReadinessViewState,
  IReadinessSummaryPayload,
  VersionedRecord,
} from '../../types/index.js';

export interface IBidReadinessVersionedSnapshot {
  readonly snapshotId: string;
  readonly pursuitId: string;
  readonly createdAt: string;
  readonly version: VersionedRecord;
  readonly governanceTraceId: string;
  readonly governanceState: string;
  readonly payload: {
    readonly status: string;
    readonly score: number;
    readonly summary: IReadinessSummaryPayload;
    readonly criteriaCount: number;
    readonly blockerCount: number;
  };
}

function buildFallbackVersion(pursuitId: string): VersionedRecord {
  return {
    recordId: pursuitId,
    version: 1,
    updatedAt: new Date(0).toISOString(),
    updatedBy: 'system:sf18-t07-snapshot',
    source: 'snapshot-fallback',
    correlationId: `sf18-t07-${pursuitId}`,
  };
}

/**
 * Creates deterministic versioned snapshot payloads from readiness state.
 *
 * @design D-SF18-T07
 */
export function createBidReadinessVersionedSnapshot(params: {
  readonly pursuitId: string;
  readonly viewState: IBidReadinessViewState | null;
  readonly createdAt?: string;
}): IBidReadinessVersionedSnapshot {
  const { pursuitId, viewState, createdAt = new Date().toISOString() } = params;

  if (!viewState) {
    return {
      snapshotId: `${pursuitId}:unavailable:${createdAt}`,
      pursuitId,
      createdAt,
      version: buildFallbackVersion(pursuitId),
      governanceTraceId: 'sf18-t07-no-view-state',
      governanceState: 'draft',
      payload: {
        status: 'unavailable',
        score: 0,
        summary: {
          score: {
            value: 0,
            status: 'not-ready',
            band: 'weak',
            computedAt: createdAt,
          },
          completeness: {
            requiredCount: 0,
            completedCount: 0,
            missingCount: 0,
            completionPercent: 0,
          },
          categoryBreakdown: [],
          recommendations: [],
          governance: {
            governanceState: 'draft',
            recordedAt: createdAt,
            recordedBy: 'system:sf18-t07-snapshot',
            traceId: 'sf18-t07-no-view-state',
            telemetryKeys: [],
          },
        },
        criteriaCount: 0,
        blockerCount: 0,
      },
    };
  }

  return {
    snapshotId: `${pursuitId}:${viewState.version.version}:${createdAt}`,
    pursuitId,
    createdAt,
    version: viewState.version,
    governanceTraceId: viewState.summary.governance.traceId,
    governanceState: viewState.summary.governance.governanceState,
    payload: {
      status: viewState.status,
      score: viewState.score,
      summary: viewState.summary,
      criteriaCount: viewState.criteria.length,
      blockerCount: viewState.criteria.filter(({ criterion, isComplete }) => criterion.isBlocker && !isComplete).length,
    },
  };
}
