/**
 * Phase 06 Prompt 03 — `PccAnalyticsViewModel` → `EChartsOption` builder.
 *
 * Pure function. Deterministic. Never mutates the input view model.
 * Returns a safe fallback option (no series) for chart kinds that the
 * MVP doesn't render natively (`progress-bars`, `matrix`, unknown) — the
 * card's summary list and accessibility text remain the authoritative
 * source of information for those kinds.
 *
 * Dataset row conventions:
 *   - `donut`           — `[{ name: string, value: number }]`
 *   - `line` / `area`   — `[{ category: string, [seriesKey]: number }]`
 *                         (every non-`category` key becomes a series)
 *   - `grouped-bar` /
 *     `stacked-bar`     — same as line/area; `stack: 'total'` for stacked
 *   - other / empty     — base option only (no series)
 */

import type { EChartsOption } from './pccAnalyticsEcharts';
import { PCC_ANALYTICS_SERIES_COLORS } from './pccAnalyticsTheme';
import type { PccAnalyticsViewModel } from './pccAnalyticsTypes';

export interface BuildPccAnalyticsOptionArgs {
  readonly viewModel: PccAnalyticsViewModel;
  readonly animationDisabled: boolean;
}

const FONT_FAMILY = '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';

export function buildPccAnalyticsOption(args: BuildPccAnalyticsOptionArgs): EChartsOption {
  const { viewModel, animationDisabled } = args;
  const baseOption: EChartsOption = {
    animation: !animationDisabled,
    textStyle: { fontFamily: FONT_FAMILY },
    color: [...PCC_ANALYTICS_SERIES_COLORS],
  };

  if (viewModel.dataset.length === 0) {
    return baseOption;
  }

  switch (viewModel.chartKind) {
    case 'donut':
      return { ...baseOption, ...buildDonutOption(viewModel) };
    case 'line':
      return { ...baseOption, ...buildLineOrAreaOption(viewModel, false) };
    case 'area':
      return { ...baseOption, ...buildLineOrAreaOption(viewModel, true) };
    case 'grouped-bar':
      return { ...baseOption, ...buildBarOption(viewModel, false) };
    case 'stacked-bar':
      return { ...baseOption, ...buildBarOption(viewModel, true) };
    case 'progress-bars':
    case 'matrix':
    default:
      return baseOption;
  }
}

function buildDonutOption(viewModel: PccAnalyticsViewModel): EChartsOption {
  const data = viewModel.dataset.map((row) => ({
    name: typeof row.name === 'string' ? row.name : String(row.name ?? ''),
    value: typeof row.value === 'number' ? row.value : Number(row.value ?? 0),
  }));
  return {
    legend: { bottom: 0, left: 'center' },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['55%', '78%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#FFFFFF', borderWidth: 2 },
        label: { show: true, position: 'outside' },
        labelLine: { show: true },
        data,
      },
    ],
  };
}

function buildLineOrAreaOption(viewModel: PccAnalyticsViewModel, isArea: boolean): EChartsOption {
  const { categories, seriesKeys, seriesValues } = extractCategoryAndSeries(viewModel.dataset);
  return {
    legend: seriesKeys.length > 1 ? { bottom: 0, left: 'center' } : undefined,
    tooltip: { trigger: 'axis' },
    grid: { left: 24, right: 24, top: 24, bottom: seriesKeys.length > 1 ? 32 : 16 },
    xAxis: { type: 'category', data: [...categories], boundaryGap: false },
    yAxis: { type: 'value' },
    series: seriesKeys.map((key) => ({
      name: key,
      type: 'line',
      smooth: true,
      data: seriesValues[key] ?? [],
      areaStyle: isArea ? {} : undefined,
    })),
  };
}

function buildBarOption(viewModel: PccAnalyticsViewModel, stacked: boolean): EChartsOption {
  const { categories, seriesKeys, seriesValues } = extractCategoryAndSeries(viewModel.dataset);
  return {
    legend: seriesKeys.length > 1 ? { bottom: 0, left: 'center' } : undefined,
    tooltip: { trigger: 'axis' },
    grid: { left: 24, right: 24, top: 24, bottom: seriesKeys.length > 1 ? 32 : 16 },
    xAxis: { type: 'category', data: [...categories] },
    yAxis: { type: 'value' },
    series: seriesKeys.map((key) => ({
      name: key,
      type: 'bar',
      stack: stacked ? 'total' : undefined,
      data: seriesValues[key] ?? [],
    })),
  };
}

interface CategoryAndSeriesProjection {
  readonly categories: readonly string[];
  readonly seriesKeys: readonly string[];
  readonly seriesValues: Readonly<Record<string, number[]>>;
}

function extractCategoryAndSeries(
  dataset: readonly Record<string, unknown>[],
): CategoryAndSeriesProjection {
  const seriesKeySet = new Set<string>();
  for (const row of dataset) {
    for (const key of Object.keys(row)) {
      if (key !== 'category') seriesKeySet.add(key);
    }
  }
  const seriesKeys = Array.from(seriesKeySet);
  const categories = dataset.map((row) =>
    typeof row.category === 'string' ? row.category : String(row.category ?? ''),
  );
  const seriesValues: Record<string, number[]> = {};
  for (const key of seriesKeys) {
    seriesValues[key] = dataset.map((row) => {
      const raw = row[key];
      return typeof raw === 'number' ? raw : Number(raw ?? 0);
    });
  }
  return { categories, seriesKeys, seriesValues };
}
