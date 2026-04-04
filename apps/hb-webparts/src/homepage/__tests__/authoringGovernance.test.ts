import { describe, expect, it } from 'vitest';
import {
  HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY,
  resolveAuthoringMessage,
} from '../helpers/authoringGovernance.js';

describe('Prompt-09 authoring governance seam', () => {
  it('locks governance entries for all first-release webparts', () => {
    expect(Object.keys(HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY).sort()).toEqual([
      'companyPulse',
      'hbHeroBanner',
      'leadershipMessage',
      'peopleCulture',
      'personalizedWelcomeHeader',
      'priorityActionsRail',
      'projectPortfolioSpotlight',
      'safetyFieldExcellence',
      'smartSearchWayfinding',
      'toolLauncherWorkHub',
    ]);
  });

  it('requires owner and zone metadata for every entry', () => {
    for (const entry of Object.values(HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY)) {
      expect(entry.ownerRole.length).toBeGreaterThan(0);
      expect(entry.zone.length).toBeGreaterThan(0);
      expect(entry.zoneIntent.length).toBeGreaterThan(0);
      expect(entry.allowedContentScope.length).toBeGreaterThan(0);
      expect(entry.messages.noData.title.length).toBeGreaterThan(0);
      expect(entry.messages.invalid.title.length).toBeGreaterThan(0);
    }
  });

  it('returns no-result messaging for discovery and invalid/no-data for other states', () => {
    expect(resolveAuthoringMessage('smartSearchWayfinding', 'noResults').title).toBe('No matching resources found');
    expect(resolveAuthoringMessage('priorityActionsRail', 'invalid').title).toBe('Priority actions configuration is invalid');
    expect(resolveAuthoringMessage('companyPulse', 'noData').title).toBe('No company pulse items configured');
  });
});
