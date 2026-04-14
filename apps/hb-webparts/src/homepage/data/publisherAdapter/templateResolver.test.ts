import { describe, expect, it } from 'vitest';
import type { PublisherTemplateRegistryRow } from './publisherContracts';
import {
  compareTemplateVersions,
  resolveTemplate,
} from './templateResolver';

function entry(
  overrides: Partial<PublisherTemplateRegistryRow> & {
    TemplateKey: string;
    PostFamily: PublisherTemplateRegistryRow['PostFamily'];
  },
): PublisherTemplateRegistryRow {
  return {
    TemplateDisplayName: overrides.TemplateDisplayName ?? overrides.TemplateKey,
    TemplateStatus: 'active',
    TemplateVersion: '1.0.0',
    PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    PageShellVersion: '1.0.0',
    ShellSourceSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    ShellSourcePagePath:
      'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
    BannerRendererKind: 'oobPageTitle',
    BodyRendererKind: 'oobText',
    TeamRendererKind: 'teamViewer',
    GalleryRendererKind: 'oobImageGallery',
    ShowTeamBlock: true,
    ShowGalleryBlock: true,
    RequiredFieldSetKey: 'req-default',
    ValidationProfileKey: `val-${overrides.TemplateKey}`,
    RenderProfileKey: `render-${overrides.TemplateKey}`,
    ...overrides,
  };
}

const monthly = entry({
  TemplateKey: 'ps-inprogress-monthly-v1',
  PostFamily: ['monthlySpotlight'],
  SpotlightType: ['monthly'],
});

const milestone = entry({
  TemplateKey: 'ps-inprogress-milestone-v1',
  PostFamily: ['milestoneSpotlight'],
  SpotlightType: ['milestone'],
});

const projectUpdate = entry({
  TemplateKey: 'ps-inprogress-project-update-v1',
  PostFamily: ['projectUpdate'],
  SpotlightType: ['monthly', 'other'],
});

const genericWildcard = entry({
  TemplateKey: 'ps-generic-v1',
  PostFamily: ['monthlySpotlight', 'milestoneSpotlight', 'projectUpdate', 'projectStory'],
});

describe('resolveTemplate', () => {
  it('returns emptyRegistry failure when registry is empty', () => {
    const result = resolveTemplate(
      { PostFamily: 'monthlySpotlight' },
      [],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('emptyRegistry');
  });

  it('honors admin TemplateKey override', () => {
    const result = resolveTemplate(
      { TemplateKey: 'ps-inprogress-milestone-v1', PostFamily: 'monthlySpotlight' },
      [monthly, milestone],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.TemplateKey).toBe('ps-inprogress-milestone-v1');
      expect(result.trace.selectionRule).toBe('adminOverride');
    }
  });

  it('fails overrideNotFound when the admin key is absent', () => {
    const result = resolveTemplate(
      { TemplateKey: 'ps-does-not-exist', PostFamily: 'monthlySpotlight' },
      [monthly, milestone],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('overrideNotFound');
  });

  it('fails overrideInactive when the admin key exists but is not active', () => {
    const deprecated = entry({
      TemplateKey: 'ps-deprecated-v0',
      PostFamily: ['monthlySpotlight'],
      TemplateStatus: 'deprecated',
    });
    const result = resolveTemplate(
      { TemplateKey: 'ps-deprecated-v0', PostFamily: 'monthlySpotlight' },
      [deprecated, monthly],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('overrideInactive');
  });

  it('matches a single candidate by PostFamily + SpotlightType', () => {
    const result = resolveTemplate(
      { PostFamily: 'milestoneSpotlight', SpotlightType: 'milestone' },
      [monthly, milestone, projectUpdate],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.TemplateKey).toBe('ps-inprogress-milestone-v1');
      expect(result.trace.selectionRule).toBe('applicability');
    }
  });

  it('noCandidate when nothing matches', () => {
    const result = resolveTemplate(
      { PostFamily: 'projectStory' },
      [monthly, milestone, projectUpdate],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('noCandidate');
  });

  it('prefers the most specific candidate over a wildcard entry', () => {
    const result = resolveTemplate(
      { PostFamily: 'monthlySpotlight', SpotlightType: 'monthly' },
      [genericWildcard, monthly],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.TemplateKey).toBe('ps-inprogress-monthly-v1');
      expect(result.trace.selectionRule).toBe('specificityTieBreak');
    }
  });

  it('rejects inactive entries even when they would otherwise match', () => {
    const inactive = entry({
      TemplateKey: 'ps-inprogress-monthly-v0',
      PostFamily: ['monthlySpotlight'],
      SpotlightType: ['monthly'],
      TemplateStatus: 'inactive',
      TemplateVersion: '0.9.0',
    });
    const result = resolveTemplate(
      { PostFamily: 'monthlySpotlight', SpotlightType: 'monthly' },
      [inactive, monthly],
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.entry.TemplateKey).toBe('ps-inprogress-monthly-v1');
  });

  it('breaks a specificity tie by preferring the higher TemplateVersion', () => {
    const v1 = entry({
      TemplateKey: 'ps-inprogress-monthly-v1',
      PostFamily: ['monthlySpotlight'],
      SpotlightType: ['monthly'],
      TemplateVersion: '1.0.0',
    });
    const v2 = entry({
      TemplateKey: 'ps-inprogress-monthly-v2',
      PostFamily: ['monthlySpotlight'],
      SpotlightType: ['monthly'],
      TemplateVersion: '2.1.0',
    });
    const result = resolveTemplate(
      { PostFamily: 'monthlySpotlight', SpotlightType: 'monthly' },
      [v1, v2],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.TemplateKey).toBe('ps-inprogress-monthly-v2');
      expect(result.trace.selectionRule).toBe('versionTieBreak');
    }
  });

  it('projectUpdate matches both inProgress and update spotlight types', () => {
    for (const st of ['monthly', 'other'] as const) {
      const result = resolveTemplate(
        { PostFamily: 'projectUpdate', SpotlightType: st },
        [monthly, milestone, projectUpdate],
      );
      expect(result.ok).toBe(true);
      if (result.ok)
        expect(result.entry.TemplateKey).toBe('ps-inprogress-project-update-v1');
    }
  });
});

describe('compareTemplateVersions', () => {
  it('compares numeric segments numerically', () => {
    expect(compareTemplateVersions('1.2.0', '1.10.0')).toBeLessThan(0);
    expect(compareTemplateVersions('2.0.0', '1.99.0')).toBeGreaterThan(0);
  });

  it('treats non-numeric suffixes as lexicographic', () => {
    expect(compareTemplateVersions('1.0.0', '1.0.0-beta')).toBeGreaterThan(0);
    expect(compareTemplateVersions('1.0.0-beta', '1.0.0-alpha')).toBeGreaterThan(0);
  });
});
