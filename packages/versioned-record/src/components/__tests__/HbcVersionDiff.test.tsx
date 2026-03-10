import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HbcVersionDiff } from '../HbcVersionDiff';
import { VersionApi } from '../../api/VersionApi';

vi.mock('../../api/VersionApi');

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: () => [],
};

const snapA = { snapshotId: 'a', version: 1, tag: 'submitted' as const, snapshot: { totalScore: 42, projectName: 'Alpha' }, createdAt: '2026-01-01T00:00:00Z', createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' }, changeSummary: '' };
const snapB = { snapshotId: 'b', version: 2, tag: 'approved' as const, snapshot: { totalScore: 67, projectName: 'Alpha' }, createdAt: '2026-01-15T00:00:00Z', createdBy: { userId: 'u1', displayName: 'Alice', role: 'Director' }, changeSummary: '' };

describe('HbcVersionDiff', () => {
  beforeEach(() => {
    vi.mocked(VersionApi.getSnapshot).mockImplementation(async (_rt, _id, ver) =>
      ver === 1 ? (snapA as never) : (snapB as never)
    );
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      { snapshotId: 'a', version: 1, tag: 'submitted', createdAt: snapA.createdAt, createdBy: snapA.createdBy, changeSummary: '' },
      { snapshotId: 'b', version: 2, tag: 'approved', createdAt: snapB.createdAt, createdBy: snapB.createdBy, changeSummary: '' },
    ]);
  });

  it('renders side-by-side diff with changed fields', async () => {
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={2}
        config={mockConfig}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('1 field changed')).toBeInTheDocument();
    });
  });

  it('toggles to unified diff mode', async () => {
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={2}
        config={mockConfig}
      />
    );
    await waitFor(() => screen.getByText('Unified'));
    fireEvent.click(screen.getByText('Unified'));
    expect(screen.getByLabelText('Unified diff')).toBeInTheDocument();
  });

  it('displays numeric delta for changed numeric fields', async () => {
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={2}
        config={mockConfig}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('+25')).toBeInTheDocument();
    });
  });

  it('shows "No differences found" when versions are identical', async () => {
    vi.mocked(VersionApi.getSnapshot).mockResolvedValue(snapA as never);
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={1}
        config={mockConfig}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/No differences found/)).toBeInTheDocument();
    });
  });
});
