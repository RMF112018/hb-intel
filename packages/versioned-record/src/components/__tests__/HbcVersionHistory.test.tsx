import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HbcVersionHistory } from '../HbcVersionHistory';
import { VersionApi } from '../../api/VersionApi';
import { useComplexity } from '@hbc/complexity';

vi.mock('../../api/VersionApi');
vi.mock('@hbc/complexity');

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: () => [],
};

const mockUser = { userId: 'u1', displayName: 'Alice', role: 'Director' };

function renderComponent(overrides = {}) {
  return render(
    <HbcVersionHistory
      recordType="bd-scorecard"
      recordId="rec-1"
      config={mockConfig}
      currentUser={mockUser}
      {...overrides}
    />
  );
}

describe('HbcVersionHistory', () => {
  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' } as never);
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      {
        snapshotId: 'snap-2',
        version: 2,
        tag: 'approved',
        createdAt: '2026-01-15T10:00:00Z',
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'Director' },
        changeSummary: 'Approved for submission',
      },
      {
        snapshotId: 'snap-1',
        version: 1,
        tag: 'submitted',
        createdAt: '2026-01-10T09:00:00Z',
        createdBy: { userId: 'u2', displayName: 'Bob', role: 'PM' },
        changeSummary: 'Initial submission',
      },
    ]);
  });

  it('renders version list entries', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('v2')).toBeInTheDocument();
      expect(screen.getByText('v1')).toBeInTheDocument();
    });
  });

  it('renders tag badges with correct labels', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });
  });

  it('shows rollback CTAs when allowRollback=true and tier=expert', async () => {
    renderComponent({ allowRollback: true });
    await waitFor(() => {
      expect(screen.getAllByText(/Restore to v/)).toHaveLength(2);
    });
  });

  it('hides rollback CTAs when tier=standard', async () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' } as never);
    renderComponent({ allowRollback: true });
    await waitFor(() => {
      expect(screen.queryByText(/Restore to v/)).not.toBeInTheDocument();
    });
  });

  it('opens rollback confirmation modal on CTA click', async () => {
    renderComponent({ allowRollback: true });
    await waitFor(() => screen.getAllByText(/Restore to v/));
    fireEvent.click(screen.getAllByText(/Restore to v/)[0]!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/This will create a new version/)).toBeInTheDocument();
  });

  it('cancels rollback modal without calling VersionApi', async () => {
    renderComponent({ allowRollback: true });
    await waitFor(() => screen.getAllByText(/Restore to v/));
    fireEvent.click(screen.getAllByText(/Restore to v/)[0]!);
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(VersionApi.restoreSnapshot).not.toHaveBeenCalled();
  });

  it('calls VersionApi.restoreSnapshot on modal confirm', async () => {
    vi.mocked(VersionApi.restoreSnapshot).mockResolvedValue({
      restoredSnapshot: { snapshotId: 'snap-3', version: 3 } as never,
      supersededSnapshotIds: ['snap-2'],
    });

    renderComponent({ allowRollback: true });
    await waitFor(() => screen.getAllByText(/Restore to v/));

    // Override getMetadataList for the refresh call after rollback
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([]);

    fireEvent.click(screen.getAllByText(/Restore to v/)[0]!);

    // Click the confirm button inside the dialog (not the list CTA)
    const dialog = screen.getByRole('dialog');
    const confirmButton = dialog.querySelector('.hbc-rollback-modal__confirm') as HTMLElement;
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(VersionApi.restoreSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({ targetSnapshotId: 'snap-2' })
      )
    );
  });

  it('shows "Show archived versions" toggle when superseded versions exist', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      {
        snapshotId: 'snap-1',
        version: 1,
        tag: 'superseded',
        createdAt: '2026-01-01T00:00:00Z',
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
    ]);

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Show archived versions')).toBeInTheDocument();
    });
  });

  it('shows empty history message when metadata is empty', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([]);

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('No versions recorded yet.')).toBeInTheDocument();
    });
  });

  it('fires onVersionSelect callback when entry is clicked', async () => {
    const onVersionSelect = vi.fn();
    renderComponent({ onVersionSelect });
    await waitFor(() => screen.getByText('v2'));

    fireEvent.click(screen.getByLabelText('View version 2'));
    expect(onVersionSelect).toHaveBeenCalledWith(
      expect.objectContaining({ snapshotId: 'snap-2', version: 2 })
    );
  });

  it('shows error state with retry button when API fails', async () => {
    vi.mocked(VersionApi.getMetadataList).mockRejectedValue(new Error('Network error'));

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Failed to load version history/)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('shows rollback error in modal when restoreSnapshot fails', async () => {
    vi.mocked(VersionApi.restoreSnapshot).mockRejectedValue(new Error('Restore failed'));

    renderComponent({ allowRollback: true });
    await waitFor(() => screen.getAllByText(/Restore to v/));

    fireEvent.click(screen.getAllByText(/Restore to v/)[0]!);

    const dialog = screen.getByRole('dialog');
    const confirmButton = dialog.querySelector('.hbc-rollback-modal__confirm') as HTMLElement;
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Restore failed/)).toBeInTheDocument();
    });
  });

  it('displays "1 version" singular when only one entry', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      {
        snapshotId: 'snap-1',
        version: 1,
        tag: 'draft',
        createdAt: '2026-01-10T09:00:00Z',
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: 'Only version',
      },
    ]);

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('1 version')).toBeInTheDocument();
    });
  });

  it('displays change summary when present', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Approved for submission')).toBeInTheDocument();
    });
  });

  it('hides rollback CTA for superseded entries', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      {
        snapshotId: 'snap-1',
        version: 1,
        tag: 'superseded',
        createdAt: '2026-01-01T00:00:00Z',
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
    ]);

    renderComponent({ allowRollback: true });
    await waitFor(() => screen.getByText('Show archived versions'));
    // Click to reveal superseded entries
    fireEvent.click(screen.getByText('Show archived versions'));
    // The superseded entry should NOT have a rollback CTA
    expect(screen.queryByText(/Restore to v/)).not.toBeInTheDocument();
  });

  it('formatRelativeTime renders correct labels for various offsets', async () => {
    // Use standard tier so relative timestamps are displayed (expert shows absolute)
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' } as never);
    const now = Date.now();

    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      {
        snapshotId: 'snap-sec',
        version: 7,
        tag: 'draft',
        createdAt: new Date(now - 30 * 1000).toISOString(), // 30 seconds ago
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
      {
        snapshotId: 'snap-min',
        version: 6,
        tag: 'draft',
        createdAt: new Date(now - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
      {
        snapshotId: 'snap-hour',
        version: 5,
        tag: 'draft',
        createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
      {
        snapshotId: 'snap-day',
        version: 4,
        tag: 'draft',
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
      {
        snapshotId: 'snap-week',
        version: 3,
        tag: 'draft',
        createdAt: new Date(now - 2 * 7 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
      {
        snapshotId: 'snap-month',
        version: 2,
        tag: 'draft',
        createdAt: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString(), // ~2 months ago
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
      {
        snapshotId: 'snap-year',
        version: 1,
        tag: 'draft',
        createdAt: new Date(now - 400 * 24 * 60 * 60 * 1000).toISOString(), // > 1 year ago
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
        changeSummary: '',
      },
    ]);

    renderComponent();
    await waitFor(() => screen.getByText('v7'));

    // Verify that relative time labels are present
    expect(screen.getByText('just now')).toBeInTheDocument();
    expect(screen.getByText('5m ago')).toBeInTheDocument();
    expect(screen.getByText('3h ago')).toBeInTheDocument();
    expect(screen.getByText('3d ago')).toBeInTheDocument();
    expect(screen.getByText('2w ago')).toBeInTheDocument();
    expect(screen.getByText('2mo ago')).toBeInTheDocument();
    expect(screen.getByText('1y ago')).toBeInTheDocument();
  });
});
