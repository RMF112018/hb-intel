/**
 * Phase 06 Prompt 13 — phase-level regression coverage.
 *
 * Cross-cutting invariants that aren't naturally located in a single
 * prompt-specific test file:
 *
 *   - Project Home row-sum choreography (each row of three operational/
 *     analytics cards sums to 12 at largeLaptop/desktop/ultrawide and
 *     to 10 at standardLaptop);
 *   - no `<a href>` anchor affordance for Project Home gateway actions;
 *   - phase-level unified surface sweep across all eight Phase 06
 *     surfaces (Project Home fixture + read-model + five primary-
 *     dashboard analytics tabs + core-tools) asserting cardinality,
 *     zero card-level `data-pcc-active-surface-panel`, zero nested
 *     cards, zero `Project Intelligence` text, zero developer/TODO UI
 *     copy in rendered grid textContent;
 *   - shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`
 *     marker is present exactly once on the PccApp render;
 *   - single static dependency/import guard over the PCC source tree
 *     confirming echarts-for-react is neither declared in package.json
 *     nor imported in PCC source (comments + string literals stripped
 *     so approved post-MVP TODO prose does not trip the guard).
 *
 * Document Control is its own PCC surface (PccDocumentsSurface) and is
 * intentionally absent from the Phase 06 primary-dashboard matrix.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';

const { setOptionMock, resizeMock, disposeMock, initMock } = vi.hoisted(() => {
  const setOptionMock = vi.fn();
  const resizeMock = vi.fn();
  const disposeMock = vi.fn();
  const initMock = vi.fn(() => ({
    setOption: setOptionMock,
    resize: resizeMock,
    dispose: disposeMock,
  }));
  return { setOptionMock, resizeMock, disposeMock, initMock };
});

vi.mock('echarts/core', () => ({
  use: vi.fn(),
  registerTheme: vi.fn(),
  init: initMock,
}));
vi.mock('echarts/charts', () => ({ BarChart: {}, LineChart: {}, PieChart: {} }));
vi.mock('echarts/components', () => ({
  DatasetComponent: {},
  GridComponent: {},
  LegendComponent: {},
  TooltipComponent: {},
}));
vi.mock('echarts/renderers', () => ({ SVGRenderer: {} }));

import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectHome } from '../surfaces/projectHome/PccProjectHome';
import { PccPrimaryDashboardSurface } from '../surfaces/phase05Dashboard/PccPrimaryDashboardSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import type { PccPrimaryTabId } from '@hbc/models/pcc';
import type { PccResponsiveMode } from '../layout/footprints';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function getGrid(container: HTMLElement): HTMLElement {
  const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]');
  if (!grid) throw new Error('No [data-pcc-bento-grid] in container');
  return grid;
}

function getDirectChildCards(grid: HTMLElement): HTMLElement[] {
  return Array.from(grid.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
  );
}

function getCardTitles(grid: HTMLElement): string[] {
  return getDirectChildCards(grid).map(
    (card) => card.querySelector('h2, h3, h4')?.textContent?.trim() ?? '',
  );
}

void setOptionMock;
void resizeMock;
void disposeMock;

/* -------------------------------------------------------------------------
 * 1. Project Home row-sum choreography
 *
 * The user-visible contract is that each of the four operational-spine
 * + analytics rows fills the bento grid edge to edge: 12 at 12-column
 * modes (largeLaptop / desktop / ultrawide) and 10 at standardLaptop.
 * Derived from the per-card span matrix in
 * `PccProjectHome.phase06Composition.test.tsx:209–300` (canonical).
 * ------------------------------------------------------------------------- */

// Phase 08 Prompt 09 — re-centered Project Home row choreography.
// Row 1: Priority Actions (5) + Project Readiness (3) + Document Control Center (4) = 12.
// Row 2: Action Exposure Mix (5) + Site Health Summary (3) + Project Health Trend (4) = 12.
// Row 3: Approvals & Checkpoints (4) + Readiness / Approval Rollup (4) + Missing Configurations (4) = 12.
// Row 4: External Platforms (4) + Team Snapshot (3) + Recent Activity (5) = 12.
// 10-column rows (standardLaptop) follow the same composition (4 + 3 + 3 in Row 2), summing to 10.
const ROW_LABELS_IN_ORDER: readonly (readonly string[])[] = [
  ['Priority Actions', 'Project Readiness', 'Document Control Center'],
  ['Action Exposure Mix', 'Site Health Summary', 'Project Health Trend'],
  ['Approvals & Checkpoints', 'Readiness / Approval Rollup', 'Missing Configurations'],
  ['External Platforms', 'Team Snapshot', 'Recent Activity'],
];

