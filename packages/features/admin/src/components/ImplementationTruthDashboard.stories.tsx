/**
 * ImplementationTruthDashboard stories — probe status × staleness matrix
 * SF17-T08 — Testing Strategy
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ImplementationTruthDashboard } from './ImplementationTruthDashboard.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { INFRA_PROBES_QUERY_KEY } from '../constants/index.js';
import { createMockProbeResult, createMockProbeSnapshot } from '../../testing/index.js';

const meta: Meta<typeof ImplementationTruthDashboard> = {
  title: 'Admin Intelligence/ImplementationTruthDashboard',
  component: ImplementationTruthDashboard,
};

export default meta;

type Story = StoryObj<typeof ImplementationTruthDashboard>;

function createClient(data: unknown): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  client.setQueryData(INFRA_PROBES_QUERY_KEY, data);
  return client;
}

function Wrapper({ data, children }: { data: unknown; children: React.ReactNode }) {
  const [client] = React.useState(() => createClient(data));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** All probes healthy, fresh data */
export const HealthyFresh: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        data={{
          latestSnapshot: createMockProbeSnapshot({
            results: [
              createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p2', probeKey: 'azure-functions', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p3', probeKey: 'azure-search', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p4', probeKey: 'notification-system', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p5', probeKey: 'module-record-health', status: 'healthy' }),
            ],
          }),
          lastRunAt: new Date().toISOString(),
        }}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** Mixed degraded probes, fresh data */
export const DegradedFresh: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        data={{
          latestSnapshot: createMockProbeSnapshot({
            results: [
              createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'degraded', summary: 'Elevated latency' }),
              createMockProbeResult({ probeId: 'p2', probeKey: 'azure-functions', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p3', probeKey: 'azure-search', status: 'degraded', summary: 'Partial results' }),
              createMockProbeResult({ probeId: 'p4', probeKey: 'notification-system', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p5', probeKey: 'module-record-health', status: 'healthy' }),
            ],
          }),
          lastRunAt: new Date().toISOString(),
        }}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** Error probes, fresh data */
export const ErrorFresh: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        data={{
          latestSnapshot: createMockProbeSnapshot({
            results: [
              createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'error', summary: 'Connection refused' }),
              createMockProbeResult({ probeId: 'p2', probeKey: 'azure-functions', status: 'error', summary: 'Timeout' }),
              createMockProbeResult({ probeId: 'p3', probeKey: 'azure-search', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p4', probeKey: 'notification-system', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p5', probeKey: 'module-record-health', status: 'healthy' }),
            ],
          }),
          lastRunAt: new Date().toISOString(),
        }}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** All probes healthy, stale data (> 30 min ago) */
export const HealthyStale: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        data={{
          latestSnapshot: createMockProbeSnapshot({
            results: [
              createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p2', probeKey: 'azure-functions', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p3', probeKey: 'azure-search', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p4', probeKey: 'notification-system', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p5', probeKey: 'module-record-health', status: 'healthy' }),
            ],
          }),
          lastRunAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        }}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** Degraded probes with stale data */
export const DegradedStale: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        data={{
          latestSnapshot: createMockProbeSnapshot({
            results: [
              createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'degraded', summary: 'Elevated latency', anomalies: ['Latency > 2s'] }),
              createMockProbeResult({ probeId: 'p2', probeKey: 'azure-functions', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p3', probeKey: 'azure-search', status: 'error', summary: 'Index stale', anomalies: ['Index age > 24h'] }),
              createMockProbeResult({ probeId: 'p4', probeKey: 'notification-system', status: 'healthy' }),
              createMockProbeResult({ probeId: 'p5', probeKey: 'module-record-health', status: 'healthy' }),
            ],
          }),
          lastRunAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        }}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** Error probes with stale data */
export const ErrorStale: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        data={{
          latestSnapshot: createMockProbeSnapshot({
            results: [
              createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'error', summary: 'Connection refused' }),
              createMockProbeResult({ probeId: 'p2', probeKey: 'azure-functions', status: 'error', summary: 'Timeout' }),
              createMockProbeResult({ probeId: 'p3', probeKey: 'azure-search', status: 'error', summary: 'Service unavailable' }),
              createMockProbeResult({ probeId: 'p4', probeKey: 'notification-system', status: 'degraded', summary: 'Partial delivery' }),
              createMockProbeResult({ probeId: 'p5', probeKey: 'module-record-health', status: 'healthy' }),
            ],
          }),
          lastRunAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        }}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

// TODO: Playwright e2e — probe degrade → recovery lifecycle visible on dashboard
