import { describe, expect, it } from 'vitest';
import {
  SLUG_MAX_LENGTH,
  applySlugUniqueness,
  generateSlug,
  generateSlugFromTitle,
  resolveSlugForSave,
  shouldRegenerateSlug,
} from './slugGovernance';

describe('generateSlugFromTitle', () => {
  it('lowercases, hyphenates, and trims a normal title', () => {
    expect(generateSlugFromTitle('A Premium Project Spotlight!'))
      .toBe('a-premium-project-spotlight');
  });

  it('collapses runs of non-alphanumeric characters', () => {
    expect(generateSlugFromTitle('Hello   ---   World!!!')).toBe('hello-world');
  });

  it('drops apostrophes inside words rather than splitting them', () => {
    expect(generateSlugFromTitle("Bob's Project — Phase 2")).toBe('bobs-project-phase-2');
  });

  it('returns an empty string for content with no usable characters', () => {
    expect(generateSlugFromTitle('!!!')).toBe('');
    expect(generateSlugFromTitle('   ')).toBe('');
    expect(generateSlugFromTitle('')).toBe('');
  });

  it('truncates to the configured maximum length', () => {
    const long = 'a'.repeat(SLUG_MAX_LENGTH + 50);
    const result = generateSlugFromTitle(long);
    expect(result.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(result).toBe('a'.repeat(SLUG_MAX_LENGTH));
  });
});

describe('generateSlug', () => {
  it('uses the title when usable', () => {
    expect(generateSlug({ Title: 'Hello World', ArticleId: 'art-123' })).toBe('hello-world');
  });

  it('falls back to untitled-<id-tail> when the title is empty', () => {
    expect(generateSlug({ Title: '', ArticleId: 'art-abcdef-1234' })).toBe('untitled-f-1234');
  });

  it('falls back when the title produces an empty slug', () => {
    expect(generateSlug({ Title: '!!!', ArticleId: 'xxxxxxabcdef' })).toBe('untitled-abcdef');
  });
});

describe('applySlugUniqueness', () => {
  it('returns the candidate unchanged when no collision exists', () => {
    expect(applySlugUniqueness('hello-world', new Set())).toBe('hello-world');
    expect(applySlugUniqueness('hello-world', new Set(['other']))).toBe('hello-world');
  });

  it('appends -2 on first collision', () => {
    expect(applySlugUniqueness('hello-world', new Set(['hello-world']))).toBe('hello-world-2');
  });

  it('walks up the suffix on consecutive collisions', () => {
    const taken = new Set(['hello', 'hello-2', 'hello-3']);
    expect(applySlugUniqueness('hello', taken)).toBe('hello-4');
  });

  it('respects SLUG_MAX_LENGTH when appending a suffix', () => {
    const base = 'a'.repeat(SLUG_MAX_LENGTH);
    const taken = new Set([base]);
    const result = applySlugUniqueness(base, taken);
    expect(result.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(result.endsWith('-2')).toBe(true);
  });

  it('returns the empty string unchanged for an empty candidate', () => {
    expect(applySlugUniqueness('', new Set(['hello']))).toBe('');
  });
});

describe('shouldRegenerateSlug', () => {
  it('regenerates while in draft', () => {
    expect(shouldRegenerateSlug('draft', 'hello-world')).toBe(true);
  });

  it('preserves an existing slug once out of draft', () => {
    expect(shouldRegenerateSlug('review', 'hello-world')).toBe(false);
    expect(shouldRegenerateSlug('approved', 'hello-world')).toBe(false);
    expect(shouldRegenerateSlug('published', 'hello-world')).toBe(false);
    expect(shouldRegenerateSlug('archived', 'hello-world')).toBe(false);
    expect(shouldRegenerateSlug('withdrawn', 'hello-world')).toBe(false);
  });

  it('regenerates when the persisted slug is missing or blank, regardless of state', () => {
    expect(shouldRegenerateSlug('published', '')).toBe(true);
    expect(shouldRegenerateSlug('published', '   ')).toBe(true);
    expect(shouldRegenerateSlug('approved', undefined)).toBe(true);
    expect(shouldRegenerateSlug('approved', null)).toBe(true);
  });
});

describe('resolveSlugForSave', () => {
  it('regenerates from title and applies uniqueness while in draft', () => {
    const next = resolveSlugForSave(
      {
        ArticleId: 'art-1',
        Title: 'Hello World',
        Slug: 'old-slug',
        WorkflowState: 'draft',
      },
      new Set(['hello-world']),
    );
    expect(next).toBe('hello-world-2');
  });

  it('preserves the persisted slug once out of draft', () => {
    const next = resolveSlugForSave(
      {
        ArticleId: 'art-1',
        Title: 'A Brand New Title',
        Slug: 'frozen-slug',
        WorkflowState: 'published',
      },
      new Set(['frozen-slug', 'a-brand-new-title']),
    );
    expect(next).toBe('frozen-slug');
  });

  it('regenerates when slug is missing on a non-draft article', () => {
    const next = resolveSlugForSave(
      {
        ArticleId: 'art-1',
        Title: 'Recover Slug',
        Slug: '',
        WorkflowState: 'review',
      },
      new Set(),
    );
    expect(next).toBe('recover-slug');
  });

  it('falls back to untitled-<id-tail> when no title is set', () => {
    const next = resolveSlugForSave(
      {
        ArticleId: 'art-aaaaaa-bbbbbb',
        Title: '',
        Slug: '',
        WorkflowState: 'draft',
      },
      new Set(),
    );
    expect(next).toBe('untitled-bbbbbb');
  });
});
