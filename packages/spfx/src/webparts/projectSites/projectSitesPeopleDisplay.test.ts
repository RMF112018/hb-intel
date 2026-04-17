import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatProjectSitesPersonLabel,
  resolveProjectSitesPeopleDisplayLabels,
} from './projectSitesPeopleDisplay.js';

vi.mock('@hbc/auth/spfx', () => ({
  getSpfxContext: () => ({
    pageContext: {
      web: { absoluteUrl: 'https://contoso.sharepoint.com/sites/HBCentral' },
    },
  }),
}));

describe('projectSitesPeopleDisplay', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses authoritative SharePoint user title when available', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Title: 'Jane Doe' }),
    } as Response);

    const labels = await resolveProjectSitesPeopleDisplayLabels(['jane.doe@contoso.com']);

    expect(labels['jane.doe@contoso.com']).toBe('Jane Doe');
  });

  it('falls back to heuristic humanization when authoritative lookup is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    const labels = await resolveProjectSitesPeopleDisplayLabels(['john_smith@contoso.com']);

    expect(labels['john_smith@contoso.com']).toBe('John Smith');
  });

  it('formats labels from map and falls back when missing', () => {
    expect(
      formatProjectSitesPersonLabel('manager@contoso.com', { 'manager@contoso.com': 'Manager Name' }),
    ).toBe('Manager Name');
    expect(formatProjectSitesPersonLabel('lead.estimator@contoso.com', {})).toBe('Lead Estimator');
  });
});
