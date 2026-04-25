import { describe, expect, it } from 'vitest';
import {
  adminIssueDetails,
  makeIssue,
  userCopyForIssues,
  type FoleonConfigErrorCode,
} from '../foleonConfigIssues.js';

describe('FoleonConfigIssue helpers', () => {
  it('creates issues with admin scope by default and governed label', () => {
    const issue = makeIssue('missing-site-url');
    expect(issue).toEqual({
      code: 'missing-site-url',
      scope: 'admin',
      adminLabel: 'SharePoint site URL is missing.',
    });
  });

  it('assigns a governed label for every known error code', () => {
    const codes: FoleonConfigErrorCode[] = [
      'missing-site-url',
      'missing-content-registry-list-id',
      'missing-placements-list-id',
      'no-origins-allowlisted',
      'manifest-id-mismatch',
      'package-version-mismatch',
    ];
    for (const code of codes) {
      const issue = makeIssue(code);
      expect(issue.code).toBe(code);
      expect(issue.adminLabel.length).toBeGreaterThan(0);
    }
  });

  it('userCopyForIssues returns empty string when there are no issues', () => {
    expect(userCopyForIssues([])).toBe('');
  });

  it('userCopyForIssues returns the generic user-safe sentence otherwise', () => {
    const copy = userCopyForIssues([makeIssue('missing-site-url')]);
    expect(copy).toContain('Foleon');
    expect(copy).toContain('admin');
    // Never interpolates the code or admin label.
    expect(copy).not.toContain('missing-site-url');
    expect(copy).not.toContain('SharePoint site URL is missing.');
  });

  it('adminIssueDetails dedupes repeated codes and keeps only admin scope', () => {
    const issues = [
      makeIssue('missing-site-url'),
      makeIssue('missing-site-url'),
      { ...makeIssue('missing-placements-list-id'), scope: 'user' as const },
      makeIssue('manifest-id-mismatch'),
    ];
    const details = adminIssueDetails(issues);
    expect(details.map((d) => d.code)).toEqual([
      'missing-site-url',
      'manifest-id-mismatch',
    ]);
  });

  it('adminIssueDetails includes fixed remediation guidance for admin diagnostics', () => {
    const details = adminIssueDetails([
      makeIssue('missing-content-registry-list-id'),
      makeIssue('missing-placements-list-id'),
      makeIssue('package-version-mismatch'),
    ]);

    expect(details[0]?.adminRemediation).toContain('contentRegistryListId');
    expect(details[0]?.adminRemediation).toContain(
      "/_api/web/lists/getbytitle('HB_FoleonContentRegistry')?$select=Id",
    );
    expect(details[1]?.adminRemediation).toContain('placementsListId');
    expect(details[1]?.adminRemediation).toContain(
      "/_api/web/lists/getbytitle('HB_FoleonHomepagePlacements')?$select=Id",
    );
    expect(details[2]?.adminRemediation).toContain('expectedPackageVersion');
    expect(details[2]?.adminRemediation).toContain('App Catalog package');
  });
});
