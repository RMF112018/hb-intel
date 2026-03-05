/**
 * HbcCreateButton Stories — PH4B.2 §Step 5 (F-013)
 * CSF3 format | DESIGN_SYSTEM.md convention
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcCreateButton } from './HbcCreateButton.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta<typeof HbcCreateButton> = {
  title: 'Shell/HbcCreateButton',
  component: HbcCreateButton,
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
type Story = StoryObj<typeof HbcCreateButton>;

export const Default: Story = {
  args: {
    onClick: () => console.log('Create clicked'),
  },
};

export const Offline: Story = {
  name: 'Offline (disabled)',
  parameters: {
    docs: {
      description: {
        story: 'When offline, the button shows a cloud-offline icon and ignores clicks. The offline state is detected via useOnlineStatus hook.',
      },
    },
  },
  args: {
    onClick: () => console.log('Should not fire when offline'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>Online</p>
        <HbcCreateButton onClick={() => console.log('Create')} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>Offline (auto-detected)</p>
        <HbcCreateButton onClick={() => {}} />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', padding: '16px', borderRadius: '4px' }}>
        <HbcCreateButton onClick={() => console.log('Create')} />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Online/Offline Labels)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Verify <code>aria-label</code> changes between &quot;Create new item&quot; (online)
        and &quot;Create new item (offline unavailable)&quot; (offline).
        Button should have <code>title</code> tooltip when offline.
      </p>
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <HbcCreateButton onClick={() => console.log('Create')} />
      </div>
    </div>
  ),
};
