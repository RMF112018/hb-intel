/**
 * Phase-09 Prompt-06 — readiness-controller milestone legacy hard-block.
 *
 * Pins the UI-side invariant that a `milestoneSpotlight` draft surfaces
 * a blocking content-type message and has Publish / Republish disabled.
 * The orchestrator enforces the same invariant server-side (see
 * `publishOrchestrator.test.ts`); this test guarantees the UI gate
 * agrees so the button can never become clickable for milestone
 * legacy drafts.
 */
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useReadinessController,
  type ReadinessControllerInputs,
} from './useReadinessController';
import type {
  PublisherArticleRow,
  PublisherPageBindingRow,
} from '../../../data/publisherAdapter/index.js';

function article(
  over: Partial<PublisherArticleRow> = {},
): PublisherArticleRow {
  return {
    ArticleId: 'art-001',
    Title: 'Draft',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'draft',
    TemplateKey: 'tmpl-v1',
    WorkflowState: 'approved',
    Subhead: 's',
    SummaryExcerpt: 'e',
    BodyRichText: '<p>b</p>',
    HeroPrimaryImage: 'https://img.example/h.jpg',
    HeroPrimaryImageAltText: 'alt',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-10T00:00:00Z',
    ...over,
  } as PublisherArticleRow;
}

function binding(): PublisherPageBindingRow {
  return {
    BindingId: 'bnd-001',
    ArticleId: 'art-001',
    Title: 'Draft',
    PublishStatus: 'published',
    TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    PageId: '1',
    PageName: 'draft.aspx',
    PageShellVersion: '1.0.0',
    PageTemplateKey: 'tmpl-v1',
    RenderVersion: '1.0.0',
  };
}

function inputs(
  over: Partial<ReadinessControllerInputs> = {},
): ReadinessControllerInputs {
  return {
    articleDraft: article(),
    binding: undefined,
    preview: undefined,
    promotionPolicy: undefined,
    busy: false,
    ...over,
  };
}

describe('useReadinessController — save-health first-persistence gate', () => {
  it('blocks Save draft on a fresh (not-yet-persisted) draft with missing tenant fields', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({
            Title: 'Untitled article',
            Subhead: '',
            SummaryExcerpt: '',
            BodyRichText: '',
            HeroPrimaryImage: '',
            HeroPrimaryImageAltText: '',
          }),
          isPersisted: false,
        }),
      ),
    );
    expect(result.current.saveEnabled).toBe(false);
    expect(result.current.saveHealth.kind).toBe('missingFirstPersistenceFields');
    if (result.current.saveHealth.kind === 'missingFirstPersistenceFields') {
      const fields = result.current.saveHealth.missing.map((m) => m.field);
      expect(fields).toEqual(
        expect.arrayContaining([
          'Title',
          'Subhead',
          'SummaryExcerpt',
          'BodyRichText',
          'HeroPrimaryImage',
        ]),
      );
    }
    expect(result.current.saveBlockedReason).toMatch(
      /Finish .* required field/,
    );
  });

  it('enables Save draft once first-persistence fields are satisfied', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({
            // article() already fills tenant fields; add project
            // binding required by the first-persistence rule set.
            ProjectId: 'proj-1',
            ProjectName: 'Proj 1',
          } as Partial<PublisherArticleRow>),
          isPersisted: false,
        }),
      ),
    );
    expect(result.current.saveHealth.kind).toBe('readyFirstPersistence');
    expect(result.current.saveEnabled).toBe(true);
    expect(result.current.saveBlockedReason).toBeUndefined();
  });

  it('short-circuits to readySubsequentPersistence once the master row has been persisted', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ Title: 'Untitled article', Subhead: '' }),
          isPersisted: true,
        }),
      ),
    );
    expect(result.current.saveHealth.kind).toBe('readySubsequentPersistence');
    expect(result.current.saveEnabled).toBe(true);
  });

  it('busy outranks missing-first-persistence fields', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ Title: 'Untitled article' }),
          isPersisted: false,
          busy: true,
        }),
      ),
    );
    expect(result.current.saveHealth.kind).toBe('busy');
    expect(result.current.saveEnabled).toBe(false);
  });
});

