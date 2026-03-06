/**
 * DemoCharts — HbcChart with mock schedule metrics.
 * Foundation Plan Phase 3.
 */
/* eslint-disable @hbc/hbc/enforce-hbc-tokens -- TODO: use HBC tokens (Phase 4b.11) */
import { HbcChart } from '@hbc/ui-kit';

const scheduleOption = {
  title: { text: 'Schedule Progress', left: 'center' as const },
  tooltip: { trigger: 'axis' as const },
  legend: { bottom: 0 },
  xAxis: {
    type: 'category' as const,
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
  yAxis: { type: 'value' as const, name: '% Complete' },
  series: [
    {
      name: 'Planned',
      type: 'line' as const,
      data: [10, 25, 40, 55, 70, 85],
      smooth: true,
      color: '#004B87',
    },
    {
      name: 'Actual',
      type: 'line' as const,
      data: [8, 22, 38, 50, 63, 75],
      smooth: true,
      color: '#E97A2B',
    },
  ],
};

const budgetOption = {
  title: { text: 'Budget by Category', left: 'center' as const },
  tooltip: { trigger: 'item' as const },
  series: [
    {
      type: 'pie' as const,
      radius: ['40%', '70%'],
      data: [
        { value: 3200000, name: 'Labor' },
        { value: 2800000, name: 'Materials' },
        { value: 1500000, name: 'Equipment' },
        { value: 900000, name: 'Subcontracts' },
        { value: 600000, name: 'Overhead' },
      ],
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' },
      },
    },
  ],
};

export function DemoCharts() {
  return (
    <div>
      <h3 className="harness-section-title">Charts — Schedule & Budget</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <HbcChart option={scheduleOption} height="320px" />
        <HbcChart option={budgetOption} height="320px" />
      </div>
    </div>
  );
}
