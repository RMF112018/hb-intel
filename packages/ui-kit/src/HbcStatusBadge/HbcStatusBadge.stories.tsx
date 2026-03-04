import type { Meta, StoryObj } from '@storybook/react';
import { HbcStatusBadge } from './index.js';
import type { StatusVariant } from './types.js';

const meta: Meta<typeof HbcStatusBadge> = {
  title: 'Components/HbcStatusBadge',
  component: HbcStatusBadge,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'success',
        'warning',
        'error',
        'info',
        'neutral',
        'onTrack',
        'atRisk',
        'critical',
        'pending',
        'inProgress',
        'completed',
        'draft',
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
  'success',
  'warning',
  'error',
  'info',
  'neutral',
  'onTrack',
  'atRisk',
  'critical',
  'pending',
  'inProgress',
  'completed',
  'draft',
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
