import type { Meta, StoryObj } from '@storybook/react';
import { HbcConnectivityBar } from './HbcConnectivityBar.js';

const meta: Meta<typeof HbcConnectivityBar> = {
  title: 'Shell/HbcConnectivityBar',
  component: HbcConnectivityBar,
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1E1E1E', minHeight: '80px', paddingTop: '16px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    status: { control: 'select', options: ['online', 'syncing', 'offline'] },
  },
};

export default meta;
type Story = StoryObj<typeof HbcConnectivityBar>;

export const Online: Story = { args: { status: 'online' } };
export const Syncing: Story = { args: { status: 'syncing' } };
export const Offline: Story = { args: { status: 'offline' } };
