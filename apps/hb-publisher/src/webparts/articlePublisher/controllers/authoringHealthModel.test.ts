/**
 * Phase-11 Prompt-02 — authoring-health preflight model tests.
 *
 * Pins the pure preflight derivation used by `useReadinessController`
 * and the top-of-canvas health banner. The goal is not just to prove
 * "a state exists for X" but to prove the model keeps global
 * bootstrap failures (empty/unreadable registry) distinct from
 * draft-specific no-match conditions — the misdiagnosis that was
 * the actual defect before this prompt.
 */
import { describe, expect, it } from 'vitest';
import {
  authoringHealthActionHint,
  authoringHealthHeadline,
  deriveAuthoringHealth,
  isAuthoringHealthy,
  isGlobalAuthoringFailure,
} from './authoringHealthModel';
import type {
  PublisherArticleRow,
  PublisherTemplateRegistryRow,
} from '../../../data/publisherAdapter/index.js';

function projectSpotlightTemplate(
  over: Partial<PublisherTemplateRegistryRow> = {},
): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'tmpl-ps-monthly-v1',
    TemplateName: 'Project Spotlight Monthly v1',
    Destination: 'projectSpotlight',
    ContentTypes: ['monthlySpotlight'],
    SpotlightTypes: undefined,
    ProjectStages: undefined,
    ArticleSubjects: undefined,
    IsActive: true,
    Priority: 100,
    VersionLabel: '1.0.0',
    RequiredFieldSetKey: 'req-ps-inprogress-monthly-v1',
    ShowTeamViewer: true,
    ShowGallery: true,
    HeroProfileKey: 'hbSignatureHero',
    PageTemplateKey: 'tmpl-ps-monthly-v1',
    PageShellKey: 'hbSignaturePageShell',
    ...over,
  } as unknown as PublisherTemplateRegistryRow;
}

function matchingDraft(
  over: Partial<PublisherArticleRow> = {},
): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'T',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: '',
    TemplateKey: '',
    WorkflowState: 'draft',
    Subhead: 's',
    SummaryExcerpt: 'x',
    BodyRichText: '<p>b</p>',
    HeroPrimaryImage: 'h',
    HeroPrimaryImageAltText: 'a',
    CreatedDateUtc: '2026-04-15T00:00:00Z',
    UpdatedDateUtc: '2026-04-15T00:00:00Z',
    IsFeatured: false,
    IsPinned: false,
    ...over,
  } as unknown as PublisherArticleRow;
}

describe('authoringHealthModel — deriveAuthoringHealth priority', () => {
  it('returns loading while the registry read is in flight', () => {
    const health = deriveAuthoringHealth({
      registry: { loading: true, rows: undefined, error: undefined },
      articleDraft: undefined,
    });
    expect(health.kind).toBe('loading');
    expect(isAuthoringHealthy(health)).toBe(false);
    expect(isGlobalAuthoringFailure(health)).toBe(false);
  });

  it('prefers registryReadFailure over emptyRegistry when the read threw', () => {
    const health = deriveAuthoringHealth({
      registry: {
        loading: false,
        rows: undefined,
        error: 'SPList access denied',
      },
      articleDraft: matchingDraft(),
    });
    expect(health.kind).toBe('registryReadFailure');
    if (health.kind !== 'registryReadFailure') throw new Error();
    expect(health.message).toBe('SPList access denied');
    expect(isGlobalAuthoringFailure(health)).toBe(true);
  });

  it('returns emptyRegistry when the read succeeded but returned zero rows', () => {
    const health = deriveAuthoringHealth({
      registry: { loading: false, rows: [], error: undefined },
      articleDraft: matchingDraft(),
    });
    expect(health.kind).toBe('emptyRegistry');
    expect(isGlobalAuthoringFailure(health)).toBe(true);
  });

  it('returns healthy when the registry is populated and no draft is selected', () => {
    const health = deriveAuthoringHealth({
      registry: {
        loading: false,
        rows: [projectSpotlightTemplate()],
        error: undefined,
      },
      articleDraft: undefined,
    });
    expect(health.kind).toBe('healthy');
    expect(isAuthoringHealthy(health)).toBe(true);
  });

  it('returns healthy when the registry is populated and the draft resolves', () => {
    const health = deriveAuthoringHealth({
      registry: {
        loading: false,
        rows: [projectSpotlightTemplate()],
        error: undefined,
      },
      articleDraft: matchingDraft(),
    });
    expect(health.kind).toBe('healthy');
  });

  it('returns draftNoTemplateMatch for a draft whose discriminators do not resolve', () => {
    const health = deriveAuthoringHealth({
      registry: {
        loading: false,
        // Registry has a PS template, but this draft is companyPulse —
        // a valid registry + an unmatchable draft is exactly the
        // author-actionable case the model must keep distinct from a
        // global environment failure.
        rows: [projectSpotlightTemplate()],
        error: undefined,
      },
      articleDraft: matchingDraft({
        Destination: 'companyPulse',
      }),
    });
    expect(health.kind).toBe('draftNoTemplateMatch');
    expect(isGlobalAuthoringFailure(health)).toBe(false);
    if (health.kind === 'draftNoTemplateMatch') {
      expect(health.reason).toBeDefined();
    }
  });
});

describe('authoringHealthModel — copy helpers keep global vs draft problems distinct', () => {
  it('uses distinct headlines for empty vs read-failure vs no-match', () => {
    const empty = authoringHealthHeadline({ kind: 'emptyRegistry' });
    const readFail = authoringHealthHeadline({
      kind: 'registryReadFailure',
      message: 'x',
    });
    const noMatch = authoringHealthHeadline({
      kind: 'draftNoTemplateMatch',
      reason: 'noCandidate',
      message: 'x',
    });
    expect(empty).not.toBe(readFail);
    expect(empty).not.toBe(noMatch);
    expect(readFail).not.toBe(noMatch);
  });

  it('routes global failures to platform-team hints and draft failures to author-actionable hints', () => {
    expect(authoringHealthActionHint({ kind: 'emptyRegistry' })).toMatch(
      /platform team/i,
    );
    expect(
      authoringHealthActionHint({
        kind: 'registryReadFailure',
        message: 'x',
      }),
    ).toMatch(/platform team|Reload/i);
    expect(
      authoringHealthActionHint({
        kind: 'draftNoTemplateMatch',
        reason: 'noCandidate',
        message: 'x',
      }),
    ).toMatch(/content type|destination|discriminator/i);
  });

  it('returns no hint when the environment is healthy or still loading', () => {
    expect(authoringHealthActionHint({ kind: 'healthy' })).toBeUndefined();
    expect(authoringHealthActionHint({ kind: 'loading' })).toBeUndefined();
  });
});
