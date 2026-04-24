/**
 * Pure stale-data detection for Foleon sync runs.
 *
 * Given a set of HB_FoleonSyncRuns rows, derive per-kind freshness
 * (last-success, last-failure, staleness, in-flight). Zero side
 * effects — the SharePoint read adapter that feeds this utility lives
 * in Wave 02 when the backend writer ships.
 *
 * Authority:
 *   apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-sync-runs.md
 *   docs/architecture/decisions/ADR-2026-04-24-foleon-phase-01-launch-scope.md
 */

export type FoleonSyncRunKind = 'Docs' | 'Projects' | 'Analytics';
export type FoleonSyncRunStatus = 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';

export interface FoleonSyncRunRow {
  readonly runId: string;
  readonly runKind: FoleonSyncRunKind;
  readonly status: FoleonSyncRunStatus;
  readonly startedUtc: string;
  readonly endedUtc?: string;
  readonly errorCount?: number;
}

export interface FoleonSyncStatus {
  readonly runKind: FoleonSyncRunKind;
  readonly lastSuccessUtc?: string;
  readonly lastFailureUtc?: string;
  readonly minutesSinceLastSuccess?: number;
  readonly isStale: boolean;
  readonly hasInFlight: boolean;
  readonly lastRunStatus?: FoleonSyncRunStatus;
}

/**
 * Pure deterministic reducer. Rows may be in any order; the function
 * selects the most-recent success, the most-recent failure, and any
 * currently-running entry.
 */
export function deriveFoleonSyncStatus(
  runs: ReadonlyArray<FoleonSyncRunRow>,
  kind: FoleonSyncRunKind,
  now: Date,
  staleThresholdMinutes: number,
): FoleonSyncStatus {
  if (staleThresholdMinutes <= 0 || !Number.isFinite(staleThresholdMinutes)) {
    throw new Error(
      `deriveFoleonSyncStatus: staleThresholdMinutes must be a positive finite number, got ${staleThresholdMinutes}`,
    );
  }

  const ofKind = runs.filter((r) => r.runKind === kind);
  const nowMs = now.getTime();

  let lastSuccess: FoleonSyncRunRow | undefined;
  let lastFailure: FoleonSyncRunRow | undefined;
  let latest: FoleonSyncRunRow | undefined;
  let hasInFlight = false;

  for (const run of ofKind) {
    const startMs = Date.parse(run.startedUtc);
    if (Number.isNaN(startMs)) continue;

    if (run.status === 'Running') {
      hasInFlight = true;
    }
    if (run.status === 'Succeeded') {
      if (!lastSuccess || startMs > Date.parse(lastSuccess.startedUtc)) {
        lastSuccess = run;
      }
    }
    if (run.status === 'Failed') {
      if (!lastFailure || startMs > Date.parse(lastFailure.startedUtc)) {
        lastFailure = run;
      }
    }
    if (!latest || startMs > Date.parse(latest.startedUtc)) {
      latest = run;
    }
  }

  const minutesSinceLastSuccess = lastSuccess
    ? Math.max(0, Math.floor((nowMs - Date.parse(lastSuccess.startedUtc)) / 60000))
    : undefined;

  const isStale =
    minutesSinceLastSuccess === undefined
      ? true
      : minutesSinceLastSuccess > staleThresholdMinutes;

  return {
    runKind: kind,
    ...(lastSuccess ? { lastSuccessUtc: lastSuccess.startedUtc } : {}),
    ...(lastFailure ? { lastFailureUtc: lastFailure.startedUtc } : {}),
    ...(typeof minutesSinceLastSuccess === 'number' ? { minutesSinceLastSuccess } : {}),
    isStale,
    hasInFlight,
    ...(latest ? { lastRunStatus: latest.status } : {}),
  };
}
