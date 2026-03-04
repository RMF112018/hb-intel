/**
 * HbcStatusBadge stories — PH4.6 §Step 1
 * V2.1 dual-channel: color + shape, FieldMode, A11y grayscale test
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcStatusBadge } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import type { StatusVariant } from './types.js';

const meta: Meta<typeof HbcStatusBadge> = {
  title: 'Components/HbcStatusBadge',
  component: HbcStatusBadge,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'success', 'warning', 'error', 'info', 'neutral',
        'onTrack', 'atRisk', 'critical', 'pending', 'inProgress',
        'completed', 'draft',
      ],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
};

export default meta;
type Story = StoryObj<typeof HbcStatusBadge>;

export const Default: Story = {
  args: { variant: 'success', label: 'On Track' },
};

const ALL_VARIANTS: StatusVariant[] = [
  'success', 'warning', 'error', 'info', 'neutral',
  'onTrack', 'atRisk', 'critical', 'pending', 'inProgress',
  'completed', 'draft',
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {ALL_VARIANTS.map((v) => (
        <HbcStatusBadge key={v} variant={v} label={v} />
      ))}
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ALL_VARIANTS.map((v) => (
            <HbcStatusBadge key={v} variant={v} label={v} />
          ))}
        </div>
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Grayscale)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Grayscale filter applied — icons provide shape distinction independent of color.
      </p>
      <div style={{ filter: 'grayscale(100%)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {ALL_VARIANTS.map((v) => (
          <HbcStatusBadge key={v} variant={v} label={v} />
        ))}
      </div>
    </div>
  ),
};
