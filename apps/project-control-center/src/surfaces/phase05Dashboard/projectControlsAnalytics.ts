/**
 * Phase 06 Prompt 09 — Project Controls analytics data.
 *
 * Three preview analytics cards consumed by `PccPrimaryDashboardSurface`
 * only when `activePrimaryTabId === 'project-controls'`. Built on the
 * Prompt 03 analytics foundation (`PccAnalyticsCard`,
 * `buildPreviewAnalyticsViewModel`) and Prompt 01's `spanOverrides` seam.
 * Project-controls-only — not a shared dashboard primitive.
 */

import { buildPreviewAnalyticsViewModel, type PccAnalyticsViewModel } from '../../analytics';
import type { PccCardSpanOverrides } from '../../layout/footprints';

// TODO(post-mvp): Replace deterministic Project Controls analytics samples
// with source-backed read-model projections once constraints, permits,
// inspections, risks, issues, decisions, field-operations, and communication
// envelopes are defined. Keep this read-model driven; do not introduce
// workflow execution, source-system mutation, permit/inspection execution,
// risk decision execution, approval execution, or writeback from analytics
// cards.

export type PccProjectControlsAnalyticsCardKey =
  | 'constraintsAging'
  | 'permitInspectionReadiness'
  | 'riskIssueSeverityDistribution';

export const PROJECT_CONTROLS_ANALYTICS_CARD_KEYS: readonly PccProjectControlsAnalyticsCardKey[] = [
  'constraintsAging',
  'permitInspectionReadiness',
  'riskIssueSeverityDistribution',
] as const;

export const PROJECT_CONTROLS_ANALYTICS_CARD_TITLES: Readonly<
  Record<PccProjectControlsAnalyticsCardKey, string>
> = {
  constraintsAging: 'Constraints Aging',
  permitInspectionReadiness: 'Permit / Inspection Readiness',
  riskIssueSeverityDistribution: 'Risk / Issue Severity Distribution',
};

const projectControlsAnalyticsSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});

export const PROJECT_CONTROLS_ANALYTICS_SPAN_OVERRIDES: Readonly<
  Record<PccProjectControlsAnalyticsCardKey, PccCardSpanOverrides>
> = {
  constraintsAging: projectControlsAnalyticsSpan(4, 3),
  permitInspectionReadiness: projectControlsAnalyticsSpan(4, 4),
  riskIssueSeverityDistribution: projectControlsAnalyticsSpan(4, 3),
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic project controls sample';

export const PROJECT_CONTROLS_ANALYTICS_VIEW_MODELS: Readonly<
  Record<PccProjectControlsAnalyticsCardKey, PccAnalyticsViewModel>
> = {
  constraintsAging: buildPreviewAnalyticsViewModel({
    id: 'pcc-project-controls-constraints-aging',
    title: 'Constraints Aging',
    eyebrow: 'Constraint exposure',
    description: 'Preview of open project constraints by aging bucket and resolution posture.',
    chartKind: 'stacked-bar',
    dataset: [
      { category: '0–7 days', open: 4, mitigated: 6 },
      { category: '8–14 days', open: 5, mitigated: 3 },
      { category: '15–30 days', open: 3, mitigated: 2 },
      { category: '31+ days', open: 2, mitigated: 1 },
    ],
    summary: [
      { label: 'Open constraints', value: '14', tone: 'warning' },
      { label: '31+ day constraints', value: '2', tone: 'danger' },
      { label: 'Recently mitigated', value: '12', tone: 'success' },
    ],
    accessibilitySummary:
      'Stacked bar chart preview of open and mitigated project constraints across aging buckets.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  permitInspectionReadiness: buildPreviewAnalyticsViewModel({
    id: 'pcc-project-controls-permit-inspection-readiness',
    title: 'Permit / Inspection Readiness',
    eyebrow: 'Permits and inspections',
    description:
      'Preview of permit and inspection readiness across submitted, approved, scheduled, and open items.',
    chartKind: 'grouped-bar',
    dataset: [
      { category: 'Permits', ready: 7, open: 3 },
      { category: 'Inspections', ready: 11, open: 4 },
      { category: 'Re-inspections', ready: 3, open: 2 },
      { category: 'Closeout holds', ready: 5, open: 1 },
    ],
    summary: [
      { label: 'Permit readiness', value: '7 ready', tone: 'info' },
      { label: 'Open inspection items', value: '4', tone: 'warning' },
      { label: 'Closeout holds open', value: '1', tone: 'danger' },
    ],
    accessibilitySummary:
      'Grouped bar chart preview of permit and inspection readiness across permits, inspections, re-inspections, and closeout holds.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  riskIssueSeverityDistribution: buildPreviewAnalyticsViewModel({
    id: 'pcc-project-controls-risk-issue-severity-distribution',
    title: 'Risk / Issue Severity Distribution',
    eyebrow: 'Risk and issue posture',
    description: 'Preview distribution of project controls risks and issues by severity.',
    chartKind: 'donut',
    dataset: [
      { name: 'Critical', value: 2 },
      { name: 'High', value: 5 },
      { name: 'Medium', value: 9 },
      { name: 'Low', value: 6 },
    ],
    summary: [
      { label: 'Critical risks / issues', value: '2', tone: 'danger' },
      { label: 'High risks / issues', value: '5', tone: 'warning' },
      { label: 'Total tracked items', value: '22', tone: 'info' },
    ],
    accessibilitySummary:
      'Donut chart preview of project controls risk and issue severity distribution across critical, high, medium, and low severity.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
};
