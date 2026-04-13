import { describe, expect, it } from 'vitest';
import { buildHeroArticleContent } from '../../webparts/hbSignatureHero/articleConfig.js';

describe('buildHeroArticleContent — Phase-04 property-pane → runtime mapping', () => {
  it('returns undefined when any required field is missing or empty', () => {
    expect(buildHeroArticleContent(undefined)).toBeUndefined();
    expect(buildHeroArticleContent({})).toBeUndefined();
    expect(
      buildHeroArticleContent({
        articleTitle: 'T',
        articleAuthor: 'A',
        // publishedDate missing
      }),
    ).toBeUndefined();
    expect(
      buildHeroArticleContent({
        articleTitle: '   ',
        articleAuthor: 'A',
        articlePublishedDate: '2026-04-13',
      }),
    ).toBeUndefined();
  });

  it('builds a minimal article when only the required triad is populated', () => {
    const result = buildHeroArticleContent({
      articleTitle: '  A Major Milestone  ',
      articleAuthor: 'Avery Stone',
      articlePublishedDate: '2026-04-13',
    });
    expect(result).toEqual({
      title: 'A Major Milestone',
      author: 'Avery Stone',
      publishedDate: '2026-04-13',
      subheading: undefined,
      primaryImage: undefined,
      publishedTime: undefined,
      labels: undefined,
      destinationUrl: undefined,
      authorUpn: undefined,
      authorPhotoUrl: undefined,
    });
  });

  it('maps all optional fields and splits labels on commas and pipes', () => {
    const result = buildHeroArticleContent({
      articleTitle: 'Full Article',
      articleAuthor: 'Pat Field',
      articlePublishedDate: '2026-04-13',
      articleSubheading: 'Deck line.',
      articlePrimaryImageUrl: 'https://example.invalid/hero.jpg',
      articlePublishedTime: '09:15 AM',
      articleLabels: 'Project, Field | Quality',
      articleDestinationUrl: 'https://example.invalid/articles/x',
      articleAuthorUpn: 'pat.field@example.invalid',
      articleAuthorPhotoUrl: 'https://cdn.example.invalid/pat.jpg',
    });
    expect(result).toEqual({
      title: 'Full Article',
      author: 'Pat Field',
      publishedDate: '2026-04-13',
      subheading: 'Deck line.',
      primaryImage: 'https://example.invalid/hero.jpg',
      publishedTime: '09:15 AM',
      labels: ['Project', 'Field', 'Quality'],
      destinationUrl: 'https://example.invalid/articles/x',
      authorUpn: 'pat.field@example.invalid',
      authorPhotoUrl: 'https://cdn.example.invalid/pat.jpg',
    });
  });

  it('ignores non-string property values', () => {
    const result = buildHeroArticleContent({
      articleTitle: 'X',
      articleAuthor: 'Y',
      articlePublishedDate: '2026-04-13',
      articleSubheading: 42 as unknown as string,
      articleLabels: null as unknown as string,
    });
    expect(result?.subheading).toBeUndefined();
    expect(result?.labels).toBeUndefined();
  });
});
