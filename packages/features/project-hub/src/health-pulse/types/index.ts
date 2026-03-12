/**
 * SF21-T01 scaffold types for Project Health Pulse.
 * Domain computation contracts are intentionally placeholder-only in T01.
 */

export type HealthDimensionKey = 'cost' | 'time' | 'field' | 'office';

export type HealthStatus = 'on-track' | 'watch' | 'at-risk' | 'critical' | 'data-pending';

export type PulseConfidenceTier = 'high' | 'moderate' | 'low' | 'unreliable';

export interface PulseReasonCode {
  code: string;
  summary: string;
}

export interface HealthDimensionSnapshot {
  key: HealthDimensionKey;
  status: HealthStatus;
  score: number;
  confidence: PulseConfidenceTier;
}

export interface ProjectHealthPulseSnapshot {
  projectId: string;
  overallStatus: HealthStatus;
  overallScore: number;
  dimensions: HealthDimensionSnapshot[];
  reasonCodes: PulseReasonCode[];
}

export interface HealthPulseTelemetryEvent {
  name: string;
  emittedAt: string;
  projectId: string;
  metadata: Record<string, string | number | boolean | null>;
}