describe('useReadinessController — authoring-health preflight gating', () => {
  const healthyRegistry = {
    loading: false,
    rows: [
      {
        TemplateKey: 'tmpl-ps-monthly-v1',
        TemplateName: 'Project Spotlight Monthly v1',
        IsActive: true,
        TemplatePriority: 100,
        VersionLabel: '1.0.0',
        ContentTypes: ['monthlySpotlight'],
        Destination: 'projectSpotlight',
        PageShellTemplateKey: 'hbSignaturePageShell',
        HeroProfileKey: 'hbSignatureHero',
        BodyProfileKey: 'hbSignatureBody',
        ShowHero: true,
        ShowBody: true,
        ShowTeamViewer: true,
        ShowGallery: true,
        ShowSecondaryImage: false,
        RequiredFieldSetKey: 'req-ps-inprogress-monthly-v1',
      },
    ],
    error: undefined,
  } as unknown as {
    loading: boolean;
    rows: readonly never[];
    error: string | undefined;
  };

  it('blocks publish/republish/save when the registry is empty', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ WorkflowState: 'approved' }),
          isPersisted: true,
          templateRegistry: { loading: false, rows: [], error: undefined },
        }),
      ),
    );
    expect(result.current.authoringHealth.kind).toBe('emptyRegistry');
    expect(result.current.publishEnabled).toBe(false);
    expect(result.current.saveEnabled).toBe(false);
    expect(result.current.saveBlockedReason).toMatch(/no active.*template/i);
  });

  it('blocks writes when the registry read failed', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ WorkflowState: 'approved' }),
          isPersisted: true,
          templateRegistry: {
            loading: false,
            rows: undefined,
            error: 'network timeout',
          },
        }),
      ),
    );
    expect(result.current.authoringHealth.kind).toBe('registryReadFailure');
    expect(result.current.publishEnabled).toBe(false);
    expect(result.current.saveEnabled).toBe(false);
    expect(result.current.saveBlockedReason).toMatch(/network timeout/);
  });

  it('reports draftNoTemplateMatch without classifying it as a global failure', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({
            // Supported destination (no destination hard-block) but the
            // registry's lone row only declares `monthlySpotlight`, so
            // a `projectUpdate` draft fails resolution on content-type
            // applicability rather than destination or milestone legacy.
            ArticleContentType: 'projectUpdate',
            WorkflowState: 'approved',
          } as Partial<PublisherArticleRow>),
          isPersisted: true,
          templateRegistry: healthyRegistry as unknown as typeof healthyRegistry,
        }),
      ),
    );
    expect(result.current.authoringHealth.kind).toBe('draftNoTemplateMatch');
    expect(result.current.authoringGlobalFailure).toBe(false);
    // Publish is blocked by the resolution gap …
    expect(result.current.publishEnabled).toBe(false);
    // … but save is not blocked by the preflight (the save-time
    // resolver owns that refusal, with its own targeted copy).
    expect(result.current.saveEnabled).toBe(true);
  });

  it('clears the preflight block once the registry becomes healthy', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ WorkflowState: 'approved' }),
          isPersisted: true,
          templateRegistry: healthyRegistry as unknown as typeof healthyRegistry,
        }),
      ),
    );
    expect(result.current.authoringHealth.kind).toBe('healthy');
    expect(result.current.saveEnabled).toBe(true);
    expect(result.current.publishEnabled).toBe(true);
  });

  it('treats the loading state as a soft write-block without scary copy', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ WorkflowState: 'approved' }),
          isPersisted: true,
          templateRegistry: {
            loading: true,
            rows: undefined,
            error: undefined,
          },
        }),
      ),
    );
    expect(result.current.authoringHealth.kind).toBe('loading');
    expect(result.current.saveEnabled).toBe(false);
    expect(result.current.publishEnabled).toBe(false);
    expect(result.current.saveBlockedReason).toMatch(/Checking/);
  });
});

