import { useMemo } from 'react';

/**
 * Risk/exposure zone data for the executive cockpit center canvas.
 * Each zone maps to one of the 5 spec zones (Z1–Z5).
 */

export interface HealthPostureZone {
  readonly overallStatus: 'healthy' | 'watch' | 'at-risk' | 'critical';
  readonly topDrivers: readonly string[];
  readonly trend: 'improving' | 'stable' | 'worsening';
  readonly freshnessLabel: string;
}

export interface CostExposureZone {
  readonly forecastDrift: number;
  readonly unresolvedExposure: number;
  readonly pendingConfirmations: number;
  readonly reportPosture: 'current' | 'stale' | 'missing';
}

export interface ScheduleRiskZone {
  readonly milestoneDriftCount: number;
  readonly nearTermRiskCount: number;
  readonly staleUpdateWarning: boolean;
  readonly downstreamImpacts: number;
}

export interface QualitySafetyZone {
  readonly blockedGates: number;
  readonly unresolvedCorrectiveActions: number;
  readonly closeoutConcerns: number;
  readonly safetyHealthBand: 'healthy' | 'watch' | 'at-risk' | 'critical';
}

export interface CrossDriverZone {
  readonly correlationSummary: string;
  readonly linkedRecordCount: number;
}

export interface RiskExposureSummary {
  readonly healthPosture: HealthPostureZone;
  readonly costExposure: CostExposureZone;
  readonly scheduleRisk: ScheduleRiskZone;
  readonly qualitySafety: QualitySafetyZone;
  readonly crossDriver: CrossDriverZone;
}

/**
 * Returns mock risk/exposure summary for the executive cockpit.
 * Will be replaced by real health-pulse and cross-module aggregation.
 */
export function useRiskExposureSummary(projectId: string | null): RiskExposureSummary {
  return useMemo(
    () => ({
      healthPosture: {
        overallStatus: 'at-risk' as const,
        topDrivers: ['Schedule milestone drift', 'Financial forecast pending', 'Subcontract gate blocked'],
        trend: 'worsening' as const,
        freshnessLabel: 'Updated 2h ago',
      },
      costExposure: {
        forecastDrift: 142000,
        unresolvedExposure: 87500,
        pendingConfirmations: 2,
        reportPosture: 'stale' as const,
      },
      scheduleRisk: {
        milestoneDriftCount: 3,
        nearTermRiskCount: 2,
        staleUpdateWarning: true,
        downstreamImpacts: 4,
      },
      qualitySafety: {
        blockedGates: 1,
        unresolvedCorrectiveActions: 3,
        closeoutConcerns: 2,
        safetyHealthBand: 'watch' as const,
      },
      crossDriver: {
        correlationSummary:
          'Schedule drift on Foundation Complete is driving startup readiness risk and increasing forecast uncertainty in the financial module.',
        linkedRecordCount: 7,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- projectId used for future real queries
    [projectId],
  );
}
