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
