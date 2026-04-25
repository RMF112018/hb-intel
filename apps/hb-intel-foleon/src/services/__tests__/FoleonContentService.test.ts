import { describe, expect, it } from 'vitest';
import {
  FOLEON_CONTENT_SELECT_FIELDS,
  toFoleonContentRecord,
} from '../FoleonContentService.js';
import {
  FOLEON_CONTENT_REGISTRY_SCHEMA,
  assertSelectFieldsInSchema,
} from '../../schema/foleonListSchemas.js';

describe('toFoleonContentRecord', () => {
  it('returns null when Id or FoleonDocId is missing', () => {
    expect(toFoleonContentRecord({ Title: 'x' })).toBeNull();
    expect(toFoleonContentRecord({ Id: 1, Title: 'x' })).toBeNull();
  });

  it('unwraps hyperlink fields supplied as { Url } objects', () => {
    const record = toFoleonContentRecord({
      Id: 42,
      Title: 'Example',
      FoleonDocId: 999,
      ContentTypeKey: 'Newsletter',
      PublishStatus: 'Published',
      IsVisible: true,
      AllowEmbed: true,
      OpenMode: 'Inline Reader',
      PublishedUrl: { Url: 'https://viewer.us.foleon.com/published/abc/' },
      ThumbnailUrl: 'https://cdn.example.com/thumb.png',
    });
    expect(record?.publishedUrl).toBe('https://viewer.us.foleon.com/published/abc/');
    expect(record?.thumbnailUrl).toBe('https://cdn.example.com/thumb.png');
  });

  it('normalizes unknown choice values to safe defaults', () => {
    const record = toFoleonContentRecord({
      Id: 1,
      Title: 'x',
      FoleonDocId: 2,
      ContentTypeKey: 'Unknown Type',
      PublishStatus: 'Unknown',
      OpenMode: 'Unknown',
      AllowEmbed: true,
      IsVisible: true,
    });
    expect(record?.contentTypeKey).toBe('Other');
    expect(record?.publishStatus).toBe('Draft');
    expect(record?.openMode).toBe('Inline Reader');
  });

  it('coerces booleans from truthy / falsy values', () => {
    const record = toFoleonContentRecord({
      Id: 1,
      Title: 'x',
      FoleonDocId: 2,
      ContentTypeKey: 'Project Highlight',
      PublishStatus: 'Published',
      AllowEmbed: true,
      IsVisible: true,
      IsFeatured: false,
      RequiresExternalOpen: undefined,
    });
    expect(record?.isVisible).toBe(true);
    expect(record?.isFeatured).toBe(false);
    expect(record?.requiresExternalOpen).toBe(false);
  });

  it('maps two-lane scalar fields without person-field expansion', () => {
    const record = toFoleonContentRecord({
      Id: 1,
      Title: 'Project Spotlight',
      FoleonDocId: 2,
      ContentTypeKey: 'Project Spotlight',
      ReaderKey: 'project-spotlight',
      Cadence: 'Monthly',
      HomepageSlot: 'Project Spotlight Reader',
      ArchiveGroup: '2026-04',
      ActiveEdition: true,
      PrimaryAudience: 'Companywide',
      LastEditorialUpdate: '2026-04-25T12:00:00.000Z',
      PublishStatus: 'Published',
      AllowEmbed: true,
      IsVisible: true,
    });

    expect(record).toMatchObject({
      contentTypeKey: 'Project Spotlight',
      readerKey: 'project-spotlight',
      cadence: 'Monthly',
      homepageSlot: 'Project Spotlight Reader',
      archiveGroup: '2026-04',
      activeEdition: true,
      primaryAudience: 'Companywide',
      lastEditorialUpdate: '2026-04-25T12:00:00.000Z',
    });
  });
});

describe('FOLEON_CONTENT_SELECT_FIELDS', () => {
  it('uses a schema-valid public projection with Id exception', () => {
    const selected = FOLEON_CONTENT_SELECT_FIELDS.split(',');
    expect(() =>
      assertSelectFieldsInSchema(FOLEON_CONTENT_REGISTRY_SCHEMA, selected),
    ).not.toThrow();
  });

  it('does not include person-field projections requiring $expand', () => {
    expect(FOLEON_CONTENT_SELECT_FIELDS).not.toContain('MarketingOwner');
    expect(FOLEON_CONTENT_SELECT_FIELDS).not.toContain('AudienceGroups');
  });

  it('includes only the new scalar-safe lane fields', () => {
    const selected = FOLEON_CONTENT_SELECT_FIELDS.split(',');
    expect(selected).toEqual(expect.arrayContaining([
      'ReaderKey',
      'Cadence',
      'HomepageSlot',
      'ArchiveGroup',
      'ActiveEdition',
      'PrimaryAudience',
      'LastEditorialUpdate',
    ]));
    expect(selected).not.toContain('MarketingOwner');
    expect(selected).not.toContain('AudienceGroups');
  });

  it('does not include excluded governance/admin fields', () => {
    for (const excluded of [
      'Tags',
      'FirstPublishedOn',
      'FoleonModifiedOn',
      'RelatedProjectSiteUrl',
      'LastSynced',
      'SyncHash',
      'RawFoleonJson',
      'AdminNotes',
    ]) {
      expect(FOLEON_CONTENT_SELECT_FIELDS).not.toContain(excluded);
    }
  });
});
