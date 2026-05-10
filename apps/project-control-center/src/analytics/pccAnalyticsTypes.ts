/**
 * Phase 06 Prompt 03 — PCC analytics foundation types.
 *
 * Direct ECharts MVP. Types only — no runtime, no DOM, no rendering. The
 * `PccAnalyticsViewModel` is the single envelope that flows from data
 * sources / fixture builders into `PccAnalyticsCard`. Critical user-
 * visible facts live in `summary` and `accessibilitySummary` so charts
 * are never the only source of information.
 */

import type { ReactNode } from 'react';
import type { PccCardFootprint, PccCardSpanOverrides } from '../layout/footprints';
import type { PccCardRegion, PccCardTier } from '../layout/PccDashboardCard';

export type PccAnalyticsState = 'ready' | 'preview' | 'degraded' | 'empty' | 'source-unavailable';

export type PccAnalyticsChartKind =
  | 'donut'
  | 'stacked-bar'
  | 'grouped-bar'
  | 'line'
  | 'area'
  | 'progress-bars'
  | 'matrix';

export type PccAnalyticsTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface PccAnalyticsSummaryItem {
  readonly label: string;
  readonly value: string;
  readonly tone?: PccAnalyticsTone;
}

export interface PccAnalyticsViewModel {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly state: PccAnalyticsState;
  readonly stateLabel: string;
  readonly sourceLabel: string;
  readonly sampleData: boolean;
  readonly summary: readonly PccAnalyticsSummaryItem[];
  readonly chartKind: PccAnalyticsChartKind;
  readonly dataset: readonly Record<string, unknown>[];
  readonly accessibilitySummary: string;
}

export interface PccAnalyticsCardLayout {
  readonly footprint?: PccCardFootprint;
  readonly tier?: PccCardTier;
  readonly region?: PccCardRegion;
  readonly spanOverrides?: PccCardSpanOverrides;
}

export interface PccAnalyticsCardAction {
  readonly content: ReactNode;
}
