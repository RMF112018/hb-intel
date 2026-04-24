/**
 * Wave-02 Prompt-04 closure: SafetyIngestionOutcome never fakes success.
 *
 * `operation.success === true` alone is not enough if the paired
 * committed payload is missing. Review-required is pending/accepted,
 * not complete. Duplicate-suspected is not a clean commit.
 */
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { IngestionRunResult, SafetyIngestionRun } from '@hbc/features-safety';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    ...rest
  }: {
    children: ReactNode;
    to: string;
    params?: Record<string, string>;
  } & Record<string, unknown>) => (
    <a
      href="#"
      data-to={to}
      data-params={params ? JSON.stringify(params) : ''}
      {...rest}
    >
      {children}
    </a>
  ),
}));

import { SafetyIngestionOutcome } from '../components/SafetyIngestionOutcome.js';

function run(overrides: Partial<SafetyIngestionRun> = {}): SafetyIngestionRun {
  return {
    id: 'run-1',
    spItemId: 1,
    title: 'run-1',
    sourceUploadItemId: 1,
    uploadFileName: 'checklist.xlsx',
    validationStatus: 'passed',
    parseStatus: 'passed',
    projectResolutionStatus: 'resolved',
    terminalStatus: 'committed',
    committedEntityIdsJson: '{}',
    runStartedAt: '2026-04-22T00:00:00Z',
    runCompletedAt: '2026-04-22T00:01:00Z',
    attemptNumber: 1,
    ...overrides,
  } as SafetyIngestionRun;
}

describe('SafetyIngestionOutcome false-success guards', () => {
  it('does not render "Inspection committed" when state === committed but result.committed is missing', () => {
    const result = {
      run: run({ terminalStatus: 'committed' }),
      state: 'committed',
    } as IngestionRunResult;
    render(<SafetyIngestionOutcome result={result} />);
    expect(screen.queryByText(/^inspection committed$/i)).toBeNull();
    expect(
      screen.getByText(/ingestion reported committed without a committed payload/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open inspection/i })).toBeNull();
    expect(
      screen.getByRole('link', { name: /open review queue/i }),
    ).toBeInTheDocument();
  });

  it('renders review-required copy (not committed) when the backend returns review-required', () => {
    const result: IngestionRunResult = {
      run: run({ terminalStatus: 'review-required' }),
      state: 'review-required',
    };
    render(<SafetyIngestionOutcome result={result} />);
    expect(screen.queryByText(/^inspection committed$/i)).toBeNull();
    expect(screen.getByRole('heading', { name: /^review required$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open review queue/i })).toBeInTheDocument();
  });

  it('renders duplicate-suspected copy (not clean commit) when duplicate review is required', () => {
    const result: IngestionRunResult = {
      run: run({
        terminalStatus: 'review-required',
        errorClass: 'duplicate-suspected',
      }),
      state: 'review-required',
    };
    render(<SafetyIngestionOutcome result={result} />);
    expect(screen.getByText(/duplicate suspected/i)).toBeInTheDocument();
    expect(screen.queryByText(/^inspection committed$/i)).toBeNull();
  });

  it('renders commit-failed copy (not success) when the backend returns commit-failed', () => {
    const result: IngestionRunResult = {
      run: run({ terminalStatus: 'commit-failed', errorClass: 'commit-error' }),
      state: 'commit-failed',
    };
    render(<SafetyIngestionOutcome result={result} />);
    expect(screen.getByText(/commit failed after successful parse/i)).toBeInTheDocument();
    expect(screen.queryByText(/^inspection committed$/i)).toBeNull();
  });
});
