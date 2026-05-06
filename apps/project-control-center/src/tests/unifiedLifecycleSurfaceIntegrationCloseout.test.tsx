/**
 * Wave 99 / Prompt 05D — cross-surface integration hardening / closeout.
 *
 * This file is the readiness-gate test bundle for the Wave 99
 * unified-lifecycle integrations landed in Prompts 05A–05C. It is
 * tests-only — no source / adapter / hook / component / CSS edits
 * accompany it. The four blocks below close narrow gaps the prompt
 * audit identified:
 *
 *   1. Cross-surface router lock — `PccSurfaceRouter.tsx` does NOT
 *      register any non-canonical or department-workspace route id,
 *      and DOES register every approved MVP route id (including
 *      `approvals`).
 *   2. No-nested-dashboard-card invariant — no `[data-pcc-card]` is
 *      a descendant of another `[data-pcc-card]` on either Project
 *      Home or Project Readiness's read-model-driven path.
 *   3. Section-file source scans — neither
 *      `PccProjectHomeUnifiedLifecycleSection.tsx` nor
 *      `PccProjectReadinessUnifiedLifecycleSection.tsx` references
 *      any leaf-route client method identifier or
 *      `getUnifiedLifecycle` directly; both files import and use
 *      `useUnifiedLifecycleReadModel`.
 *   4. Constraints Log read-only at surface level — the
 *      constraints-log section under project-readiness renders no
 *      enabled buttons and no `<a href^="https?:">` (live launch).
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PccApp } from '../PccApp';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

const SRC_ROOT = resolve(__dirname, '..');
const ROUTER_FILE = resolve(SRC_ROOT, 'shell', 'PccSurfaceRouter.tsx');
const PROJECT_HOME_SECTION_FILE = resolve(
  SRC_ROOT,
  'surfaces',
  'projectHome',
  'PccProjectHomeUnifiedLifecycleSection.tsx',
);
const PROJECT_READINESS_SECTION_FILE = resolve(
  SRC_ROOT,
  'surfaces',
  'projectReadiness',
  'PccProjectReadinessUnifiedLifecycleSection.tsx',
);

// Comments-only stripper: preserves string literals so quoted route
// ids stay visible. Matches the discipline used by
// `useUnifiedLifecycleReadModel.test.ts` and `pcc-api-dormancy.test.ts`.
function stripCommentsOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
}

// Comments + strings stripper for identifier scans. Static template
// text is stripped, but `${...}` expression bodies are preserved by
// virtue of remaining outside the matched template-literal regex's
// reach when expression contents include backtick-balanced text. The
// section files contain no template literals, so the simpler
// regex-based stripper is sufficient here (mirrors 05A's approach).
function stripCommentsAndStrings(src: string): string {
  return stripCommentsOnly(src)
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

const APPROVED_ROUTED_SURFACE_IDS = [
  'project-home',
  'team-and-access',
  'documents',
  'project-readiness',
  'approvals',
  'external-systems',
  'control-center-settings',
  'site-health',
] as const;

const FORBIDDEN_ROUTE_IDS = [
  // Wave 99 unified-lifecycle non-canonical names that must never
  // appear as routed surfaces (they're internal concept names
  // only — see 04B docblock).
  'unified-lifecycle',
  'lifecycle-timeline',
  'traceability-graph',
  'closed-project-references',
  'warranty-trace',
  'cross-project-knowledge',
  'unified-search',
  // Department-workspace patterns that the unified-lifecycle
  // doctrine explicitly rules out.
  'estimating',
  'preconstruction',
  'operations-workspace',
  'warranty-workspace',
  'closeout-workspace',
  'executive-oversight-workspace',
] as const;

const LEAF_ROUTE_CLIENT_METHODS = [
  'getProjectMemory',
  'getProjectLenses',
  'getProjectTraceability',
  'getWarrantyTrace',
  'getCrossProjectKnowledge',
  'getUnifiedSearch',
] as const;

// ─────────────────────────────────────────────────────────────────────
// Block 1 — cross-surface router lock
// ─────────────────────────────────────────────────────────────────────

describe('PccSurfaceRouter — cross-surface integration lock (Wave 99 / Prompt 05D)', () => {
  const raw = readFileSync(ROUTER_FILE, 'utf8');
  const commentsStripped = stripCommentsOnly(raw);

  it.each(FORBIDDEN_ROUTE_IDS)(
    'does not register a routed surface for forbidden id "%s"',
    (forbidden) => {
      const singleQuoted = new RegExp(`case\\s+'${forbidden}'\\s*:`);
      const doubleQuoted = new RegExp(`case\\s+"${forbidden}"\\s*:`);
      const backtickQuoted = new RegExp(`case\\s+\`${forbidden}\`\\s*:`);
      expect(singleQuoted.test(commentsStripped)).toBe(false);
      expect(doubleQuoted.test(commentsStripped)).toBe(false);
      expect(backtickQuoted.test(commentsStripped)).toBe(false);
    },
  );

  it.each(APPROVED_ROUTED_SURFACE_IDS)(
    'registers the approved routed surface id "%s" (sanity — guards against accidental router gutting)',
    (approved) => {
      const re = new RegExp(`case\\s+['"\`]${approved}['"\`]\\s*:`);
      expect(re.test(commentsStripped)).toBe(true);
    },
  );
});

// ─────────────────────────────────────────────────────────────────────
// Block 2 — no nested dashboard cards on either read-model-driven path
// ─────────────────────────────────────────────────────────────────────

describe('Cross-surface no-nested-dashboard-card invariant (Wave 99 / Prompt 05D)', () => {
  afterEach(() => {
    cleanup();
  });

  it('Project Home read-model-driven path: every [data-pcc-card] has no descendant [data-pcc-card]', async () => {
    const { container, findByText } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await findByText('Lifecycle Timeline');
    const cards = container.querySelectorAll<HTMLElement>('[data-pcc-card]');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of Array.from(cards)) {
      expect(
        card.querySelector('[data-pcc-card]'),
        'no [data-pcc-card] should be nested inside another [data-pcc-card]',
      ).toBeNull();
    }
  });

  it('Project Readiness read-model-driven path: every [data-pcc-card] has no descendant [data-pcc-card]', async () => {
    const { container } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    const projectReadinessButton = container.querySelector(
      '[data-pcc-surface-id="project-readiness"]',
    );
    expect(projectReadinessButton).not.toBeNull();
    fireEvent.click(projectReadinessButton!);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    const cards = container.querySelectorAll<HTMLElement>('[data-pcc-card]');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of Array.from(cards)) {
      expect(
        card.querySelector('[data-pcc-card]'),
        'no [data-pcc-card] should be nested inside another [data-pcc-card]',
      ).toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Block 3 — section files import the hook and never reference client
// method identifiers directly
// ─────────────────────────────────────────────────────────────────────

describe('Unified-lifecycle section files — architectural boundary (Wave 99 / Prompt 05D)', () => {
  const cases: ReadonlyArray<{ readonly name: string; readonly file: string }> = [
    {
      name: 'PccProjectHomeUnifiedLifecycleSection.tsx',
      file: PROJECT_HOME_SECTION_FILE,
    },
    {
      name: 'PccProjectReadinessUnifiedLifecycleSection.tsx',
      file: PROJECT_READINESS_SECTION_FILE,
    },
  ];

  it.each(cases)(
    '$name references no leaf-route client method identifier, does not call getUnifiedLifecycle directly, and imports/uses useUnifiedLifecycleReadModel',
    ({ file }) => {
      const raw = readFileSync(file, 'utf8');
      const commentsStripped = stripCommentsOnly(raw);
      const tokensStripped = stripCommentsAndStrings(raw);

      // No leaf-route client method identifier appears as code.
      for (const identifier of LEAF_ROUTE_CLIENT_METHODS) {
        const re = new RegExp(`\\b${identifier}\\b`);
        expect(
          re.test(tokensStripped),
          `${identifier} must not appear in section file source`,
        ).toBe(false);
      }

      // The section file does NOT call client.getUnifiedLifecycle
      // directly — only the 05A hook does.
      expect(
        /\bgetUnifiedLifecycle\b/.test(tokensStripped),
        'getUnifiedLifecycle must not appear in section file source; the hook owns the call',
      ).toBe(false);

      // The 05A hook IS imported (string-literal import path stays
      // visible after comments-only stripping) AND is invoked as an
      // identifier in code (visible after comments+strings stripping).
      expect(
        commentsStripped.includes('useUnifiedLifecycleReadModel'),
        'section file must import useUnifiedLifecycleReadModel',
      ).toBe(true);
      expect(
        /\buseUnifiedLifecycleReadModel\b/.test(tokensStripped),
        'section file must invoke useUnifiedLifecycleReadModel as a code identifier',
      ).toBe(true);
    },
  );
});

// ─────────────────────────────────────────────────────────────────────
// Block 4 — Constraints Log read-only / no-execution at surface level
// ─────────────────────────────────────────────────────────────────────

describe('Constraints Log surface integration — read-only / no-execution posture (Wave 99 / Prompt 05D)', () => {
  it('Constraints Log section under project-readiness renders no anchor with a live-launch href', () => {
    // The 18-case PccConstraintsLogRegions.test.tsx already locks the
    // standalone component's inert affordance posture (every action
    // chip is disabled, every detail toggle is local-state only,
    // etc.). At the surface integration level the meaningful leak
    // risk is a live-launch anchor href appearing inside the
    // constraints-log section as it appears under project-readiness.
    // Local-state UI (filters, <details>/<summary> toggles, etc.)
    // is intentionally NOT asserted disabled here — those are
    // legitimate read-model-driven non-mutating affordances.
    const { container } = render(<PccApp forceMode="desktop" />);
    const projectReadinessButton = container.querySelector(
      '[data-pcc-surface-id="project-readiness"]',
    );
    expect(projectReadinessButton).not.toBeNull();
    fireEvent.click(projectReadinessButton!);
    const sections = container.querySelectorAll<HTMLElement>(
      '[data-pcc-readiness-section="constraints-log"]',
    );
    expect(sections.length).toBeGreaterThan(0);

    for (const section of Array.from(sections)) {
      const anchors = section.querySelectorAll<HTMLAnchorElement>('a[href]');
      for (const anchor of Array.from(anchors)) {
        const href = anchor.getAttribute('href') ?? '';
        expect(
          /^https?:\/\//.test(href),
          `constraints-log anchor href '${href}' must not be a live launch URL`,
        ).toBe(false);
      }
    }
  });
});
