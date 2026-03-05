/**
 * HbcUserMenu Stories — PH4B.2 §Step 5 (F-013)
 * CSF3 format | DESIGN_SYSTEM.md convention
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcUserMenu } from './HbcUserMenu.js';
import { hbcFieldTheme } from '../theme/theme.js';
import type { ShellUser } from './types.js';

const mockUser: ShellUser = {
  id: '1',
  displayName: 'John Smith',
  email: 'john.smith@hbconstruction.com',
  initials: 'JS',
};

const mockUserWithAvatar: ShellUser = {
  ...mockUser,
  avatarUrl: 'https://i.pravatar.cc/32?u=john',
};

const guestUser: ShellUser = {
  id: '0',
  displayName: 'Guest User',
  email: 'guest@example.com',
  initials: 'GU',
};

const meta: Meta<typeof HbcUserMenu> = {
  title: 'Shell/HbcUserMenu',
  component: HbcUserMenu,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px', minHeight: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcUserMenu>;

export const Default: Story = {
  args: {
    user: mockUser,
    isFieldMode: false,
    onToggleFieldMode: () => console.log('Toggle field mode'),
    onSignOut: () => console.log('Sign out'),
    onProfileClick: () => console.log('Profile'),
  },
};

export const WithAvatar: Story = {
  args: {
    user: mockUserWithAvatar,
    isFieldMode: false,
    onToggleFieldMode: () => console.log('Toggle field mode'),
    onSignOut: () => console.log('Sign out'),
  },
};

export const Guest: Story = {
  args: {
    user: guestUser,
    isFieldMode: false,
    onToggleFieldMode: () => console.log('Toggle field mode'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '48px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>Initials</p>
        <HbcUserMenu user={mockUser} isFieldMode={false} onToggleFieldMode={() => {}} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>Avatar</p>
        <HbcUserMenu user={mockUserWithAvatar} isFieldMode={false} onToggleFieldMode={() => {}} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>Field Mode On</p>
        <HbcUserMenu user={mockUser} isFieldMode={true} onToggleFieldMode={() => {}} />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', padding: '16px', borderRadius: '4px' }}>
        <HbcUserMenu
          user={mockUser}
          isFieldMode={true}
          onToggleFieldMode={() => console.log('Toggle')}
          onSignOut={() => console.log('Sign out')}
        />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Menu Roles)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Tab to avatar, Enter to open menu. Verify <code>role="menu"</code> and
        <code> role="menuitem"</code> on items. Escape closes menu and returns focus.
      </p>
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <HbcUserMenu
          user={mockUser}
          isFieldMode={false}
          onToggleFieldMode={() => {}}
          onSignOut={() => {}}
          onProfileClick={() => {}}
        />
      </div>
    </div>
  ),
};
