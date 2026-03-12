/**
 * SF18-T08 deterministic time helper for tests and stories.
 *
 * @design D-SF18-T08
 */
export function createDeterministicNow(iso = '2026-03-12T12:00:00.000Z'): {
  readonly nowIso: string;
  readonly nowMs: number;
} {
  return {
    nowIso: iso,
    nowMs: new Date(iso).getTime(),
  };
}
