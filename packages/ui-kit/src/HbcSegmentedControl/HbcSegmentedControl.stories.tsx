/**
 * HbcSegmentedControl stories — Governed pill-group selector
 * Four required exports: Default, AllVariants, FieldMode, A11yTest
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcSegmentedControl } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta<typeof HbcSegmentedControl> = {
  title: 'Components/HbcSegmentedControl',
  component: HbcSegmentedControl,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HbcSegmentedControl>;

const yearOptions = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
];

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft', label: 'Draft' },
];

export const Default: Story = {
  args: {
    label: 'Year:',
    options: yearOptions,
    value: '2026',
  },
};

export const AllVariants: Story = {
  render: () => {
    const [year, setYear] = React.useState('2026');
    const [status, setStatus] = React.useState('all');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <HbcSegmentedControl label="Year:" options={yearOptions} value={year} onChange={setYear} />
        <HbcSegmentedControl label="Status:" options={statusOptions} value={status} onChange={setStatus} />
        <HbcSegmentedControl label="Size sm:" options={yearOptions} value={year} onChange={setYear} size="sm" />
        <HbcSegmentedControl label="Size md:" options={yearOptions} value={year} onChange={setYear} size="md" />
        <HbcSegmentedControl label="Disabled:" options={yearOptions} value={year} onChange={setYear} disabled />
        <HbcSegmentedControl label="Hidden label:" showLabel={false} options={statusOptions} value={status} onChange={setStatus} />
      </div>
    );
  },
};

export const FieldMode: Story = {
  render: () => {
    const [year, setYear] = React.useState('2026');
    return (
      <FluentProvider theme={hbcFieldTheme}>
        <div style={{ background: '#0F1419', padding: 32 }}>
          <HbcSegmentedControl label="Year:" options={yearOptions} value={year} onChange={setYear} />
        </div>
      </FluentProvider>
    );
  },
};

export const A11yTest: Story = {
  render: () => {
    const [val, setVal] = React.useState('active');
    return (
      <div>
        <p>
          <strong>Keyboard navigation:</strong> Focus any pill, then use ArrowLeft/Right to move
          selection. Selection wraps at both ends. The component uses{' '}
          <code>role=&quot;radiogroup&quot;</code> with <code>aria-labelledby</code> pointing to the
          visible label, and each button sets <code>aria-pressed</code>.
        </p>
        <HbcSegmentedControl label="Filter:" options={statusOptions} value={val} onChange={setVal} />
      </div>
    );
  },
};
