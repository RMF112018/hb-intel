import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcNotificationPreferences } from '../HbcNotificationPreferences';

const meta: Meta<typeof HbcNotificationPreferences> = {
  title: 'NotificationIntelligence/HbcNotificationPreferences',
  component: HbcNotificationPreferences,
};

export default meta;
type Story = StoryObj<typeof HbcNotificationPreferences>;

export const Expert_Default: Story = {
  render: () => <HbcNotificationPreferences />,
};

export const Expert_With_Overrides: Story = {
  render: () => <HbcNotificationPreferences onSave={() => {}} />,
};
