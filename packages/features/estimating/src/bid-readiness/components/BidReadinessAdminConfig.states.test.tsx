import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { estimatingBidReadinessProfile } from '../profiles/index.js';
import type { UseBidReadinessAdminConfigResult } from '../../types/index.js';
import { BidReadinessAdminConfig } from './BidReadinessAdminConfig.js';

const { useBidReadinessAdminConfigMock } = vi.hoisted(() => ({
  useBidReadinessAdminConfigMock: vi.fn(),
}));

vi.mock('../hooks/index.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBidReadinessAdminConfig: useBidReadinessAdminConfigMock,
  };
});

function createMockResult(
  overrides: Partial<UseBidReadinessAdminConfigResult>,
): UseBidReadinessAdminConfigResult {
  const draft = {
    profile: estimatingBidReadinessProfile,
    checklistDefinitions: [],
    governance: {
      governanceState: 'approved' as const,
      recordedAt: '2026-03-12T00:00:00.000Z',
      recordedBy: 'test-user',
      traceId: 'trace-1',
      telemetryKeys: [],
    },
    version: {
      recordId: 'profile',
      version: 1,
      updatedAt: '2026-03-12T00:00:00.000Z',
      updatedBy: 'test-user',
    },
  };

  return {
    state: 'success',
    snapshot: draft,
    draft,
    validationErrors: [],
    isLoading: false,
    isDegraded: false,
    error: null,
    setCriterionWeight: vi.fn(),
    setCriterionBlocker: vi.fn(),
    setThreshold: vi.fn(),
    saveDraft: vi.fn(() => draft),
    resetDraft: vi.fn(),
    ...overrides,
  };
}

describe('BidReadinessAdminConfig states', () => {
  it('renders loading/error/empty branches deterministically', () => {
    useBidReadinessAdminConfigMock.mockReturnValue(createMockResult({
      state: 'loading',
      draft: null,
      snapshot: null,
      isLoading: true,
    }));
    const { rerender } = render(<BidReadinessAdminConfig />);
    expect(screen.getByTestId('admin-config-loading')).toBeInTheDocument();

    useBidReadinessAdminConfigMock.mockReturnValue(createMockResult({
      state: 'error',
      draft: null,
      snapshot: null,
      error: new Error('failed'),
    }));
    rerender(<BidReadinessAdminConfig />);
    expect(screen.getByTestId('admin-config-error')).toBeInTheDocument();

    useBidReadinessAdminConfigMock.mockReturnValue(createMockResult({
      state: 'empty',
      draft: null,
      snapshot: null,
    }));
    rerender(<BidReadinessAdminConfig />);
    expect(screen.getByTestId('admin-config-empty')).toBeInTheDocument();
  });

  it('renders degraded and validation-error branches', () => {
    useBidReadinessAdminConfigMock.mockReturnValue(createMockResult({
      state: 'degraded',
      isDegraded: true,
      validationErrors: ['threshold ordering invalid'],
    }));

    render(<BidReadinessAdminConfig />);
    expect(screen.getByTestId('admin-config-degraded')).toBeInTheDocument();
    expect(screen.getByTestId('admin-config-validation-errors')).toBeInTheDocument();
  });
});