const ROW_SUM_MODES: readonly { mode: PccResponsiveMode; sum: number }[] = [
  { mode: 'ultrawide', sum: 12 },
  { mode: 'desktop', sum: 12 },
  { mode: 'largeLaptop', sum: 12 },
  { mode: 'standardLaptop', sum: 10 },
];

describe('PccPhase06RegressionCoverage — Project Home row-sum choreography', () => {
  for (const { mode, sum } of ROW_SUM_MODES) {
    it(`row sums equal ${sum} at ${mode} (operational spine + analytics)`, () => {
      const { container } = render(
        <PccBentoGrid forceMode={mode}>
          <PccProjectHome />
        </PccBentoGrid>,
      );
      const grid = getGrid(container);
      const titles = getCardTitles(grid);

      // Title-anchored sanity assertion before reading spans.
      expect(titles).toEqual([
        ...ROW_LABELS_IN_ORDER[0],
        ...ROW_LABELS_IN_ORDER[1],
        ...ROW_LABELS_IN_ORDER[2],
        ...ROW_LABELS_IN_ORDER[3],
      ]);

      const cards = getDirectChildCards(grid);
      expect(cards).toHaveLength(12);

      for (let rowIndex = 0; rowIndex < 4; rowIndex += 1) {
        const rowCards = cards.slice(rowIndex * 3, rowIndex * 3 + 3);
        const rowSum = rowCards.reduce((acc, card) => {
          const span = Number.parseInt(card.getAttribute('data-pcc-column-span') ?? '0', 10);
          return acc + span;
        }, 0);
        const rowSummary = rowCards
          .map((c) => c.querySelector('h2, h3, h4')?.textContent?.trim() ?? '')
          .join(' + ');
        expect(rowSum, `Row ${rowIndex + 1} at ${mode} (${rowSummary}) must sum to ${sum}`).toBe(
          sum,
        );
      }
    });
  }
});

/* -------------------------------------------------------------------------
 * 2. Project Home gateway action — no <a href> anchor affordance
 * ------------------------------------------------------------------------- */

async function renderProjectHomeReadModel() {
  const client = createPccFixtureReadModelClient();
  const utils = render(
    <PccBentoGrid forceMode="desktop">
      <PccProjectHome readModelClient={client} />
    </PccBentoGrid>,
  );
  await utils.findByText('Lifecycle Timeline');
  await waitFor(() => {
    const grid = getGrid(utils.container);
    expect(getDirectChildCards(grid).length).toBe(18);
  });
  return utils;
}

describe('PccPhase06RegressionCoverage — Project Home gateways are buttons, never anchors', () => {
  it('every [data-pcc-project-home-gateway-action] is a <button type="button"> with no href attribute', async () => {
    const { container } = await renderProjectHomeReadModel();
    const gatewayActions = Array.from(
      container.querySelectorAll<HTMLElement>('[data-pcc-project-home-gateway-action]'),
    );
    expect(
      gatewayActions.length,
      'expected at least one Project Home gateway action affordance',
    ).toBeGreaterThan(0);
    for (const action of gatewayActions) {
      expect(action.tagName).toBe('BUTTON');
      expect(action.getAttribute('type')).toBe('button');
      expect(action.hasAttribute('href')).toBe(false);
    }
  });

  it('no <a href> anchor lives within any gateway action affordance', async () => {
    const { container } = await renderProjectHomeReadModel();
    const gatewayActions = Array.from(
      container.querySelectorAll<HTMLElement>('[data-pcc-project-home-gateway-action]'),
    );
    for (const action of gatewayActions) {
      expect(action.tagName).not.toBe('A');
      const nestedAnchors = action.querySelectorAll('a[href]');
      expect(nestedAnchors.length).toBe(0);
    }
  });
});

