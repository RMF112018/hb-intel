/**
 * Phase 06 Prompt 04 — Project Home analytics data.
 *
 * Three preview analytics cards consumed by `PccProjectHome` and
 * `PccProjectHomeReadModelContent`. Builds on the Prompt 03 analytics
 * foundation (`PccAnalyticsCard`, `buildPreviewAnalyticsViewModel`)
 * and Prompt 01's `spanOverrides` seam. Project-Home-scoped only —
 * not a layout primitive.
 */

import { buildPreviewAnalyticsViewModel, type PccAnalyticsViewModel } from '../../analytics';
import type { PccCardSpanOverrides } from '../../layout/footprints';

// TODO(post-mvp): Replace deterministic Project Home analytics samples with
// source-backed read-model projections once Project Home analytics envelopes
// are defined. Keep this read-model driven; do not introduce workflow
// execution, source-system mutation, or writeback from analytics cards.

export type PccProjectHomeAnalyticsCardKey =
  | 'actionExposureMix'
  | 'projectHealthTrend'
  | 'readinessApprovalRollup';

export const PROJECT_HOME_ANALYTICS_CARD_KEYS: readonly PccProjectHomeAnalyticsCardKey[] = [
  'actionExposureMix',
  'projectHealthTrend',
  'readinessApprovalRollup',
] as const;

export const PROJECT_HOME_ANALYTICS_CARD_TITLES: Readonly<
  Record<PccProjectHomeAnalyticsCardKey, string>
> = {
  actionExposureMix: 'Action Exposure Mix',
  projectHealthTrend: 'Project Health Trend',
  readinessApprovalRollup: 'Readiness / Approval Rollup',
};

const projectHomeAnalyticsSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});

export const PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES: Readonly<
  Record<PccProjectHomeAnalyticsCardKey, PccCardSpanOverrides>
> = {
  actionExposureMix: projectHomeAnalyticsSpan(4, 3),
  projectHealthTrend: projectHomeAnalyticsSpan(4, 3),
  readinessApprovalRollup: projectHomeAnalyticsSpan(4, 4),
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic project sample';

export const PROJECT_HOME_ANALYTICS_VIEW_MODELS: Readonly<
  Record<PccProjectHomeAnalyticsCardKey, PccAnalyticsViewModel>
> = {
  actionExposureMix: buildPreviewAnalyticsViewModel({
    id: 'pcc-project-home-action-exposure-mix',
    title: 'Action Exposure Mix',
    eyebrow: 'Action exposure',
    description: 'Preview distribution of active project exposure across action categories.',
    chartKind: 'donut',
    dataset: [
      { name: 'Blocking', value: 4 },
      { name: 'Coordination', value: 7 },
      { name: 'Readiness', value: 5 },
      { name: 'Documentation', value: 3 },
    ],
    summary: [
      { label: 'Blocking items', value: '4', tone: 'danger' },
      { label: 'Coordination items', value: '7', tone: 'warning' },
      { label: 'Readiness items', value: '5', tone: 'info' },
    ],
    accessibilitySummary:
      'Donut chart of active project exposure across Blocking, Coordination, Readiness, and Documentation categories.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  projectHealthTrend: buildPreviewAnalyticsViewModel({
    id: 'pcc-project-home-project-health-trend',
    title: 'Project Health Trend',
    eyebrow: 'Health trend',
    description: 'Preview trend of project health signals across the next four review periods.',
    chartKind: 'area',
    dataset: [
      { category: 'W1', health: 82, exposure: 18 },
      { category: 'W2', health: 84, exposure: 16 },
      { category: 'W3', health: 81, exposure: 19 },
      { category: 'W4', health: 86, exposure: 14 },
    ],
    summary: [
      { label: 'Current health', value: '86%', tone: 'success' },
      { label: 'Exposure trend', value: 'Improving', tone: 'success' },
      { label: 'Watch items', value: '3', tone: 'warning' },
    ],
    accessibilitySummary:
      'Area chart of project health signals across four upcoming review periods.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  readinessApprovalRollup: buildPreviewAnalyticsViewModel({
    id: 'pcc-project-home-readiness-approval-rollup',
    title: 'Readiness / Approval Rollup',
    eyebrow: 'Readiness controls',
    description: 'Preview rollup of startup readiness, approval aging, and configuration gaps.',
    chartKind: 'grouped-bar',
    dataset: [
      { category: 'Readiness', complete: 74, open: 26 },
      { category: 'Approvals', complete: 68, open: 32 },
      { category: 'Configurations', complete: 81, open: 19 },
    ],
    summary: [
      { label: 'Readiness complete', value: '74%', tone: 'info' },
      { label: 'Approval open load', value: '32%', tone: 'warning' },
      { label: 'Config complete', value: '81%', tone: 'success' },
    ],
    accessibilitySummary:
      'Grouped bar chart of complete versus open work across Readiness, Approvals, and Configurations.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
};
