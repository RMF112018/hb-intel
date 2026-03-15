import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkTeamFeed } from './index.js';

const meta: Meta<typeof HbcMyWorkTeamFeed> = {
  title: 'MyWorkFeed/HbcMyWorkTeamFeed',
  component: HbcMyWorkTeamFeed,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkTeamFeed>;

export const DelegatedByMe: Story = {
  args: {
    defaultScope: 'delegated-by-me',
  },
};

export const MyTeam: Story = {
  args: {
    defaultScope: 'my-team',
  },
};

export const EscalationCandidate: Story = {
  args: {
    defaultScope: 'escalation-candidate',
  },
};