/* -------------------------------------------------------------------------
 * 3. Phase 06 unified surface sweep
 *
 * Mirror of EXPECTED_DIRECT_CARD_COUNT_BY_TAB in
 * `PccSurfaceRouter.phase05.test.tsx` (canonical anchor). The duplicate
 * is intentional so a future cardinality drift fails two tests
 * simultaneously. Document Control is its own surface
 * (PccDocumentsSurface) and intentionally absent from this matrix.
 *
 * Phase 07 Prompt 02 intentionally removes the Phase 05-regressed
 * generic Dashboard/title-description card from the six shared
 * primary-dashboard surfaces, dropping each count by one. Project Home
 * fixture/read-model counts (12 / 18) remain governed by Phase 06.
 * ------------------------------------------------------------------------- */

type PccDashboardPrimaryTabId = Exclude<PccPrimaryTabId, 'project-home' | 'documents'>;

const PHASE_06_PRIMARY_DASHBOARD_CARD_COUNTS: Readonly<Record<PccDashboardPrimaryTabId, number>> = {
  'core-tools': 2,
  'estimating-preconstruction': 4,
  'startup-closeout': 5,
  'project-controls': 5,
  'cost-time': 5,
  'systems-administration': 5,
};

const PRIMARY_DASHBOARD_TABS: readonly PccDashboardPrimaryTabId[] = [
  'core-tools',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'cost-time',
  'systems-administration',
];

// Forbidden developer/TODO copy regex set. Scoped to RENDERED grid
// textContent only — source files legitimately carry these tokens inside
// JSDoc/comments (the approved post-MVP TODOs at
// `pccAnalyticsEcharts.ts:30`, `projectHomeChoreography.ts:15`,
// `projectHomeAnalytics.ts`, `PccProjectHomeReadModelContent.tsx`,
// `PccPrimaryDashboardSurface.tsx`, `pccAnalyticsViewModels.ts`).
const FORBIDDEN_RENDERED_PATTERNS: readonly { name: string; pattern: RegExp }[] = [
  { name: 'TODO(post-mvp)', pattern: /TODO\(post-mvp\)/i },
  { name: 'Prompt NN', pattern: /\bPrompt\s+\d{2}\b/i },
  { name: 'wave-XX', pattern: /\bwave-[a-z0-9]+\b/i },
  { name: 'phase-NN', pattern: /\bphase[-\s]?\d{2}\b/i },
  { name: 'coming soon', pattern: /coming soon/i },
];

function assertSurfaceInvariants(grid: HTMLElement, surfaceId: string, expectedCardCount: number) {
  expect(
    getDirectChildCards(grid).length,
    `surface '${surfaceId}' must render exactly ${expectedCardCount} direct cards`,
  ).toBe(expectedCardCount);

  expect(
    grid.querySelectorAll('[data-pcc-card][data-pcc-active-surface-panel]'),
    `surface '${surfaceId}' must not declare card-level [data-pcc-active-surface-panel]`,
  ).toHaveLength(0);

  expect(
    grid.querySelectorAll('[data-pcc-card] [data-pcc-card]'),
    `surface '${surfaceId}' must not render nested [data-pcc-card]`,
  ).toHaveLength(0);

  expect(
    grid.textContent ?? '',
    `surface '${surfaceId}' must not render "Project Intelligence"`,
  ).not.toContain('Project Intelligence');

  const text = grid.textContent ?? '';
  for (const { name, pattern } of FORBIDDEN_RENDERED_PATTERNS) {
    expect(
      pattern.test(text),
      `surface '${surfaceId}' must not render developer/TODO copy matching '${name}'`,
    ).toBe(false);
  }

  expect(
    Array.from(grid.children).every(
      (child) => child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    ),
    `surface '${surfaceId}': every direct bento child must be a [data-pcc-card] article`,
  ).toBe(true);
}

describe('PccPhase06RegressionCoverage — unified surface sweep (Project Home fixture)', () => {
  it('renders 12 direct cards and preserves all Phase 06 invariants', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome />
      </PccBentoGrid>,
    );
    assertSurfaceInvariants(getGrid(container), 'project-home-fixture', 12);
  });
});

