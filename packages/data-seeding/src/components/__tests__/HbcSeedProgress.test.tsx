import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HbcSeedProgress } from '../HbcSeedProgress';
import { createMockSeedResult, mockSeedStatuses } from '@hbc/data-seeding/testing';

vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(() => ({ tier: 'standard', variant: 'default' })),
}));

const { useComplexity } = await vi.importMock<typeof import('@hbc/complexity')>('@hbc/complexity');

describe('HbcSeedProgress', () => {
  const onRetryErrors = vi.fn();
  const onReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useComplexity.mockReturnValue({ tier: 'standard', variant: 'default' });
  });

  it('renders progress bar with correct segments during importing', () => {
    render(
      <HbcSeedProgress
        totalRows={100}
        importedRows={50}
        errorRows={10}
        status={mockSeedStatuses.importing}
        result={null}
        onReset={onReset}
      />
    );

    expect(screen.getByTestId('hbc-seed-progress-bar')).toBeDefined();
    expect(screen.getByTestId('hbc-seed-progress-bar-success')).toBeDefined();
    expect(screen.getByTestId('hbc-seed-progress-bar-error')).toBeDefined();
  });

  it('shows imported count during importing', () => {
    render(
      <HbcSeedProgress
        totalRows={100}
        importedRows={50}
        errorRows={0}
        status={mockSeedStatuses.importing}
        result={null}
      />
    );

    expect(screen.getByTestId('hbc-seed-progress-counts').textContent).toContain('50');
  });

  it('shows result summary on complete', () => {
    const result = createMockSeedResult({ errorCount: 0, successCount: 50 });

    render(
      <HbcSeedProgress
        totalRows={50}
        importedRows={50}
        errorRows={0}
        status={mockSeedStatuses.complete}
        result={result}
        onReset={onReset}
      />
    );

    expect(screen.getByTestId('hbc-seed-progress-result')).toBeDefined();
    expect(screen.getByTestId('hbc-seed-progress-reset-button')).toBeDefined();
  });

  it('shows retry button for partial status when onRetryErrors provided', () => {
    const result = createMockSeedResult();

    render(
      <HbcSeedProgress
        totalRows={50}
        importedRows={48}
        errorRows={2}
        status={mockSeedStatuses.partial}
        result={result}
        onRetryErrors={onRetryErrors}
        onReset={onReset}
      />
    );

    expect(screen.getByTestId('hbc-seed-progress-retry-button')).toBeDefined();
  });

  it('shows error report download link when errors exist with source doc', () => {
    const result = createMockSeedResult();

    render(
      <HbcSeedProgress
        totalRows={50}
        importedRows={48}
        errorRows={2}
        status={mockSeedStatuses.partial}
        result={result}
        onRetryErrors={onRetryErrors}
        onReset={onReset}
      />
    );

    expect(screen.getByTestId('hbc-seed-progress-error-report-link')).toBeDefined();
  });

  it('renders per-batch detail in Expert complexity (D-05)', () => {
    useComplexity.mockReturnValue({ tier: 'expert', variant: 'default' });

    render(
      <HbcSeedProgress
        totalRows={100}
        importedRows={50}
        errorRows={0}
        status={mockSeedStatuses.importing}
        result={null}
      />
    );

    expect(screen.getByTestId('hbc-seed-progress-batch-detail')).toBeDefined();
  });

  it('shows failed message on failed status', () => {
    const result = createMockSeedResult({ successCount: 0, errorCount: 50 });

    render(
      <HbcSeedProgress
        totalRows={50}
        importedRows={0}
        errorRows={50}
        status={mockSeedStatuses.failed}
        result={result}
        onReset={onReset}
      />
    );

    expect(screen.getByText(/Import failed/)).toBeDefined();
  });

  it('shows skipped count when result has skipped rows', () => {
    const result = createMockSeedResult({ skippedCount: 5 });

    render(
      <HbcSeedProgress
        totalRows={55}
        importedRows={48}
        errorRows={2}
        status={mockSeedStatuses.partial}
        result={result}
        onRetryErrors={onRetryErrors}
        onReset={onReset}
      />
    );

    expect(screen.getByText(/5 skipped/)).toBeDefined();
  });

  it('does not show progress bar in idle state', () => {
    render(
      <HbcSeedProgress
        totalRows={0}
        importedRows={0}
        errorRows={0}
        status={mockSeedStatuses.idle}
        result={null}
      />
    );

    expect(screen.queryByTestId('hbc-seed-progress-bar')).toBeNull();
  });
});
