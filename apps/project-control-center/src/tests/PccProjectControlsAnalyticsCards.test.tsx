/**
 * Phase 06 Prompt 09 — Project Controls analytics card contract.
 *
 * Locks the three preview analytics cards inserted into the Project
 * Controls primary dashboard: project-controls-only rendering, exact
 * 6-card direct-child order, Prompt 07 Estimating + Prompt 08 Startup
 * & Closeout cross-conditional regression locks, per-card markers,
 * verbatim preview-copy strings, source-label override, fallback
 * summary outside the chart canvas, span overrides at four 12-/10-column
 * modes plus tabletLandscape footprint-fallback, all seven registry-
 * driven module rows visible (5 deferred / 2 preview-selectable), no
 * Project Intelligence regression, zero card-level active-panel marker,
 * and the static `echarts-for-react`-not-imported guard scoped to PCC
 * analytics + the Phase 05 dashboard surface.
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
  PROJECT_CONTROLS_ANALYTICS_VIEW_MODELS,
  type PccProjectControlsAnalyticsCardKey,
} from '../surfaces/phase05Dashboard/projectControlsAnalytics';
import type { PccPrimaryTabId } from '@hbc/models/pcc';
import type { PccResponsiveMode } from '../layout/footprints';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const ANALYTICS_KEYS: readonly PccProjectControlsAnalyticsCardKey[] = [
  'constraintsAging',
  'permitInspectionReadiness',
  'riskIssueSeverityDistribution',
];

const ANALYTICS_TITLE_BY_KEY: Readonly<Record<PccProjectControlsAnalyticsCardKey, string>> = {
  constraintsAging: 'Constraints Aging',
  permitInspectionReadiness: 'Permit / Inspection Readiness',
  riskIssueSeverityDistribution: 'Risk / Issue Severity Distribution',
};

const ANALYTICS_ID_BY_KEY: Readonly<Record<PccProjectControlsAnalyticsCardKey, string>> = {
  constraintsAging: 'pcc-project-controls-constraints-aging',
  permitInspectionReadiness: 'pcc-project-controls-permit-inspection-readiness',
  riskIssueSeverityDistribution: 'pcc-project-controls-risk-issue-severity-distribution',
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic project controls sample';

const PROJECT_CONTROLS_MODULE_LABELS_VISIBLE = [
  'Project Controls',
  'Permits & Inspections',
  'Contract & Compliance',
  'Risk / Issues / Decisions',
  'Constraints Log',
  'Field Operations',
  'Meeting & Communication',
] as const;

const DEFERRED_MODULE_IDS = [
  'project-controls-center',
  'contract-compliance',
  'risk-issues-decisions',
  'field-operations',
  'meeting-communication',
] as const;

const PREVIEW_SELECTABLE_MODULE_IDS = ['permits-inspections', 'constraints-log'] as const;

function renderProjectControls(mode: PccResponsiveMode = 'desktop') {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId="project-controls" />
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

describe('Project Controls analytics — title rendering', () => {
  it('renders all three analytics card titles in the bento grid', () => {
    const { container } = renderProjectControls();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    for (const key of ANALYTICS_KEYS) {
      expect(grid!.textContent).toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Project Controls analytics — exact 6-card direct order', () => {
  it('renders Project Controls → Module status → 3 analytics → Select a module when no module is active', () => {
    const { container } = renderProjectControls();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const titles = readDirectCardTitlesInOrder(grid);
    expect(titles).toEqual([
      'Project Controls',
      'Module status',
      'Constraints Aging',
      'Permit / Inspection Readiness',
      'Risk / Issue Severity Distribution',
      'Select a module',
    ]);
  });
});

describe('Project Controls analytics — unrelated dashboards remain unchanged', () => {
  for (const tabId of ['core-tools', 'cost-time'] as const) {
    it(`'${tabId}' renders zero project-controls analytics cards and exactly 3 direct dashboard cards`, () => {
      const { container } = renderOtherTab(tabId);
      const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
      const directCards = Array.from(grid.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
      );
      expect(directCards).toHaveLength(3);
      for (const key of ANALYTICS_KEYS) {
        expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
      }
    });
  }
});

describe('Project Controls analytics — Prompt 07 Estimating cross-conditional regression lock', () => {
  it("'estimating-preconstruction' still renders exactly 5 direct cards with both Estimating titles and zero Project Controls analytics titles", () => {
    const { container } = renderOtherTab('estimating-preconstruction');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards).toHaveLength(5);
    expect(grid.textContent).toContain('Handoff Continuity Preview');
    expect(grid.textContent).toContain('Estimate Exposure Preview');
    for (const key of ANALYTICS_KEYS) {
      expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Project Controls analytics — Prompt 08 Startup & Closeout cross-conditional regression lock', () => {
  it("'startup-closeout' still renders exactly 6 direct cards with all three Startup & Closeout titles and zero Project Controls analytics titles", () => {
    const { container } = renderOtherTab('startup-closeout');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards).toHaveLength(6);
    expect(grid.textContent).toContain('Startup Readiness Completion');
    expect(grid.textContent).toContain('Responsibility Coverage');
    expect(grid.textContent).toContain('Closeout & Warranty Readiness');
    for (const key of ANALYTICS_KEYS) {
      expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Project Controls analytics — per-card markers', () => {
  it('emits the canonical analytics card markers for each Project Controls analytics card', () => {
    const { container } = renderProjectControls();
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

describe('Project Controls analytics — verbatim preview copy and source label', () => {
  it('renders the verbatim preview-copy strings inside each analytics card explanation', () => {
    const { container } = renderProjectControls();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const explanation = body!.querySelector('[data-pcc-analytics-card-sample-explanation]');
      expect(explanation, `explanation block for ${id}`).not.toBeNull();
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_LABEL);
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_DESCRIPTION);
    }
  });

  it('overrides the source label to "Source: deterministic project controls sample" on each analytics card', () => {
    const { container } = renderProjectControls();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const sourceLabel = body!.querySelector('[data-pcc-analytics-card-source-label]');
      expect(sourceLabel?.textContent?.trim()).toBe(SAMPLE_SOURCE_LABEL);
    }
  });
});

describe('Project Controls analytics — fallback summary outside chart and direct-child invariant', () => {
  it('renders the summary list with no row nested inside the chart canvas', () => {
    const { container } = renderProjectControls();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const summaryRows = body!.querySelectorAll('[data-pcc-analytics-card-summary-row]');
      expect(summaryRows.length, `${id} should have summary rows`).toBe(
        PROJECT_CONTROLS_ANALYTICS_VIEW_MODELS[key].summary.length,
      );
      for (const row of Array.from(summaryRows)) {
        expect(row.closest('[data-pcc-analytics-chart]')).toBeNull();
      }
    }
  });

  it('every analytics card article is a direct child of [data-pcc-bento-grid]', () => {
    const { container } = renderProjectControls();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.parentElement).toBe(grid);
    }
  });
});

describe('Project Controls analytics — span overrides', () => {
  const TWELVE_COL_SPAN: Readonly<Record<PccProjectControlsAnalyticsCardKey, number>> = {
    constraintsAging: 4,
    permitInspectionReadiness: 4,
    riskIssueSeverityDistribution: 4,
  };
  const STANDARD_LAPTOP_SPAN: Readonly<Record<PccProjectControlsAnalyticsCardKey, number>> = {
    constraintsAging: 3,
    permitInspectionReadiness: 4,
    riskIssueSeverityDistribution: 3,
  };

  function assertOverrides(
    expectedByKey: Readonly<Record<PccProjectControlsAnalyticsCardKey, number>>,
    mode: PccResponsiveMode,
  ): void {
    const { container } = renderProjectControls(mode);
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

  it('falls back to footprint behavior at tabletLandscape (no project-controls analytics override declared)', () => {
    const { container } = renderProjectControls('tabletLandscape');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.getAttribute('data-pcc-span-source')).toBe('footprint');
      expect(article.hasAttribute('data-pcc-span-override-mode')).toBe(false);
    }
  });
});

describe('Project Controls analytics — registry rows preserved and posture invariants', () => {
  it('keeps all seven Project Controls module rows visible (registry unchanged)', () => {
    const { container } = renderProjectControls();
    for (const label of PROJECT_CONTROLS_MODULE_LABELS_VISIBLE) {
      expect(container.textContent).toContain(label);
    }
  });

  it('preserves deferred / non-selectable posture for project-controls-center, contract-compliance, risk-issues-decisions, field-operations, meeting-communication', () => {
    const { container } = renderProjectControls();
    for (const moduleId of DEFERRED_MODULE_IDS) {
      const row = container.querySelector(`[data-pcc-dashboard-module-row="${moduleId}"]`);
      expect(row, `module row for ${moduleId} should render`).not.toBeNull();
      expect(row!.getAttribute('data-pcc-dashboard-module-selectable')).toBe('false');
      expect(row!.getAttribute('data-pcc-dashboard-module-state')).toBe('deferred');
    }
  });

  it('preserves preview / selectable posture for permits-inspections and constraints-log', () => {
    const { container } = renderProjectControls();
    for (const moduleId of PREVIEW_SELECTABLE_MODULE_IDS) {
      const row = container.querySelector(`[data-pcc-dashboard-module-row="${moduleId}"]`);
      expect(row, `module row for ${moduleId} should render`).not.toBeNull();
      expect(row!.getAttribute('data-pcc-dashboard-module-selectable')).toBe('true');
      expect(row!.getAttribute('data-pcc-dashboard-module-state')).toBe('preview');
    }
  });

  it('does not contain "Project Intelligence" anywhere in the Project Controls dashboard', () => {
    const { container } = renderProjectControls();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.textContent ?? '').not.toContain('Project Intelligence');
  });

  it('renders zero card-level [data-pcc-active-surface-panel] markers (shell owns the active panel)', () => {
    const { container } = renderProjectControls();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.querySelectorAll('[data-pcc-card][data-pcc-active-surface-panel]')).toHaveLength(0);
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
