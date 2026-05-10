/**
 * Phase 06 Prompt 03 — pure analytics view-model builders.
 *
 * Future prompts will project domain data into `PccAnalyticsViewModel`
 * via these helpers. Builders are stateless, deterministic, and avoid
 * locale/time/random inputs.
 */

import type {
  PccAnalyticsChartKind,
  PccAnalyticsState,
  PccAnalyticsSummaryItem,
  PccAnalyticsViewModel,
} from './pccAnalyticsTypes';

const DEFAULT_SOURCE_LABEL_AVAILABLE = 'Source: PCC read-model available';
const DEFAULT_SOURCE_LABEL_DEGRADED = 'Source: PCC read-model partial — backend unavailable';

export interface BuildAnalyticsViewModelArgs {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly chartKind: PccAnalyticsChartKind;
  readonly dataset: readonly Record<string, unknown>[];
  readonly summary: readonly PccAnalyticsSummaryItem[];
  readonly accessibilitySummary: string;
  readonly sourceLabel?: string;
}

export function buildReadyAnalyticsViewModel(
  args: BuildAnalyticsViewModelArgs,
): PccAnalyticsViewModel {
  return projectViewModel(args, {
    state: 'ready',
    stateLabel: 'Ready',
    sampleData: false,
    sourceLabel: args.sourceLabel ?? DEFAULT_SOURCE_LABEL_AVAILABLE,
  });
}

export function buildPreviewAnalyticsViewModel(
  args: BuildAnalyticsViewModelArgs,
): PccAnalyticsViewModel {
  return projectViewModel(args, {
    state: 'preview',
    stateLabel: 'Preview',
    sampleData: true,
    sourceLabel: args.sourceLabel ?? DEFAULT_SOURCE_LABEL_AVAILABLE,
  });
}

export function buildDegradedAnalyticsViewModel(
  args: BuildAnalyticsViewModelArgs,
): PccAnalyticsViewModel {
  return projectViewModel(args, {
    state: 'degraded',
    stateLabel: 'Source partially unavailable',
    sampleData: true,
    sourceLabel: args.sourceLabel ?? DEFAULT_SOURCE_LABEL_DEGRADED,
  });
}

interface ProjectionDefaults {
  readonly state: PccAnalyticsState;
  readonly stateLabel: string;
  readonly sampleData: boolean;
  readonly sourceLabel: string;
}

function projectViewModel(
  args: BuildAnalyticsViewModelArgs,
  defaults: ProjectionDefaults,
): PccAnalyticsViewModel {
  return {
    id: args.id,
    title: args.title,
    eyebrow: args.eyebrow,
    description: args.description,
    state: defaults.state,
    stateLabel: defaults.stateLabel,
    sourceLabel: defaults.sourceLabel,
    sampleData: defaults.sampleData,
    summary: args.summary,
    chartKind: args.chartKind,
    dataset: args.dataset,
    accessibilitySummary: args.accessibilitySummary,
  };
}
