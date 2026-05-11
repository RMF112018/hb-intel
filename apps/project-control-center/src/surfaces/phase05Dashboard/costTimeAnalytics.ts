/**
 * Phase 06 Prompt 10 — Cost & Time analytics data.
 *
 * Three preview analytics cards consumed by `PccPrimaryDashboardSurface`
 * only when `activePrimaryTabId === 'cost-time'`. Built on the Prompt 03
 * analytics foundation (`PccAnalyticsCard`,
 * `buildPreviewAnalyticsViewModel`) and Prompt 01's `spanOverrides` seam.
 * Cost-&-time-only — not a shared dashboard primitive.
 */

import { buildPreviewAnalyticsViewModel, type PccAnalyticsViewModel } from '../../analytics';
import type { PccCardSpanOverrides } from '../../layout/footprints';

// TODO(post-mvp): Replace deterministic Cost & Time analytics samples with
// source-backed read-model projections once financial reporting, schedule,
// procurement, buyout, commitment, and cost-exposure envelopes are defined.
// Sage remains the accounting book of record. Keep this read-model driven;
// do not introduce Sage mutation, schedule mutation, procurement/buyout
// execution, commitment/cost workflow execution, approval execution, or
// writeback from analytics cards.

export type PccCostTimeAnalyticsCardKey =
  | 'scheduleMilestonePosture'
  | 'procurementBuyoutExposure'
  | 'commitmentCostExposurePreview';

export const COST_TIME_ANALYTICS_CARD_KEYS: readonly PccCostTimeAnalyticsCardKey[] = [
  'scheduleMilestonePosture',
  'procurementBuyoutExposure',
  'commitmentCostExposurePreview',
] as const;

export const COST_TIME_ANALYTICS_CARD_TITLES: Readonly<
  Record<PccCostTimeAnalyticsCardKey, string>
> = {
  scheduleMilestonePosture: 'Schedule Milestone Posture',
  procurementBuyoutExposure: 'Procurement / Buyout Exposure',
  commitmentCostExposurePreview: 'Commitment / Cost Exposure Preview',
};

const costTimeAnalyticsSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});

export const COST_TIME_ANALYTICS_SPAN_OVERRIDES: Readonly<
  Record<PccCostTimeAnalyticsCardKey, PccCardSpanOverrides>
> = {
  scheduleMilestonePosture: costTimeAnalyticsSpan(4, 3),
  procurementBuyoutExposure: costTimeAnalyticsSpan(4, 4),
  commitmentCostExposurePreview: costTimeAnalyticsSpan(4, 3),
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic cost and time sample';

export const COST_TIME_ANALYTICS_VIEW_MODELS: Readonly<
  Record<PccCostTimeAnalyticsCardKey, PccAnalyticsViewModel>
> = {
  scheduleMilestonePosture: buildPreviewAnalyticsViewModel({
    id: 'pcc-cost-time-schedule-milestone-posture',
    title: 'Schedule Milestone Posture',
    eyebrow: 'Schedule posture',
    description:
      'Preview of milestone posture across baseline, current forecast, and exposure trend.',
    chartKind: 'line',
    dataset: [
      { category: 'Baseline', forecast: 0, exposure: 0 },
      { category: 'Update 1', forecast: 2, exposure: 1 },
      { category: 'Update 2', forecast: 4, exposure: 3 },
      { category: 'Update 3', forecast: 3, exposure: 2 },
    ],
    summary: [
      { label: 'Forecast variance', value: '+3 days', tone: 'warning' },
      { label: 'Milestones on track', value: '8', tone: 'success' },
      { label: 'Watch milestones', value: '2', tone: 'warning' },
    ],
    accessibilitySummary:
      'Line chart preview of schedule milestone posture across baseline and three update periods.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  procurementBuyoutExposure: buildPreviewAnalyticsViewModel({
    id: 'pcc-cost-time-procurement-buyout-exposure',
    title: 'Procurement / Buyout Exposure',
    eyebrow: 'Procurement and buyout',
    description:
      'Preview of procurement and buyout exposure across bid, award, submittal, and release lanes.',
    chartKind: 'grouped-bar',
    dataset: [
      { category: 'Bid leveling', complete: 74, exposure: 26 },
      { category: 'Award', complete: 61, exposure: 39 },
      { category: 'Submittals', complete: 68, exposure: 32 },
      { category: 'Release', complete: 57, exposure: 43 },
    ],
    summary: [
      { label: 'Buyout complete', value: '61%', tone: 'warning' },
      { label: 'Submittal exposure', value: '32%', tone: 'warning' },
      { label: 'Release exposure', value: '43%', tone: 'danger' },
    ],
    accessibilitySummary:
      'Grouped bar chart preview of procurement and buyout exposure across bid leveling, award, submittal, and release lanes.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  commitmentCostExposurePreview: buildPreviewAnalyticsViewModel({
    id: 'pcc-cost-time-commitment-cost-exposure-preview',
    title: 'Commitment / Cost Exposure Preview',
    eyebrow: 'Commitment and cost exposure',
    description: 'Preview of committed, pending, and exposed cost posture by cost-control lane.',
    chartKind: 'stacked-bar',
    dataset: [
      { category: 'Commitments', committed: 78, pending: 12, exposure: 10 },
      { category: 'Allowances', committed: 64, pending: 18, exposure: 18 },
      { category: 'Contingency', committed: 52, pending: 16, exposure: 32 },
      { category: 'Changes', committed: 43, pending: 28, exposure: 29 },
    ],
    summary: [
      { label: 'Committed posture', value: '78%', tone: 'info' },
      { label: 'Contingency exposure', value: '32%', tone: 'warning' },
      { label: 'Change exposure', value: '29%', tone: 'warning' },
    ],
    accessibilitySummary:
      'Stacked bar chart preview of committed, pending, and exposed cost posture across commitments, allowances, contingency, and changes.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
};
