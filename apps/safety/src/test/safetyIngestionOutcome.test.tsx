/**
 * Phase-04 audit G-03 — post-submit outcome zone (behavior-first).
 *
 * Renders SafetyIngestionOutcome for every terminal ingestion state and
 * asserts the authored title, status badge, framing sections, and CTA
 * target — the CTA href is proof that the outcome routes honestly to an
 * existing router entry using data already present on IngestionRunResult.
 */
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { IngestionRunResult, SafetyIngestionRun } from '@hbc/features-safety';

// Replace tanstack-router Link with a plain anchor that echoes to / params
// as attributes so we can assert route targets behaviorally.
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

function committedResult(overrides?: {
  projectNumber?: string | null;
  weekStartDate?: string | null;
}): IngestionRunResult {
  const projectNumber = overrides?.projectNumber ?? 'P-1234';
  const weekStartDate = overrides?.weekStartDate ?? '2026-04-20';
  return {
    run: run({ terminalStatus: 'committed' }),
    state: 'committed',
    committed: {
      inspectionEvent: {
        id: 'inspection-42',
        inspectionScore: 0.92,
      } as unknown as IngestionRunResult['committed'] extends infer C
        ? C extends { inspectionEvent: infer I }
          ? I
          : never
        : never,
      projectWeekRecord: {
        id: 'pwr-1',
        projectNumber: projectNumber ?? '',
        weekStartDate: weekStartDate ?? '',
      } as unknown as NonNullable<IngestionRunResult['committed']>['projectWeekRecord'],
      findings: [],
    },
  } as IngestionRunResult;
}

