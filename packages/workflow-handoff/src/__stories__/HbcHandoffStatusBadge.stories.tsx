import type { Meta, StoryObj } from '@storybook/react';
import { vi } from 'vitest';
import { HbcHandoffStatusBadge } from '../components/HbcHandoffStatusBadge';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ tier: 'standard' }),
}));

// ─── Meta ───────────────────────────────────────────────────────────────────

const meta: Meta<typeof HbcHandoffStatusBadge> = {
  title: 'WorkflowHandoff/HbcHandoffStatusBadge',
  component: HbcHandoffStatusBadge,
  args: {
    handoffId: 'hoff-001',
    lastUpdatedAt: '2026-01-15T09:05:00Z',
  },
};

export default meta;
type Story = StoryObj<typeof HbcHandoffStatusBadge>;

// ─── Stories ────────────────────────────────────────────────────────────────

export const Draft: Story = {
  args: { status: 'draft' },
};

export const Sent: Story = {
  args: { status: 'sent' },
};

export const Received: Story = {
  args: { status: 'received' },
};

export const Acknowledged: Story = {
  args: { status: 'acknowledged' },
};

export const Rejected: Story = {
  args: { status: 'rejected' },
};
