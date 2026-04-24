import { describe, expect, it } from 'vitest';
import { toFoleonContentRecord } from '../FoleonContentService.js';

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
});