describe('SafetyIngestionOutcome — per-state outcomes + honest routes', () => {
  it('committed: shows success title + primary Open-inspection CTA using the inspection id', () => {
    const result = committedResult();
    render(<SafetyIngestionOutcome result={result} />);

    expect(screen.getByText(/inspection committed/i)).toBeInTheDocument();
    const primary = screen.getByRole('link', { name: /open inspection/i });
    expect(primary).toHaveAttribute('data-to', '/inspections/$inspectionEventId');
    expect(primary.getAttribute('data-params')).toContain('inspection-42');
  });

  it('committed: renders the reporting-period drill-in CTA only when projectNumber and weekStartDate are present', () => {
    const result = committedResult();
    render(<SafetyIngestionOutcome result={result} />);
    const secondary = screen.getByRole('link', {
      name: /open reporting-period rollup/i,
    });
    expect(secondary).toHaveAttribute('data-to', '/projects/$projectNumber/weeks/$weekStartDate');
    const params = JSON.parse(secondary.getAttribute('data-params') ?? '{}');
    expect(params).toEqual({ projectNumber: 'P-1234', weekStartDate: '2026-04-20' });
  });

  it('committed: omits the secondary drill-in CTA when projectNumber is missing on the result', () => {
    const result = committedResult({ projectNumber: '' });
    render(<SafetyIngestionOutcome result={result} />);
    expect(
      screen.queryByRole('link', { name: /open reporting-period rollup/i }),
    ).toBeNull();
  });

  it('committed: omits the secondary drill-in CTA when weekStartDate is missing on the result', () => {
    const result = committedResult({ weekStartDate: '' });
    render(<SafetyIngestionOutcome result={result} />);
    expect(
      screen.queryByRole('link', { name: /open reporting-period rollup/i }),
    ).toBeNull();
  });

  it('review-required (duplicate-suspected): authored duplicate title + Review-queue CTA', () => {
    const result: IngestionRunResult = {
      run: run({
        terminalStatus: 'review-required',
        errorClass: 'duplicate-suspected',
      }),
      state: 'review-required',
    };
    render(<SafetyIngestionOutcome result={result} />);

    expect(screen.getByText(/duplicate suspected/i)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /open review queue/i });
    expect(cta).toHaveAttribute('data-to', '/review');
  });

  it('review-required (non-duplicate): generic review-required title + Review-queue CTA', () => {
    const result: IngestionRunResult = {
      run: run({ terminalStatus: 'review-required' }),
      state: 'review-required',
    };
    render(<SafetyIngestionOutcome result={result} />);

    expect(screen.getByRole('heading', { name: /^review required$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open review queue/i })).toHaveAttribute(
      'data-to',
      '/review',
    );
  });

  it('unresolved-project: surfaces the attempted project text + routes to Review queue', () => {
    const result: IngestionRunResult = {
      run: run({
        terminalStatus: 'unresolved-project',
        errorClass: 'project-unresolved',
        attemptedProjectSiteText: 'FakeSite / 9999',
      }),
      state: 'unresolved-project',
    };
    render(<SafetyIngestionOutcome result={result} />);

    expect(screen.getByText(/project could not be resolved/i)).toBeInTheDocument();
    expect(screen.getByText(/FakeSite \/ 9999/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open review queue/i })).toHaveAttribute(
      'data-to',
      '/review',
    );
  });

  it('reporting-period-mismatch: authored title + Review-queue CTA', () => {
    const result: IngestionRunResult = {
      run: run({
        terminalStatus: 'reporting-period-mismatch',
        errorClass: 'reporting-period-mismatch',
      }),
      state: 'reporting-period-mismatch',
    };
    render(<SafetyIngestionOutcome result={result} />);

    expect(screen.getByText(/reporting period mismatch/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open review queue/i })).toHaveAttribute(
      'data-to',
      '/review',
    );
  });

  it('parse-error: surfaces detected template version + Review-queue CTA', () => {
    const result: IngestionRunResult = {
      run: run({
        terminalStatus: 'parse-error',
        errorClass: 'parse-error',
        templateVersionDetected: 'v1.0.3',
      }),
      state: 'parse-error',
    };
    render(<SafetyIngestionOutcome result={result} />);

    expect(screen.getByText(/could not be parsed/i)).toBeInTheDocument();
    expect(screen.getByText(/v1\.0\.3/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open review queue/i })).toHaveAttribute(
      'data-to',
      '/review',
    );
  });

  it('invalid-template: authored "not supported" title + detected version + Review-queue CTA', () => {
    const result: IngestionRunResult = {
      run: run({
        terminalStatus: 'invalid-template',
        errorClass: 'template-invalid',
        templateVersionDetected: 'v0.9',
      }),
      state: 'invalid-template',
    };
    render(<SafetyIngestionOutcome result={result} />);

    expect(screen.getByText(/template version not supported/i)).toBeInTheDocument();
    expect(screen.getByText(/v0\.9/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open review queue/i })).toHaveAttribute(
      'data-to',
      '/review',
    );
  });

  it('commit-failed: authored commit-failure framing + Review-queue CTA', () => {
    const result: IngestionRunResult = {
      run: run({
        terminalStatus: 'commit-failed',
        errorClass: 'commit-error',
        errorSummary: 'write to InspectionEvents timed out',
      }),
      state: 'commit-failed',
    };
    render(<SafetyIngestionOutcome result={result} />);

    expect(screen.getByText(/commit failed after successful parse/i)).toBeInTheDocument();
    expect(screen.getByText(/write to InspectionEvents timed out/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open review queue/i })).toHaveAttribute(
      'data-to',
      '/review',
    );
  });

  it('renders the three authored framing labels for every state', () => {
    const result: IngestionRunResult = {
      run: run({ terminalStatus: 'parse-error' }),
      state: 'parse-error',
    };
    render(<SafetyIngestionOutcome result={result} />);
    expect(screen.getByText(/what happened/i)).toBeInTheDocument();
    expect(screen.getByText(/what it means/i)).toBeInTheDocument();
    expect(screen.getByText(/what to do next/i)).toBeInTheDocument();
  });

  it('shows attempt marker when run is a replay (attemptNumber > 1)', () => {
    const result: IngestionRunResult = {
      run: run({ terminalStatus: 'review-required', attemptNumber: 3 }),
      state: 'review-required',
    };
    render(<SafetyIngestionOutcome result={result} />);
    expect(screen.getByText(/attempt 3/i)).toBeInTheDocument();
  });
});
