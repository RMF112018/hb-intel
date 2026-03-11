import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcNotificationCenter } from '../HbcNotificationCenter';

const meta: Meta<typeof HbcNotificationCenter> = {
  title: 'NotificationIntelligence/HbcNotificationCenter',
  component: HbcNotificationCenter,
};

export default meta;
type Story = StoryObj<typeof HbcNotificationCenter>;

export const Empty: Story = {
  render: () => <HbcNotificationCenter />,
};

export const With_Mixed_Tier_Items: Story = {
  render: () => <HbcNotificationCenter defaultFilter="all" />,
};

export const Loading: Story = {
  render: () => <HbcNotificationCenter />,
};
