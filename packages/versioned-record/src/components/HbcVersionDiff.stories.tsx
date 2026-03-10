import type { Meta, StoryObj } from './__storybook-types';
import { HbcVersionDiff } from './HbcVersionDiff';

const meta: Meta<typeof HbcVersionDiff> = {
  title: 'versioned-record/HbcVersionDiff',
  component: HbcVersionDiff,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof HbcVersionDiff>;

export const SideBySideNumericDelta: Story = {
  name: 'Side by side — numeric delta display',
};

export const SideBySideTextCharDiff: Story = {
  name: 'Side by side — character-level text diff',
};

export const UnifiedMode: Story = {
  name: 'Unified diff mode',
};

export const NoChanges: Story = {
  name: 'No differences between versions',
};

export const LoadingState: Story = {
  name: 'Computing diff — loading state',
};

export const AddedAndRemovedFields: Story = {
  name: 'Added and removed fields',
};
