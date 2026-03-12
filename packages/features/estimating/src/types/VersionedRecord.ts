/**
 * Immutable provenance metadata contract for readiness snapshots.
 *
 * @design D-SF18-T02
 */
export interface VersionedRecord {
  readonly recordId: string;
  readonly version: number;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId?: string;
  readonly source?: string;
}
