/**
 * HbcLineChart — Typed line chart wrapper around HbcChart
 * PH4.7 §7.4 | Blueprint §1d
 *
 * Builds ECharts line series with optional area fill.
 * Uses HBC brand palette via 'hb-intel' theme.
 */
import * as React from 'react';
import { HbcChart } from './index.js';
import type { HbcLineChartProps } from './chart-types.js';

export const HbcLineChart: React.FC<HbcLineChartProps> = ({
  series,
  xAxisLabels,
  title,
  areaFill = false,
  height = '400px',
  onPointClick,
  className,
}) => {
  const echartsSeries = series.map((s) => ({
    type: 'line' as const,
    name: s.name,
    data: s.data,
    smooth: true,
    ...(areaFill
      ? { areaStyle: { opacity: 0.15 } }
      : {}),
  }));

  const option: Record<string, unknown> = {
    ...(title ? { title: { text: title } } : {}),
    tooltip: { trigger: 'axis' },
    legend: {
      data: series.map((s) => s.name),
    },
    xAxis: {
      type: 'category',
      data: xAxisLabels,
    },
    yAxis: {
      type: 'value',
    },
    series: echartsSeries,
  };

  const handleChartReady = React.useCallback(
    (instance: unknown) => {
      if (!onPointClick) return;
      const chart = instance as { on: (event: string, cb: (params: { seriesName: string; dataIndex: number }) => void) => void };
      chart.on('click', (params) => {
        onPointClick(params.seriesName, params.dataIndex);
      });
    },
    [onPointClick],
  );

  return (
    <div data-hbc-ui="line-chart" className={className}>
      <HbcChart
        option={option as never}
        height={height}
        onChartReady={onPointClick ? handleChartReady : undefined}
      />
    </div>
  );
};
