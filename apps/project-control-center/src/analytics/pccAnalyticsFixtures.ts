/**
 * Phase 06 Prompt 03 — deterministic analytics fixtures.
 *
 * Used by tests and by later prompts (04-11) when wiring per-surface
 * analytics cards before live read-model envelopes are connected. No
 * `Date.now()`, no `Math.random()`, no locale-dependent formatting.
 *
 * The `sourceLabel` for ready fixtures uses
 * `Source: PCC read-model available` (per stored convention — never
 * the word `live` for the read-model envelope).
 *
 * These fixtures are NOT rendered into any production surface in
 * Prompt 03.
 */

import type { PccAnalyticsViewModel } from './pccAnalyticsTypes';

export const PCC_ANALYTICS_FIXTURE_READY: PccAnalyticsViewModel = {
  id: 'pcc-analytics-fixture-ready',
  title: 'Project Spend by Category',
  eyebrow: 'Cost & Time',
  description: 'Category breakdown of committed project spend.',
  state: 'ready',
  stateLabel: 'Ready',
  sourceLabel: 'Source: PCC read-model available',
  sampleData: false,
  summary: [
    { label: 'General Conditions', value: '$2.4M', tone: 'info' },
    { label: 'Site Work', value: '$1.6M', tone: 'neutral' },
    { label: 'Concrete', value: '$3.1M', tone: 'neutral' },
  ],
  chartKind: 'donut',
  dataset: [
    { name: 'General Conditions', value: 2400000 },
    { name: 'Site Work', value: 1600000 },
    { name: 'Concrete', value: 3100000 },
  ],
  accessibilitySummary:
    'Donut chart of project spend across General Conditions, Site Work, and Concrete categories.',
};

export const PCC_ANALYTICS_FIXTURE_PREVIEW: PccAnalyticsViewModel = {
  id: 'pcc-analytics-fixture-preview',
  title: 'Schedule Trend (Preview)',
  eyebrow: 'Schedule',
  description: 'Planned vs forecast progress over the next four weeks.',
  state: 'preview',
  stateLabel: 'Preview',
  sourceLabel: 'Source: PCC read-model available',
  sampleData: true,
  summary: [
    { label: 'Planned (week 4)', value: '78%', tone: 'info' },
    { label: 'Forecast (week 4)', value: '74%', tone: 'warning' },
    { label: 'Variance', value: '-4 pts', tone: 'warning' },
  ],
  chartKind: 'line',
  dataset: [
    { category: 'W1', planned: 25, forecast: 24 },
    { category: 'W2', planned: 45, forecast: 43 },
    { category: 'W3', planned: 62, forecast: 58 },
    { category: 'W4', planned: 78, forecast: 74 },
  ],
  accessibilitySummary:
    'Line chart of planned versus forecast progress across four upcoming weeks.',
};

export const PCC_ANALYTICS_FIXTURE_DEGRADED: PccAnalyticsViewModel = {
  id: 'pcc-analytics-fixture-degraded',
  title: 'Approvals Aging (Degraded)',
  eyebrow: 'Approvals',
  description: 'Pending approval requests grouped by aging bucket.',
  state: 'degraded',
  stateLabel: 'Source partially unavailable',
  sourceLabel: 'Source: PCC read-model partial — backend unavailable',
  sampleData: true,
  summary: [
    { label: '0-3 days', value: '6', tone: 'info' },
    { label: '4-7 days', value: '4', tone: 'warning' },
    { label: '8+ days', value: '2', tone: 'danger' },
  ],
  chartKind: 'stacked-bar',
  dataset: [
    { category: '0-3 days', pending: 6 },
    { category: '4-7 days', pending: 4 },
    { category: '8+ days', pending: 2 },
  ],
  accessibilitySummary: 'Stacked bar chart of pending approval counts grouped by aging bucket.',
};

export const PCC_ANALYTICS_FIXTURES: ReadonlyArray<PccAnalyticsViewModel> = [
  PCC_ANALYTICS_FIXTURE_READY,
  PCC_ANALYTICS_FIXTURE_PREVIEW,
  PCC_ANALYTICS_FIXTURE_DEGRADED,
];
