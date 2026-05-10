/**
 * Phase 06 Prompt 03 — direct ECharts module registration.
 *
 * PCC owns its own direct echarts wrapper (no `echarts-for-react`,
 * no use of `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`). This
 * module performs idempotent modular registration of just the chart
 * types, components, and renderer the analytics foundation needs, plus
 * the `pcc-analytics` theme.
 */

import * as echarts from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { BarChart, LineChart, PieChart } from 'echarts/charts';

/**
 * The runtime instance returned by `echarts.init` from the modular
 * `echarts/core` entrypoint. Distinct from `EChartsType` in `'echarts'`
 * (different private members), so derive it from `init`'s return type.
 */
export type PccEchartsInstance = ReturnType<typeof echarts.init>;
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { PCC_ANALYTICS_ECHARTS_THEME_NAME, PCC_ANALYTICS_THEME } from './pccAnalyticsTheme';

// TODO(post-mvp): Re-evaluate echarts-for-react after MVP if it materially
// improves chart lifecycle handling, animation quality, responsiveness,
// accessibility integration, or maintainability versus the PCC-owned direct
// echarts wrapper.

let registered = false;

export function ensurePccAnalyticsRegistered(): void {
  if (registered) return;
  echarts.use([
    BarChart,
    LineChart,
    PieChart,
    DatasetComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    SVGRenderer,
  ]);
  echarts.registerTheme(PCC_ANALYTICS_ECHARTS_THEME_NAME, PCC_ANALYTICS_THEME);
  registered = true;
}

export { echarts };
export type { EChartsOption };
