import type { Meta, StoryObj } from './__storybook-types';
import { HbcVersionBadge } from './HbcVersionBadge';

const meta: Meta<typeof HbcVersionBadge> = {
  title: 'versioned-record/HbcVersionBadge',
  component: HbcVersionBadge,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof HbcVersionBadge>;

export const Draft: Story = {
  name: 'Tag: Draft',
  args: { currentVersion: 1, currentTag: 'draft' },
};

export const Submitted: Story = {
  name: 'Tag: Submitted',
  args: { currentVersion: 2, currentTag: 'submitted' },
};

export const Approved: Story = {
  name: 'Tag: Approved',
  args: { currentVersion: 3, currentTag: 'approved' },
};

export const Rejected: Story = {
  name: 'Tag: Rejected',
  args: { currentVersion: 4, currentTag: 'rejected' },
};

export const Archived: Story = {
  name: 'Tag: Archived',
  args: { currentVersion: 5, currentTag: 'archived' },
};

export const Handoff: Story = {
  name: 'Tag: Handoff',
  args: { currentVersion: 6, currentTag: 'handoff' },
};

export const Superseded: Story = {
  name: 'Tag: Superseded',
  args: { currentVersion: 7, currentTag: 'superseded' },
};

export const Interactive: Story = {
  name: 'Interactive (clickable)',
  args: { currentVersion: 3, currentTag: 'approved', onClick: () => alert('Badge clicked') },
};
