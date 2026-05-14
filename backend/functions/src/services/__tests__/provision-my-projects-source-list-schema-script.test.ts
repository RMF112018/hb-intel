import { describe, expect, it } from 'vitest';
import {
  parseArgs,
  resolveSiteUrl,
  selectExitCode,
  validateHBCentralSiteUrl,
  buildProvisioningReport,
} from '../../../../../scripts/provision-my-projects-source-list-schema.js';

describe('provision-my-projects-source-list-schema exports', () => {
  it('parses basic args', () => {
    expect(parseArgs([])).toEqual({ apply: false, json: false, siteUrl: undefined });
    expect(parseArgs(['--apply', '--json'])).toEqual({ apply: true, json: true, siteUrl: undefined });
  });

  it('resolves and validates site URL', () => {
    const resolved = resolveSiteUrl({ apply: false, json: false }, {
      SHAREPOINT_PROJECTS_SITE_URL: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    } as NodeJS.ProcessEnv);
    expect(validateHBCentralSiteUrl(resolved)).toBe('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
  });

  it('selects non-zero for blocking drift', () => {
    const report = buildProvisioningReport({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      apply: true,
      startedAtUtc: '2026-05-14T00:00:00.000Z',
      completedAtUtc: '2026-05-14T00:00:01.000Z',
      targets: [
        {
          listTitle: 'Projects',
          listFound: true,
          plannedCreates: [],
          liveVerified: [],
          blockers: [
            {
              listTitle: 'Projects',
              fieldInternalName: 'leadEstimatorUpns',
              desiredType: 'MultiLineText',
              liveType: 'Text',
              reason: 'Type mismatch',
            },
          ],
          appliedCreates: [],
        },
      ],
    });
    expect(selectExitCode(report)).toBe(1);
  });
});
