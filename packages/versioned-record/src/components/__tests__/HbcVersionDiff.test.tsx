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

  it('renders CharDiffDisplay for text field changes', async () => {
    const textSnapA = { ...snapA, snapshot: { projectName: 'Hello world', totalScore: 42 } };
    const textSnapB = { ...snapB, snapshot: { projectName: 'Hello earth', totalScore: 42 } };
    vi.mocked(VersionApi.getSnapshot).mockImplementation(async (_rt, _id, ver) =>
      ver === 1 ? (textSnapA as never) : (textSnapB as never)
    );

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
      // CharDiffDisplay renders <mark> elements for changes
      const marks = document.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
    });
  });

  it('displays error state when getSnapshot rejects', async () => {
    vi.mocked(VersionApi.getSnapshot).mockRejectedValue(new Error('Network failure'));

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
      expect(screen.getByText(/Failed to load diff/)).toBeInTheDocument();
      expect(screen.getByText(/Network failure/)).toBeInTheDocument();
    });
  });

  it('fires onDiffModeChange callback when mode is toggled', async () => {
    const onModeChange = vi.fn();
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={2}
        config={mockConfig}
        onDiffModeChange={onModeChange}
      />
    );
    await waitFor(() => screen.getByText('Unified'));
    fireEvent.click(screen.getByText('Unified'));
    expect(onModeChange).toHaveBeenCalledWith('unified');
  });

  it('renders added field with dash in before column', async () => {
    const addSnapA = { ...snapA, snapshot: { projectName: 'Alpha' } };
    const addSnapB = { ...snapB, snapshot: { projectName: 'Alpha', description: 'New field' } };
    vi.mocked(VersionApi.getSnapshot).mockImplementation(async (_rt, _id, ver) =>
      ver === 1 ? (addSnapA as never) : (addSnapB as never)
    );

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
      // Added fields show a dash in the "before" column
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  it('renders removed field with dash in after column', async () => {
    const remSnapA = { ...snapA, snapshot: { projectName: 'Alpha', legacy: 'old' } };
    const remSnapB = { ...snapB, snapshot: { projectName: 'Alpha' } };
    vi.mocked(VersionApi.getSnapshot).mockImplementation(async (_rt, _id, ver) =>
      ver === 1 ? (remSnapA as never) : (remSnapB as never)
    );

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
      // For removed fields there should be 2 dashes (one in the after column for removed,
      // and possibly one in the added row's before column)
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('toggles "Show unchanged fields" button text on click', async () => {
    render(
      <HbcVersionDiff
        recordType="bd-scorecard"
        recordId="rec-1"
        versionA={1}
        versionB={2}
        config={mockConfig}
      />
    );
    await waitFor(() => screen.getByText('Show unchanged fields'));
    fireEvent.click(screen.getByText('Show unchanged fields'));
    expect(screen.getByText('Hide unchanged fields')).toBeInTheDocument();
  });
});
