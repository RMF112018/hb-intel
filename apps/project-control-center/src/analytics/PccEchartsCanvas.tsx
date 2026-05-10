/**
 * Phase 06 Prompt 03 — direct ECharts canvas wrapper.
 *
 * PCC-owned. Uses `echarts/core` modular imports + `SVGRenderer`. The
 * `forceAnimationDisabled` prop is a one-way override — it can turn
 * animation off, never on; an upstream `option.animation === false` is
 * preserved (per stored convention so reduced-motion / fixture-path
 * opt-outs from the option builder are not flipped back on).
 *
 * Critical user-visible information must be available outside this
 * canvas — `PccAnalyticsCard` renders state, source, summary list, and
 * description as siblings to the chart so the chart is never the only
 * source of information.
 */

import { useEffect, useRef, type FC } from 'react';
import {
  echarts,
  ensurePccAnalyticsRegistered,
  type EChartsOption,
  type PccEchartsInstance,
} from './pccAnalyticsEcharts';
import { PCC_ANALYTICS_ECHARTS_THEME_NAME } from './pccAnalyticsTheme';
import type { PccAnalyticsState } from './pccAnalyticsTypes';
import styles from './PccEchartsCanvas.module.css';

export interface PccEchartsCanvasProps {
  readonly chartId: string;
  readonly state: PccAnalyticsState;
  readonly sampleData: boolean;
  readonly option: EChartsOption;
  readonly accessibilitySummary: string;
  readonly forceAnimationDisabled?: boolean;
  readonly className?: string;
}

export const PccEchartsCanvas: FC<PccEchartsCanvasProps> = ({
  chartId,
  state,
  sampleData,
  option,
  accessibilitySummary,
  forceAnimationDisabled,
  className,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<PccEchartsInstance | null>(null);

  // One-way override: only forces animation off; preserves an upstream
  // `option.animation === false` when forceAnimationDisabled is unset.
  const animationDisabled = Boolean(forceAnimationDisabled);
  const resolvedAnimation = animationDisabled ? false : option.animation;

  useEffect(() => {
    if (!hostRef.current) return;
    ensurePccAnalyticsRegistered();
    const instance = echarts.init(hostRef.current, PCC_ANALYTICS_ECHARTS_THEME_NAME, {
      renderer: 'svg',
    });
    chartRef.current = instance;

    const resize = () => instance.resize();
    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(hostRef.current);
    } else {
      window.addEventListener('resize', resize);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      instance.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption({ ...option, animation: resolvedAnimation }, true);
  }, [option, resolvedAnimation]);

  const containerClassName = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div
      role="img"
      aria-label={accessibilitySummary}
      data-pcc-analytics-chart={chartId}
      data-pcc-analytics-state={state}
      data-pcc-analytics-sample-data={sampleData ? 'true' : 'false'}
      data-pcc-analytics-animation={resolvedAnimation === false ? 'disabled' : 'enabled'}
      className={containerClassName}
    >
      <div ref={hostRef} className={styles.chartHost} />
    </div>
  );
};

export default PccEchartsCanvas;
