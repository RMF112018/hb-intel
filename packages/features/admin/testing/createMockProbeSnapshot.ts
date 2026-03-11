import type { IProbeSnapshot } from '../src/types/IProbeSnapshot.js';
import type { IInfrastructureProbeResult } from '../src/types/IInfrastructureProbeResult.js';

/**
 * Factory for creating a mock probe result in tests.
 */
export function createMockProbeResult(overrides?: Partial<IInfrastructureProbeResult>): IInfrastructureProbeResult {
  return {
    probeId: 'probe-001',
    probeKey: 'sharepoint-infrastructure',
    status: 'healthy',
    summary: 'All systems operational',
    observedAt: '2026-01-01T00:00:00.000Z',
    metrics: {},
    anomalies: [],
    ...overrides,
  };
}

/**
 * Factory for creating a mock probe snapshot in tests.
 */
export function createMockProbeSnapshot(overrides?: Partial<IProbeSnapshot>): IProbeSnapshot {
  return {
    snapshotId: 'snapshot-001',
    capturedAt: '2026-01-01T00:00:00.000Z',
    results: [createMockProbeResult()],
    ...overrides,
  };
}
