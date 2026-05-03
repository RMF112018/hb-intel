/**
 * Wave 99 / Prompt 06B — AskHbiGroundingPreviewPanel test suite.
 *
 * Verifies the panel composes the 06A `useUnifiedSearchReadModel`
 * hook seam with the 04A `UnifiedProjectSearchPreview` and renders
 * project-scoped, fixture-backed, preview-only grounded answers
 * driven by predefined sample-query buttons. The panel never
 * emits routed-surface markers, never renders anchors with live
 * external URLs, and filters out grounded answers that lack
 * citations so no answer text is rendered without source metadata.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import {
  PCC_HBI_REFUSAL_REASONS,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
  type PccUnifiedSearchAskHbiReadModel,
} from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import {
  AskHbiGroundingPreviewPanel,
  ASK_HBI_PANEL_DISCLAIMER,
  ASK_HBI_PANEL_TITLE,
  ASK_HBI_SAMPLE_QUERIES,
  type IPccUnifiedSearchReadModelClient,
} from '../surfaces/unifiedLifecycle/index.js';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;
const GENERATED_AT = '2026-05-03T00:00:00.000Z';

function envelope(
  sourceStatus: PccReadModelSourceStatus = 'available',
  data: PccUnifiedSearchAskHbiReadModel = SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
): PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    viewerPersona: 'project-manager',
    warnings: [],
    generatedAtUtc: GENERATED_AT,
    data,
  };
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('fetch must not be called by the panel');
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─────────────────────────────────────────────────────────────────────
// Static copy: project-scoped + HBI-not-source-truth disclaimer
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — disclaimers and project-scoped copy', () => {
  it('renders the panel title, the HBI-not-source-truth disclaimer, and the panel root marker', () => {
    const client = createPccFixtureReadModelClient();
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
    expect(panel).not.toBeNull();
    const disclaimer = container.querySelector('[data-pcc-ask-hbi-disclaimer]');
    expect(disclaimer).not.toBeNull();
    expect(disclaimer?.textContent ?? '').toBe(ASK_HBI_PANEL_DISCLAIMER);
    expect(container.textContent ?? '').toContain(ASK_HBI_PANEL_TITLE);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Sample-query buttons: render shape + preview-safe interactivity
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — sample-query buttons', () => {
  it('renders one button per ASK_HBI_SAMPLE_QUERIES entry, all submit-safe (real interactive controls, not preview-disabled)', () => {
    const client = createPccFixtureReadModelClient();
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    const buttons = container.querySelectorAll<HTMLButtonElement>(
      '[data-pcc-ask-hbi-sample-query]',
    );
    expect(buttons.length).toBe(ASK_HBI_SAMPLE_QUERIES.length);
    for (const btn of buttons) {
      expect(btn.tagName).toBe('BUTTON');
      expect(btn.getAttribute('type')).toBe('button');
      expect(btn.disabled).toBe(false);
      expect(btn.getAttribute('data-pcc-action-state')).toBeNull();
    }
    const expectedTexts = ASK_HBI_SAMPLE_QUERIES.map((q) => q);
    const seen = Array.from(buttons).map((b) => b.getAttribute('data-pcc-ask-hbi-sample-query'));
    expect(seen).toEqual(expectedTexts);
  });

  it('default selection marks the first sample query active', () => {
    const client = createPccFixtureReadModelClient();
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    const active = container.querySelectorAll('[data-pcc-ask-hbi-sample-query-active="true"]');
    expect(active.length).toBe(1);
    expect(active[0].getAttribute('data-pcc-ask-hbi-sample-query')).toBe(ASK_HBI_SAMPLE_QUERIES[0]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Click triggers the hook/client seam (idle → loading → ready)
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — selecting a sample query triggers the hook seam', () => {
  it('initialQuery={null} starts in idle posture; clicking a sample button triggers exactly one client call with the trimmed query', async () => {
    const spy = vi.fn(async () => envelope('available'));
    const client: IPccUnifiedSearchReadModelClient = { getUnifiedSearch: spy };
    const target = ASK_HBI_SAMPLE_QUERIES[3];
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-executive"
        initialQuery={null}
      />,
    );
    const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
    expect(panel?.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('idle');
    expect(spy).not.toHaveBeenCalled();
    expect(container.querySelectorAll('[data-pcc-ask-hbi-sample-query-active="true"]').length).toBe(
      0,
    );

    const btn = container.querySelector<HTMLButtonElement>(
      `[data-pcc-ask-hbi-sample-query="${target}"]`,
    );
    expect(btn).not.toBeNull();
    fireEvent.click(btn!);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(spy).toHaveBeenCalledWith(PROJECT_ID, 'project-executive', target);
    await waitFor(() => expect(panel?.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('ready'));
  });
});

// ─────────────────────────────────────────────────────────────────────
// Ready state — grounded vs refusal, citations preserved/empty correctly
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — ready state preserves grounded + refusal posture', () => {
  it('every grounded answer row carries at least one citation chip', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('available');
      },
    };
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container
          .querySelector('[data-pcc-ask-hbi-panel]')
          ?.getAttribute('data-pcc-ask-hbi-panel-state'),
      ).toBe('ready'),
    );
    const grounded = container.querySelectorAll('[data-pcc-unified-search-answer-kind="grounded"]');
    expect(grounded.length).toBeGreaterThan(0);
    for (const row of grounded) {
      const chips = row.querySelectorAll('[data-pcc-unified-search-citation-id]');
      expect(chips.length).toBeGreaterThan(0);
    }
  });

  it('refusal rows render the refusal reason and carry zero citation chips', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('available');
      },
    };
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container.querySelectorAll('[data-pcc-unified-search-answer-kind="refusal"]').length,
      ).toBeGreaterThan(0),
    );
    const refusalSample = SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL.responses.find(
      (r) => r.refused === true,
    );
    expect(refusalSample).toBeDefined();
    if (refusalSample && refusalSample.refused === true) {
      const refusalRow = container.querySelector(
        `[data-pcc-unified-search-answer-id="${refusalSample.answerId}"]`,
      );
      expect(refusalRow).not.toBeNull();
      expect(refusalRow?.getAttribute('data-pcc-unified-search-answer-kind')).toBe('refusal');
      expect(refusalRow?.querySelectorAll('[data-pcc-unified-search-citation-id]').length).toBe(0);
      expect(refusalRow?.textContent ?? '').toContain(refusalSample.refusalReason);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Defensive sanitizer — grounded with empty citations is filtered out
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — defensive grounding sanitizer', () => {
  it('filters out grounded answers whose citations array is empty (no answer text rendered without source metadata)', async () => {
    const SHOULD_NOT_RENDER = 'should-not-render-uncited-grounded-text';
    const syntheticEnvelope: PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> = {
      ...envelope('available'),
      data: {
        responses: [
          {
            answerId: 'ans-empty-citations',
            query: 'no-citation-query',
            response: SHOULD_NOT_RENDER,
            grounded: true,
            refused: false,
            citations: [],
          },
          {
            answerId: 'ans-refusal-kept',
            query: 'refused-query',
            response: 'refusal-response',
            grounded: false,
            refused: true,
            refusalReason: 'insufficient-evidence',
            citations: [],
          },
        ],
      },
    };
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return syntheticEnvelope;
      },
    };
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container
          .querySelector('[data-pcc-ask-hbi-panel]')
          ?.getAttribute('data-pcc-ask-hbi-panel-state'),
      ).toBe('ready'),
    );
    expect(
      container.querySelector('[data-pcc-unified-search-answer-id="ans-empty-citations"]'),
    ).toBeNull();
    expect(container.textContent ?? '').not.toContain(SHOULD_NOT_RENDER);
    // refusal row is preserved (refusals are intentionally citation-free)
    expect(
      container.querySelector('[data-pcc-unified-search-answer-id="ans-refusal-kept"]'),
    ).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Canonical refusal taxonomy — every PCC_HBI_REFUSAL_REASONS value
// renders without leaking citation chips and the synthetic literals
// stay aligned with the 07B canonical 5-tuple.
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — canonical refusal taxonomy', () => {
  it('locks PCC_HBI_REFUSAL_REASONS to the 07B canonical 5-tuple', () => {
    expect(PCC_HBI_REFUSAL_REASONS).toEqual([
      'insufficient-evidence',
      'permission-restricted',
      'out-of-scope',
      'cross-project-not-authorized',
      'responsibility-conclusion-not-supported',
    ]);
  });

  for (const reason of PCC_HBI_REFUSAL_REASONS) {
    it(`renders refusal row for canonical reason '${reason}' with zero citations`, async () => {
      const refusalEnvelope: PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> = {
        ...envelope('available'),
        data: {
          responses: [
            {
              answerId: `ans-${reason}`,
              query: 'taxonomy-coverage-query',
              response: 'taxonomy-coverage-response',
              grounded: false,
              refused: true,
              refusalReason: reason,
              citations: [],
            },
          ],
        },
      };
      const client: IPccUnifiedSearchReadModelClient = {
        async getUnifiedSearch() {
          return refusalEnvelope;
        },
      };
      const { container } = render(
        <AskHbiGroundingPreviewPanel
          client={client}
          projectId={PROJECT_ID}
          viewerPersona="project-manager"
        />,
      );
      await waitFor(() =>
        expect(
          container
            .querySelector('[data-pcc-ask-hbi-panel]')
            ?.getAttribute('data-pcc-ask-hbi-panel-state'),
        ).toBe('ready'),
      );
      const refusalRow = container.querySelector(
        `[data-pcc-unified-search-answer-id="ans-${reason}"]`,
      );
      expect(refusalRow).not.toBeNull();
      expect(refusalRow?.getAttribute('data-pcc-unified-search-answer-kind')).toBe('refusal');
      expect(refusalRow?.textContent ?? '').toContain(reason);
      expect(refusalRow?.querySelectorAll('[data-pcc-unified-search-citation-id]').length).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// Restricted/redacted content — sensitive answer fields do not leak
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — restricted/redacted posture does not leak answer fields', () => {
  it('non-available envelope renders the preview-state and never renders any answer rows', async () => {
    const SECRET_RESPONSE = 'sensitive-secret-response-must-not-leak';
    const SECRET_QUERY = 'sensitive-secret-query-must-not-leak';
    const restrictedEnvelope: PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> = {
      ...envelope('source-unavailable'),
      data: {
        responses: [
          {
            answerId: 'ans-restricted',
            query: SECRET_QUERY,
            response: SECRET_RESPONSE,
            grounded: true,
            refused: false,
            citations: [],
          },
        ],
      },
    };
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return restrictedEnvelope;
      },
    };
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container
          .querySelector('[data-pcc-ask-hbi-panel]')
          ?.getAttribute('data-pcc-ask-hbi-panel-state'),
      ).toBe('ready'),
    );
    expect(container.querySelectorAll('[data-pcc-unified-search-answer-id]').length).toBe(0);
    expect(container.textContent ?? '').not.toContain(SECRET_RESPONSE);
    expect(container.textContent ?? '').not.toContain(SECRET_QUERY);
  });

  const NON_AVAILABLE_STATUSES: readonly PccReadModelSourceStatus[] = [
    'backend-unavailable',
    'source-unavailable',
    'missing-config',
    'stale',
    'unauthorized',
    'forbidden',
  ];

  for (const status of NON_AVAILABLE_STATUSES) {
    it(`'${status}' envelope never renders answer rows and never leaks synthetic secret fields`, async () => {
      const SECRET_RESPONSE = `secret-response-${status}-must-not-leak`;
      const SECRET_QUERY = `secret-query-${status}-must-not-leak`;
      const restrictedEnvelope: PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> = {
        ...envelope(status),
        data: {
          responses: [
            {
              answerId: `ans-restricted-${status}`,
              query: SECRET_QUERY,
              response: SECRET_RESPONSE,
              grounded: true,
              refused: false,
              citations: [],
            },
          ],
        },
      };
      const client: IPccUnifiedSearchReadModelClient = {
        async getUnifiedSearch() {
          return restrictedEnvelope;
        },
      };
      const { container } = render(
        <AskHbiGroundingPreviewPanel
          client={client}
          projectId={PROJECT_ID}
          viewerPersona="project-manager"
        />,
      );
      await waitFor(() =>
        expect(
          container
            .querySelector('[data-pcc-ask-hbi-panel]')
            ?.getAttribute('data-pcc-ask-hbi-panel-state'),
        ).toBe('ready'),
      );
      expect(container.querySelectorAll('[data-pcc-unified-search-answer-id]').length).toBe(0);
      expect(container.textContent ?? '').not.toContain(SECRET_RESPONSE);
      expect(container.textContent ?? '').not.toContain(SECRET_QUERY);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// Envelope degraded posture — stays on hook 'ready', renders PccPreviewState
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — envelope-degraded posture renders the preview state', () => {
  it('backend-unavailable envelope renders [data-pcc-state="error"] inside the panel body', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('backend-unavailable', { responses: [] });
      },
    };
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container
          .querySelector('[data-pcc-ask-hbi-panel]')
          ?.getAttribute('data-pcc-ask-hbi-panel-state'),
      ).toBe('ready'),
    );
    const body = container.querySelector('[data-pcc-ask-hbi-panel-body]');
    expect(body?.querySelector('[data-pcc-state="error"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-pcc-unified-search-answer-id]').length).toBe(0);
  });

  it('source-unavailable envelope renders [data-pcc-state="unavailable-fixture"] inside the panel body', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('source-unavailable', { responses: [] });
      },
    };
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container
          .querySelector('[data-pcc-ask-hbi-panel]')
          ?.getAttribute('data-pcc-ask-hbi-panel-state'),
      ).toBe('ready'),
    );
    const body = container.querySelector('[data-pcc-ask-hbi-panel-body]');
    expect(body?.querySelector('[data-pcc-state="unavailable-fixture"]')).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Hook-level error — rejected promise renders error preview, no crash
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — hook-level rejected promise', () => {
  it('renders the panel error state without throwing when the client rejects', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        throw new Error('panel-test-rejection');
      },
    };
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container
          .querySelector('[data-pcc-ask-hbi-panel]')
          ?.getAttribute('data-pcc-ask-hbi-panel-state'),
      ).toBe('error'),
    );
    const body = container.querySelector('[data-pcc-ask-hbi-panel-body]');
    expect(body?.querySelector('[data-pcc-state="error"]')).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// No live external URLs and no routed-surface markers
// ─────────────────────────────────────────────────────────────────────

describe('AskHbiGroundingPreviewPanel — no live external URLs and no routed-surface markers', () => {
  it('renders zero <a href> elements (no live external links of any kind)', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container
          .querySelector('[data-pcc-ask-hbi-panel]')
          ?.getAttribute('data-pcc-ask-hbi-panel-state'),
      ).toBe('ready'),
    );
    const anchors = container.querySelectorAll('a[href]');
    expect(anchors.length).toBe(0);
  });

  it('does not emit canonical routed-surface markers (data-pcc-active-surface-panel, data-pcc-surface-id) and defensively no data-pcc-surface-active', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = render(
      <AskHbiGroundingPreviewPanel
        client={client}
        projectId={PROJECT_ID}
        viewerPersona="project-manager"
      />,
    );
    await waitFor(() =>
      expect(
        container
          .querySelector('[data-pcc-ask-hbi-panel]')
          ?.getAttribute('data-pcc-ask-hbi-panel-state'),
      ).toBe('ready'),
    );
    expect(container.querySelector('[data-pcc-active-surface-panel]')).toBeNull();
    expect(container.querySelector('[data-pcc-surface-id]')).toBeNull();
    // defensive (non-canonical):
    expect(container.querySelector('[data-pcc-surface-active]')).toBeNull();
    expect(container.querySelector('[data-pcc-workspace]')).toBeNull();
  });
});
