import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcNotificationBanner } from '../HbcNotificationBanner';
import { createMockNotification } from '../../../testing/createMockNotification';

const meta: Meta<typeof HbcNotificationBanner> = {
  title: 'NotificationIntelligence/HbcNotificationBanner',
  component: HbcNotificationBanner,
};

export default meta;
type Story = StoryObj<typeof HbcNotificationBanner>;

const immediateNotification = createMockNotification({
  id: 'notif-story-1',
  effectiveTier: 'immediate',
  title: 'BIC Transfer Complete',
  body: 'Project Alpha has been transferred to Estimating.',
});

export const Immediate_Notification: Story = {
  render: () => (
    <HbcNotificationBanner
      notification={immediateNotification}
      onDismiss={() => {}}
    />
  ),
};

export const Auto_Dismiss: Story = {
  render: () => (
    <HbcNotificationBanner
      notification={immediateNotification}
      onDismiss={() => {}}
    />
  ),
};

export const No_Notification: Story = {
  render: () => (
    <HbcNotificationBanner notification={null} onDismiss={() => {}} />
  ),
};
