/**
 * Typed config-issue vocabulary for the Foleon runtime contract.
 *
 * Every blocking condition produced by
 * `resolveFoleonRuntimeContract` maps to a stable
 * `FoleonConfigErrorCode` so:
 *   - tests assert against codes, not prose;
 *   - the redacted runtime binding proof can disclose what went
 *     wrong without interpolating caller-supplied config values;
 *   - SRE runbooks correlate tenant telemetry against a closed
 *     vocabulary.
 *
 * Codes never embed config values. User-facing copy is generic; the
 * only variable part surfaced to admins is the code itself plus its
 * governed `adminLabel`.
 */

export type FoleonConfigErrorCode =
  | 'missing-site-url'
  | 'missing-content-registry-list-id'
  | 'missing-placements-list-id'
  | 'no-origins-allowlisted'
  | 'manifest-id-mismatch'
  | 'package-version-mismatch';

export type FoleonConfigIssueScope = 'user' | 'admin';

export interface FoleonConfigIssue {
  readonly code: FoleonConfigErrorCode;
  readonly scope: FoleonConfigIssueScope;
  /**
   * Governed, fixed label used only by admin surfaces and by the
   * derived `blockingReasons` back-compat value. Never interpolates
   * config values.
   */
  readonly adminLabel: string;
}

const ADMIN_LABELS: Record<FoleonConfigErrorCode, string> = {
  'missing-site-url': 'SharePoint site URL is missing.',
  'missing-content-registry-list-id': 'HB_FoleonContentRegistry list GUID is missing.',
  'missing-placements-list-id': 'HB_FoleonHomepagePlacements list GUID is missing.',
  'no-origins-allowlisted': 'No Foleon origins are allowlisted.',
  'manifest-id-mismatch': 'Expected manifest ID does not match Foleon webpart authority.',
  'package-version-mismatch':
    'Expected package version does not match governed Foleon package version.',
};

export function makeIssue(
  code: FoleonConfigErrorCode,
  scope: FoleonConfigIssueScope = 'admin',
): FoleonConfigIssue {
  return { code, scope, adminLabel: ADMIN_LABELS[code] };
}

const USER_COPY_GENERIC =
  'Foleon integration is not fully configured. Contact an HB Central admin.';

/**
 * Single user-safe string rendered in the blocked-state banner.
 * Never exposes internal codes or config values.
 */
export function userCopyForIssues(issues: ReadonlyArray<FoleonConfigIssue>): string {
  if (issues.length === 0) return '';
  return USER_COPY_GENERIC;
}

/**
 * Admin-scope projection used by the admin diagnostics expansion.
 * Returns a deduped list of `{ code, adminLabel }`.
 */
export function adminIssueDetails(
  issues: ReadonlyArray<FoleonConfigIssue>,
): ReadonlyArray<{ code: FoleonConfigErrorCode; adminLabel: string }> {
  const seen = new Set<FoleonConfigErrorCode>();
  const out: Array<{ code: FoleonConfigErrorCode; adminLabel: string }> = [];
  for (const issue of issues) {
    if (issue.scope !== 'admin') continue;
    if (seen.has(issue.code)) continue;
    seen.add(issue.code);
    out.push({ code: issue.code, adminLabel: issue.adminLabel });
  }
  return out;
}
