/**
 * Phase 06 Prompt 08 — Project Startup & Closeout analytics data.
 *
 * Three preview analytics cards consumed by `PccPrimaryDashboardSurface`
 * only when `activePrimaryTabId === 'startup-closeout'`. Built on the
 * Prompt 03 analytics foundation (`PccAnalyticsCard`,
 * `buildPreviewAnalyticsViewModel`) and Prompt 01's `spanOverrides` seam.
 * Startup-&-closeout-only — not a shared dashboard primitive.
 */

import { buildPreviewAnalyticsViewModel, type PccAnalyticsViewModel } from '../../analytics';
import type { PccCardSpanOverrides } from '../../layout/footprints';

// TODO(post-mvp): Replace deterministic Project Startup & Closeout
// analytics samples with source-backed read-model projections once
// startup, responsibility, closeout, turnover, warranty, and
// lessons-learned envelopes are defined. Keep this read-model driven;
// do not introduce workflow execution, source-system mutation,
// warranty-system mutation, approval execution, or writeback from
// analytics cards.

export type PccStartupCloseoutAnalyticsCardKey =
  | 'startupReadinessCompletion'
  | 'responsibilityCoverage'
  | 'closeoutWarrantyReadiness';

export const STARTUP_CLOSEOUT_ANALYTICS_CARD_KEYS: readonly PccStartupCloseoutAnalyticsCardKey[] = [
  'startupReadinessCompletion',
  'responsibilityCoverage',
  'closeoutWarrantyReadiness',
] as const;

export const STARTUP_CLOSEOUT_ANALYTICS_CARD_TITLES: Readonly<
  Record<PccStartupCloseoutAnalyticsCardKey, string>
> = {
  startupReadinessCompletion: 'Startup Readiness Completion',
  responsibilityCoverage: 'Responsibility Coverage',
  closeoutWarrantyReadiness: 'Closeout & Warranty Readiness',
};

const startupCloseoutAnalyticsSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});

export const STARTUP_CLOSEOUT_ANALYTICS_SPAN_OVERRIDES: Readonly<
  Record<PccStartupCloseoutAnalyticsCardKey, PccCardSpanOverrides>
> = {
  startupReadinessCompletion: startupCloseoutAnalyticsSpan(4, 3),
  responsibilityCoverage: startupCloseoutAnalyticsSpan(4, 4),
  closeoutWarrantyReadiness: startupCloseoutAnalyticsSpan(4, 3),
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic startup and closeout sample';

export const STARTUP_CLOSEOUT_ANALYTICS_VIEW_MODELS: Readonly<
  Record<PccStartupCloseoutAnalyticsCardKey, PccAnalyticsViewModel>
> = {
  startupReadinessCompletion: buildPreviewAnalyticsViewModel({
    id: 'pcc-startup-closeout-startup-readiness-completion',
    title: 'Startup Readiness Completion',
    eyebrow: 'Startup readiness',
    description:
      'Preview of startup readiness completion across onboarding, controls, safety, and source setup.',
    chartKind: 'grouped-bar',
    dataset: [
      { category: 'Onboarding', complete: 86, open: 14 },
      { category: 'Project controls', complete: 72, open: 28 },
      { category: 'Safety setup', complete: 91, open: 9 },
      { category: 'Source setup', complete: 68, open: 32 },
    ],
    summary: [
      { label: 'Onboarding complete', value: '86%', tone: 'success' },
      { label: 'Controls complete', value: '72%', tone: 'info' },
      { label: 'Source setup open', value: '32%', tone: 'warning' },
    ],
    accessibilitySummary:
      'Grouped bar chart preview of startup readiness completion across onboarding, project controls, safety setup, and source setup.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  responsibilityCoverage: buildPreviewAnalyticsViewModel({
    id: 'pcc-startup-closeout-responsibility-coverage',
    title: 'Responsibility Coverage',
    eyebrow: 'Responsibility matrix',
    description:
      'Preview of responsibility coverage across owner, design, trade, and internal project roles.',
    chartKind: 'progress-bars',
    dataset: [
      { category: 'Owner obligations', covered: 82, open: 18 },
      { category: 'Design responsibilities', covered: 76, open: 24 },
      { category: 'Trade responsibilities', covered: 69, open: 31 },
      { category: 'Internal owners', covered: 88, open: 12 },
    ],
    summary: [
      { label: 'Internal owners assigned', value: '88%', tone: 'success' },
      { label: 'Trade responsibility coverage', value: '69%', tone: 'warning' },
      { label: 'Open responsibility gaps', value: '31%', tone: 'warning' },
    ],
    accessibilitySummary:
      'Progress-bars chart preview of responsibility coverage across owner obligations, design responsibilities, trade responsibilities, and internal owners.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  closeoutWarrantyReadiness: buildPreviewAnalyticsViewModel({
    id: 'pcc-startup-closeout-closeout-warranty-readiness',
    title: 'Closeout & Warranty Readiness',
    eyebrow: 'Closeout and warranty',
    description:
      'Preview of closeout, turnover, and warranty readiness across required closeout lanes.',
    chartKind: 'stacked-bar',
    dataset: [
      { category: 'Closeout', ready: 63, open: 37 },
      { category: 'Turnover', ready: 58, open: 42 },
      { category: 'Warranty', ready: 44, open: 56 },
      { category: 'Lessons learned', ready: 35, open: 65 },
    ],
    summary: [
      { label: 'Closeout ready', value: '63%', tone: 'info' },
      { label: 'Turnover open', value: '42%', tone: 'warning' },
      { label: 'Warranty open', value: '56%', tone: 'danger' },
    ],
    accessibilitySummary:
      'Stacked bar chart preview of closeout, turnover, warranty, and lessons-learned readiness.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
};
