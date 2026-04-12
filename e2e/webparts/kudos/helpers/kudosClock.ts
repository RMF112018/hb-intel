/**
 * Deterministic clock utilities for the HB Kudos stress suite.
 *
 * Every seeded item and audit event uses timestamps derived from these
 * anchors so diffs in report artifacts do not shift between runs.
 */
export const KUDOS_CLOCK_ANCHOR_ISO = '2026-01-15T12:00:00.000Z';
export const KUDOS_CLOCK_ANCHOR_MS = Date.parse(KUDOS_CLOCK_ANCHOR_ISO);

/** Offset from anchor in whole minutes. Negative offsets = past. */
export function at(offsetMinutes: number): string {
  return new Date(KUDOS_CLOCK_ANCHOR_MS + offsetMinutes * 60_000).toISOString();
}

/** Scheduled-publish timestamp used for A4 (approvedScheduled) cases. */
export const KUDOS_SCHEDULED_FUTURE_ISO = at(60 * 24 * 3); // +3 days

/** Past-homepage-window timestamp used for C4 aged-off cases. */
export const KUDOS_AGED_OFF_ISO = at(-60 * 24 * 45); // 45 days ago

/** Archive-eligible timestamp used for C3. */
export const KUDOS_ARCHIVE_ELIGIBLE_ISO = at(-60 * 24 * 14); // 14 days ago
