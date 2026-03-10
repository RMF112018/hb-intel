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
});
