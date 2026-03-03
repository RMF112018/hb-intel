/** HbcChart — Blueprint §1d lazy-loaded ECharts wrapper */
import type { EChartsOption } from 'echarts';

export interface HbcChartProps {
  /** ECharts option configuration */
  option: EChartsOption;
  /** Chart height (default '400px') */
  height?: string;
  /** Chart width (default '100%') */
  width?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Fallback element shown while chart loads */
  loadingFallback?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Callback when chart instance is ready */
  onChartReady?: (instance: unknown) => void;
}
