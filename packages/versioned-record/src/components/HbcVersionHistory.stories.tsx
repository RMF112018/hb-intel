import type { Meta, StoryObj } from './__storybook-types';
import { HbcVersionHistory } from './HbcVersionHistory';

const meta: Meta<typeof HbcVersionHistory> = {
  title: 'versioned-record/HbcVersionHistory',
  component: HbcVersionHistory,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof HbcVersionHistory>;

const baseConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit' as const],
  getStakeholders: () => [],
};

export const Default: Story = {
  args: {
    recordType: 'bd-scorecard',
    recordId: 'rec-1',
    config: baseConfig,
  },
};

export const MultipleVersions: Story = {
  name: 'Multiple versions — submitted and approved',
};

export const WithRollback: Story = {
  name: 'With rollback CTA (Expert tier, Director role)',
  args: {
    allowRollback: true,
    currentUser: { userId: 'bob', displayName: 'Bob Martinez', role: 'Director' },
  },
};

export const RollbackModalOpen: Story = {
  name: 'Rollback confirmation modal open',
};

export const WithSupersededVersions: Story = {
  name: 'With superseded versions — toggle hidden',
};

export const SupersededVersionsRevealed: Story = {
  name: 'Superseded versions revealed via toggle',
};

export const EmptyHistory: Story = {
  name: 'Empty history — no versions yet',
};

export const LoadingState: Story = {
  name: 'Loading state',
};

export const ErrorState: Story = {
  name: 'Error state — API failure',
};

export const StandardComplexity: Story = {
  name: 'Standard complexity — no rollback CTA',
};

export const ApprovedVersionBadge: Story = {
  name: 'Approved version tag badge color',
};
