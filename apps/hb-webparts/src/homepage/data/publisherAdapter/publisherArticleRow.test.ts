/**
 * Tenant `HB Articles` master-record round-trip tests.
 *
 * Exercises the read path (`mapArticleRow`) and write path
 * (`mapArticleRowToListFields`) against the tenant-aligned
 * `PublisherArticleRow` shape pinned to the `HB Articles` schema
 * report. These tests pin the master-record contract keyed by
 * `ArticleId` so a silent regression back to the `PostId` / `PostFamily`
 * / `BannerImageUrl` shape breaks CI loudly.
 */
import { describe, expect, it } from 'vitest';
import { mapArticleRow } from './publisherRowMappers';
import { mapArticleRowToListFields } from './publisherWriters';
import type { PublisherArticleRow } from './publisherContracts';

const TENANT_RAW_ROW: Record<string, unknown> = {
  ArticleId: 'art-2026-042',
  Title: 'Acme Tower — April',
  ArticleContentType: 'monthlySpotlight',
  Destination: 'projectSpotlight',
  Slug: 'acme-tower-april',
  TemplateKey: 'ps-inprogress-monthly-v1',
  WorkflowState: 'approved',
  Subhead: 'Concrete pour on-schedule',
  SummaryExcerpt: 'A summary.',
  BodyRichText: '<p>Body.</p>',
  HeroPrimaryImage: { Url: 'https://img.example/hero.jpg' },
  HeroPrimaryImageAltText: 'Aerial view of Acme Tower',
  CreatedDateUtc: '2026-04-01T00:00:00Z',
  UpdatedDateUtc: '2026-04-10T00:00:00Z',
  ProjectId: 'PRJ-1',
  ProjectName: 'Acme Tower',
  SpotlightType: 'monthly',
  ProjectStage: 'active',
  ArticleSubject: 'project',
  TargetSiteUrl:
    'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
  PageTemplateKey: 'ps-inprogress-monthly-v1',
  PageShellVersion: '1.0.0',
  RenderVersion: '1.0.0',
  PageName: 'acme-tower-april.aspx',
  PageSyncStatus: 'in-sync',
  IsFeatured: true,
  FeaturedRank: 1,
  HeroThemeVariant: 'default',
};

describe('PublisherArticleRow — tenant HB Articles round-trip', () => {
  it('mapArticleRow reads the tenant required columns and keys by ArticleId', () => {
    const row = mapArticleRow(TENANT_RAW_ROW);
    expect(row).toBeDefined();
    expect(row!.ArticleId).toBe('art-2026-042');
    expect(row!.ArticleContentType).toBe('monthlySpotlight');
    expect(row!.Destination).toBe('projectSpotlight');
    expect(row!.WorkflowState).toBe('approved');
    expect(row!.HeroPrimaryImage).toBe('https://img.example/hero.jpg');
    expect(row!.HeroPrimaryImageAltText).toBe('Aerial view of Acme Tower');
    expect(row!.SpotlightType).toBe('monthly');
    expect(row!.ProjectStage).toBe('active');
    expect(row!.PageSyncStatus).toBe('in-sync');
  });

  it('mapArticleRow returns undefined when a tenant-required column is missing', () => {
    const missingArticleId = { ...TENANT_RAW_ROW } as Record<string, unknown>;
    delete missingArticleId['ArticleId'];
    expect(mapArticleRow(missingArticleId)).toBeUndefined();

    const missingContentType = { ...TENANT_RAW_ROW } as Record<string, unknown>;
    delete missingContentType['ArticleContentType'];
    expect(mapArticleRow(missingContentType)).toBeUndefined();

    const missingDestination = { ...TENANT_RAW_ROW } as Record<string, unknown>;
    delete missingDestination['Destination'];
    expect(mapArticleRow(missingDestination)).toBeUndefined();

    const missingHero = { ...TENANT_RAW_ROW } as Record<string, unknown>;
    delete missingHero['HeroPrimaryImage'];
    expect(mapArticleRow(missingHero)).toBeUndefined();
  });

  it('mapArticleRow rejects obsolete Post* / Banner* field names silently masquerading as master-record data', () => {
    const legacyRaw: Record<string, unknown> = {
      PostId: 'post-001',
      Title: 'legacy',
      PostFamily: 'monthlySpotlight',
      TargetSiteKey: 'projectSpotlight',
      PageShellKey: 'ps-shell-v1',
      SourceTemplatePath: 'ignored.aspx',
      Slug: 's',
      TemplateKey: 't',
      WorkflowState: 'draft',
      Subhead: 's',
      SummaryExcerpt: 'x',
      BodyRichText: 'x',
      BannerImageUrl: 'https://img.example/legacy.jpg',
      BannerImageAltText: 'legacy alt',
      CreatedDateUtc: '2026-01-01T00:00:00Z',
      UpdatedDateUtc: '2026-01-02T00:00:00Z',
    };
    // Without the tenant-required `ArticleId` / `ArticleContentType` /
    // `Destination` / `HeroPrimaryImage*` columns, the mapper must
    // refuse the row — it cannot silently interpret legacy shapes.
    expect(mapArticleRow(legacyRaw)).toBeUndefined();
  });

  it('mapArticleRowToListFields writes the tenant column names for an HB Articles upsert', () => {
    const row: PublisherArticleRow = mapArticleRow(TENANT_RAW_ROW)!;
    const fields = mapArticleRowToListFields(row);
    expect(fields['ArticleId']).toBe('art-2026-042');
    expect(fields['ArticleContentType']).toBe('monthlySpotlight');
    expect(fields['Destination']).toBe('projectSpotlight');
    expect(fields['HeroPrimaryImageAltText']).toBe('Aerial view of Acme Tower');
    expect(fields['HeroPrimaryImage']).toEqual({
      Url: 'https://img.example/hero.jpg',
      Description: 'https://img.example/hero.jpg',
    });
    // Obsolete master field names must NOT appear in the write payload.
    expect(fields['PostId']).toBeUndefined();
    expect(fields['PostFamily']).toBeUndefined();
    expect(fields['TargetSiteKey']).toBeUndefined();
    expect(fields['PageShellKey']).toBeUndefined();
    expect(fields['SourceTemplatePath']).toBeUndefined();
    expect(fields['BannerImageUrl']).toBeUndefined();
    expect(fields['BannerImageAltText']).toBeUndefined();
  });
});
