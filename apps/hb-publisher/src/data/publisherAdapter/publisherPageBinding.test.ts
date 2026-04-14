/**
 * Tenant `HB Article Destination Pages` round-trip drift guard.
 *
 * Pins the page-binding contract (read + write) to the tenant schema so
 * obsolete pre-tenant-audit columns (`TargetSiteKey`, `BindingStatus`,
 * `TemplateKey`, `TemplateVersion`, `PageShellKey`, `SourceTemplatePath`,
 * `LastOperation*`, `LastSuccessfulSyncDateUtc`) cannot silently slip
 * back into the binding seam.
 */
import { describe, expect, it } from 'vitest';
import { mapPageBindingRow } from './publisherRowMappers';
import { mapBindingRowToListFields } from './pageBindingWriter';
import type { PublisherPageBindingRow } from './publisherContracts';

const TENANT_RAW_BINDING: Record<string, unknown> = {
  BindingId: 'bnd-042',
  ArticleId: 'art-2026-042',
  Title: 'Acme Tower — April',
  TargetSiteUrl:
    'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
  PageTemplateKey: 'ps-inprogress-monthly-v1',
  PublishStatus: 'published',
  PageId: '123',
  PageName: 'acme-tower-april.aspx',
  PageUrl: {
    Url: 'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
  },
  PageShellVersion: '1.0.0',
  RenderVersion: '1.0.0',
  SyncStatus: 'in-sync',
  LastSyncDateUtc: '2026-04-12T00:00:00Z',
  PublishedDateUtc: '2026-04-12T00:00:00Z',
};

describe('HB Article Destination Pages — tenant round-trip', () => {
  it('mapPageBindingRow reads every tenant-required column', () => {
    const row = mapPageBindingRow(TENANT_RAW_BINDING);
    expect(row).toBeDefined();
    expect(row!.BindingId).toBe('bnd-042');
    expect(row!.ArticleId).toBe('art-2026-042');
    expect(row!.Title).toBe('Acme Tower — April');
    expect(row!.PageTemplateKey).toBe('ps-inprogress-monthly-v1');
    expect(row!.PublishStatus).toBe('published');
    expect(row!.SyncStatus).toBe('in-sync');
    expect(row!.RenderVersion).toBe('1.0.0');
    expect(row!.PageShellVersion).toBe('1.0.0');
  });

  it('mapPageBindingRow rejects a row missing any tenant-required column', () => {
    for (const required of [
      'BindingId',
      'ArticleId',
      'Title',
      'TargetSiteUrl',
      'PageTemplateKey',
      'PublishStatus',
    ] as const) {
      const incomplete = { ...TENANT_RAW_BINDING };
      delete (incomplete as Record<string, unknown>)[required];
      expect(mapPageBindingRow(incomplete)).toBeUndefined();
    }
  });

  it('mapPageBindingRow rejects a row that still carries legacy BindingStatus / TargetSiteKey', () => {
    const legacy = {
      BindingId: 'bnd-042',
      ArticleId: 'art-2026-042',
      TargetSiteKey: 'projectSpotlight',
      BindingStatus: 'published',
      PageName: 'p.aspx',
      SourceTemplatePath: 'SitePages/Templates/t.aspx',
      PageShellKey: 'ps-shell-v1',
      PageShellVersion: '1.0.0',
      TemplateKey: 'ps-inprogress-monthly-v1',
      TemplateVersion: '1.0.0',
      TargetSiteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    };
    // Without tenant-required Title, PageTemplateKey, PublishStatus the
    // mapper refuses to interpret the legacy shape.
    expect(mapPageBindingRow(legacy)).toBeUndefined();
  });

  it('mapBindingRowToListFields emits tenant columns only', () => {
    const row: PublisherPageBindingRow = mapPageBindingRow(TENANT_RAW_BINDING)!;
    const fields = mapBindingRowToListFields(row);
    expect(fields['BindingId']).toBe('bnd-042');
    expect(fields['ArticleId']).toBe('art-2026-042');
    expect(fields['Title']).toBe('Acme Tower — April');
    expect(fields['PageTemplateKey']).toBe('ps-inprogress-monthly-v1');
    expect(fields['PublishStatus']).toBe('published');
    expect(fields['SyncStatus']).toBe('in-sync');
    expect(fields['RenderVersion']).toBe('1.0.0');
    expect(fields['PageShellVersion']).toBe('1.0.0');
    expect(fields['LastSyncDateUtc']).toBe('2026-04-12T00:00:00Z');
    expect(fields['PublishedDateUtc']).toBe('2026-04-12T00:00:00Z');

    // Obsolete legacy columns must NEVER appear in the write payload.
    expect(fields['TargetSiteKey']).toBeUndefined();
    expect(fields['BindingStatus']).toBeUndefined();
    expect(fields['TemplateKey']).toBeUndefined();
    expect(fields['TemplateVersion']).toBeUndefined();
    expect(fields['PageShellKey']).toBeUndefined();
    expect(fields['SourceTemplatePath']).toBeUndefined();
    expect(fields['LastOperation']).toBeUndefined();
    expect(fields['LastOperationDateUtc']).toBeUndefined();
    expect(fields['LastSuccessfulSyncDateUtc']).toBeUndefined();
  });
});
