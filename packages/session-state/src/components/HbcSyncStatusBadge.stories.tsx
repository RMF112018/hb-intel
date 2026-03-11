/**
 * HbcSyncStatusBadge Storybook stories — SF12-T08
 *
 * Covers: synced, pending operations, many pending, offline, detail expanded.
 */
import type { Meta, StoryObj } from '@storybook/react';
import type { ISessionStateContext } from '../types/index.js';
import { SessionStateContext } from '../context/SessionStateContext.js';
import { HbcSyncStatusBadge } from './HbcSyncStatusBadge.js';
import { createMockSessionContext } from '../../testing/createMockSessionContext.js';
import { createMockQueuedOperation } from '../../testing/createMockQueuedOperation.js';

function withSessionContext(overrides: Partial<ISessionStateContext> = {}) {
  const ctx = createMockSessionContext(overrides);
  return function Decorator(Story: React.ComponentType) {
    return (
      <SessionStateContext.Provider value={ctx}>
        <Story />
      </SessionStateContext.Provider>
    );
  };
}

const meta: Meta<typeof HbcSyncStatusBadge> = {
  title: 'session-state/HbcSyncStatusBadge',
  component: HbcSyncStatusBadge,
};

export default meta;

type Story = StoryObj<typeof HbcSyncStatusBadge>;

/** Synced — green badge, no pending operations */
export const Synced: Story = {
  args: { showWhenEmpty: true },
  decorators: [
    withSessionContext({ pendingCount: 0, queuedOperations: [] }),
  ],
};

/** PendingOperations — amber badge with count */
export const PendingOperations: Story = {
  decorators: [
    withSessionContext({
      pendingCount: 3,
      queuedOperations: [
        createMockQueuedOperation({ operationId: 'op-001' }),
        createMockQueuedOperation({ operationId: 'op-002', type: 'form-save', target: '/api/forms' }),
        createMockQueuedOperation({ operationId: 'op-003', type: 'upload', target: '/api/files', retryCount: 1 }),
      ],
    }),
  ],
};

/** ManyPending — large pending count */
export const ManyPending: Story = {
  decorators: [
    withSessionContext({
      pendingCount: 42,
      queuedOperations: Array.from({ length: 42 }, (_, i) =>
        createMockQueuedOperation({
          operationId: `op-${String(i + 1).padStart(3, '0')}`,
          type: i % 2 === 0 ? 'api-mutation' : 'upload',
          target: `/api/resource/${i + 1}`,
        }),
      ),
    }),
  ],
};

/** Offline — offline with pending operations */
export const Offline: Story = {
  decorators: [
    withSessionContext({
      connectivity: 'offline',
      pendingCount: 2,
      queuedOperations: [
        createMockQueuedOperation({ operationId: 'op-001' }),
        createMockQueuedOperation({ operationId: 'op-002', retryCount: 3, maxRetries: 5 }),
      ],
    }),
  ],
};

/** DetailExpanded — shows the details popover in open state */
export const DetailExpanded: Story = {
  decorators: [
    withSessionContext({
      pendingCount: 3,
      queuedOperations: [
        createMockQueuedOperation({ operationId: 'op-001' }),
        createMockQueuedOperation({ operationId: 'op-002', type: 'form-save', target: '/api/forms' }),
        createMockQueuedOperation({ operationId: 'op-003', retryCount: 2, maxRetries: 5 }),
      ],
    }),
  ],
  play: async ({ canvasElement }) => {
    const details = canvasElement.querySelector('details');
    if (details) {
      details.open = true;
    }
  },
};
