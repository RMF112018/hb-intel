import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcHeader } from './HbcHeader.js';
import { hbcFieldTheme } from '../theme/theme.js';
import type { ShellUser } from './types.js';

const mockUser: ShellUser = {
  id: '1',
  displayName: 'John Smith',
  email: 'john.smith@hbconstruction.com',
  initials: 'JS',
};

const meta: Meta<typeof HbcHeader> = {
  title: 'Shell/HbcHeader',
  component: HbcHeader,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HbcHeader>;

export const Default: Story = {
  args: {
    user: mockUser,
    onSignOut: () => console.log('Sign out'),
    onCreateClick: () => console.log('Create'),
    onSearchOpen: () => console.log('Search'),
  },
};

export const NoUser: Story = {
  args: {
    user: null,
  },
};

export const WithAvatar: Story = {
  args: {
    user: { ...mockUser, avatarUrl: 'https://i.pravatar.cc/32?u=john' },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Default (with user)</p>
        <HbcHeader
          user={mockUser}
          onSignOut={() => {}}
          onCreateClick={() => {}}
          onSearchOpen={() => {}}
        />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>No user (signed out)</p>
        <HbcHeader user={null} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>With avatar URL</p>
        <HbcHeader
          user={{ ...mockUser, avatarUrl: 'https://i.pravatar.cc/32?u=john' }}
          onSignOut={() => {}}
          onCreateClick={() => {}}
          onSearchOpen={() => {}}
        />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '0', backgroundColor: '#0F1419' }}>
        <HbcHeader
          user={mockUser}
          onSignOut={() => {}}
          onCreateClick={() => {}}
          onSearchOpen={() => {}}
        />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Keyboard + Screen Reader)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Tab through header controls to verify focus order: logo, search, create, avatar menu.
        Press Enter/Space to activate. Screen reader should announce each control's purpose.
      </p>
      <HbcHeader
        user={mockUser}
        onSignOut={() => {}}
        onCreateClick={() => {}}
        onSearchOpen={() => {}}
      />
    </div>
  ),
};
