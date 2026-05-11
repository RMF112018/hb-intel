/**
 * Phase 06 Prompt 10 — Cost & Time analytics card contract.
 *
 * Locks the three preview analytics cards inserted into the Cost & Time
 * primary dashboard: cost-time-only rendering, exact 5-card direct-child
 * order (post-Phase-07 Prompt 02 — generic Dashboard hero card removed),
 * Prompts 07 / 08 / 09 cross-conditional regression locks, per-card
 * markers, verbatim preview-copy strings, source-label override, fallback
 * summary outside the chart canvas, span overrides at four 12-/10-column
 * modes plus tabletLandscape footprint-fallback, all four registry-driven
 * module rows visible (3 deferred / 1 preview-selectable), Sage book-of-
 * record posture line visible AND scoped only to cost-time, no Project
 * Intelligence regression, zero card-level active-panel marker, and the
 * static `echarts-for-react`-not-imported guard scoped to PCC analytics +
 * the Phase 05 dashboard surface.
 *
 * Mocks `echarts/core` so jsdom doesn't spin up real ECharts during the
 * dashboard renders.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

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

import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccPrimaryDashboardSurface } from '../surfaces/phase05Dashboard/PccPrimaryDashboardSurface';
import {
  PCC_ANALYTICS_PREVIEW_DESCRIPTION,
  PCC_ANALYTICS_PREVIEW_LABEL,
} from '../analytics/pccAnalyticsA11y';
import {
  COST_TIME_ANALYTICS_VIEW_MODELS,
  type PccCostTimeAnalyticsCardKey,
} from '../surfaces/phase05Dashboard/costTimeAnalytics';
import type { PccPrimaryTabId } from '@hbc/models/pcc';
import type { PccResponsiveMode } from '../layout/footprints';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const ANALYTICS_KEYS: readonly PccCostTimeAnalyticsCardKey[] = [
  'scheduleMilestonePosture',
  'procurementBuyoutExposure',
  'commitmentCostExposurePreview',
];

const ANALYTICS_TITLE_BY_KEY: Readonly<Record<PccCostTimeAnalyticsCardKey, string>> = {
  scheduleMilestonePosture: 'Schedule Milestone Posture',
  procurementBuyoutExposure: 'Procurement / Buyout Exposure',
  commitmentCostExposurePreview: 'Commitment / Cost Exposure Preview',
};

const ANALYTICS_ID_BY_KEY: Readonly<Record<PccCostTimeAnalyticsCardKey, string>> = {
  scheduleMilestonePosture: 'pcc-cost-time-schedule-milestone-posture',
  procurementBuyoutExposure: 'pcc-cost-time-procurement-buyout-exposure',
  commitmentCostExposurePreview: 'pcc-cost-time-commitment-cost-exposure-preview',
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic cost and time sample';

const COST_TIME_MODULE_LABELS_VISIBLE = [
  'Financial Reporting',
  'Schedule Monitor',
  'Procurement & Buyout',
  'Commitment / Cost Exposure',
] as const;

const DEFERRED_MODULE_IDS = [
  'financial-reporting',
  'schedule-monitor',
  'commitment-cost-exposure',
] as const;

const PREVIEW_SELECTABLE_MODULE_IDS = ['procurement-buyout'] as const;

const TABS_WITHOUT_BOOK_OF_RECORD: readonly PccPrimaryTabId[] = [
  'core-tools',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'systems-administration',
];

function renderCostTime(mode: PccResponsiveMode = 'desktop') {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId="cost-time" />
    </PccBentoGrid>,
  );
}

function renderOtherTab(tabId: PccPrimaryTabId, mode: PccResponsiveMode = 'desktop') {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId={tabId} />
    </PccBentoGrid>,
  );
}

function readDirectCardTitlesInOrder(grid: HTMLElement): string[] {
  return Array.from(grid.children)
    .filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    )
    .map((card) => card.querySelector('h2,h3,h4')?.textContent?.trim() ?? '');
}

function getCardArticle(container: HTMLElement, id: string): HTMLElement {
  const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
  if (!(body instanceof HTMLElement)) {
    throw new Error(`Analytics card body for ${id} not found`);
  }
  const article = body.closest('[data-pcc-card]');
  if (!(article instanceof HTMLElement)) {
    throw new Error(`Article ancestor for ${id} not found`);
  }
  return article;
}

describe('Cost & Time analytics — title rendering', () => {
  it('renders all three analytics card titles in the bento grid', () => {
    const { container } = renderCostTime();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    for (const key of ANALYTICS_KEYS) {
      expect(grid!.textContent).toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Cost & Time analytics — exact 5-card direct order', () => {
  it('renders Module status → 3 analytics → Select a module when no module is active', () => {
    const { container } = renderCostTime();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const titles = readDirectCardTitlesInOrder(grid);
    expect(titles).toEqual([
      'Module status',
      'Schedule Milestone Posture',
      'Procurement / Buyout Exposure',
      'Commitment / Cost Exposure Preview',
      'Select a module',
    ]);
  });
});

describe('Cost & Time analytics — unrelated dashboards remain unchanged', () => {
  // Phase 07 Prompt 02 removed the generic Dashboard hero card from the
  // six shared primary-dashboard surfaces. core-tools is the only
  // remaining primary dashboard that uses PccPrimaryDashboardSurface
  // without analytics and now renders the 2-card baseline
  // (Module status + Selected module).
  for (const tabId of ['core-tools'] as const) {
    it(`'${tabId}' renders zero cost-time analytics cards and exactly 2 direct dashboard cards`, () => {
      const { container } = renderOtherTab(tabId);
      const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
      const directCards = Array.from(grid.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
      );
      expect(directCards).toHaveLength(2);
      for (const key of ANALYTICS_KEYS) {
        expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
      }
    });
  }
});

describe('Cost & Time analytics — Prompt 07 Estimating cross-conditional regression lock', () => {
  it("'estimating-preconstruction' still renders exactly 4 direct cards with both Estimating titles and zero Cost & Time analytics titles", () => {
    const { container } = renderOtherTab('estimating-preconstruction');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards).toHaveLength(4);
    expect(grid.textContent).toContain('Handoff Continuity Preview');
    expect(grid.textContent).toContain('Estimate Exposure Preview');
    for (const key of ANALYTICS_KEYS) {
      expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Cost & Time analytics — Prompt 08 Startup & Closeout cross-conditional regression lock', () => {
  it("'startup-closeout' still renders exactly 5 direct cards with all three Startup & Closeout titles and zero Cost & Time analytics titles", () => {
    const { container } = renderOtherTab('startup-closeout');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards).toHaveLength(5);
    expect(grid.textContent).toContain('Startup Readiness Completion');
    expect(grid.textContent).toContain('Responsibility Coverage');
    expect(grid.textContent).toContain('Closeout & Warranty Readiness');
    for (const key of ANALYTICS_KEYS) {
      expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Cost & Time analytics — Prompt 09 Project Controls cross-conditional regression lock', () => {
  it("'project-controls' still renders exactly 5 direct cards with all three Project Controls titles and zero Cost & Time analytics titles", () => {
    const { container } = renderOtherTab('project-controls');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards).toHaveLength(5);
    expect(grid.textContent).toContain('Constraints Aging');
    expect(grid.textContent).toContain('Permit / Inspection Readiness');
    expect(grid.textContent).toContain('Risk / Issue Severity Distribution');
    for (const key of ANALYTICS_KEYS) {
      expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Cost & Time analytics — per-card markers', () => {
  it('emits the canonical analytics card markers for each Cost & Time analytics card', () => {
    const { container } = renderCostTime();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      expect(body, `card body for ${id} should render`).not.toBeNull();
      expect(body!.getAttribute('data-pcc-analytics-card-state')).toBe('preview');
      expect(body!.getAttribute('data-pcc-analytics-card-sample-data')).toBe('true');
      const chart = body!.querySelector(`[data-pcc-analytics-chart="${id}"]`);
      expect(chart, `chart container for ${id} should render`).not.toBeNull();
      expect(chart!.getAttribute('data-pcc-analytics-sample-data')).toBe('true');
    }
  });
});

describe('Cost & Time analytics — verbatim preview copy and source label', () => {
  it('renders the verbatim preview-copy strings inside each analytics card explanation', () => {
    const { container } = renderCostTime();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const explanation = body!.querySelector('[data-pcc-analytics-card-sample-explanation]');
      expect(explanation, `explanation block for ${id}`).not.toBeNull();
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_LABEL);
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_DESCRIPTION);
    }
  });

  it('overrides the source label to "Source: deterministic cost and time sample" on each analytics card', () => {
    const { container } = renderCostTime();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const sourceLabel = body!.querySelector('[data-pcc-analytics-card-source-label]');
      expect(sourceLabel?.textContent?.trim()).toBe(SAMPLE_SOURCE_LABEL);
    }
  });
});

describe('Cost & Time analytics — fallback summary outside chart and direct-child invariant', () => {
  it('renders the summary list with no row nested inside the chart canvas', () => {
    const { container } = renderCostTime();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const summaryRows = body!.querySelectorAll('[data-pcc-analytics-card-summary-row]');
      expect(summaryRows.length, `${id} should have summary rows`).toBe(
        COST_TIME_ANALYTICS_VIEW_MODELS[key].summary.length,
      );
      for (const row of Array.from(summaryRows)) {
        expect(row.closest('[data-pcc-analytics-chart]')).toBeNull();
      }
    }
  });

  it('every analytics card article is a direct child of [data-pcc-bento-grid]', () => {
    const { container } = renderCostTime();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.parentElement).toBe(grid);
    }
  });
});

describe('Cost & Time analytics — span overrides', () => {
  const TWELVE_COL_SPAN: Readonly<Record<PccCostTimeAnalyticsCardKey, number>> = {
    scheduleMilestonePosture: 4,
    procurementBuyoutExposure: 4,
    commitmentCostExposurePreview: 4,
  };
  const STANDARD_LAPTOP_SPAN: Readonly<Record<PccCostTimeAnalyticsCardKey, number>> = {
    scheduleMilestonePosture: 3,
    procurementBuyoutExposure: 4,
    commitmentCostExposurePreview: 3,
  };

  function assertOverrides(
    expectedByKey: Readonly<Record<PccCostTimeAnalyticsCardKey, number>>,
    mode: PccResponsiveMode,
  ): void {
    const { container } = renderCostTime(mode);
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.getAttribute('data-pcc-column-span'), `${key} column span at ${mode}`).toBe(
        String(expectedByKey[key]),
      );
      expect(article.getAttribute('data-pcc-span-source')).toBe('override');
      expect(article.getAttribute('data-pcc-span-override-mode')).toBe(mode);
    }
  }

  it('applies the 12-column matrix at desktop', () => {
    assertOverrides(TWELVE_COL_SPAN, 'desktop');
  });

  it('applies the 12-column matrix at largeLaptop', () => {
    assertOverrides(TWELVE_COL_SPAN, 'largeLaptop');
  });

  it('applies the 12-column matrix at ultrawide', () => {
    assertOverrides(TWELVE_COL_SPAN, 'ultrawide');
  });

  it('applies the 10-column matrix at standardLaptop', () => {
    assertOverrides(STANDARD_LAPTOP_SPAN, 'standardLaptop');
  });

  it('falls back to footprint behavior at tabletLandscape (no cost-time analytics override declared)', () => {
    const { container } = renderCostTime('tabletLandscape');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.getAttribute('data-pcc-span-source')).toBe('footprint');
      expect(article.hasAttribute('data-pcc-span-override-mode')).toBe(false);
    }
  });
});

describe('Cost & Time analytics — registry rows preserved and posture invariants', () => {
  it('keeps all four Cost & Time module rows visible (registry unchanged)', () => {
    const { container } = renderCostTime();
    for (const label of COST_TIME_MODULE_LABELS_VISIBLE) {
      expect(container.textContent).toContain(label);
    }
  });

  it('preserves deferred / non-selectable posture for financial-reporting, schedule-monitor, commitment-cost-exposure', () => {
    const { container } = renderCostTime();
    for (const moduleId of DEFERRED_MODULE_IDS) {
      const row = container.querySelector(`[data-pcc-dashboard-module-row="${moduleId}"]`);
      expect(row, `module row for ${moduleId} should render`).not.toBeNull();
      expect(row!.getAttribute('data-pcc-dashboard-module-selectable')).toBe('false');
      expect(row!.getAttribute('data-pcc-dashboard-module-state')).toBe('deferred');
    }
  });

  it('preserves preview / selectable posture for procurement-buyout', () => {
    const { container } = renderCostTime();
    for (const moduleId of PREVIEW_SELECTABLE_MODULE_IDS) {
      const row = container.querySelector(`[data-pcc-dashboard-module-row="${moduleId}"]`);
      expect(row, `module row for ${moduleId} should render`).not.toBeNull();
      expect(row!.getAttribute('data-pcc-dashboard-module-selectable')).toBe('true');
      expect(row!.getAttribute('data-pcc-dashboard-module-state')).toBe('preview');
    }
  });

  it('does not contain "Project Intelligence" anywhere in the Cost & Time dashboard', () => {
    const { container } = renderCostTime();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.textContent ?? '').not.toContain('Project Intelligence');
  });

  it('renders zero card-level [data-pcc-active-surface-panel] markers (shell owns the active panel)', () => {
    const { container } = renderCostTime();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.querySelectorAll('[data-pcc-card][data-pcc-active-surface-panel]')).toHaveLength(0);
  });
});

describe('Cost & Time analytics — Sage book-of-record posture line visible and scoped to cost-time', () => {
  it('renders the data-pcc-dashboard-book-of-record="cost-time" marker on the Cost & Time dashboard with the Sage book-of-record copy', () => {
    const { container } = renderCostTime();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const bookOfRecord = grid.querySelector('[data-pcc-dashboard-book-of-record="cost-time"]');
    expect(bookOfRecord, 'cost-time book-of-record line should render').not.toBeNull();
    expect(bookOfRecord!.textContent ?? '').toContain('Sage remains the accounting book of record');
  });

  for (const tabId of TABS_WITHOUT_BOOK_OF_RECORD) {
    it(`'${tabId}' renders zero [data-pcc-dashboard-book-of-record] markers`, () => {
      const { container } = renderOtherTab(tabId);
      const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
      expect(grid.querySelectorAll('[data-pcc-dashboard-book-of-record]')).toHaveLength(0);
    });
  }
});

const SAGE_CUE_EXACT_TEXT =
  'Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.';

describe('Cost & Time analytics — Sage cue position and posture (Phase 07 Prompt 05)', () => {
  const SAGE_CUE_FORBIDDEN_AFFIRMATIVE_PATTERNS: readonly RegExp[] = [
    /will write back/i,
    /can write back/i,
    /sync(?:s|ed)? to Sage/i,
    /post(?:s|ed)? to Sage/i,
    /update(?:s|d)? Sage/i,
    /mutate(?:s|d)? Sage/i,
    /accounting mutation/i,
  ];

  it('renders the Sage cue verbatim inside the Module status card with post-Phase-07 host-card markers', () => {
    const { container } = renderCostTime();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const cue = grid.querySelector<HTMLElement>('[data-pcc-dashboard-book-of-record="cost-time"]');
    expect(cue, 'Cost & Time Sage cue must render').not.toBeNull();
    expect(cue!.textContent?.trim()).toBe(SAGE_CUE_EXACT_TEXT);

    const card = cue!.closest<HTMLElement>('[data-pcc-card]');
    expect(card, 'Sage cue must be inside a [data-pcc-card]').not.toBeNull();
    expect(
      card!.querySelector('h2, h3, h4')?.textContent?.trim(),
      'Sage cue host card heading must be "Module status"',
    ).toBe('Module status');

    expect(card!.getAttribute('data-pcc-footprint')).toBe('wide');
    expect(card!.getAttribute('data-pcc-card-hierarchy')).toBe('standard');
    expect(card!.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card!.getAttribute('data-pcc-card-region')).toBe('operational');

    expect(card!.getAttribute('data-pcc-footprint')).not.toBe('hero');
    expect(card!.getAttribute('data-pcc-card-hierarchy')).not.toBe('primary');
    expect(card!.getAttribute('data-pcc-card-tier')).not.toBe('tier1');
    expect(card!.getAttribute('data-pcc-card-region')).not.toBe('command');
  });

  it('Sage cue contains "does not write back to Sage" and asserts zero affirmative Sage writeback/sync/mutation language on the cue node only', () => {
    const { container } = renderCostTime();
    const cue = container.querySelector<HTMLElement>(
      '[data-pcc-dashboard-book-of-record="cost-time"]',
    );
    expect(cue, 'Sage cue must render').not.toBeNull();
    const cueText = cue!.textContent ?? '';
    expect(cueText).toContain('does not write back to Sage');
    for (const pattern of SAGE_CUE_FORBIDDEN_AFFIRMATIVE_PATTERNS) {
      expect(
        pattern.test(cueText),
        `Sage cue must not match affirmative writeback/sync/mutation pattern ${pattern}`,
      ).toBe(false);
    }
  });

  it('first direct Cost & Time card is "Module status" and no generic Cost & Time hero card survives', () => {
    const { container } = renderCostTime();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards.length).toBeGreaterThanOrEqual(1);
    expect(directCards[0].querySelector('h2, h3, h4')?.textContent?.trim()).toBe('Module status');
    const heroPatternCard = directCards.find(
      (card) =>
        card.querySelector('h2, h3, h4')?.textContent?.trim() === 'Cost & Time' &&
        card.getAttribute('data-pcc-footprint') === 'hero' &&
        card.getAttribute('data-pcc-card-hierarchy') === 'primary' &&
        card.getAttribute('data-pcc-card-tier') === 'tier1' &&
        card.getAttribute('data-pcc-card-region') === 'command',
    );
    expect(
      heroPatternCard,
      'no Cost & Time direct card may match the removed Phase 05 generic Dashboard hero pattern',
    ).toBeUndefined();
  });
});

describe('Cost & Time analytics — selected-module behavior with Sage cue relocated (Phase 07 Prompt 05)', () => {
  it('Cost & Time render with activeModuleId="procurement-buyout" keeps the Sage cue inside Module status and renders the Procurement & Buyout selected-module card without leaking the cue', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccPrimaryDashboardSurface
          activePrimaryTabId="cost-time"
          activeModuleId="procurement-buyout"
        />
      </PccBentoGrid>,
    );
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;

    const cue = grid.querySelector<HTMLElement>('[data-pcc-dashboard-book-of-record="cost-time"]');
    expect(cue, 'Sage cue must still render with an active Cost & Time module').not.toBeNull();
    const cueHostCard = cue!.closest<HTMLElement>('[data-pcc-card]');
    expect(
      cueHostCard!.querySelector('h2, h3, h4')?.textContent?.trim(),
      'Sage cue must remain inside the Module status card on the activeModuleId render path',
    ).toBe('Module status');

    const selectedInner = grid.querySelector<HTMLElement>('[data-pcc-selected-module-card]');
    expect(selectedInner, 'Selected-module marker div must render').not.toBeNull();
    expect(selectedInner!.getAttribute('data-pcc-selected-module-id')).toBe('procurement-buyout');
    expect(selectedInner!.getAttribute('data-pcc-selected-module-state')).toBe('preview');
    expect(selectedInner!.getAttribute('data-pcc-selected-module-parent-tab')).toBe('cost-time');

    const selectedHostCard = selectedInner!.closest<HTMLElement>('[data-pcc-card]');
    expect(
      selectedHostCard!.querySelector('h2, h3, h4')?.textContent?.trim(),
      'Selected-module card heading must equal the registry label "Procurement & Buyout"',
    ).toBe('Procurement & Buyout');
    expect(
      selectedHostCard!.textContent ?? '',
      'Selected-module card must not include the Sage book-of-record cue',
    ).not.toContain('Sage remains the accounting book of record');
  });
});

describe('Phase 05 dashboard + PCC analytics — does not import echarts-for-react', () => {
  it('no PCC analytics or phase05Dashboard source file (excluding tests) imports the echarts-for-react module', () => {
    const roots = [
      join(import.meta.dirname, '..', 'analytics'),
      join(import.meta.dirname, '..', 'surfaces', 'phase05Dashboard'),
    ];
    const failures: string[] = [];
    const importPattern = /(?:from|require\(|import\()\s*['"]echarts-for-react['"]/;

    function walk(dir: string): void {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.isFile()) continue;
        if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) continue;
        if (!/\.(tsx?|css)$/.test(entry.name)) continue;
        const content = readFileSync(full, 'utf8');
        if (importPattern.test(content)) {
          failures.push(full);
        }
      }
    }

    for (const root of roots) walk(root);
    expect(
      failures,
      `expected zero echarts-for-react imports under analytics/ and surfaces/phase05Dashboard/, got ${failures.join(', ')}`,
    ).toHaveLength(0);
  });
});
