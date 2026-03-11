/**
 * HbcRelatedItemsTile tests — D-SF14-T07
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HbcRelatedItemsTile } from './HbcRelatedItemsTile.js';
import { createMockRelatedItem } from '../../testing/createMockRelatedItem.js';

// ── Mocks ────────────────────────────────────────────────────────

const mockUseRelatedItems = vi.fn();
vi.mock('../hooks/index.js', () => ({
  useRelatedItems: (...args: unknown[]) => mockUseRelatedItems(...args),
}));

const mockUseComplexity = vi.fn();
vi.mock('@hbc/complexity', () => ({
  useComplexity: () => mockUseComplexity(),
}));

const mockUseCurrentUser = vi.fn();
vi.mock('@hbc/auth', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

// ── Helpers ──────────────────────────────────────────────────────

function createItems(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createMockRelatedItem({
      recordId: `item-${i + 1}`,
      label: `Item ${i + 1}`,
      relationshipLabel: `Relationship ${i + 1}`,
    }),
  );
}

const defaultProps = {
  sourceRecordType: 'bd-scorecard',
  sourceRecordId: 'bd-sc-001',
  sourceRecord: { id: 'bd-sc-001' },
};

describe('HbcRelatedItemsTile', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReturnValue({ roles: [{ name: 'BD Manager' }] });
    mockUseComplexity.mockReturnValue({ tier: 'standard' });
    mockUseRelatedItems.mockReturnValue({
      items: createItems(5),
      groups: {},
      isLoading: false,
      error: null,
    });
  });

  it('renders top-3 items', () => {
    render(<HbcRelatedItemsTile {...defaultProps} />);

    const cards = screen.getAllByTestId('related-items-tile-card');
    expect(cards).toHaveLength(3);
  });

  it('shows "View all (N)" when items > 3', () => {
    render(<HbcRelatedItemsTile {...defaultProps} />);

    const viewAll = screen.getByTestId('related-items-tile-view-all');
    expect(viewAll.textContent).toBe('View all (5)');
  });

  it('onViewAll callback fires on click', () => {
    const onViewAll = vi.fn();
    render(<HbcRelatedItemsTile {...defaultProps} onViewAll={onViewAll} />);

    const viewAllBtn = screen.getByTestId('related-items-tile-view-all');
    fireEvent.click(viewAllBtn);

    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('hidden for essential tier', () => {
    mockUseComplexity.mockReturnValue({ tier: 'essential' });

    const { container } = render(<HbcRelatedItemsTile {...defaultProps} />);
    expect(container.innerHTML).toBe('');
  });

  it('loading state renders placeholder', () => {
    mockUseRelatedItems.mockReturnValue({
      items: [],
      groups: {},
      isLoading: true,
      error: null,
    });

    render(<HbcRelatedItemsTile {...defaultProps} />);
    expect(screen.getByTestId('related-items-tile-loading')).toBeDefined();
  });

  it('empty items returns null', () => {
    mockUseRelatedItems.mockReturnValue({
      items: [],
      groups: {},
      isLoading: false,
      error: null,
    });

    const { container } = render(<HbcRelatedItemsTile {...defaultProps} />);
    expect(container.innerHTML).toBe('');
  });

  it('compact card shows label, icon, and relationship badge', () => {
    mockUseRelatedItems.mockReturnValue({
      items: [createMockRelatedItem({ label: 'Test Project', relationshipLabel: 'Has Project' })],
      groups: {},
      isLoading: false,
      error: null,
    });

    render(<HbcRelatedItemsTile {...defaultProps} />);

    expect(screen.getByTestId('related-items-tile-card-label').textContent).toBe('Test Project');
    expect(screen.getByTestId('related-items-tile-card-badge').textContent).toBe('Has Project');
  });

  it('degraded banner on error with stale data', () => {
    mockUseRelatedItems.mockReturnValue({
      items: createItems(2),
      groups: {},
      isLoading: false,
      error: 'API error',
    });

    render(<HbcRelatedItemsTile {...defaultProps} />);
    expect(screen.getByTestId('related-items-tile-degraded')).toBeDefined();
  });

  it('renders module icon fallback when moduleIcon is empty', () => {
    mockUseRelatedItems.mockReturnValue({
      items: [createMockRelatedItem({ moduleIcon: '', label: 'No Icon Item' })],
      groups: {},
      isLoading: false,
      error: null,
    });

    render(<HbcRelatedItemsTile {...defaultProps} />);
    expect(screen.getByTestId('related-items-tile-card-label').textContent).toBe('No Icon Item');
  });

  it('uses Unknown role fallback when no currentUserRole and user has no roles', () => {
    mockUseCurrentUser.mockReturnValue({ roles: [] });
    mockUseRelatedItems.mockReturnValue({
      items: createItems(1),
      groups: {},
      isLoading: false,
      error: null,
    });

    render(<HbcRelatedItemsTile {...defaultProps} currentUserRole={undefined} />);
    expect(mockUseRelatedItems).toHaveBeenCalledWith(
      expect.objectContaining({ currentUserRole: 'Unknown' }),
    );
  });

  it('uses user role from auth when currentUserRole prop is omitted', () => {
    mockUseCurrentUser.mockReturnValue({ roles: [{ name: 'Superintendent' }] });
    mockUseRelatedItems.mockReturnValue({
      items: createItems(1),
      groups: {},
      isLoading: false,
      error: null,
    });

    render(<HbcRelatedItemsTile {...defaultProps} />);
    expect(mockUseRelatedItems).toHaveBeenCalledWith(
      expect.objectContaining({ currentUserRole: 'Superintendent' }),
    );
  });

  it('does not show "View all" when items <= 3', () => {
    mockUseRelatedItems.mockReturnValue({
      items: createItems(2),
      groups: {},
      isLoading: false,
      error: null,
    });

    render(<HbcRelatedItemsTile {...defaultProps} />);
    expect(screen.queryByTestId('related-items-tile-view-all')).toBeNull();
  });
});
