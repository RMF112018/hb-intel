/**
 * Phase-04 audit G-05 — per-entry triage card (behavior-first).
 *
 * Verifies that SafetyReviewEntryCard surfaces the authored reason-to-action
 * framing for each terminal cause, that the governed supersede path is
 * reachable only for duplicate-suspected entries, and that the existing
 * SafetyReviewActions confirm-dialog flow is preserved unchanged.
 */
import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ReviewQueueEntry } from '@hbc/features-safety';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...rest }: { children: ReactNode; to?: string } & Record<string, unknown>) => (
    <a data-to={to ?? ''} {...rest}>
      {children}
    </a>
  ),
}));

import { SafetyReviewEntryCard } from '../components/SafetyReviewEntryCard.js';

function entry(overrides: {
  runId?: string;
  terminalStatus?: string;
  errorClass?: string;
  attemptNumber?: number;
  templateVersionDetected?: string;
  attemptedProjectSiteText?: string;
  errorSummary?: string;
  projectNumber?: string;
  inspectionEventId?: string;
}): ReviewQueueEntry {
  const id = overrides.runId ?? 'run-42';
  return {
    run: {
      id,
      spItemId: 1,
      title: id,
      sourceUploadItemId: 1,
      uploadFileName: 'checklist.xlsx',
      validationStatus: 'failed',
      parseStatus: 'failed',
      projectResolutionStatus: 'skipped',
      terminalStatus: (overrides.terminalStatus ?? 'review-required') as ReviewQueueEntry['run']['terminalStatus'],
      committedEntityIdsJson: '{}',
      errorClass: overrides.errorClass as ReviewQueueEntry['run']['errorClass'],
      runStartedAt: '2026-04-22T00:00:00Z',
      runCompletedAt: '2026-04-22T00:01:00Z',
      attemptNumber: overrides.attemptNumber ?? 1,
      templateVersionDetected: overrides.templateVersionDetected,
      attemptedProjectSiteText: overrides.attemptedProjectSiteText,
      errorSummary: overrides.errorSummary,
    } as ReviewQueueEntry['run'],
    inspectionEventId: overrides.inspectionEventId,
    projectNumber: overrides.projectNumber ?? 'P-1234',
    projectNameSnapshot: 'HB Tower A',
    reason: 'Review required',
  };
}

describe('SafetyReviewEntryCard — triage framing + preserved supersede discipline', () => {
  it('renders project context, file + run id, and status badge', () => {
    render(
      <SafetyReviewEntryCard
        entry={entry({ terminalStatus: 'parse-error', projectNumber: 'P-0099' })}
        isPending={false}
        onRetry={() => {}}
      />,
    );

    expect(screen.getByRole('heading', { name: /P-0099/ })).toBeInTheDocument();
    expect(screen.getByText('HB Tower A')).toBeInTheDocument();
    expect(screen.getByText(/checklist\.xlsx/)).toBeInTheDocument();
    expect(screen.getByText(/Run run-42/)).toBeInTheDocument();
    expect(screen.getByText('parse-error')).toBeInTheDocument();
  });

  it('renders authored "why it’s here" + "what the action does" framing rows', () => {
    render(
      <SafetyReviewEntryCard
        entry={entry({ terminalStatus: 'parse-error' })}
        isPending={false}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/why it.s here/i)).toBeInTheDocument();
    expect(screen.getByText(/what the action does/i)).toBeInTheDocument();
  });

  it('surfaces template version diagnostic on parse-error', () => {
    render(
      <SafetyReviewEntryCard
        entry={entry({
          terminalStatus: 'parse-error',
          templateVersionDetected: 'v1.0.4',
        })}
        isPending={false}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/template version detected/i)).toBeInTheDocument();
    expect(screen.getByText('v1.0.4')).toBeInTheDocument();
  });

  it('surfaces attempted project text on unresolved-project', () => {
    render(
      <SafetyReviewEntryCard
        entry={entry({
          terminalStatus: 'unresolved-project',
          attemptedProjectSiteText: 'Site / 9999',
        })}
        isPending={false}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/attempted project/i)).toBeInTheDocument();
    expect(screen.getByText('Site / 9999')).toBeInTheDocument();
  });

  it('surfaces adapter error summary on commit-failed', () => {
    render(
      <SafetyReviewEntryCard
        entry={entry({
          terminalStatus: 'commit-failed',
          errorSummary: 'InspectionEvents write threw 429',
        })}
        isPending={false}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/adapter reported/i)).toBeInTheDocument();
    expect(screen.getByText(/InspectionEvents write threw 429/)).toBeInTheDocument();
  });

  it('shows an attempt marker when the run is a replay', () => {
    render(
      <SafetyReviewEntryCard
        entry={entry({ attemptNumber: 4 })}
        isPending={false}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/attempt 4/i)).toBeInTheDocument();
  });

  it('duplicate-suspected: supersede path is reachable and opens the governed confirm dialog', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <SafetyReviewEntryCard
        entry={entry({
          terminalStatus: 'review-required',
          errorClass: 'duplicate-suspected',
        })}
        isPending={false}
        onRetry={onRetry}
      />,
    );

    const supersede = screen.getByRole('button', { name: /^supersede & commit$/i });
    await user.click(supersede);

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    // Mutation must NOT fire until the governed confirm.
    expect(onRetry).not.toHaveBeenCalled();

    // Confirm via the dialog's confirm button.
    await user.click(within(dialog).getByRole('button', { name: /supersede & commit/i }));
    expect(onRetry).toHaveBeenCalledWith('run-42', true);
  });

  it('non-duplicate: supersede action is NOT reachable', () => {
    render(
      <SafetyReviewEntryCard
        entry={entry({ terminalStatus: 'review-required' })}
        isPending={false}
        onRetry={() => {}}
      />,
    );
    expect(
      screen.queryByRole('button', { name: /^supersede & commit$/i }),
    ).toBeNull();
    expect(screen.getByRole('button', { name: /^retry$/i })).toBeInTheDocument();
  });

  it('retry button fires onRetry with supersedePrior=false (single-click, no dialog)', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <SafetyReviewEntryCard
        entry={entry({ terminalStatus: 'review-required' })}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    await user.click(screen.getByRole('button', { name: /^retry$/i }));
    expect(onRetry).toHaveBeenCalledWith('run-42', false);
  });
});
