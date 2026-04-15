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
