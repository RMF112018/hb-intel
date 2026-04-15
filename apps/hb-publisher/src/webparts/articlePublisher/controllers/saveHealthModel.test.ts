/**
 * Phase-11 Prompt-01 — first-persistence save-health model tests.
 *
 * Pins the pure derivation used by `useReadinessController` to gate
 * Save draft truthfully. Exercises the priority order, the
 * tenant-required first-persistence field list, and the
 * subsequent-persistence short-circuit.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NEW_DRAFT_TITLE,
  deriveSaveHealth,
  isSaveReady,
  missingFirstPersistenceFields,
  saveDisabledReason,
  type SaveHealth,
} from './saveHealthModel';
import type { PublisherArticleRow } from '../../../data/publisherAdapter/index.js';

function readyFirstSaveDraft(
  over: Partial<PublisherArticleRow> = {},
): PublisherArticleRow {
  return {
    ArticleId: 'art-new',
    Title: 'Project X comes online',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: '',
    TemplateKey: '',
    WorkflowState: 'draft',
    Subhead: 'Short subhead',
    SummaryExcerpt: 'A rollup summary of the work.',
    BodyRichText: '<p>Actual body copy.</p>',
    HeroPrimaryImage: 'https://img.example/hero.jpg',
    HeroPrimaryImageAltText: 'Hero describing the project',
    CreatedDateUtc: '2026-04-15T00:00:00Z',
    UpdatedDateUtc: '2026-04-15T00:00:00Z',
    ProjectId: 'proj-42',
    ProjectName: 'Project X',
    IsFeatured: false,
    IsPinned: false,
    TargetSiteUrl: undefined,
    ...over,
  } as unknown as PublisherArticleRow;
}

function blankDraft(): PublisherArticleRow {
  return {
    ArticleId: 'art-new',
    Title: DEFAULT_NEW_DRAFT_TITLE,
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: '',
    TemplateKey: '',
    WorkflowState: 'draft',
    Subhead: '',
    SummaryExcerpt: '',
    BodyRichText: '',
    HeroPrimaryImage: '',
    HeroPrimaryImageAltText: '',
    CreatedDateUtc: '2026-04-15T00:00:00Z',
    UpdatedDateUtc: '2026-04-15T00:00:00Z',
    IsFeatured: false,
    IsPinned: false,
  } as unknown as PublisherArticleRow;
}

function baseInputs() {
  return {
    articleDraft: readyFirstSaveDraft(),
    busy: false,
    unsupportedDestinationMessage: undefined,
    unsupportedContentTypeMessage: undefined,
    isPersisted: false,
  };
}

describe('saveHealthModel — missingFirstPersistenceFields', () => {
  it('flags default "Untitled article" title as blocking', () => {
    const missing = missingFirstPersistenceFields(
      readyFirstSaveDraft({ Title: DEFAULT_NEW_DRAFT_TITLE }),
    );
    expect(missing.some((m) => m.field === 'Title')).toBe(true);
  });

  it('flags each tenant first-persistence field independently', () => {
    const missing = missingFirstPersistenceFields(blankDraft());
    const fields = missing.map((m) => m.field);
    expect(fields).toEqual(
      expect.arrayContaining([
        'Title',
        'ProjectBinding',
        'Subhead',
        'SummaryExcerpt',
        'BodyRichText',
        'HeroPrimaryImage',
      ]),
    );
  });

  it('treats rich-body "<p></p>" as empty', () => {
    const missing = missingFirstPersistenceFields(
      readyFirstSaveDraft({ BodyRichText: '<p></p>' }),
    );
    expect(missing.some((m) => m.field === 'BodyRichText')).toBe(true);
  });

  it('requires hero alt text only when a hero image exists', () => {
    const noImage = missingFirstPersistenceFields(
      readyFirstSaveDraft({ HeroPrimaryImage: '', HeroPrimaryImageAltText: '' }),
    );
    // Missing image is the blocker, not alt text (alt is conditional).
    expect(noImage.some((m) => m.field === 'HeroPrimaryImage')).toBe(true);
    expect(noImage.some((m) => m.field === 'HeroPrimaryImageAltText')).toBe(
      false,
    );

    const withImageNoAlt = missingFirstPersistenceFields(
      readyFirstSaveDraft({ HeroPrimaryImageAltText: '' }),
    );
    expect(
      withImageNoAlt.some((m) => m.field === 'HeroPrimaryImageAltText'),
    ).toBe(true);
  });

  it('returns an empty list for a fully satisfied first-save draft', () => {
    expect(missingFirstPersistenceFields(readyFirstSaveDraft())).toEqual([]);
  });
});

describe('saveHealthModel — deriveSaveHealth priority order', () => {
  it('returns noDraft when articleDraft is undefined', () => {
    const health = deriveSaveHealth({ ...baseInputs(), articleDraft: undefined });
    expect(health.kind).toBe('noDraft');
    expect(isSaveReady(health)).toBe(false);
  });

  it('busy outranks missing-fields', () => {
    const health = deriveSaveHealth({
      ...baseInputs(),
      articleDraft: blankDraft(),
      busy: true,
    });
    expect(health.kind).toBe('busy');
  });

  it('unsupported destination outranks missing-fields', () => {
    const health = deriveSaveHealth({
      ...baseInputs(),
      articleDraft: blankDraft(),
      unsupportedDestinationMessage: 'destination not wired',
    });
    expect(health.kind).toBe('unsupportedDestination');
  });

  it('unsupported content type outranks missing-fields', () => {
    const health = deriveSaveHealth({
      ...baseInputs(),
      articleDraft: blankDraft(),
      unsupportedContentTypeMessage: 'milestone legacy',
    });
    expect(health.kind).toBe('unsupportedContentType');
  });

  it('returns missingFirstPersistenceFields for a fresh blank draft', () => {
    const health = deriveSaveHealth({
      ...baseInputs(),
      articleDraft: blankDraft(),
    });
    expect(health.kind).toBe('missingFirstPersistenceFields');
    if (health.kind !== 'missingFirstPersistenceFields') throw new Error();
    expect(health.missing.length).toBeGreaterThan(0);
    expect(isSaveReady(health)).toBe(false);
  });

  it('returns readyFirstPersistence when every required field is satisfied', () => {
    const health: SaveHealth = deriveSaveHealth(baseInputs());
    expect(health.kind).toBe('readyFirstPersistence');
    expect(isSaveReady(health)).toBe(true);
  });

  it('short-circuits to readySubsequentPersistence once isPersisted=true, even with blank fields', () => {
    const health = deriveSaveHealth({
      ...baseInputs(),
      articleDraft: blankDraft(),
      isPersisted: true,
    });
    expect(health.kind).toBe('readySubsequentPersistence');
    expect(isSaveReady(health)).toBe(true);
  });
});

describe('saveHealthModel — saveDisabledReason', () => {
  it('returns undefined for both ready kinds', () => {
    expect(
      saveDisabledReason({ kind: 'readyFirstPersistence' }),
    ).toBeUndefined();
    expect(
      saveDisabledReason({ kind: 'readySubsequentPersistence' }),
    ).toBeUndefined();
  });

  it('summarises missing-field count', () => {
    const health = deriveSaveHealth({
      ...baseInputs(),
      articleDraft: blankDraft(),
    });
    expect(saveDisabledReason(health)).toMatch(/Finish \d+ required field/);
  });

  it('propagates destination / content-type messages verbatim', () => {
    expect(
      saveDisabledReason({ kind: 'unsupportedDestination', message: 'x' }),
    ).toBe('x');
    expect(
      saveDisabledReason({ kind: 'unsupportedContentType', message: 'y' }),
    ).toBe('y');
  });
});