describe('useReadinessController — promotion-rule health passthrough', () => {
  it('surfaces a failure headline distinct from an empty-config headline', () => {
    const { result: fail } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article(),
          isPersisted: true,
          promotionRuleHealth: {
            kind: 'loadFailure',
            message: 'network timeout',
          },
        }),
      ),
    );
    expect(fail.current.promotionRuleHealth?.kind).toBe('loadFailure');
    expect(fail.current.promotionRuleHealthHeadline).toMatch(/failed to load/i);

    const { result: empty } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article(),
          isPersisted: true,
          promotionRuleHealth: { kind: 'readyEmpty' },
        }),
      ),
    );
    expect(empty.current.promotionRuleHealthHeadline).toMatch(
      /No active promotion rules/i,
    );
    expect(fail.current.promotionRuleHealthHeadline).not.toBe(
      empty.current.promotionRuleHealthHeadline,
    );
  });

  it('emits no promotion-health headline when the ruleset is healthy', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article(),
          isPersisted: true,
          promotionRuleHealth: {
            kind: 'ready',
            rules: [],
          },
        }),
      ),
    );
    expect(result.current.promotionRuleHealthHeadline).toBeUndefined();
  });
});

describe('useReadinessController — milestone legacy hard-block', () => {
  it('exposes unsupportedContentTypeMessage and disables Publish on milestoneSpotlight drafts', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ ArticleContentType: 'milestoneSpotlight' }),
        }),
      ),
    );
    expect(result.current.unsupportedContentTypeLoaded).toBe(true);
    expect(result.current.unsupportedContentTypeMessage).toMatch(
      /milestoneSpotlight/i,
    );
    expect(result.current.publishEnabled).toBe(false);
  });

  it('disables Republish on milestoneSpotlight even when the article is published and bound', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({
            ArticleContentType: 'milestoneSpotlight',
            WorkflowState: 'published',
          }),
          binding: binding(),
        }),
      ),
    );
    expect(result.current.republishEnabled).toBe(false);
  });

  it('leaves operational content types enabled (monthlySpotlight on approved)', () => {
    const { result } = renderHook(() => useReadinessController(inputs()));
    expect(result.current.unsupportedContentTypeLoaded).toBe(false);
    expect(result.current.publishEnabled).toBe(true);
  });
});

describe('useReadinessController — dirty working-copy gate (Wave-03 Prompt-01)', () => {
  it('disables Publish when the working copy has drifted from the saved baseline', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ WorkflowState: 'approved' }),
          isDirty: true,
        }),
      ),
    );
    expect(result.current.publishEnabled).toBe(false);
    expect(result.current.publishBlockedByDirty).toBe(true);
  });

  it('disables Republish when the working copy is dirty even with a healthy binding', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ WorkflowState: 'published' }),
          binding: binding(),
          isDirty: true,
        }),
      ),
    );
    expect(result.current.republishEnabled).toBe(false);
    expect(result.current.publishBlockedByDirty).toBe(true);
  });

  it('keeps Publish enabled on a clean approved draft (regression guard)', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ WorkflowState: 'approved' }),
          isDirty: false,
        }),
      ),
    );
    expect(result.current.publishEnabled).toBe(true);
    expect(result.current.publishBlockedByDirty).toBe(false);
  });

  it('keeps Republish enabled on a clean published + bound draft (regression guard)', () => {
    const { result } = renderHook(() =>
      useReadinessController(
        inputs({
          articleDraft: article({ WorkflowState: 'published' }),
          binding: binding(),
          isDirty: false,
        }),
      ),
    );
    expect(result.current.republishEnabled).toBe(true);
  });

  it('reports publishBlockedByDirty=false when no draft is selected', () => {
    const { result } = renderHook(() =>
      useReadinessController(inputs({ articleDraft: undefined, isDirty: true })),
    );
    expect(result.current.publishBlockedByDirty).toBe(false);
  });
});
