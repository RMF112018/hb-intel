/**
 * HbcDonutChart — Typed donut/pie chart wrapper around HbcChart
 * PH4.7 §7.4 | Blueprint §1d
 *
 * Builds ECharts pie series with configurable inner radius.
 * Uses HBC brand palette via 'hb-intel' theme.
 */
import * as React from 'react';
import { HbcChart } from './index.js';
import type { HbcDonutChartProps } from './chart-types.js';

export const HbcDonutChart: React.FC<HbcDonutChartProps> = ({
  data,
  title,
  innerRadius = '50%',
  height = '400px',
  onSliceClick,
  className,
}) => {
  const seriesData = data.map((d) => ({
    name: d.name,
    value: d.value,
    ...(d.color ? { itemStyle: { color: d.color } } : {}),
  }));

  const option: Record<string, unknown> = {
    ...(title ? { title: { text: title } } : {}),
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: '0' },
    series: [
      {
        type: 'pie',
        radius: [innerRadius, '80%'],
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ],
  };

  const handleChartReady = React.useCallback(
    (instance: unknown) => {
      if (!onSliceClick) return;
      const chart = instance as { on: (event: string, cb: (params: { dataIndex: number }) => void) => void };
      chart.on('click', (params) => {
        const item = data[params.dataIndex];
        if (item) onSliceClick(item);
      });
    },
    [data, onSliceClick],
  );

  return (
    <div data-hbc-ui="donut-chart" className={className}>
      <HbcChart
        option={option as never}
        height={height}
        onChartReady={onSliceClick ? handleChartReady : undefined}
      />
    </div>
  );
};
