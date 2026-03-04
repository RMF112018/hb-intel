/**
 * Chart-specific type interfaces for typed wrappers
 * PH4.7 §7.4 | Blueprint §1d
 */

export interface BarDataItem {
  category: string;
  value: number;
  color?: string;
}

export interface HbcBarChartProps {
  /** Bar chart data */
  data: BarDataItem[];
  /** Bar orientation (default 'vertical') */
  orientation?: 'vertical' | 'horizontal';
  /** Chart title */
  title?: string;
  /** Chart height (default '400px') */
  height?: string;
  /** Click handler for click-to-filter */
  onBarClick?: (item: BarDataItem) => void;
  /** Additional CSS class */
  className?: string;
}

export interface DonutDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface HbcDonutChartProps {
  /** Donut chart data */
  data: DonutDataItem[];
  /** Chart title */
  title?: string;
  /** Inner radius (default '50%') */
  innerRadius?: string;
  /** Chart height (default '400px') */
  height?: string;
  /** Click handler for click-to-filter */
  onSliceClick?: (item: DonutDataItem) => void;
  /** Additional CSS class */
  className?: string;
}

export interface LineSeriesItem {
  name: string;
  data: number[];
}

export interface HbcLineChartProps {
  /** Line series data */
  series: LineSeriesItem[];
  /** X-axis category labels */
  xAxisLabels: string[];
  /** Chart title */
  title?: string;
  /** Enable area fill under lines */
  areaFill?: boolean;
  /** Chart height (default '400px') */
  height?: string;
  /** Click handler for data point */
  onPointClick?: (seriesName: string, dataIndex: number) => void;
  /** Additional CSS class */
  className?: string;
}
