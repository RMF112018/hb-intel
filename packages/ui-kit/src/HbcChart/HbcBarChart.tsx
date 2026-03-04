/**
 * HbcBarChart — Typed bar chart wrapper around HbcChart
 * PH4.7 §7.4 | Blueprint §1d
 *
 * Builds ECharts bar series option from simplified props.
 * Uses HBC brand palette via 'hb-intel' theme.
 */
import * as React from 'react';
import { HbcChart } from './index.js';
import type { HbcBarChartProps } from './chart-types.js';

export const HbcBarChart: React.FC<HbcBarChartProps> = ({
  data,
  orientation = 'vertical',
  title,
  height = '400px',
  onBarClick,
  className,
}) => {
  const isHorizontal = orientation === 'horizontal';

  const categories = data.map((d) => d.category);
  const values = data.map((d) => d.value);
  const colors = data.some((d) => d.color)
    ? data.map((d) => d.color).filter(Boolean)
    : undefined;

  const option: Record<string, unknown> = {
    ...(title ? { title: { text: title } } : {}),
    tooltip: { trigger: 'axis' },
    [isHorizontal ? 'yAxis' : 'xAxis']: {
      type: 'category',
      data: categories,
    },
    [isHorizontal ? 'xAxis' : 'yAxis']: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
        data: colors
          ? values.map((v, i) => ({
              value: v,
              itemStyle: colors[i] ? { color: colors[i] } : undefined,
            }))
          : values,
      },
    ],
  };

  const handleChartReady = React.useCallback(
    (instance: unknown) => {
      if (!onBarClick) return;
      const chart = instance as { on: (event: string, cb: (params: { dataIndex: number }) => void) => void };
      chart.on('click', (params) => {
        const item = data[params.dataIndex];
        if (item) onBarClick(item);
      });
    },
    [data, onBarClick],
  );

  return (
    <div data-hbc-ui="bar-chart" className={className}>
      <HbcChart
        option={option as never}
        height={height}
        onChartReady={onBarClick ? handleChartReady : undefined}
      />
    </div>
  );
};
