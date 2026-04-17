import { describe, expect, it } from 'vitest';
import { deriveProjectSiteLaunchStatus } from './projectSiteLaunchState.js';
import type { IProjectSiteDataQuality } from './types.js';

function quality(issues: IProjectSiteDataQuality['issues'] = []): IProjectSiteDataQuality {
  const hasMalformed = issues.includes('invalid-year') || issues.includes('malformed-site-url');
  return {
    classification: issues.length === 0 ? 'complete' : (hasMalformed ? 'malformed' : 'partial'),
    issues,
    hasAnyIssue: issues.length > 0,
    hasLaunchCriticalIssue: issues.length > 0,
  };
}

describe('deriveProjectSiteLaunchStatus', () => {
  it('classifies launch-ready live records', () => {
    const result = deriveProjectSiteLaunchStatus({
      hasSiteUrl: true,
      projectStage: 'Active',
      dataQuality: quality([]),
    });
    expect(result.state).toBe('live');
    expect(result.isLaunchable).toBe(true);
  });

  it('classifies provisioning when site is not yet available', () => {
    const result = deriveProjectSiteLaunchStatus({
      hasSiteUrl: false,
      projectStage: 'Preconstruction',
      dataQuality: quality(['missing-site-url']),
    });
    expect(result.state).toBe('provisioning');
    expect(result.isLaunchable).toBe(false);
  });

  it('classifies archived/inactive records', () => {
    const withSite = deriveProjectSiteLaunchStatus({
      hasSiteUrl: true,
      projectStage: 'Archived',
      dataQuality: quality([]),
    });
    expect(withSite.state).toBe('archived');
    expect(withSite.isLaunchable).toBe(true);

    const withoutSite = deriveProjectSiteLaunchStatus({
      hasSiteUrl: false,
      projectStage: 'Closed',
      dataQuality: quality(['missing-site-url']),
    });
    expect(withoutSite.state).toBe('archived');
    expect(withoutSite.isLaunchable).toBe(false);
  });

  it('classifies attention-needed when critical non-provisioning issues exist', () => {
    const result = deriveProjectSiteLaunchStatus({
      hasSiteUrl: true,
      projectStage: 'Active',
      dataQuality: quality(['invalid-year']),
    });
    expect(result.state).toBe('attention-needed');
    expect(result.isLaunchable).toBe(false);
  });
});
