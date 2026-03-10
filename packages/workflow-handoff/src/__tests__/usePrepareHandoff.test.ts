import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePrepareHandoff } from '../hooks/usePrepareHandoff';
import { createMockHandoffConfig } from '../../testing/createMockHandoffConfig';
import type { IBicOwner } from '../types/IWorkflowHandoff';

// ─────────────────────────────────────────────────────────────────────────────
// Test types
// ─────────────────────────────────────────────────────────────────────────────

interface MockSource {
  id: string;
  projectName: string;
  workflowStage: string;
}

interface MockDest {
  projectName: string;
}

const currentUser: IBicOwner = {
  userId: 'user-001',
  displayName: 'Test User',
  role: 'BD Director',
};

let config = createMockHandoffConfig<MockSource, MockDest>();
const defaultSource: MockSource = { id: 'src-001', projectName: 'Test Project', workflowStage: 'approved' };

beforeEach(() => {
  config = createMockHandoffConfig<MockSource, MockDest>();
});

// ─────────────────────────────────────────────────────────────────────────────
// Core behavior
// ─────────────────────────────────────────────────────────────────────────────

describe('usePrepareHandoff', () => {
  it('returns null package when sourceRecord is null', async () => {
    const { result } = renderHook(() =>
      usePrepareHandoff<MockSource, MockDest>(null, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package).toBeNull();
      expect(result.current.preflight).toBeNull();
      expect(result.current.isAssembling).toBe(false);
    });
  });

  it('returns null package when disabled', async () => {
    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser, false)
    );

    await waitFor(() => {
      expect(result.current.package).toBeNull();
    });
  });

  it('produces preflight with isReady=true when validateReadiness returns null', async () => {
    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.preflight).not.toBeNull();
      expect(result.current.preflight?.isReady).toBe(true);
      expect(result.current.preflight?.blockingReason).toBeNull();
      expect(result.current.preflight?.checks).toHaveLength(1);
      expect(result.current.preflight?.checks[0].passed).toBe(true);
    });
  });

  it('produces preflight with isReady=false when validateReadiness returns a reason', async () => {
    config.validateReadiness = () => 'Scorecard must be approved';

    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.preflight?.isReady).toBe(false);
      expect(result.current.preflight?.blockingReason).toBe('Scorecard must be approved');
      expect(result.current.preflight?.checks[0].passed).toBe(false);
      expect(result.current.preflight?.checks[0].label).toBe('Scorecard must be approved');
    });
  });

  it('runs mapSourceToDestination and stores result in package.destinationSeedData', async () => {
    config.mapSourceToDestination = (src) => ({ projectName: src.projectName });

    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package).not.toBeNull();
      expect(result.current.package?.destinationSeedData).toEqual({ projectName: 'Test Project' });
    });
  });

  it('resolves documents asynchronously and stores in package.documents', async () => {
    config.resolveDocuments = async () => [
      { documentId: 'doc-1', fileName: 'f.pdf', sharepointUrl: 'https://sp/f.pdf', category: 'RFP' },
    ];

    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package?.documents).toHaveLength(1);
      expect(result.current.package?.documents[0].fileName).toBe('f.pdf');
    });
  });

  it('falls back to empty documents array when resolveDocuments throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    config.resolveDocuments = async () => { throw new Error('network error'); };

    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package?.documents).toEqual([]);
    });
    warnSpy.mockRestore();
  });

  it('uses resolved recipient when resolveRecipient returns a user', async () => {
    config.resolveRecipient = () => ({
      userId: 'rec-001',
      displayName: 'Recipient',
      role: 'Estimator',
    });

    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package?.recipient.userId).toBe('rec-001');
    });
  });

  it('falls back to currentUser when resolveRecipient returns null', async () => {
    config.resolveRecipient = () => null;

    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package?.recipient.userId).toBe(currentUser.userId);
    });
  });

  it('sets sender to currentUser', async () => {
    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package?.sender).toEqual(currentUser);
    });
  });

  it('assembles correct module metadata from config', async () => {
    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package?.sourceModule).toBe('business-development');
      expect(result.current.package?.sourceRecordType).toBe('bd-scorecard');
      expect(result.current.package?.destinationModule).toBe('estimating');
      expect(result.current.package?.destinationRecordType).toBe('estimating-pursuit');
    });
  });

  it('reassemble() triggers re-assembly', async () => {
    const resolveDocsSpy = vi.fn().mockResolvedValue([]);
    config.resolveDocuments = resolveDocsSpy;

    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package).not.toBeNull();
    });

    const callCountBefore = resolveDocsSpy.mock.calls.length;

    act(() => {
      result.current.reassemble();
    });

    await waitFor(() => {
      expect(resolveDocsSpy.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });

  it('sets isError=true and logs when assembly throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    config.mapSourceToDestination = () => { throw new Error('mapper fail'); };

    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    errorSpy.mockRestore();
  });

  it('falls back to empty string for sourceRecordId when source has no id property', async () => {
    const noIdSource = { projectName: 'NoId', workflowStage: 'approved' } as MockSource;

    const { result } = renderHook(() =>
      usePrepareHandoff(noIdSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package?.sourceRecordId).toBe('');
    });
  });

  it('initializes contextNotes as empty array', async () => {
    const { result } = renderHook(() =>
      usePrepareHandoff(defaultSource, config, currentUser)
    );

    await waitFor(() => {
      expect(result.current.package?.contextNotes).toEqual([]);
    });
  });
});
