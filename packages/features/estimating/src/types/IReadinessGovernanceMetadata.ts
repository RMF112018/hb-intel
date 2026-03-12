/**
 * Governance metadata contracts for readiness auditability and traceability.
 *
 * @design D-SF18-T02
 */
import type { GovernanceState, TelemetryKey } from '../constants/index.js';

export interface IReadinessGovernanceMetadata {
  readonly governanceState: GovernanceState;
  readonly recordedAt: string;
  readonly recordedBy: string;
  readonly traceId: string;
  readonly immutableSnapshotId?: string;
  readonly telemetryKeys: readonly TelemetryKey[];
}
