import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcHandoffReceiver } from '../components/HbcHandoffReceiver';
import { HandoffApi } from '../api/HandoffApi';
import { createMockHandoffConfig } from '../../testing/createMockHandoffConfig';
import { createMockHandoffPackage } from '../../testing/createMockHandoffPackage';
import { createMockContextNote } from '../../testing/createMockContextNote';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ tier: 'standard' }),
}));

vi.mock('../api/HandoffApi', () => ({
  HandoffApi: {
    create: vi.fn(),
    send: vi.fn(),
    get: vi.fn(),
    inbox: vi.fn(),
    outbox: vi.fn(),
    markReceived: vi.fn(),
    acknowledge: vi.fn(),
    reject: vi.fn(),
    updateContextNotes: vi.fn(),
  },
}));

// ─── Types ──────────────────────────────────────────────────────────────────

interface MockSource { id: string; projectName: string }
interface MockDest { projectName: string }

const config = createMockHandoffConfig<MockSource, MockDest>({
  routeLabel: 'BD Win → Estimating Pursuit',
  acknowledgeDescription: 'An Estimating Pursuit will be created and pre-populated with the data below.',
});

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

// ─── Meta ───────────────────────────────────────────────────────────────────

const meta: Meta<typeof HbcHandoffReceiver> = {
  title: 'WorkflowHandoff/HbcHandoffReceiver',
  component: HbcHandoffReceiver,
  args: {
    handoffId: 'hoff-001',
    config,
  },
};

export default meta;
type Story = StoryObj<typeof HbcHandoffReceiver>;

// ─── Stories ────────────────────────────────────────────────────────────────

export const SentState: Story = {
  decorators: [
    (Story) => {
      const pkg = createMockHandoffPackage<MockSource, MockDest>({
        status: 'sent',
        contextNotes: [
          createMockContextNote({ category: 'Key Decision', body: 'Client confirmed scope includes Phase 2.' }),
          createMockContextNote({ category: 'Risk', body: 'Budget uncertainty on interior finishes.' }),
        ],
      });
      vi.mocked(HandoffApi.get).mockResolvedValue(pkg);
      vi.mocked(HandoffApi.markReceived).mockResolvedValue({ ...pkg, status: 'received' });
      return (
        <QueryClientProvider client={createQueryClient()}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export const ReceivedState: Story = {
  decorators: [
    (Story) => {
      const pkg = createMockHandoffPackage<MockSource, MockDest>({ status: 'received' });
      vi.mocked(HandoffApi.get).mockResolvedValue(pkg);
      return (
        <QueryClientProvider client={createQueryClient()}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export const AcknowledgedState: Story = {
  decorators: [
    (Story) => {
      const pkg = createMockHandoffPackage<MockSource, MockDest>({ status: 'acknowledged' });
      vi.mocked(HandoffApi.get).mockResolvedValue(pkg);
      return (
        <QueryClientProvider client={createQueryClient()}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export const RejectedState: Story = {
  decorators: [
    (Story) => {
      const pkg = createMockHandoffPackage<MockSource, MockDest>({ status: 'rejected' });
      vi.mocked(HandoffApi.get).mockResolvedValue(pkg);
      return (
        <QueryClientProvider client={createQueryClient()}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};
