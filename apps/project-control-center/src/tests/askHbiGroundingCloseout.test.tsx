/**
 * Wave 99 / Prompt 06D — Ask-HBI grounding / security closeout test.
 *
 * REGRESSION + GROUNDING-SAFETY + READINESS CLOSEOUT for the Prompt 06
 * unified-search / Ask-HBI preview implementation (06A hook seam, 06B
 * panel component, 06C Project Home integration). Adds cross-surface
 * locks that prove the integrated Ask-HBI experience holds the safety
 * contract end-to-end and that the 06-owned source files contain no
 * live-integration tokens, no source-truth-claim language, and no
 * routed-surface registration in `PccSurfaceRouter.tsx`.
 *
 * This file does NOT duplicate assertions already covered exhaustively
 * in 06A's `useUnifiedSearchReadModel.test.ts`, 06B's
 * `AskHbiGroundingPreviewPanel.test.tsx`, 06C's
 * `PccProjectHomeAskHbiSection.test.tsx`, `PccProjectHome.test.tsx`,
 * `PccApp.optIn.test.tsx`, or `useProjectHomeReadModel.test.ts`. It
 * focuses exclusively on the cross-surface integrated assertions and
 * the file-content guards that those isolated suites cannot make.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccUnifiedSearchAskHbiReadModel,
} from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import {
  ASK_HBI_PANEL_DISCLAIMER,
  ASK_HBI_SAMPLE_QUERIES,
} from '../surfaces/unifiedLifecycle/index.js';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('fetch must not be called by the closeout integrated render with the fixture client');
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// Source-scan stripper helpers — local to this test file (mirrors the
// 06A `useUnifiedLifecycleReadModel.test.ts:290-301` pattern; no shared
// util introduced in 06D scope).
function stripCommentsOnly(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
}

function stripCommentsAndStrings(src: string): string {
  return stripCommentsOnly(src)
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

const HOOK_FILE = resolve(
  __dirname,
  '..',
  'surfaces',
  'unifiedLifecycle',
  'useUnifiedSearchReadModel.ts',
);
const PANEL_FILE = resolve(
  __dirname,
  '..',
  'surfaces',
  'unifiedLifecycle',
  'components',
  'AskHbiGroundingPreviewPanel.tsx',
);
const SECTION_FILE = resolve(
  __dirname,
  '..',
  'surfaces',
  'projectHome',
  'PccProjectHomeAskHbiSection.tsx',
);
const SURFACE_ROUTER_FILE = resolve(__dirname, '..', 'shell', 'PccSurfaceRouter.tsx');

// ─────────────────────────────────────────────────────────────────────
// Cross-surface lock 1 — integrated Project Home idle posture and
// bento invariants on initial mount.
// ─────────────────────────────────────────────────────────────────────

describe('Ask-HBI closeout — integrated Project Home idle posture and bento invariants', () => {
  it('renders 15 cards, the Ask-HBI card mounts in idle posture, no answer rows are visible, no card is nested inside another card, and the panel disclaimer is present', async () => {
    const { container, findByText } = render(
      <PccApp
        forceMode="wideDesktop"
        readModelClient={createPccFixtureReadModelClient()}
      />,
    );
    await findByText('Ask HBI — Grounded Project Answers');
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(15);
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
    }
    // No card nested inside another card (symmetric bento invariant
    // beyond the existing "direct child" assertion).
    expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]')).toHaveLength(0);

    // Ask-HBI panel mounts in idle posture and renders zero answer rows
    // — locks the "no auto-fired grounded content visible on app open"
    // contract at the integrated level.
    const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
    expect(panel).not.toBeNull();
    expect(panel!.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('idle');
    expect(container.querySelectorAll('[data-pcc-unified-search-answer-id]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-pcc-unified-search-answer-kind]')).toHaveLength(0);

    // Panel disclaimer must be present inside the Ask-HBI card.
    const askHbiHeading = await findByText('Ask HBI — Grounded Project Answers');
    const askHbiCard = askHbiHeading.closest('[data-pcc-card]');
    expect(askHbiCard).not.toBeNull();
    const disclaimer = askHbiCard!.querySelector('[data-pcc-ask-hbi-disclaimer]');
    expect(disclaimer?.textContent ?? '').toBe(ASK_HBI_PANEL_DISCLAIMER);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Cross-surface lock 2 — integrated sample-query click renders grounded
// chips with the canonical citation source identity (recordType + recordId).
// ─────────────────────────────────────────────────────────────────────

describe('Ask-HBI closeout — integrated sample-query click renders grounded chips with source identity', () => {
  it('clicking a sample query in the integrated Ask-HBI card transitions to ready, renders citation chips that carry the canonical recordType + recordId, and renders refusal rows with refusal reason and zero citations', async () => {
    const { container, findByText } = render(
      <PccApp
        forceMode="wideDesktop"
        readModelClient={createPccFixtureReadModelClient()}
      />,
    );
    await findByText('Ask HBI — Grounded Project Answers');
    const target = ASK_HBI_SAMPLE_QUERIES[0];
    const button = container.querySelector<HTMLButtonElement>(
      `[data-pcc-ask-hbi-sample-query="${target}"]`,
    );
    expect(button).not.toBeNull();
    fireEvent.click(button!);
    await waitFor(() => {
      const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
      expect(panel?.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('ready');
    });

    // Derive the expected grounded citation values from the canonical
    // aggregate fixture (NOT from an intermediate sibling export);
    // proves the rendered chip carries informationally-meaningful
    // source identity, not just a structural data attribute.
    const groundedFixture = SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL.responses.find(
      (r) => r.grounded === true && r.citations.length > 0,
    );
    expect(groundedFixture).toBeDefined();
    if (groundedFixture && groundedFixture.grounded === true) {
      const [expectedCitation] = groundedFixture.citations;
      const groundedRow = container.querySelector(
        `[data-pcc-unified-search-answer-id="${groundedFixture.answerId}"]`,
      );
      expect(groundedRow).not.toBeNull();
      expect(groundedRow!.getAttribute('data-pcc-unified-search-answer-kind')).toBe('grounded');
      const chip = groundedRow!.querySelector(
        `[data-pcc-unified-search-citation-id="${expectedCitation.citationId}"]`,
      );
      expect(chip).not.toBeNull();
      const chipText = chip!.textContent ?? '';
      expect(chipText).toContain(expectedCitation.recordType);
      expect(chipText).toContain(expectedCitation.recordId);
      expect(chipText).toContain(expectedCitation.sourceLineage.sourceSystem);
    }

    // Refusal rows: present with refusal reason and zero citations.
    const refusalFixture = SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL.responses.find(
      (r) => r.refused === true,
    );
    expect(refusalFixture).toBeDefined();
    if (refusalFixture && refusalFixture.refused === true) {
      const refusalRow = container.querySelector(
        `[data-pcc-unified-search-answer-id="${refusalFixture.answerId}"]`,
      );
      expect(refusalRow).not.toBeNull();
      expect(refusalRow!.getAttribute('data-pcc-unified-search-answer-kind')).toBe('refusal');
      expect(refusalRow!.querySelectorAll('[data-pcc-unified-search-citation-id]')).toHaveLength(0);
      expect(refusalRow!.textContent ?? '').toContain(refusalFixture.refusalReason);
    }

    // No live URL anchors anywhere on the integrated Project Home, even
    // after the user-initiated grounded fetch resolves.
    const anchors = container.querySelectorAll<HTMLAnchorElement>('a[href]');
    for (const a of Array.from(anchors)) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Cross-surface lock 3 — integrated restricted/degraded posture does not
// leak sensitive answer text via Project Home's section + dashboard-card
// chrome.
// ─────────────────────────────────────────────────────────────────────

describe('Ask-HBI closeout — integrated restricted/degraded posture does not leak sensitive content', () => {
  it('source-unavailable envelope with a sensitive synthetic answer payload renders a preview-state and no answer rows, and the secret strings never appear in container.textContent', async () => {
    const SECRET_RESPONSE = 'closeout-restricted-secret-response-must-not-leak';
    const SECRET_QUERY = 'closeout-restricted-secret-query-must-not-leak';
    const restrictedEnvelope: PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> = {
      projectId: PROJECT_ID,
      mode: 'fixture',
      sourceStatus: 'source-unavailable',
      readOnly: true,
      viewerPersona: 'project-manager',
      warnings: [],
      generatedAtUtc: '2026-05-03T00:00:00.000Z',
      data: {
        responses: [
          {
            answerId: 'closeout-restricted-answer',
            query: SECRET_QUERY,
            response: SECRET_RESPONSE,
            grounded: true,
            refused: false,
            citations: [],
          },
        ],
      },
    };
    // Override only `getUnifiedSearch` on a full fixture client via
    // `vi.spyOn` — preserves every other surface method untouched and
    // avoids widening the synthetic-client type to `IPccReadModelClient`'s
    // full surface (which `PccApp.readModelClient` requires for the
    // PccSurfaceRouter that sits beneath it).
    const baseClient = createPccFixtureReadModelClient();
    vi.spyOn(baseClient, 'getUnifiedSearch').mockResolvedValue(restrictedEnvelope);
    const { container, findByText } = render(
      <PccApp forceMode="wideDesktop" readModelClient={baseClient} />,
    );
    await findByText('Ask HBI — Grounded Project Answers');
    const target = ASK_HBI_SAMPLE_QUERIES[0];
    const button = container.querySelector<HTMLButtonElement>(
      `[data-pcc-ask-hbi-sample-query="${target}"]`,
    );
    fireEvent.click(button!);
    await waitFor(() => {
      const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
      expect(panel?.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('ready');
    });
    // Section renders the preview-state and zero answer rows.
    const askHbiHeading = await findByText('Ask HBI — Grounded Project Answers');
    const askHbiCard = askHbiHeading.closest('[data-pcc-card]');
    expect(askHbiCard).not.toBeNull();
    expect(askHbiCard!.querySelector('[data-pcc-state="unavailable-fixture"]')).not.toBeNull();
    expect(askHbiCard!.querySelectorAll('[data-pcc-unified-search-answer-id]')).toHaveLength(0);
    // Sensitive synthetic strings never appear anywhere in the integrated
    // Project Home rendered DOM.
    expect(container.textContent ?? '').not.toContain(SECRET_RESPONSE);
    expect(container.textContent ?? '').not.toContain(SECRET_QUERY);
  });
});

// ─────────────────────────────────────────────────────────────────────
// File-content guard 1 — 06-owned source files contain no live-integration
// tokens (defense in depth across hook + panel + section).
// ─────────────────────────────────────────────────────────────────────

const LIVE_INTEGRATION_TOKENS = [
  'procore',
  'sage',
  'dynamics',
  'salesforce',
  'autodesk',
  'adobe',
  'docusign',
  'document-crunch',
  'vector',
  'embedding',
  'openai',
  'anthropic',
  'graph.microsoft',
  '@microsoft/sp-',
  '@hbc/auth',
  'fetch(',
  'XMLHttpRequest',
  'EventSource',
  'WebSocket',
] as const;

describe('Ask-HBI closeout — 06-owned source files contain no live-integration tokens', () => {
  const sources = [
    { label: 'useUnifiedSearchReadModel.ts', path: HOOK_FILE },
    { label: 'AskHbiGroundingPreviewPanel.tsx', path: PANEL_FILE },
    { label: 'PccProjectHomeAskHbiSection.tsx', path: SECTION_FILE },
  ] as const;

  for (const src of sources) {
    it(`${src.label} comments-only-stripped source contains no live-integration token`, () => {
      const raw = readFileSync(src.path, 'utf8');
      const commentsStripped = stripCommentsOnly(raw).toLowerCase();
      for (const token of LIVE_INTEGRATION_TOKENS) {
        expect(
          commentsStripped.includes(token.toLowerCase()),
          `${src.label} must not reference live-integration token '${token}'`,
        ).toBe(false);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// File-content guard 2 — 06-owned source files contain no source-truth
// claim language. The forbidden list rejects qualified claim phrases —
// the bare phrase `source of truth` is allowed because the panel's
// required disclaimer is `HBI is not the source of truth.` (negation).
// ─────────────────────────────────────────────────────────────────────

const FORBIDDEN_CLAIM_PHRASES = [
  'HBI is the source of truth',
  'HBI is authoritative',
  'system of record',
  'replaces Procore',
  'replaces Sage',
  'replaces Graph',
  'replaces SharePoint',
  'determines responsibility',
  'owns the project record',
] as const;

describe('Ask-HBI closeout — 06-owned source files contain no source-truth-claim language', () => {
  const sources = [
    { label: 'useUnifiedSearchReadModel.ts', path: HOOK_FILE },
    { label: 'AskHbiGroundingPreviewPanel.tsx', path: PANEL_FILE },
    { label: 'PccProjectHomeAskHbiSection.tsx', path: SECTION_FILE },
  ] as const;

  for (const src of sources) {
    it(`${src.label} comments-only-stripped source rejects every qualified source-truth-claim phrase`, () => {
      const raw = readFileSync(src.path, 'utf8');
      const commentsStripped = stripCommentsOnly(raw).toLowerCase();
      for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
        expect(
          commentsStripped.includes(phrase.toLowerCase()),
          `${src.label} must not contain claim phrase '${phrase}'`,
        ).toBe(false);
      }
    });
  }

  it('panel source contains the positive disclaimer phrase ("not the source of truth") so a future copy change that removes the disclaimer is also caught', () => {
    const raw = readFileSync(PANEL_FILE, 'utf8');
    expect(raw.toLowerCase()).toContain('not the source of truth');
  });
});

// ─────────────────────────────────────────────────────────────────────
// File-content guard 3 — PccSurfaceRouter has no ask-hbi / unified-search
// / search-workspace registration. (The router lives outside 06 scope;
// scanning it here proves Ask-HBI was not promoted to a routed surface
// without authorization.)
// ─────────────────────────────────────────────────────────────────────

const FORBIDDEN_SURFACE_TOKENS = [
  'ask-hbi',
  'unified-search',
  'search-workspace',
  'hbi-search',
  'ask-hbi-workspace',
] as const;

describe('Ask-HBI closeout — PccSurfaceRouter has no ask-hbi / unified-search / search-workspace registration', () => {
  it('PccSurfaceRouter.tsx contains no forbidden surface-id token (raw includes scan, comments + strings included so any case label or marker reference would be caught)', () => {
    const raw = readFileSync(SURFACE_ROUTER_FILE, 'utf8');
    for (const token of FORBIDDEN_SURFACE_TOKENS) {
      expect(
        raw.includes(token),
        `PccSurfaceRouter.tsx must not contain forbidden surface-id token '${token}'`,
      ).toBe(false);
    }
  });

  it('PccSurfaceRouter.tsx tokens-stripped source contains no `case` clauses for ask-hbi / unified-search / search-workspace identifiers (defense-in-depth on tokens-stripped form)', () => {
    const raw = readFileSync(SURFACE_ROUTER_FILE, 'utf8');
    const tokensStripped = stripCommentsAndStrings(raw);
    // The case labels would survive comment-stripping but not string-
    // stripping (they sit inside `case '<id>':`). A surviving
    // identifier-form reference (e.g., a constant named `askHbi`) would
    // be the regression to catch here.
    for (const token of FORBIDDEN_SURFACE_TOKENS) {
      const ident = token.replace(/-/g, '');
      const re = new RegExp(`\\b${ident}\\b`, 'i');
      expect(
        re.test(tokensStripped),
        `PccSurfaceRouter.tsx tokens-stripped source must not contain identifier-form '${ident}'`,
      ).toBe(false);
    }
  });
});
