import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkSourceHealth } from '../components/HbcMyWorkSourceHealth/index.js';
import type { IMyWorkHealthState } from '../types/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

vi.mock('@hbc/ui-kit', () => ({
  HbcBanner: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
    <div data-testid={`banner-${variant}`}>{children}</div>
  ),
  HbcTypography: ({ children, intent }: { children: React.ReactNode; intent: string }) => (
    <span data-testid={`typography-${intent}`}>{children}</span>
  ),
  HbcStatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid={`status-badge-${variant}`}>{label}</span>
  ),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function createHealthState(overrides?: Partial<IMyWorkHealthState>): IMyWorkHealthState {
  return {
    freshness: 'live',
    hiddenSupersededCount: 0,
    degradedSourceCount: 0,
    warningMessage: null,
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkSourceHealth', () => {
  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
  });

  it('returns null at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const { container } = render(<HbcMyWorkSourceHealth healthState={createHealthState()} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null at standard tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    const { container } = render(<HbcMyWorkSourceHealth healthState={createHealthState()} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when healthState is undefined', () => {
    const { container } = render(<HbcMyWorkSourceHealth />);
    expect(container.innerHTML).toBe('');
  });

  it('renders freshness badge at expert tier', () => {
    render(<HbcMyWorkSourceHealth healthState={createHealthState({ freshness: 'live' })} />);
    expect(screen.getByTestId('status-badge-success')).toHaveTextContent('Live');
  });

  it('renders cached freshness variant', () => {
    render(<HbcMyWorkSourceHealth healthState={createHealthState({ freshness: 'cached' })} />);
    expect(screen.getByTestId('status-badge-info')).toHaveTextContent('Cached');
  });

  it('renders degraded source count when > 0', () => {
    render(<HbcMyWorkSourceHealth healthState={createHealthState({ degradedSourceCount: 3 })} />);
    expect(screen.getByText('3 degraded sources')).toBeInTheDocument();
  });

  it('renders singular degraded source label', () => {
    render(<HbcMyWorkSourceHealth healthState={createHealthState({ degradedSourceCount: 1 })} />);
    expect(screen.getByText('1 degraded source')).toBeInTheDocument();
  });

  it('renders hidden superseded count when > 0', () => {
    render(<HbcMyWorkSourceHealth healthState={createHealthState({ hiddenSupersededCount: 5 })} />);
    expect(screen.getByText('5 hidden superseded')).toBeInTheDocument();
  });

  it('renders warning message when present', () => {
    render(
      <HbcMyWorkSourceHealth
        healthState={createHealthState({ warningMessage: 'Source degraded' })}
      />,
    );
    expect(screen.getByTestId('banner-warning')).toHaveTextContent('Source degraded');
  });

  it('does not render degraded count when 0', () => {
    render(<HbcMyWorkSourceHealth healthState={createHealthState({ degradedSourceCount: 0 })} />);
    expect(screen.queryByText(/degraded/)).not.toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <HbcMyWorkSourceHealth healthState={createHealthState()} className="custom" />,
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});
