import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkOfflineBanner } from '../components/HbcMyWorkOfflineBanner/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

vi.mock('@hbc/ui-kit/icons', () => ({
  CloudOffline: (props: Record<string, unknown>) => (
    <svg data-testid="cloud-offline-icon" data-size={props.size} />
  ),
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcBanner: ({ children, variant, className }: { children: React.ReactNode; variant: string; className?: string; icon?: React.ReactNode }) => (
    <div data-testid="banner" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

const mockUseMyWorkOfflineState = vi.fn();

vi.mock('../hooks/useMyWorkOfflineState.js', () => ({
  useMyWorkOfflineState: (...args: unknown[]) => mockUseMyWorkOfflineState(...args),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkOfflineBanner', () => {
  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockUseMyWorkOfflineState.mockReturnValue({
      offlineState: {
        isOnline: true,
        lastSuccessfulSyncIso: '',
        cachedItemCount: 0,
        queuedActionCount: 0,
        queuedActions: [],
      },
      triggerSync: vi.fn(),
    });
  });

  it('returns null when online', () => {
    const { container } = render(<HbcMyWorkOfflineBanner />);
    expect(container.innerHTML).toBe('');
  });

  it('renders warning banner when offline', () => {
    mockUseMyWorkOfflineState.mockReturnValue({
      offlineState: {
        isOnline: false,
        lastSuccessfulSyncIso: '',
        cachedItemCount: 0,
        queuedActionCount: 0,
        queuedActions: [],
      },
      triggerSync: vi.fn(),
    });
    render(<HbcMyWorkOfflineBanner />);
    expect(screen.getByTestId('banner')).toHaveAttribute('data-variant', 'warning');
  });

  it('shows simple offline message in essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    mockUseMyWorkOfflineState.mockReturnValue({
      offlineState: {
        isOnline: false,
        lastSuccessfulSyncIso: '2026-01-15T10:00:00.000Z',
        cachedItemCount: 5,
        queuedActionCount: 2,
        queuedActions: [],
      },
      triggerSync: vi.fn(),
    });
    render(<HbcMyWorkOfflineBanner />);
    expect(screen.getByText('You are offline')).toBeInTheDocument();
  });

  it('shows sync time and queued count in standard tier', () => {
    mockUseMyWorkOfflineState.mockReturnValue({
      offlineState: {
        isOnline: false,
        lastSuccessfulSyncIso: new Date(Date.now() - 5 * 60_000).toISOString(),
        cachedItemCount: 5,
        queuedActionCount: 2,
        queuedActions: [],
      },
      triggerSync: vi.fn(),
    });
    render(<HbcMyWorkOfflineBanner />);
    const text = screen.getByTestId('banner').textContent;
    expect(text).toContain('Last synced');
    expect(text).toContain('2 actions queued');
  });

  it('shows singular action text for 1 queued action', () => {
    mockUseMyWorkOfflineState.mockReturnValue({
      offlineState: {
        isOnline: false,
        lastSuccessfulSyncIso: new Date(Date.now() - 60_000).toISOString(),
        cachedItemCount: 1,
        queuedActionCount: 1,
        queuedActions: [],
      },
      triggerSync: vi.fn(),
    });
    render(<HbcMyWorkOfflineBanner />);
    const text = screen.getByTestId('banner').textContent;
    expect(text).toContain('1 action queued');
    expect(text).not.toContain('actions');
  });

  it('shows queued action listing in expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    mockUseMyWorkOfflineState.mockReturnValue({
      offlineState: {
        isOnline: false,
        lastSuccessfulSyncIso: new Date(Date.now() - 120_000).toISOString(),
        cachedItemCount: 3,
        queuedActionCount: 2,
        queuedActions: [
          { actionKey: 'mark-read', workItemId: 'work-001', payload: null, queuedAtIso: '2026-01-15T10:00:00.000Z' },
          { actionKey: 'defer', workItemId: 'work-002', payload: null, queuedAtIso: '2026-01-15T10:01:00.000Z' },
        ],
      },
      triggerSync: vi.fn(),
    });
    render(<HbcMyWorkOfflineBanner />);
    expect(screen.getByText(/mark-read — work-001/)).toBeInTheDocument();
    expect(screen.getByText(/defer — work-002/)).toBeInTheDocument();
  });

  it('does not show action listing in standard tier even with queued actions', () => {
    mockUseMyWorkOfflineState.mockReturnValue({
      offlineState: {
        isOnline: false,
        lastSuccessfulSyncIso: new Date(Date.now() - 60_000).toISOString(),
        cachedItemCount: 3,
        queuedActionCount: 1,
        queuedActions: [
          { actionKey: 'defer', workItemId: 'work-001', payload: null, queuedAtIso: '2026-01-15T10:00:00.000Z' },
        ],
      },
      triggerSync: vi.fn(),
    });
    render(<HbcMyWorkOfflineBanner />);
    expect(screen.queryByText(/defer — work-001/)).not.toBeInTheDocument();
  });
});
