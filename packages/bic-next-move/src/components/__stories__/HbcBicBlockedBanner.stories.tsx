import type { Meta, StoryObj } from '@storybook/react';
import { HbcBicBlockedBanner } from '../HbcBicBlockedBanner';

const meta: Meta<typeof HbcBicBlockedBanner> = {
  title: 'BIC / HbcBicBlockedBanner',
  component: HbcBicBlockedBanner,
  argTypes: {
    forceVariant: {
      control: { type: 'select' },
      options: ['essential', 'standard', 'expert'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof HbcBicBlockedBanner>;

export const ReasonOnly: Story = {
  args: {
    blockedReason: 'Waiting on Structural Engineering to complete their section',
    forceVariant: 'essential',
  },
};

export const WithSpaLink: Story = {
  args: {
    blockedReason: 'Waiting on Structural Engineering to complete their section',
    blockedByItem: { label: 'Structural Review #123', href: '/structural/review/123' },
    onNavigate: (href: string) => console.log('Navigate to:', href),
    forceVariant: 'standard',
  },
};

export const WithAnchorFallback: Story = {
  args: {
    blockedReason: 'Waiting on external drawing set approval',
    blockedByItem: { label: 'External Drawing Set', href: 'https://external.example.com/drawings/456' },
    forceVariant: 'standard',
  },
};

export const ExpertWithEscalation: Story = {
  args: {
    blockedReason: 'Waiting on Structural Engineering to complete their section',
    blockedByItem: { label: 'Structural Review #123', href: '/structural/review/123' },
    onNavigate: (href: string) => console.log('Navigate to:', href),
    forceVariant: 'expert',
  },
};
