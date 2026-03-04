/**
 * HbcConnectivityBar stories — PH4.6 §Step 2
 * V2.1 compliant: 2px/4px, pulse, 3 states, screen reader verification
 */
import * as React from 'react';
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

export const Default: Story = { args: { status: 'online' } };
export const Syncing: Story = { args: { status: 'syncing' } };
export const Offline: Story = { args: { status: 'offline' } };

export const A11yTest: Story = {
  name: 'A11y Test (Screen Reader)',
  render: () => (
    <div>
      <p style={{ color: '#FFFFFF', fontSize: '0.875rem', padding: '8px 16px' }}>
        Each bar has <code>role=&quot;status&quot;</code>, <code>aria-live=&quot;polite&quot;</code>,
        and descriptive <code>aria-label</code>. Inspect with screen reader or DevTools.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <p style={{ color: '#A0A0A0', fontSize: '0.75rem', padding: '0 16px' }}>Online (2px)</p>
          <div style={{ position: 'relative', height: '8px' }}>
            <HbcConnectivityBar status="online" />
          </div>
        </div>
        <div>
          <p style={{ color: '#A0A0A0', fontSize: '0.75rem', padding: '0 16px' }}>Syncing (4px, pulse)</p>
          <div style={{ position: 'relative', height: '8px' }}>
            <HbcConnectivityBar status="syncing" />
          </div>
        </div>
        <div>
          <p style={{ color: '#A0A0A0', fontSize: '0.75rem', padding: '0 16px' }}>Offline (4px, pulse)</p>
          <div style={{ position: 'relative', height: '8px' }}>
            <HbcConnectivityBar status="offline" />
          </div>
        </div>
      </div>
    </div>
  ),
};