describe('PccPhase06RegressionCoverage — unified surface sweep (Project Home read-model)', () => {
  it('renders 18 direct cards and preserves all Phase 06 invariants', async () => {
    const { container } = await renderProjectHomeReadModel();
    assertSurfaceInvariants(getGrid(container), 'project-home-read-model', 18);
  });
});

describe('PccPhase06RegressionCoverage — unified surface sweep (primary dashboards)', () => {
  for (const tabId of PRIMARY_DASHBOARD_TABS) {
    const expected = PHASE_06_PRIMARY_DASHBOARD_CARD_COUNTS[tabId];
    it(`'${tabId}' renders ${expected} direct cards and preserves all Phase 06 invariants`, () => {
      const { container } = render(
        <PccBentoGrid forceMode="desktop">
          <PccPrimaryDashboardSurface activePrimaryTabId={tabId} />
        </PccBentoGrid>,
      );
      assertSurfaceInvariants(getGrid(container), `primary-dashboard:${tabId}`, expected);
    });
  }
});

describe('PccPhase06RegressionCoverage — shell-owned active-panel marker', () => {
  it('PccApp render produces exactly one main[role="tabpanel"][data-pcc-active-surface-panel] and zero card-level markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const shellPanels = container.querySelectorAll(
      'main[role="tabpanel"][data-pcc-active-surface-panel]',
    );
    expect(shellPanels).toHaveLength(1);
    const grid = getGrid(container);
    expect(grid.querySelectorAll('[data-pcc-card][data-pcc-active-surface-panel]')).toHaveLength(0);
  });
});

/* -------------------------------------------------------------------------
 * 4. Static dependency / import guard
 * ------------------------------------------------------------------------- */

function stripCommentsAndStrings(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/`(?:\\.|[^`\\])*`/g, '``');
}

const ECHARTS_FOR_REACT_IMPORT_PATTERN =
  /(?:from|require\(|import\()\s*['"`]echarts-for-react['"`]/;

describe('PccPhase06RegressionCoverage — static dependency and import guard', () => {
  it('apps/project-control-center/package.json declares no echarts-for-react dependency', () => {
    const pkgPath = join(import.meta.dirname, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    };
    for (const bucket of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ] as const) {
      const declared = pkg[bucket] ?? {};
      expect(
        Object.prototype.hasOwnProperty.call(declared, 'echarts-for-react'),
        `package.json '${bucket}' must not declare echarts-for-react`,
      ).toBe(false);
    }
  });

  it('no PCC source file (excluding tests) imports echarts-for-react after stripping comments and string literals', () => {
    const srcRoot = join(import.meta.dirname, '..');
    const failures: string[] = [];

    function walk(dir: string): void {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === '__fixtures__' || entry.name === 'node_modules') continue;
          walk(full);
          continue;
        }
        if (!entry.isFile()) continue;
        if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) continue;
        if (!/\.(tsx?)$/.test(entry.name)) continue;
        const raw = readFileSync(full, 'utf8');
        const stripped = stripCommentsAndStrings(raw);
        if (ECHARTS_FOR_REACT_IMPORT_PATTERN.test(stripped)) {
          failures.push(full);
        }
      }
    }

    walk(srcRoot);
    expect(
      failures,
      `expected zero echarts-for-react imports under apps/project-control-center/src, got ${failures.join(', ')}`,
    ).toHaveLength(0);
  });

  it('approved post-MVP echarts-for-react prose mention in pccAnalyticsEcharts.ts does not trigger the import guard', () => {
    const pccAnalyticsEchartsPath = join(
      import.meta.dirname,
      '..',
      'analytics',
      'pccAnalyticsEcharts.ts',
    );
    const raw = readFileSync(pccAnalyticsEchartsPath, 'utf8');
    expect(
      raw.includes('echarts-for-react'),
      'expected the approved Prompt 03 prose mention to remain in pccAnalyticsEcharts.ts',
    ).toBe(true);
    const stripped = stripCommentsAndStrings(raw);
    expect(ECHARTS_FOR_REACT_IMPORT_PATTERN.test(stripped)).toBe(false);
  });
});
