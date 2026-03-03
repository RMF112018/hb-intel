/**
 * EChartsRenderer — Separate file for React.lazy dynamic import
 * Blueprint §1d — ECharts (~800KB) only loaded when a chart first renders.
 * HB Intel color palette registered as custom ECharts theme.
 */
import * as React from 'react';
import ReactEChartsCore from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import {
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
} from '../theme/tokens.js';
import type { HbcChartProps } from './types.js';

// Register ECharts modules
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

// Register HB Intel ECharts theme
const HBC_CHART_COLORS = [
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  '#0E7A0D',
  '#0078D4',
  '#D13438',
  '#8764B8',
  '#00B7C3',
  '#107C10',
  '#CA5010',
  '#5C2D91',
];

echarts.registerTheme('hb-intel', {
  color: HBC_CHART_COLORS,
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  title: {
    textStyle: {
      color: '#323130',
      fontWeight: 600,
    },
  },
  legend: {
    textStyle: {
      color: '#605E5C',
    },
  },
});

export interface EChartsRendererProps {
  option: HbcChartProps['option'];
  height: string;
  width: string;
  isLoading: boolean;
  className?: string;
  onChartReady?: (instance: unknown) => void;
}

export const EChartsRenderer: React.FC<EChartsRendererProps> = ({
  option,
  height,
  width,
  isLoading,
  className,
  onChartReady,
}) => {
  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      theme="hb-intel"
      style={{ height, width }}
      className={className}
      showLoading={isLoading}
      onChartReady={onChartReady}
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default EChartsRenderer;
