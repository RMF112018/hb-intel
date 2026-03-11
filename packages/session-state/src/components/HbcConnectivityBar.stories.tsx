/**
 * HbcConnectivityBar Storybook stories — SF12-T08
 *
 * Covers all connectivity states: online, online-visible, offline, degraded, syncing.
 */
import type { Meta, StoryObj } from '@storybook/react';
import type { ISessionStateContext } from '../types/index.js';
import { SessionStateContext } from '../context/SessionStateContext.js';
import { HbcConnectivityBar } from './HbcConnectivityBar.js';
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

const meta: Meta<typeof HbcConnectivityBar> = {
  title: 'session-state/HbcConnectivityBar',
  component: HbcConnectivityBar,
};

export default meta;

type Story = StoryObj<typeof HbcConnectivityBar>;

/** Online — bar hidden by default */
export const Online: Story = {
  decorators: [withSessionContext({ connectivity: 'online' })],
};

/** Online with showWhenOnline — green "Connected" bar visible */
export const OnlineVisible: Story = {
  args: { showWhenOnline: true },
  decorators: [withSessionContext({ connectivity: 'online' })],
};

/** Offline — red bar with pending count */
export const Offline: Story = {
  decorators: [
    withSessionContext({
      connectivity: 'offline',
      pendingCount: 5,
    }),
  ],
};

/** Degraded — amber warning bar */
export const Degraded: Story = {
  decorators: [
    withSessionContext({ connectivity: 'degraded' }),
  ],
};

/** Syncing — simulated reconnect transition with pending operations */
export const Syncing: Story = {
  args: { showWhenOnline: true },
  decorators: [
    withSessionContext({
      connectivity: 'online',
      pendingCount: 3,
      queuedOperations: [
        createMockQueuedOperation({ operationId: 'op-001' }),
        createMockQueuedOperation({ operationId: 'op-002', type: 'form-save', target: '/api/forms' }),
        createMockQueuedOperation({ operationId: 'op-003', type: 'upload', target: '/api/files' }),
      ],
    }),
  ],
};
