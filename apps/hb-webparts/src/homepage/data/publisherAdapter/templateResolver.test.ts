/**
 * Tenant-aligned resolver tests for the `HB Article Template Registry`.
 *
 * Exercises the new tenant-shape matching rules:
 *   - IsActive filter
 *   - Destination scoping
 *   - ContentTypes / SpotlightTypes / ProjectStages / ArticleSubjects
 *     applicability (wildcard when empty)
 *   - TemplatePriority tie-break
 *   - VersionLabel loose-semver tie-break
 *   - Admin override (TemplateKey) respects IsActive
 */
import { describe, expect, it } from 'vitest';
import {
  resolveTemplate,
  compareVersionLabels,
  type TemplateResolverInput,
} from './templateResolver';
import type { PublisherTemplateRegistryRow } from './publisherContracts';

function tpl(
  over: Partial<PublisherTemplateRegistryRow> & { TemplateKey: string },
): PublisherTemplateRegistryRow {
  return {
    TemplateKey: over.TemplateKey,
    TemplateName: over.TemplateName ?? over.TemplateKey,
    IsActive: over.IsActive ?? true,
    TemplatePriority: over.TemplatePriority ?? 100,
    VersionLabel: over.VersionLabel,
    ContentTypes: over.ContentTypes ?? ['monthlySpotlight'],
    Destination: over.Destination ?? 'projectSpotlight',
    SpotlightTypes: over.SpotlightTypes,
    ProjectStages: over.ProjectStages,
    ArticleSubjects: over.ArticleSubjects,
    PageShellTemplateKey: over.PageShellTemplateKey ?? 'ps-shell-v1',
    HeroProfileKey: over.HeroProfileKey ?? 'hbSignatureHero',
    BodyProfileKey: over.BodyProfileKey ?? 'oobText',
    TeamViewerProfileKey: over.TeamViewerProfileKey ?? 'teamViewer',
    GalleryProfileKey: over.GalleryProfileKey ?? 'oobImageGallery',
    ShowHero: over.ShowHero ?? true,
    ShowBody: over.ShowBody ?? true,
    ShowTeamViewer: over.ShowTeamViewer ?? true,
    ShowGallery: over.ShowGallery ?? true,
    ShowSecondaryImage: over.ShowSecondaryImage ?? false,
    RequiredFieldSetKey: over.RequiredFieldSetKey ?? 'req-default',
    Notes: over.Notes,
  };
}

const INPUT_MONTHLY: TemplateResolverInput = {
  ArticleContentType: 'monthlySpotlight',
  Destination: 'projectSpotlight',
};

describe('resolveTemplate — tenant HB Article Template Registry', () => {
  it('returns emptyRegistry when registry is empty', () => {
    const result = resolveTemplate(INPUT_MONTHLY, []);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('emptyRegistry');
  });

  it('selects the only matching active row', () => {
    const registry = [tpl({ TemplateKey: 'only-v1' })];
    const result = resolveTemplate(INPUT_MONTHLY, registry);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entry.TemplateKey).toBe('only-v1');
    expect(result.trace.selectionRule).toBe('applicability');
  });

  it('rejects rows where IsActive=false', () => {
    const registry = [
      tpl({ TemplateKey: 'inactive', IsActive: false }),
    ];
    const result = resolveTemplate(INPUT_MONTHLY, registry);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('noCandidate');
  });

  it('rejects rows whose Destination does not match the article', () => {
    const registry = [
      tpl({ TemplateKey: 'pulse-only', Destination: 'companyPulse' }),
    ];
    const result = resolveTemplate(INPUT_MONTHLY, registry);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('noCandidate');
  });

  it('rejects rows whose ContentTypes do not include the article content type', () => {
    const registry = [
      tpl({
        TemplateKey: 'news-only',
        ContentTypes: ['newsUpdate'],
      }),
    ];
    const result = resolveTemplate(INPUT_MONTHLY, registry);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('noCandidate');
  });

  it('respects admin override when the override is active', () => {
    const registry = [
      tpl({ TemplateKey: 'auto-winner', TemplatePriority: 999 }),
      tpl({ TemplateKey: 'manual', TemplatePriority: 1 }),
    ];
    const result = resolveTemplate(
      { ...INPUT_MONTHLY, TemplateKey: 'manual' },
      registry,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entry.TemplateKey).toBe('manual');
    expect(result.trace.selectionRule).toBe('adminOverride');
  });

  it('rejects an inactive admin override with overrideInactive', () => {
    const registry = [
      tpl({ TemplateKey: 'auto' }),
      tpl({ TemplateKey: 'manual', IsActive: false }),
    ];
    const result = resolveTemplate(
      { ...INPUT_MONTHLY, TemplateKey: 'manual' },
      registry,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('overrideInactive');
  });

  it('reports overrideNotFound for missing override keys', () => {
    const registry = [tpl({ TemplateKey: 'auto' })];
    const result = resolveTemplate(
      { ...INPUT_MONTHLY, TemplateKey: 'ghost' },
      registry,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('overrideNotFound');
  });

  it('prefers more specific applicability (declared SpotlightTypes beats wildcard)', () => {
    const registry = [
      tpl({ TemplateKey: 'wildcard' }),
      tpl({ TemplateKey: 'narrow', SpotlightTypes: ['monthly'] }),
    ];
    const result = resolveTemplate(
      { ...INPUT_MONTHLY, SpotlightType: 'monthly' },
      registry,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entry.TemplateKey).toBe('narrow');
    expect(result.trace.selectionRule).toBe('specificityTieBreak');
  });

  it('breaks specificity ties by highest TemplatePriority', () => {
    const registry = [
      tpl({ TemplateKey: 'lowpri', TemplatePriority: 10 }),
      tpl({ TemplateKey: 'hipri', TemplatePriority: 200 }),
    ];
    const result = resolveTemplate(INPUT_MONTHLY, registry);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entry.TemplateKey).toBe('hipri');
    expect(result.trace.selectionRule).toBe('priorityTieBreak');
  });

  it('breaks priority ties by highest VersionLabel', () => {
    const registry = [
      tpl({ TemplateKey: 'old', TemplatePriority: 100, VersionLabel: '1.0.0' }),
      tpl({ TemplateKey: 'new', TemplatePriority: 100, VersionLabel: '1.2.0' }),
    ];
    const result = resolveTemplate(INPUT_MONTHLY, registry);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entry.TemplateKey).toBe('new');
    expect(result.trace.selectionRule).toBe('versionTieBreak');
  });
});

describe('compareVersionLabels', () => {
  it('orders missing label below any labelled value', () => {
    expect(compareVersionLabels(undefined, '1.0.0')).toBeLessThan(0);
    expect(compareVersionLabels('1.0.0', undefined)).toBeGreaterThan(0);
    expect(compareVersionLabels(undefined, undefined)).toBe(0);
  });

  it('compares numeric segments numerically', () => {
    expect(compareVersionLabels('1.10.0', '1.2.0')).toBeGreaterThan(0);
    expect(compareVersionLabels('1.2.0', '1.2.0')).toBe(0);
  });

  it('treats pre-release suffixes as older than release', () => {
    expect(compareVersionLabels('1.2.0', '1.2.0-beta')).toBeGreaterThan(0);
  });
});
