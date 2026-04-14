import { describe, expect, it } from 'vitest';
import type { PublisherArticleRow } from '../../../data/publisherAdapter/index.js';
import {
  assessDraftCompleteness,
  assessDraftMissingFields,
  rollupGroupCompleteness,
} from './draftCompleteness.js';

function row(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'Atlantic Center',
    Subhead: 'Subhead.',
    SummaryExcerpt: 'Summary.',
    BodyRichText: '<p>Body.</p>',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'atlantic-center',
    TemplateKey: 'ps-inprogress-monthly-v1',
    WorkflowState: 'draft',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    IsFeatured: false,
    IsPinned: false,
    HeroPrimaryImage: 'https://img/x.jpg',
    HeroPrimaryImageAltText: 'alt',
    ...over,
  };
}

describe('assessDraftMissingFields', () => {
  it('returns an empty list when every required field is present', () => {
    expect(assessDraftMissingFields(row())).toEqual([]);
  });

  it('flags each required field in a stable order', () => {
    const missing = assessDraftMissingFields(
      row({
        Title: '',
        Subhead: '',
        SummaryExcerpt: '',
        BodyRichText: '<p></p>',
        HeroPrimaryImage: '',
        HeroPrimaryImageAltText: '',
        Slug: '',
      }),
    );
    expect(missing).toEqual([
      'Title',
      'Subhead',
      'SummaryExcerpt',
      'BodyRichText',
      'HeroPrimaryImage',
      'HeroPrimaryImageAltText',
      'Slug',
    ]);
  });

  it('treats whitespace-only and TipTap-empty body as missing', () => {
    expect(
      assessDraftMissingFields(row({ BodyRichText: '<p>&nbsp;</p>' })),
    ).toContain('BodyRichText');
    expect(
      assessDraftMissingFields(row({ Title: '   ' })),
    ).toContain('Title');
  });
});

describe('assessDraftCompleteness', () => {
  it('ready when every required field is present', () => {
    const out = assessDraftCompleteness(row());
    expect(out.level).toBe('ready');
    expect(out.chipLabel).toBe('Ready');
    expect(out.missingCount).toBe(0);
  });

  it('todo(n) when fields are missing — chip label is plural-safe', () => {
    const one = assessDraftCompleteness(row({ Title: '' }));
    expect(one.level).toBe('todo');
    expect(one.chipLabel).toBe('1 TODO');
    expect(one.ariaLabel).toMatch(/1 thing to do/);
    expect(one.missingFields).toEqual(['Title']);

    const many = assessDraftCompleteness(
      row({ Title: '', Subhead: '', Slug: '' }),
    );
    expect(many.chipLabel).toBe('3 TODO');
    expect(many.ariaLabel).toMatch(/3 things to do/);
    expect(many.ariaLabel).toMatch(/Title/);
  });

  it('blocked when archived or withdrawn regardless of field completeness', () => {
    expect(assessDraftCompleteness(row({ WorkflowState: 'archived' })).level).toBe(
      'blocked',
    );
    expect(assessDraftCompleteness(row({ WorkflowState: 'withdrawn' })).level).toBe(
      'blocked',
    );
  });

  it('blocked chip distinguishes archived from withdrawn in its aria-label', () => {
    expect(
      assessDraftCompleteness(row({ WorkflowState: 'archived' })).ariaLabel,
    ).toMatch(/archived/);
    expect(
      assessDraftCompleteness(row({ WorkflowState: 'withdrawn' })).ariaLabel,
    ).toMatch(/withdrawn/);
  });
});

describe('rollupGroupCompleteness', () => {
  it('aggregates counts across a mixed group', () => {
    const rollup = rollupGroupCompleteness([
      row(),
      row({ ArticleId: 'a-2', Title: '' }),
      row({ ArticleId: 'a-3', WorkflowState: 'archived' }),
      row({ ArticleId: 'a-4', Slug: '', SummaryExcerpt: '' }),
    ]);
    expect(rollup).toEqual({ ready: 1, todo: 2, blocked: 1, total: 4 });
  });

  it('returns zero counts for an empty group', () => {
    expect(rollupGroupCompleteness([])).toEqual({
      ready: 0,
      todo: 0,
      blocked: 0,
      total: 0,
    });
  });
});
