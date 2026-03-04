/**
 * HbcChart — Storybook stories for typed chart wrappers
 * PH4.7 §7.4 | Blueprint §1d
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcBarChart } from './HbcBarChart.js';
import { HbcDonutChart } from './HbcDonutChart.js';
import { HbcLineChart } from './HbcLineChart.js';

const meta: Meta = {
  title: 'Components/HbcChart',
  parameters: { layout: 'padded' },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <HbcBarChart
        title="RFIs by Category"
        data={[
          { category: 'Structural', value: 42 },
          { category: 'MEP', value: 28 },
          { category: 'Civil', value: 15 },
          { category: 'Architectural', value: 35 },
        ]}
        height="300px"
      />
      <HbcDonutChart
        title="Status Breakdown"
        data={[
          { name: 'Open', value: 42 },
          { name: 'In Progress', value: 28 },
          { name: 'Closed', value: 65 },
          { name: 'Draft', value: 12 },
        ]}
        height="300px"
      />
      <HbcLineChart
        title="Monthly Trend"
        xAxisLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
        series={[
          { name: 'RFIs', data: [10, 15, 22, 18, 25, 30] },
          { name: 'Submittals', data: [5, 8, 12, 10, 16, 20] },
        ]}
        height="300px"
      />
    </div>
  ),
};

export const WithClickToFilter: StoryObj = {
  render: () => {
    const [lastClick, setLastClick] = React.useState('');
    return (
      <div>
        <p style={{ marginBottom: 8 }}>Last click: <code>{lastClick || 'none'}</code></p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <HbcBarChart
              title="Click a bar"
              data={[
                { category: 'Q1', value: 120 },
                { category: 'Q2', value: 180 },
                { category: 'Q3', value: 150 },
                { category: 'Q4', value: 210 },
              ]}
              onBarClick={(item) => setLastClick(`Bar: ${item.category} = ${item.value}`)}
              height="250px"
            />
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <HbcDonutChart
              title="Click a slice"
              data={[
                { name: 'On Track', value: 60, color: '#00C896' },
                { name: 'At Risk', value: 25, color: '#FFB020' },
                { name: 'Critical', value: 15, color: '#FF4D4D' },
              ]}
              onSliceClick={(item) => setLastClick(`Slice: ${item.name} = ${item.value}`)}
              height="250px"
            />
          </div>
        </div>
      </div>
    );
  },
};

export const FieldMode: StoryObj = {
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <HbcBarChart
      title="Buyout Progress"
      data={[
        { category: 'Electrical', value: 85 },
        { category: 'Plumbing', value: 62 },
        { category: 'HVAC', value: 78 },
        { category: 'Steel', value: 95 },
      ]}
      orientation="horizontal"
      height="300px"
    />
  ),
};

export const A11yTest: StoryObj = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Charts include aria-label with title. Click handlers support keyboard Enter/Space.
        Color palette maintains 3:1 contrast ratio for data visualization.
      </p>
      <HbcBarChart
        title="Accessible Bar Chart"
        data={[
          { category: 'Q1', value: 120 },
          { category: 'Q2', value: 180 },
          { category: 'Q3', value: 150 },
        ]}
        height="250px"
      />
    </div>
  ),
};

export const AllVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <HbcBarChart
        title="Vertical Bar"
        data={[
          { category: 'A', value: 30 },
          { category: 'B', value: 50 },
          { category: 'C', value: 20 },
        ]}
        height="250px"
      />
      <HbcBarChart
        title="Horizontal Bar"
        data={[
          { category: 'X', value: 80 },
          { category: 'Y', value: 45 },
          { category: 'Z', value: 65 },
        ]}
        orientation="horizontal"
        height="250px"
      />
      <HbcDonutChart
        title="Donut Chart"
        data={[
          { name: 'Phase 1', value: 40 },
          { name: 'Phase 2', value: 35 },
          { name: 'Phase 3', value: 25 },
        ]}
        height="250px"
      />
      <HbcLineChart
        title="Area Fill Line"
        xAxisLabels={['W1', 'W2', 'W3', 'W4']}
        series={[{ name: 'Progress', data: [20, 45, 60, 80] }]}
        areaFill
        height="250px"
      />
    </div>
  ),
};
