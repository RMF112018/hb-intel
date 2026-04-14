import { describe, expect, it } from 'vitest';
import type { PublisherArticleRow } from '../../../data/publisherAdapter/index.js';
import { highlightMatches, matchesDraftQuery } from './draftFilter.js';

function row(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'Atlantic Center Beam Raise',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'atlantic-center-beam-raise',
    TemplateKey: 'ps-inprogress-monthly-v1',
    WorkflowState: 'draft',
    Subhead: 'Crew delivered the schedule pull-in without slowing safety.',
    SummaryExcerpt: 'How the Atlantic Center team shaved 120 days.',
    BodyRichText: '<p>…</p>',
    HeroPrimaryImage: 'https://x/y.jpg',
    HeroPrimaryImageAltText: 'beam',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    IsFeatured: false,
    IsPinned: false,
    ProjectName: 'Atlantic Center',
    AuthorEmail: 'alice@hedrickbrothers.com',
    ...over,
  };
}

describe('matchesDraftQuery', () => {
  it('matches every row when query is empty or whitespace', () => {
    expect(matchesDraftQuery(row(), '')).toBe(true);
    expect(matchesDraftQuery(row(), '   ')).toBe(true);
  });

  it('matches Title case-insensitively', () => {
    expect(matchesDraftQuery(row(), 'beam')).toBe(true);
    expect(matchesDraftQuery(row(), 'BEAM')).toBe(true);
  });

  it('matches ProjectName, Subhead, SummaryExcerpt, Slug', () => {
    expect(matchesDraftQuery(row(), 'atlantic center')).toBe(true);
    expect(matchesDraftQuery(row(), 'safety')).toBe(true);
    expect(matchesDraftQuery(row(), '120 days')).toBe(true);
    expect(matchesDraftQuery(row(), 'atlantic-center-beam')).toBe(true);
  });

  it('matches by AuthorEmail', () => {
    expect(matchesDraftQuery(row(), 'alice@')).toBe(true);
  });

  it('returns false when nothing matches', () => {
    expect(matchesDraftQuery(row(), 'helicopter')).toBe(false);
  });
});

describe('highlightMatches', () => {
  it('returns a single non-match segment when query is empty', () => {
    expect(highlightMatches('Hello there', '')).toEqual([
      { text: 'Hello there', match: false },
    ]);
  });

  it('splits text around a single match', () => {
    expect(highlightMatches('Atlantic Center', 'center')).toEqual([
      { text: 'Atlantic ', match: false },
      { text: 'Center', match: true },
    ]);
  });

  it('splits text around multiple matches', () => {
    expect(highlightMatches('a-b-a-b', 'a')).toEqual([
      { text: 'a', match: true },
      { text: '-b-', match: false },
      { text: 'a', match: true },
      { text: '-b', match: false },
    ]);
  });

  it('preserves original casing in the match segment', () => {
    const segments = highlightMatches('AtLaNtIc', 'ATLANTIC');
    expect(segments).toEqual([{ text: 'AtLaNtIc', match: true }]);
  });

  it('returns empty list for null input', () => {
    expect(highlightMatches(null, 'x')).toEqual([]);
  });

  it('returns a single non-match segment when query does not occur', () => {
    expect(highlightMatches('hello', 'zzz')).toEqual([
      { text: 'hello', match: false },
    ]);
  });
});
