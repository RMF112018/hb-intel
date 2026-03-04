/**
 * HbcChart — Lazy-loaded ECharts wrapper
 * Blueprint §1d — React.lazy + Suspense around EChartsRenderer
 * ECharts (~800KB) only loaded when a chart first renders.
 */
import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { keyframes, TRANSITION_NORMAL } from '../theme/animations.js';
import type { HbcChartProps } from './types.js';

const LazyEChartsRenderer = React.lazy(() => import('./EChartsRenderer.js'));

const useStyles = makeStyles({
  fallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    color: 'var(--colorNeutralForeground3)',
    animationName: keyframes.pulse,
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
});

export const HbcChart: React.FC<HbcChartProps> = ({
  option,
  height = '400px',
  width = '100%',
  isLoading = false,
  loadingFallback,
  className,
  onChartReady,
}) => {
  const styles = useStyles();

  const defaultFallback = (
    <div className={styles.fallback} style={{ height, width }}>
      Loading chart...
    </div>
  );

  return (
    <div data-hbc-ui="chart" className={className}>
      <React.Suspense fallback={loadingFallback ?? defaultFallback}>
        <LazyEChartsRenderer
          option={option}
          height={height}
          width={width}
          isLoading={isLoading}
          onChartReady={onChartReady}
        />
      </React.Suspense>
    </div>
  );
};

export type { HbcChartProps } from './types.js';

// PH4.7 typed chart wrappers
export { HbcBarChart } from './HbcBarChart.js';
export { HbcDonutChart } from './HbcDonutChart.js';
export { HbcLineChart } from './HbcLineChart.js';
export type {
  HbcBarChartProps,
  BarDataItem,
  HbcDonutChartProps,
  DonutDataItem,
  HbcLineChartProps,
  LineSeriesItem,
} from './chart-types.js';
