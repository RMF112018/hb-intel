import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcHandoffComposer } from '../components/HbcHandoffComposer';
import { createMockHandoffConfig } from '../../testing/createMockHandoffConfig';

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

interface MockSource { id: string; projectName: string; workflowStage: string }
interface MockDest { projectName: string }

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const sourceRecord: MockSource = {
  id: 'src-001',
  projectName: 'Riverside Office Tower',
  workflowStage: 'director-approved',
};

const currentUser = {
  userId: 'user-001',
  displayName: 'John BD Director',
  role: 'BD Director',
};

// ─── Meta ───────────────────────────────────────────────────────────────────

const meta: Meta<typeof HbcHandoffComposer> = {
  title: 'WorkflowHandoff/HbcHandoffComposer',
  component: HbcHandoffComposer,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcHandoffComposer>;

// ─── Stories ────────────────────────────────────────────────────────────────

export const PreflightPassing: Story = {
  args: {
    sourceRecord,
    config: createMockHandoffConfig<MockSource, MockDest>({
      validateReadiness: () => null,
      mapSourceToDestination: (src) => ({ projectName: src.projectName }),
      resolveDocuments: async () => [
        { documentId: 'd1', fileName: 'RFP-Package.pdf', sharepointUrl: 'https://sp/d1.pdf', category: 'RFP' },
      ],
    }),
    currentUser,
    onCancel: () => console.log('Cancel'),
  },
};

export const PreflightFailing: Story = {
  args: {
    sourceRecord: { ...sourceRecord, workflowStage: 'in-progress' },
    config: createMockHandoffConfig<MockSource, MockDest>({
      validateReadiness: () => 'Scorecard must be director-approved before handoff.',
    }),
    currentUser,
    onCancel: () => console.log('Cancel'),
  },
};

export const NoRecipient: Story = {
  args: {
    sourceRecord,
    config: createMockHandoffConfig<MockSource, MockDest>({
      validateReadiness: () => null,
      resolveRecipient: () => null,
    }),
    currentUser,
    onCancel: () => console.log('Cancel'),
  },
};
