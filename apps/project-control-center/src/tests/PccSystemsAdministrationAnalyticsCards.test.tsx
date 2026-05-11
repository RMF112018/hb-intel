/**
 * Phase 06 Prompt 11 — Systems Administration analytics card contract.
 *
 * Locks the three preview analytics cards inserted into the Systems
 * Administration primary dashboard: systems-administration-only
 * rendering, exact 6-card direct-child order, Prompts 07 / 08 / 09 / 10
 * cross-conditional regression locks, per-card markers, verbatim preview-
 * copy strings, source-label override, fallback summary outside the chart
 * canvas, span overrides at four 12-/10-column modes plus tabletLandscape
 * footprint-fallback, all five registry-driven module rows visible (1
 * deferred / 4 preview-selectable), Procore mapping/sync-health no-
 * writeback authority cue still visible when active, Cost & Time Sage
 * book-of-record marker scoped only to cost-time, no Project Intelligence
 * regression, zero card-level active-panel marker, and the static
 * `echarts-for-react`-not-imported guard scoped to PCC analytics + the
 * Phase 05 dashboard surface.
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
  SYSTEMS_ADMINISTRATION_ANALYTICS_VIEW_MODELS,
  type PccSystemsAdministrationAnalyticsCardKey,
} from '../surfaces/phase05Dashboard/systemsAdministrationAnalytics';
import type { PccModuleId, PccPrimaryTabId } from '@hbc/models/pcc';
import type { PccResponsiveMode } from '../layout/footprints';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const ANALYTICS_KEYS: readonly PccSystemsAdministrationAnalyticsCardKey[] = [
  'integrationHealthSummary',
  'configurationSeverity',
  'procoreMappingSyncPosture',
];

const ANALYTICS_TITLE_BY_KEY: Readonly<Record<PccSystemsAdministrationAnalyticsCardKey, string>> = {
  integrationHealthSummary: 'Integration Health Summary',
  configurationSeverity: 'Configuration Severity',
  procoreMappingSyncPosture: 'Procore Mapping / Sync Posture',
};

const ANALYTICS_ID_BY_KEY: Readonly<Record<PccSystemsAdministrationAnalyticsCardKey, string>> = {
  integrationHealthSummary: 'pcc-systems-administration-integration-health-summary',
  configurationSeverity: 'pcc-systems-administration-configuration-severity',
  procoreMappingSyncPosture: 'pcc-systems-administration-procore-mapping-sync-posture',
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic systems administration sample';

const SYSTEMS_ADMINISTRATION_MODULE_LABELS_VISIBLE = [
  'Site Health',
  'Control Center Settings',
  'Integration Settings',
  'Procore Mapping / Sync Health',
  'Module Configuration',
] as const;

const DEFERRED_MODULE_IDS = ['integration-settings'] as const;

const PREVIEW_SELECTABLE_MODULE_IDS = [
  'site-health',
  'control-center-settings',
  'procore-mapping-sync-health',
  'module-configuration',
] as const;

const PROCORE_AUTHORITY_CUE =
  'Mapping and sync-health context only. No writeback to Procore is performed here.';

const PRIMARY_DASHBOARD_TABS_WITHOUT_BOOK_OF_RECORD: readonly PccPrimaryTabId[] = [
  'core-tools',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'systems-administration',
];

function renderSystemsAdministration(mode: PccResponsiveMode = 'desktop') {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId="systems-administration" />
    </PccBentoGrid>,
  );
}

function renderWithActiveModule(
  tabId: PccPrimaryTabId,
  activeModuleId: PccModuleId,
  mode: PccResponsiveMode = 'desktop',
) {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId={tabId} activeModuleId={activeModuleId} />
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

describe('Systems Administration analytics — title rendering', () => {
  it('renders all three analytics card titles in the bento grid', () => {
    const { container } = renderSystemsAdministration();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    for (const key of ANALYTICS_KEYS) {
      expect(grid!.textContent).toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Systems Administration analytics — exact 6-card direct order', () => {
  it('renders Systems Administration → Module status → 3 analytics → Select a module when no module is active', () => {
    const { container } = renderSystemsAdministration();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const titles = readDirectCardTitlesInOrder(grid);
    expect(titles).toEqual([
      'Systems Administration',
      'Module status',
      'Integration Health Summary',
      'Configuration Severity',
      'Procore Mapping / Sync Posture',
      'Select a module',
    ]);
  });
});

describe('Systems Administration analytics — unrelated dashboards remain unchanged', () => {
  // Phase 06 Prompt 11 — core-tools is the only remaining primary
  // dashboard that uses PccPrimaryDashboardSurface and still renders the
  // unchanged 3-card baseline.
  for (const tabId of ['core-tools'] as const) {
    it(`'${tabId}' renders zero systems-administration analytics cards and exactly 3 direct dashboard cards`, () => {
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

describe('Systems Administration analytics — Prompt 07 Estimating cross-conditional regression lock', () => {
  it("'estimating-preconstruction' still renders exactly 5 direct cards with both Estimating titles and zero Systems Administration analytics titles", () => {
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

describe('Systems Administration analytics — Prompt 08 Startup & Closeout cross-conditional regression lock', () => {
  it("'startup-closeout' still renders exactly 6 direct cards with all three Startup & Closeout titles and zero Systems Administration analytics titles", () => {
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

describe('Systems Administration analytics — Prompt 09 Project Controls cross-conditional regression lock', () => {
  it("'project-controls' still renders exactly 6 direct cards with all three Project Controls titles and zero Systems Administration analytics titles", () => {
    const { container } = renderOtherTab('project-controls');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards).toHaveLength(6);
    expect(grid.textContent).toContain('Constraints Aging');
    expect(grid.textContent).toContain('Permit / Inspection Readiness');
    expect(grid.textContent).toContain('Risk / Issue Severity Distribution');
    for (const key of ANALYTICS_KEYS) {
      expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Systems Administration analytics — Prompt 10 Cost & Time cross-conditional regression lock', () => {
  it("'cost-time' still renders exactly 6 direct cards with all three Cost & Time titles and zero Systems Administration analytics titles", () => {
    const { container } = renderOtherTab('cost-time');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const directCards = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards).toHaveLength(6);
    expect(grid.textContent).toContain('Schedule Milestone Posture');
    expect(grid.textContent).toContain('Procurement / Buyout Exposure');
    expect(grid.textContent).toContain('Commitment / Cost Exposure Preview');
    for (const key of ANALYTICS_KEYS) {
      expect(grid.textContent).not.toContain(ANALYTICS_TITLE_BY_KEY[key]);
    }
  });
});

describe('Systems Administration analytics — per-card markers', () => {
  it('emits the canonical analytics card markers for each Systems Administration analytics card', () => {
    const { container } = renderSystemsAdministration();
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

describe('Systems Administration analytics — verbatim preview copy and source label', () => {
  it('renders the verbatim preview-copy strings inside each analytics card explanation', () => {
    const { container } = renderSystemsAdministration();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const explanation = body!.querySelector('[data-pcc-analytics-card-sample-explanation]');
      expect(explanation, `explanation block for ${id}`).not.toBeNull();
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_LABEL);
      expect(explanation!.textContent).toContain(PCC_ANALYTICS_PREVIEW_DESCRIPTION);
    }
  });

  it('overrides the source label to "Source: deterministic systems administration sample" on each analytics card', () => {
    const { container } = renderSystemsAdministration();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const sourceLabel = body!.querySelector('[data-pcc-analytics-card-source-label]');
      expect(sourceLabel?.textContent?.trim()).toBe(SAMPLE_SOURCE_LABEL);
    }
  });
});

describe('Systems Administration analytics — fallback summary outside chart and direct-child invariant', () => {
  it('renders the summary list with no row nested inside the chart canvas', () => {
    const { container } = renderSystemsAdministration();
    for (const key of ANALYTICS_KEYS) {
      const id = ANALYTICS_ID_BY_KEY[key];
      const body = container.querySelector(`[data-pcc-analytics-card="${id}"]`);
      const summaryRows = body!.querySelectorAll('[data-pcc-analytics-card-summary-row]');
      expect(summaryRows.length, `${id} should have summary rows`).toBe(
        SYSTEMS_ADMINISTRATION_ANALYTICS_VIEW_MODELS[key].summary.length,
      );
      for (const row of Array.from(summaryRows)) {
        expect(row.closest('[data-pcc-analytics-chart]')).toBeNull();
      }
    }
  });

  it('every analytics card article is a direct child of [data-pcc-bento-grid]', () => {
    const { container } = renderSystemsAdministration();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.parentElement).toBe(grid);
    }
  });
});

describe('Systems Administration analytics — span overrides', () => {
  const TWELVE_COL_SPAN: Readonly<Record<PccSystemsAdministrationAnalyticsCardKey, number>> = {
    integrationHealthSummary: 4,
    configurationSeverity: 4,
    procoreMappingSyncPosture: 4,
  };
  const STANDARD_LAPTOP_SPAN: Readonly<Record<PccSystemsAdministrationAnalyticsCardKey, number>> = {
    integrationHealthSummary: 3,
    configurationSeverity: 4,
    procoreMappingSyncPosture: 3,
  };

  function assertOverrides(
    expectedByKey: Readonly<Record<PccSystemsAdministrationAnalyticsCardKey, number>>,
    mode: PccResponsiveMode,
  ): void {
    const { container } = renderSystemsAdministration(mode);
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

  it('falls back to footprint behavior at tabletLandscape (no systems-administration analytics override declared)', () => {
    const { container } = renderSystemsAdministration('tabletLandscape');
    for (const key of ANALYTICS_KEYS) {
      const article = getCardArticle(container, ANALYTICS_ID_BY_KEY[key]);
      expect(article.getAttribute('data-pcc-span-source')).toBe('footprint');
      expect(article.hasAttribute('data-pcc-span-override-mode')).toBe(false);
    }
  });
});

describe('Systems Administration analytics — registry rows preserved and posture invariants', () => {
  it('keeps all five Systems Administration module rows visible (registry unchanged)', () => {
    const { container } = renderSystemsAdministration();
    for (const label of SYSTEMS_ADMINISTRATION_MODULE_LABELS_VISIBLE) {
      expect(container.textContent).toContain(label);
    }
  });

  it('preserves deferred / non-selectable posture for integration-settings', () => {
    const { container } = renderSystemsAdministration();
    for (const moduleId of DEFERRED_MODULE_IDS) {
      const row = container.querySelector(`[data-pcc-dashboard-module-row="${moduleId}"]`);
      expect(row, `module row for ${moduleId} should render`).not.toBeNull();
      expect(row!.getAttribute('data-pcc-dashboard-module-selectable')).toBe('false');
      expect(row!.getAttribute('data-pcc-dashboard-module-state')).toBe('deferred');
    }
  });

  it('preserves preview / selectable posture for site-health, control-center-settings, procore-mapping-sync-health, module-configuration', () => {
    const { container } = renderSystemsAdministration();
    for (const moduleId of PREVIEW_SELECTABLE_MODULE_IDS) {
      const row = container.querySelector(`[data-pcc-dashboard-module-row="${moduleId}"]`);
      expect(row, `module row for ${moduleId} should render`).not.toBeNull();
      expect(row!.getAttribute('data-pcc-dashboard-module-selectable')).toBe('true');
      expect(row!.getAttribute('data-pcc-dashboard-module-state')).toBe('preview');
    }
  });

  it('does not contain "Project Intelligence" anywhere in the Systems Administration dashboard', () => {
    const { container } = renderSystemsAdministration();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.textContent ?? '').not.toContain('Project Intelligence');
  });

  it('renders zero card-level [data-pcc-active-surface-panel] markers (shell owns the active panel)', () => {
    const { container } = renderSystemsAdministration();
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    expect(grid.querySelectorAll('[data-pcc-card][data-pcc-active-surface-panel]')).toHaveLength(0);
  });
});

describe('Systems Administration analytics — Procore Mapping / Sync Health no-writeback authority cue', () => {
  it('renders the registry-driven Procore no-writeback authority cue in the selected-module body when activeModuleId is procore-mapping-sync-health', () => {
    const { container } = renderWithActiveModule(
      'systems-administration',
      'procore-mapping-sync-health',
    );
    const selectedModuleBody = container.querySelector('[data-pcc-selected-module-card]');
    expect(selectedModuleBody, 'selected-module body should render').not.toBeNull();
    expect(selectedModuleBody!.getAttribute('data-pcc-selected-module-id')).toBe(
      'procore-mapping-sync-health',
    );
    expect(selectedModuleBody!.textContent).toContain(PROCORE_AUTHORITY_CUE);
  });
});

describe('Systems Administration analytics — Cost & Time Sage book-of-record remains scoped', () => {
  it("'cost-time' still renders the Sage book-of-record marker", () => {
    const { container } = renderOtherTab('cost-time');
    const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
    const bookOfRecord = grid.querySelector('[data-pcc-dashboard-book-of-record="cost-time"]');
    expect(bookOfRecord, 'cost-time book-of-record line should render').not.toBeNull();
    expect(bookOfRecord!.textContent ?? '').toContain('Sage remains the accounting book of record');
  });

  for (const tabId of PRIMARY_DASHBOARD_TABS_WITHOUT_BOOK_OF_RECORD) {
    it(`'${tabId}' renders zero [data-pcc-dashboard-book-of-record] markers`, () => {
      const { container } = renderOtherTab(tabId);
      const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]')!;
      expect(grid.querySelectorAll('[data-pcc-dashboard-book-of-record]')).toHaveLength(0);
    });
  }
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
