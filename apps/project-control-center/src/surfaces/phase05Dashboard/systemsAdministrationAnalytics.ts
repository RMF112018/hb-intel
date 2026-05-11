/**
 * Phase 06 Prompt 11 — Systems Administration analytics data.
 *
 * Three preview analytics cards consumed by `PccPrimaryDashboardSurface`
 * only when `activePrimaryTabId === 'systems-administration'`. Built on
 * the Prompt 03 analytics foundation (`PccAnalyticsCard`,
 * `buildPreviewAnalyticsViewModel`) and Prompt 01's `spanOverrides` seam.
 * Systems-administration-only — not a shared dashboard primitive.
 */

import { buildPreviewAnalyticsViewModel, type PccAnalyticsViewModel } from '../../analytics';
import type { PccCardSpanOverrides } from '../../layout/footprints';

// TODO(post-mvp): Replace deterministic Systems Administration analytics
// samples with source-backed read-model projections once site-health,
// settings, integration, Procore mapping, sync-health, and module-
// configuration envelopes are defined. Keep this read-model driven; do not
// introduce tenant repair, configuration mutation, sync execution, Procore
// writeback, source-system mutation, approval execution, or workflow
// execution from analytics cards.

export type PccSystemsAdministrationAnalyticsCardKey =
  | 'integrationHealthSummary'
  | 'configurationSeverity'
  | 'procoreMappingSyncPosture';

export const SYSTEMS_ADMINISTRATION_ANALYTICS_CARD_KEYS: readonly PccSystemsAdministrationAnalyticsCardKey[] =
  ['integrationHealthSummary', 'configurationSeverity', 'procoreMappingSyncPosture'] as const;

export const SYSTEMS_ADMINISTRATION_ANALYTICS_CARD_TITLES: Readonly<
  Record<PccSystemsAdministrationAnalyticsCardKey, string>
> = {
  integrationHealthSummary: 'Integration Health Summary',
  configurationSeverity: 'Configuration Severity',
  procoreMappingSyncPosture: 'Procore Mapping / Sync Posture',
};

const systemsAdministrationAnalyticsSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});

export const SYSTEMS_ADMINISTRATION_ANALYTICS_SPAN_OVERRIDES: Readonly<
  Record<PccSystemsAdministrationAnalyticsCardKey, PccCardSpanOverrides>
> = {
  integrationHealthSummary: systemsAdministrationAnalyticsSpan(4, 3),
  configurationSeverity: systemsAdministrationAnalyticsSpan(4, 4),
  procoreMappingSyncPosture: systemsAdministrationAnalyticsSpan(4, 3),
};

const SAMPLE_SOURCE_LABEL = 'Source: deterministic systems administration sample';

export const SYSTEMS_ADMINISTRATION_ANALYTICS_VIEW_MODELS: Readonly<
  Record<PccSystemsAdministrationAnalyticsCardKey, PccAnalyticsViewModel>
> = {
  integrationHealthSummary: buildPreviewAnalyticsViewModel({
    id: 'pcc-systems-administration-integration-health-summary',
    title: 'Integration Health Summary',
    eyebrow: 'Integration health',
    description:
      'Preview of integration health across connected, attention, unavailable, and deferred integration lanes.',
    chartKind: 'donut',
    dataset: [
      { name: 'Healthy', value: 6 },
      { name: 'Needs attention', value: 3 },
      { name: 'Unavailable', value: 1 },
      { name: 'Deferred', value: 2 },
    ],
    summary: [
      { label: 'Healthy integrations', value: '6', tone: 'success' },
      { label: 'Needs attention', value: '3', tone: 'warning' },
      { label: 'Unavailable integrations', value: '1', tone: 'danger' },
    ],
    accessibilitySummary:
      'Donut chart preview of integration health across healthy, attention-needed, unavailable, and deferred integration lanes.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  configurationSeverity: buildPreviewAnalyticsViewModel({
    id: 'pcc-systems-administration-configuration-severity',
    title: 'Configuration Severity',
    eyebrow: 'Configuration controls',
    description:
      'Preview of configuration findings by severity across site, project, module, and integration scopes.',
    chartKind: 'stacked-bar',
    dataset: [
      { category: 'Site settings', critical: 0, warning: 2, informational: 5 },
      { category: 'Project settings', critical: 1, warning: 3, informational: 4 },
      { category: 'Module settings', critical: 1, warning: 4, informational: 6 },
      { category: 'Integration settings', critical: 2, warning: 3, informational: 2 },
    ],
    summary: [
      { label: 'Critical findings', value: '4', tone: 'danger' },
      { label: 'Warning findings', value: '12', tone: 'warning' },
      { label: 'Informational findings', value: '17', tone: 'info' },
    ],
    accessibilitySummary:
      'Stacked bar chart preview of configuration findings by severity across site, project, module, and integration settings.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
  procoreMappingSyncPosture: buildPreviewAnalyticsViewModel({
    id: 'pcc-systems-administration-procore-mapping-sync-posture',
    title: 'Procore Mapping / Sync Posture',
    eyebrow: 'Procore mapping',
    description:
      'Preview of Procore mapping and sync-health posture across mapping, validation, sync, and exception lanes.',
    chartKind: 'grouped-bar',
    dataset: [
      { category: 'Project mapping', healthy: 8, attention: 2 },
      { category: 'Company mapping', healthy: 11, attention: 3 },
      { category: 'Sync validation', healthy: 7, attention: 4 },
      { category: 'Exception review', healthy: 5, attention: 5 },
    ],
    summary: [
      { label: 'Mapped records healthy', value: '31', tone: 'success' },
      { label: 'Records needing attention', value: '14', tone: 'warning' },
      { label: 'Exception review lanes', value: '5', tone: 'warning' },
    ],
    accessibilitySummary:
      'Grouped bar chart preview of Procore mapping and sync-health posture across project mapping, company mapping, sync validation, and exception review.',
    sourceLabel: SAMPLE_SOURCE_LABEL,
  }),
};
