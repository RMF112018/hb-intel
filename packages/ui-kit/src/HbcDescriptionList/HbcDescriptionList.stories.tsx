/**
 * HbcDescriptionList stories — Semantic key/value metadata
 * Four required exports: Default, AllVariants, FieldMode, A11yTest
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcDescriptionList } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta<typeof HbcDescriptionList> = {
  title: 'Components/HbcDescriptionList',
  component: HbcDescriptionList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HbcDescriptionList>;

const projectItems = [
  { label: 'Client', value: 'ACME Construction' },
  { label: 'Location', value: 'Denver, CO' },
  { label: 'Type', value: 'Commercial Office' },
];

const detailItems = [
  { label: 'Project Number', value: '2026-0142' },
  { label: 'Department', value: 'Mid-Atlantic' },
  { label: 'Stage', value: 'Active' },
  { label: 'Estimated Value', value: '$4.2M' },
  { label: 'Start Date', value: 'January 2026' },
];

export const Default: Story = {
  args: {
    items: projectItems,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3>Standard spacing</h3>
        <HbcDescriptionList items={detailItems} />
      </div>
      <div>
        <h3>Dense (card context)</h3>
        <HbcDescriptionList items={projectItems} dense />
      </div>
      <div>
        <h3>React node values</h3>
        <HbcDescriptionList
          items={[
            { label: 'Status', value: <strong style={{ color: '#00C896' }}>On Track</strong> },
            { label: 'Owner', value: 'Jane Smith' },
          ]}
        />
      </div>
      <div>
        <h3>Long values (truncated)</h3>
        <div style={{ maxWidth: 300 }}>
          <HbcDescriptionList
            items={[
              { label: 'Client', value: 'Very Long Client Name That Should Truncate With Ellipsis' },
              { label: 'Location', value: 'An Extremely Detailed Location Description' },
            ]}
          />
        </div>
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ background: '#0F1419', padding: 32 }}>
        <HbcDescriptionList items={detailItems} />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div>
      <p>
        <strong>Semantics:</strong> Uses <code>&lt;dl&gt;</code>, <code>&lt;dt&gt;</code>,{' '}
        <code>&lt;dd&gt;</code> elements for correct screen reader announcement.
        Each label/value pair is announced as a term/definition association.
        Values support React nodes for rich content (badges, links, etc.)
        while maintaining semantic structure.
      </p>
      <HbcDescriptionList items={detailItems} />
    </div>
  ),
};
