import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcNotificationBadge } from '../HbcNotificationBadge';

const meta: Meta<typeof HbcNotificationBadge> = {
  title: 'NotificationIntelligence/HbcNotificationBadge',
  component: HbcNotificationBadge,
};

export default meta;
type Story = StoryObj<typeof HbcNotificationBadge>;

export const No_Notifications: Story = {
  render: () => <HbcNotificationBadge onClick={() => {}} />,
};

export const With_Unread_3: Story = {
  render: () => <HbcNotificationBadge onClick={() => {}} />,
};

export const With_Unread_99Plus: Story = {
  render: () => <HbcNotificationBadge onClick={() => {}} />,
};
