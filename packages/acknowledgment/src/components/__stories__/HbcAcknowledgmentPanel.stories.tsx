import type { Meta, StoryObj } from '@storybook/react';
import { vi } from 'vitest';
import { HbcAcknowledgmentPanel } from '../HbcAcknowledgmentPanel';
import { mockAckStates, PARTY_1, PARTY_2 } from '../../../testing';
import type { IAcknowledgmentConfig, IAcknowledgmentState } from '../../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ tier: 'standard' }),
}));

let mockReturnState: IAcknowledgmentState | undefined = mockAckStates.pending;
const mockIsLoading = false;

vi.mock('../../hooks/useAcknowledgment', () => ({
  useAcknowledgment: () => ({
    state: mockReturnState,
    isLoading: mockIsLoading,
    isError: false,
    submit: vi.fn().mockResolvedValue(undefined),
    isSubmitting: false,
  }),
}));

vi.mock('../../hooks/useAcknowledgmentGate', () => ({
  useAcknowledgmentGate: () => ({
    canAcknowledge: true,
    isCurrentTurn: true,
    party: PARTY_1,
  }),
}));

// ─── Meta ───────────────────────────────────────────────────────────────────

const config: IAcknowledgmentConfig<{ id: string }> = {
  label: 'Test Sign-Off',
  mode: 'parallel',
  contextType: 'admin-provisioning',
  resolveParties: () => [PARTY_1, PARTY_2],
  resolvePromptMessage: () => 'Please confirm you have reviewed.',
  allowDecline: true,
  declineReasons: ['Incomplete', 'Incorrect', 'Other'],
};

const meta: Meta<typeof HbcAcknowledgmentPanel> = {
  title: 'Acknowledgment/HbcAcknowledgmentPanel',
  component: HbcAcknowledgmentPanel,
  args: {
    item: { id: 'item-1' },
    config,
    contextId: 'ctx-1',
    currentUserId: 'user-1',
  },
};

export default meta;
type Story = StoryObj<typeof HbcAcknowledgmentPanel>;

// ─── Stories ────────────────────────────────────────────────────────────────

export const SingleModePending: Story = {
  args: { config: { ...config, mode: 'single' } },
  decorators: [
    (Story) => {
      mockReturnState = { ...mockAckStates.pending, config: { ...config, mode: 'single' } };
      return <Story />;
    },
  ],
};

export const SingleModeComplete: Story = {
  decorators: [
    (Story) => {
      mockReturnState = mockAckStates.complete;
      return <Story />;
    },
  ],
};

export const ParallelModePartial: Story = {
  decorators: [
    (Story) => {
      mockReturnState = mockAckStates.partialParallel;
      return <Story />;
    },
  ],
};

export const ParallelModeDeclined: Story = {
  decorators: [
    (Story) => {
      mockReturnState = mockAckStates.declined;
      return <Story />;
    },
  ],
};

export const SequentialModeStep1: Story = {
  args: { config: { ...config, mode: 'sequential' } },
  decorators: [
    (Story) => {
      mockReturnState = {
        ...mockAckStates.pending,
        config: { ...config, mode: 'sequential' },
        currentSequentialParty: PARTY_1,
      };
      return <Story />;
    },
  ],
};

export const SequentialModeStep2: Story = {
  args: { config: { ...config, mode: 'sequential' } },
  decorators: [
    (Story) => {
      mockReturnState = {
        ...mockAckStates.partialParallel,
        config: { ...config, mode: 'sequential' },
        currentSequentialParty: PARTY_2,
      };
      return <Story />;
    },
  ],
};

export const SequentialModeBypassed: Story = {
  args: { config: { ...config, mode: 'sequential' }, complexityTier: 'expert' },
  decorators: [
    (Story) => {
      mockReturnState = mockAckStates.bypassed;
      return <Story />;
    },
  ],
};

export const ExpertAuditTrail: Story = {
  args: { complexityTier: 'expert' },
  decorators: [
    (Story) => {
      mockReturnState = mockAckStates.complete;
      return <Story />;
    },
  ],
};

export const OfflinePendingSync: Story = {
  decorators: [
    (Story) => {
      mockReturnState = mockAckStates.offlinePending;
      return <Story />;
    },
  ],
};

export const EssentialCTAOnly: Story = {
  args: { complexityTier: 'essential' },
  decorators: [
    (Story) => {
      mockReturnState = mockAckStates.pending;
      return <Story />;
    },
  ],
};
