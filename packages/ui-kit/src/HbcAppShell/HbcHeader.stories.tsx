import type { Meta, StoryObj } from '@storybook/react';
import { HbcHeader } from './HbcHeader.js';
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
