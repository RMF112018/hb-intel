import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HbcHandoffStatusBadge } from '../components/HbcHandoffStatusBadge';
import type { HandoffStatus } from '../types/IWorkflowHandoff';

// Mock @hbc/complexity
vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(() => ({ tier: 'standard' })),
}));

// Access the mock for per-test overrides
import { useComplexity } from '@hbc/complexity';

beforeEach(() => {
  vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' } as ReturnType<typeof useComplexity>);
});

describe('HbcHandoffStatusBadge', () => {
  it('returns null when status is null', () => {
    const { container } = render(
      <HbcHandoffStatusBadge handoffId={null} status={null} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null in essential complexity mode', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' } as ReturnType<typeof useComplexity>);

    const { container } = render(
      <HbcHandoffStatusBadge handoffId="h1" status="draft" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders "Handoff Draft" label for draft status', () => {
    render(<HbcHandoffStatusBadge handoffId="h1" status="draft" />);
    expect(screen.getByText('Handoff Draft')).toBeInTheDocument();
  });

  it('renders "Awaiting Acknowledgment" label for sent status', () => {
    render(<HbcHandoffStatusBadge handoffId="h1" status="sent" />);
    expect(screen.getByText('Awaiting Acknowledgment')).toBeInTheDocument();
  });

  it('renders "Viewed by Recipient" label for received status', () => {
    render(<HbcHandoffStatusBadge handoffId="h1" status="received" />);
    expect(screen.getByText('Viewed by Recipient')).toBeInTheDocument();
  });

  it('renders "Handoff Acknowledged" label for acknowledged status', () => {
    render(<HbcHandoffStatusBadge handoffId="h1" status="acknowledged" />);
    expect(screen.getByText('Handoff Acknowledged')).toBeInTheDocument();
  });

  it('renders "Handoff Rejected — Revision Required" label for rejected status', () => {
    render(<HbcHandoffStatusBadge handoffId="h1" status="rejected" />);
    expect(screen.getByText('Handoff Rejected — Revision Required')).toBeInTheDocument();
  });

  it('applies correct color class for each status', () => {
    const statusColorMap: Record<HandoffStatus, string> = {
      draft: 'grey',
      sent: 'blue',
      received: 'blue',
      acknowledged: 'green',
      rejected: 'red',
    };

    for (const [status, color] of Object.entries(statusColorMap)) {
      const { container } = render(
        <HbcHandoffStatusBadge handoffId="h1" status={status as HandoffStatus} />
      );
      const badge = container.querySelector('.hbc-handoff-status-badge');
      expect(badge).toHaveClass(`hbc-handoff-status-badge--${color}`);
    }
  });

  it('shows timestamp in expert mode when lastUpdatedAt is provided', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' } as ReturnType<typeof useComplexity>);

    render(
      <HbcHandoffStatusBadge
        handoffId="h1"
        status="sent"
        lastUpdatedAt="2026-01-15T09:05:00Z"
      />
    );

    const timestamp = document.querySelector('.hbc-handoff-status-badge__timestamp');
    expect(timestamp).toBeInTheDocument();
    expect(timestamp?.getAttribute('datetime')).toBe('2026-01-15T09:05:00Z');
  });

  it('does not show timestamp in standard mode', () => {
    render(
      <HbcHandoffStatusBadge
        handoffId="h1"
        status="sent"
        lastUpdatedAt="2026-01-15T09:05:00Z"
      />
    );

    const timestamp = document.querySelector('.hbc-handoff-status-badge__timestamp');
    expect(timestamp).not.toBeInTheDocument();
  });

  it('respects forceVariant override', () => {
    // Context is standard but forceVariant is expert
    render(
      <HbcHandoffStatusBadge
        handoffId="h1"
        status="sent"
        lastUpdatedAt="2026-01-15T09:05:00Z"
        forceVariant="expert"
      />
    );

    const timestamp = document.querySelector('.hbc-handoff-status-badge__timestamp');
    expect(timestamp).toBeInTheDocument();
  });

  it('sets data-handoff-id and data-status attributes', () => {
    render(<HbcHandoffStatusBadge handoffId="h1" status="draft" />);

    const badge = document.querySelector('.hbc-handoff-status-badge');
    expect(badge?.getAttribute('data-handoff-id')).toBe('h1');
    expect(badge?.getAttribute('data-status')).toBe('draft');
  });

  it('sets aria-label to the status label', () => {
    render(<HbcHandoffStatusBadge handoffId="h1" status="draft" />);

    const badge = document.querySelector('.hbc-handoff-status-badge');
    expect(badge?.getAttribute('aria-label')).toBe('Handoff Draft');
  });
});
