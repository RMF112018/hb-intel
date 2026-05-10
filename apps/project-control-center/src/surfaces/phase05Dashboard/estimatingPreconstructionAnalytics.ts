/**
 * Phase 06 Prompt 07 — Estimating & Preconstruction analytics data.
 *
 * Two preview analytics cards consumed by `PccPrimaryDashboardSurface`
 * only when `activePrimaryTabId === 'estimating-preconstruction'`. Built
 * on the Prompt 03 analytics foundation (`PccAnalyticsCard`,
 * `buildPreviewAnalyticsViewModel`) and Prompt 01's `spanOverrides` seam.
 * Estimating-only — not a shared dashboard primitive.
 */

import { buildPreviewAnalyticsViewModel, type PccAnalyticsViewModel } from '../../analytics';
import type { PccCardSpanOverrides } from '../../layout/footprints';

// TODO(post-mvp): Replace deterministic Estimating & Preconstruction
// analytics samples with source-backed read-model projections once
// preconstruction handoff and estimate-exposure envelopes are defined.
// Keep this read-model driven; do not introduce estimating-system mutation,
// source-system writeback, or workflow execution from analytics cards.

export type PccEstimatingPreconstructionAnalyticsCardKey =
  | 'handoffContinuityPreview'
  | 'estimateExposurePreview';

export const ESTIMATING_PRECONSTRUCTION_ANALYTICS_CARD_KEYS: readonly PccEstimatingPreconstructionAnalyticsCardKey[] =
  ['handoffContinuityPreview', 'estimateExposurePreview'] as const;

export const ESTIMATING_PRECONSTRUCTION_ANALYTICS_CARD_TITLES: Readonly<
  Record<PccEstimatingPreconstructionAnalyticsCardKey, string>
> = {
  handoffContinuityPreview: 'Handoff Continuity Preview',
  estimateExposurePreview: 'Estimate Exposure Preview',
};

const estimatingAnalyticsSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});

export const ESTIMATING_PRECONSTRUCTION_ANALYTICS_SPAN_OVERRIDES: Readonly<
  Record<PccEstimatingPreconstructionAnalyticsCardKey, PccCardSpanOverrides>
> = {
  handoffContinuityPreview: estimatingAnalyticsSpan(6, 5),
  estimateExposurePreview: estimatingAnalyticsSpan(6, 5),
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic preconstruction sample';

export const ESTIMATING_PRECONSTRUCTION_ANALYTICS_VIEW_MODELS: Readonly<
  Record<PccEstimatingPreconstructionAnalyticsCardKey, PccAnalyticsViewModel>
> = {
  handoffContinuityPreview: buildPreviewAnalyticsViewModel({
    id: 'pcc-estimating-handoff-continuity-preview',
    title: 'Handoff Continuity Preview',
    eyebrow: 'Preconstruction handoff',
    description: 'Preview of handoff readiness across scope, budget, schedule, and risk context.',
    chartKind: 'stacked-bar',
    dataset: [
      { category: 'Scope basis', complete: 78, open: 22 },
      { category: 'Budget context', complete: 64, open: 36 },
      { category: 'Schedule assumptions', complete: 72, open: 28 },
      { category: 'Risk notes', complete: 58, open: 42 },
    ],
    summary: [
      { label: 'Scope basis complete', value: '78%', tone: 'info' },
      { label: 'Budget context complete', value: '64%', tone: 'warning' },
      { label: 'Open risk notes', value: '42%', tone: 'warning' },
    ],
    accessibilitySummary:
      'Stacked bar chart preview of preconstruction handoff readiness across scope basis, budget context, schedule assumptions, and risk notes.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  estimateExposurePreview: buildPreviewAnalyticsViewModel({
    id: 'pcc-estimating-estimate-exposure-preview',
    title: 'Estimate Exposure Preview',
    eyebrow: 'Estimate exposure',
    description:
      'Preview of estimating assumptions, alternates, and exclusions requiring handoff attention.',
    chartKind: 'grouped-bar',
    dataset: [
      { category: 'Assumptions', documented: 14, needsReview: 5 },
      { category: 'Alternates', documented: 9, needsReview: 4 },
      { category: 'Exclusions', documented: 11, needsReview: 6 },
    ],
    summary: [
      { label: 'Assumptions needing review', value: '5', tone: 'warning' },
      { label: 'Alternates needing review', value: '4', tone: 'info' },
      { label: 'Exclusions needing review', value: '6', tone: 'danger' },
    ],
    accessibilitySummary:
      'Grouped bar chart preview of documented and review-needed estimating assumptions, alternates, and exclusions.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
};
