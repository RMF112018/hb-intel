import type { Meta, StoryObj } from '@storybook/react';
import { vi } from 'vitest';
import { HbcAcknowledgmentBadge } from '../HbcAcknowledgmentBadge';
import { mockAckStates, PARTY_1, PARTY_2 } from '../../../testing';
import type { IAcknowledgmentConfig, IAcknowledgmentState } from '../../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ tier: 'standard' }),
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcTooltip: ({ content, children }: { content: string; children: React.ReactElement }) => (
    <div title={content}>{children}</div>
  ),
}));

let mockReturnState: IAcknowledgmentState | undefined = mockAckStates.pending;

vi.mock('../../hooks/useAcknowledgment', () => ({
  useAcknowledgment: () => ({
    state: mockReturnState,
    isLoading: false,
    isError: false,
    submit: vi.fn(),
    isSubmitting: false,
  }),
}));

// ─── Meta ───────────────────────────────────────────────────────────────────

const config: IAcknowledgmentConfig<{ id: string }> = {
  label: 'Test Sign-Off',
  mode: 'parallel',
  contextType: 'admin-provisioning',
  resolveParties: () => [PARTY_1, PARTY_2],
  resolvePromptMessage: () => 'Please confirm.',
};

const meta: Meta<typeof HbcAcknowledgmentBadge> = {
  title: 'Acknowledgment/HbcAcknowledgmentBadge',
  component: HbcAcknowledgmentBadge,
  args: {
    item: { id: 'item-1' },
    config,
    contextId: 'ctx-1',
  },
};

export default meta;
type Story = StoryObj<typeof HbcAcknowledgmentBadge>;

// ─── Stories ────────────────────────────────────────────────────────────────

export const Pending: Story = {
  decorators: [(Story) => { mockReturnState = mockAckStates.pending; return <Story />; }],
};

export const Partial: Story = {
  decorators: [(Story) => { mockReturnState = mockAckStates.partialParallel; return <Story />; }],
};

export const Complete: Story = {
  decorators: [(Story) => { mockReturnState = mockAckStates.complete; return <Story />; }],
};

export const Declined: Story = {
  decorators: [(Story) => { mockReturnState = mockAckStates.declined; return <Story />; }],
};

export const Bypassed: Story = {
  args: { complexityTier: 'expert' },
  decorators: [(Story) => { mockReturnState = mockAckStates.bypassed; return <Story />; }],
};

export const ExpertWithTooltip: Story = {
  args: { complexityTier: 'expert' },
  decorators: [(Story) => { mockReturnState = mockAckStates.partialParallel; return <Story />; }],
};
