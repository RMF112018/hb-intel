/**
 * HbcNotificationBell Stories — PH4B.2 §Step 5 (F-013)
 * CSF3 format | DESIGN_SYSTEM.md convention
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcNotificationBell } from './HbcNotificationBell.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta<typeof HbcNotificationBell> = {
  title: 'Shell/HbcNotificationBell',
  component: HbcNotificationBell,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcNotificationBell>;

export const Default: Story = {
  args: {
    unreadCount: 0,
    onClick: () => console.log('Notifications clicked'),
  },
};

export const WithCount: Story = {
  args: {
    unreadCount: 5,
    onClick: () => console.log('Notifications clicked'),
  },
};

export const Over99: Story = {
  name: 'Over 99 (99+ badge)',
  args: {
    unreadCount: 150,
    onClick: () => console.log('Notifications clicked'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>0 unread</p>
        <HbcNotificationBell unreadCount={0} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>5 unread</p>
        <HbcNotificationBell unreadCount={5} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>99 unread</p>
        <HbcNotificationBell unreadCount={99} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>99+ unread</p>
        <HbcNotificationBell unreadCount={200} />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', padding: '16px', borderRadius: '4px' }}>
        <HbcNotificationBell unreadCount={3} onClick={() => console.log('Click')} />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Label + Badge)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Verify <code>aria-label</code> includes unread count when present.
        Badge is <code>aria-hidden="true"</code> (announced via label instead).
      </p>
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <HbcNotificationBell unreadCount={7} onClick={() => {}} />
      </div>
    </div>
  ),
};
