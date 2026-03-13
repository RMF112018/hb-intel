import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HbcThemeProvider } from '@hbc/ui-kit';
import {
  PostBidAutopsyApi,
  resetPostBidAutopsyStateStore,
  setPostBidAutopsyApi,
} from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyOwner,
  createMockAutopsyRecordSnapshot,
  createMockPostBidAutopsyRecord,
} from '@hbc/post-bid-autopsy/testing';
import type { BusinessDevelopmentAutopsyListRow } from './displayModel.js';

import { AutopsyListView } from './AutopsyListView.js';

vi.mock('@hbc/ui-kit', async () => {
  const actual = await vi.importActual<typeof import('@hbc/ui-kit')>('@hbc/ui-kit');
  return {
    ...actual,
    HbcTextField: ({
      label,
      value,
      onChange,
    }: {
      label: string;
      value?: string;
      onChange?: (value: string) => void;
    }) => (
      <label>
        {label}
        <input
          aria-label={label}
          value={value ?? ''}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </label>
    ),
    HbcSelect: ({
      label,
      value,
      onChange,
      options,
    }: {
      label: string;
      value?: string;
      onChange?: (value: string) => void;
      options: Array<{ value: string; label: string }>;
    }) => (
      <label>
        {label}
        <select
          aria-label={label}
          value={value ?? ''}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    ),
    HbcTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    HbcPanel: ({
      open,
      title,
      children,
    }: {
      open: boolean;
      title: string;
      children: React.ReactNode;
    }) => (open ? <div><div>{title}</div>{children}</div> : null),
    HbcDataTable: ({
      data,
      columns,
      onRowClick,
      emptyStateConfig,
    }: {
      data: BusinessDevelopmentAutopsyListRow[];
      columns: Array<{
        id?: string;
        header?: string;
        accessorKey?: string;
        cell?: (args: { row: { original: BusinessDevelopmentAutopsyListRow } }) => React.ReactNode;
      }>;
      onRowClick?: (row: BusinessDevelopmentAutopsyListRow) => void;
      emptyStateConfig?: { title: string; description?: string };
    }) => (
      <div>
        <div>
          {columns.map((column) => (
            <span key={column.id ?? column.accessorKey}>{column.header}</span>
          ))}
        </div>
        {data.length === 0 && emptyStateConfig ? <div>{emptyStateConfig.title}</div> : null}
        {data.map((row) => (
          <button key={row.autopsyId} type="button" onClick={() => onRowClick?.(row)}>
            {columns.map((column) => (
              <span key={`${row.autopsyId}-${column.id ?? column.accessorKey}`}>
                {column.cell
                  ? column.cell({ row: { original: row } })
                  : column.accessorKey
                    ? String((row as Record<string, unknown>)[column.accessorKey] ?? '')
                    : null}
              </span>
            ))}
          </button>
        ))}
      </div>
    ),
  };
});

const renderWithTheme = (node: React.ReactElement) =>
  render(<HbcThemeProvider>{node}</HbcThemeProvider>);

const seedApi = () => {
  const api = new PostBidAutopsyApi();

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'autopsy-ready',
        pursuitId: 'pursuit-ready',
        outcome: 'won',
        status: 'approved',
        confidence: {
          tier: 'high',
          score: 0.92,
          reasons: ['Corroborated'],
          evidenceCoverage: 1,
        },
        evidence: [
          {
            evidenceId: 'e-1',
            type: 'cost-artifact',
            sourceRef: 'pricing',
            capturedBy: 'user-1',
            capturedAt: '2026-03-13T00:00:00.000Z',
            sensitivity: 'internal',
          },
          {
            evidenceId: 'e-2',
            type: 'client-signal',
            sourceRef: 'client',
            capturedBy: 'user-1',
            capturedAt: '2026-03-13T00:00:00.000Z',
            sensitivity: 'internal',
          },
        ],
        rootCauseTags: [
          { tagId: 'rc-1', domain: 'pricing', label: 'Pricing discipline', normalizedCode: 'pricing-discipline' },
        ],
        disagreements: [],
        publicationGate: {
          publishable: true,
          blockers: [],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
        telemetry: {
          autopsyCompletionLatency: 2,
          repeatErrorReductionRate: 0.4,
          intelligenceSeedingConversionRate: 0.6,
          benchmarkAccuracyLift: 0.2,
          corroborationRate: 0.9,
          staleIntelligenceRate: 0,
          revalidationLatency: 0,
          reinsertionAdoptionRate: 0.7,
          autopsyCes: 0.8,
        },
      }),
    })
  );

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'autopsy-corroboration',
        pursuitId: 'pursuit-corroboration',
        outcome: 'lost',
        status: 'review',
        confidence: {
          tier: 'low',
          score: 0.32,
          reasons: ['Weak evidence'],
          evidenceCoverage: 0.4,
        },
        evidence: [],
        rootCauseTags: [
          { tagId: 'rc-2', domain: 'client', label: 'Client timing', normalizedCode: 'client-timing' },
        ],
        disagreements: [],
        publicationGate: {
          publishable: false,
          blockers: ['needs-more-evidence'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
      }),
      assignments: {
        primaryAuthor: createMockAutopsyOwner({ displayName: 'Alex Reviewer', role: 'BD Lead' }),
        coAuthors: [],
        chiefEstimator: createMockAutopsyOwner({ displayName: 'Chief Estimator', role: 'Chief Estimator' }),
      },
    })
  );

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'autopsy-stale',
        pursuitId: 'pursuit-stale',
        outcome: 'lost',
        status: 'overdue',
        confidence: {
          tier: 'moderate',
          score: 0.71,
          reasons: ['Needs revalidation'],
          evidenceCoverage: 1,
        },
        evidence: [
          {
            evidenceId: 'e-3',
            type: 'client-signal',
            sourceRef: 'stale',
            capturedBy: 'user-2',
            capturedAt: '2026-03-13T00:00:00.000Z',
            sensitivity: 'internal',
          },
          {
            evidenceId: 'e-4',
            type: 'field-observation',
            sourceRef: 'field',
            capturedBy: 'user-2',
            capturedAt: '2026-03-13T00:00:00.000Z',
            sensitivity: 'internal',
          },
        ],
        rootCauseTags: [
          { tagId: 'rc-3', domain: 'market', label: 'Market shift', normalizedCode: 'market-shift' },
        ],
        disagreements: [],
        publicationGate: {
          publishable: false,
          blockers: ['stale-intelligence'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
        telemetry: {
          autopsyCompletionLatency: 5,
          repeatErrorReductionRate: 0.1,
          intelligenceSeedingConversionRate: 0.2,
          benchmarkAccuracyLift: 0.15,
          corroborationRate: 0.55,
          staleIntelligenceRate: 0.6,
          revalidationLatency: 4,
          reinsertionAdoptionRate: 0.2,
          autopsyCes: 0.4,
        },
      }),
    })
  );

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'autopsy-conflict',
        pursuitId: 'pursuit-conflict',
        outcome: 'no-bid',
        status: 'superseded',
        confidence: {
          tier: 'moderate',
          score: 0.61,
          reasons: ['Override required'],
          evidenceCoverage: 1,
        },
        evidence: [
          {
            evidenceId: 'e-5',
            type: 'other',
            sourceRef: 'other',
            capturedBy: 'user-3',
            capturedAt: '2026-03-13T00:00:00.000Z',
            sensitivity: 'restricted-project',
          },
          {
            evidenceId: 'e-6',
            type: 'interview-note',
            sourceRef: 'note',
            capturedBy: 'user-3',
            capturedAt: '2026-03-13T00:00:00.000Z',
            sensitivity: 'restricted-project',
          },
        ],
        disagreements: [
          {
            disagreementId: 'd-1',
            criterion: 'pricing',
            participants: ['A', 'B'],
            summary: 'Open disagreement',
            escalationRequired: true,
            resolutionStatus: 'open',
          },
        ],
        overrideGovernance: {
          overrideReason: 'Manual publication review',
          overriddenBy: 'governance-1',
          overriddenAt: '2026-03-13T00:00:00.000Z',
          approvalRequired: true,
          approvedBy: null,
          approvedAt: null,
        },
        supersession: {
          supersededByAutopsyId: 'autopsy-ready',
          reason: 'Validated replacement',
        },
        publicationGate: {
          publishable: false,
          blockers: ['override-pending'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
      }),
    })
  );

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'autopsy-archived',
        pursuitId: 'pursuit-archived',
        outcome: 'lost',
        status: 'archived',
        confidence: {
          tier: 'moderate',
          score: 0.51,
          reasons: ['Archived'],
          evidenceCoverage: 1,
        },
        disagreements: [],
        evidence: [
          {
            evidenceId: 'e-7',
            type: 'other',
            sourceRef: 'archive',
            capturedBy: 'user-4',
            capturedAt: '2026-03-13T00:00:00.000Z',
            sensitivity: 'internal',
          },
          {
            evidenceId: 'e-8',
            type: 'other',
            sourceRef: 'archive-2',
            capturedBy: 'user-4',
            capturedAt: '2026-03-13T00:00:00.000Z',
            sensitivity: 'internal',
          },
        ],
        publicationGate: {
          publishable: false,
          blockers: ['archived'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
      }),
    })
  );

  setPostBidAutopsyApi('bd-list', api);
};

describe('AutopsyListView', () => {
  beforeEach(() => {
    resetPostBidAutopsyStateStore();
    seedApi();
  });

  it('renders role-scoped rows, triage queues, markers, and accessible deep links', async () => {
    renderWithTheme(
      <AutopsyListView
        apiScope="bd-list"
        viewerRole="business-development"
        pursuitMetadata={[
          { pursuitId: 'pursuit-ready', pursuitName: 'Ready Pursuit', clientName: 'Client A', projectType: 'Healthcare' },
          { pursuitId: 'pursuit-corroboration', pursuitName: 'Corroboration Pursuit', clientName: 'Client B', projectType: 'Commercial' },
          { pursuitId: 'pursuit-stale', pursuitName: 'Stale Pursuit', clientName: 'Client C', projectType: 'Industrial' },
          { pursuitId: 'pursuit-conflict', pursuitName: 'Conflict Pursuit', clientName: 'Client D', projectType: 'Industrial' },
          { pursuitId: 'pursuit-archived', pursuitName: 'Archived Pursuit', clientName: 'Client E', projectType: 'Healthcare' },
        ]}
        buildWizardLink={(row) => ({ linkId: `wizard:${row.autopsyId}`, label: `Open wizard for ${row.pursuitName}`, href: `/wizard/${row.pursuitId}` })}
        buildSummaryLink={(row) => ({ linkId: `summary:${row.autopsyId}`, label: `Open summary for ${row.pursuitName}`, href: `/summary/${row.pursuitId}` })}
        buildRelatedItemsLink={(row) => ({ linkId: `related:${row.autopsyId}`, label: `Open related items for ${row.pursuitName}`, href: `/related/${row.pursuitId}` })}
      />,
    );

    expect(screen.getByText('Needs corroboration 1')).toBeInTheDocument();
    expect(screen.getByText('Ready to publish 1')).toBeInTheDocument();
    expect(screen.getByText('Stale backlog 1')).toBeInTheDocument();
    expect(screen.getByText('Conflict review 1')).toBeInTheDocument();

    expect(screen.getAllByText('Superseded').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Archived').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Disagreement open').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Manual override').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Ready Pursuit'));
    await waitFor(() => {
      expect(screen.getByText('Autopsy detail: Ready Pursuit')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Open wizard for Ready Pursuit' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open summary for Ready Pursuit' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open related items for Ready Pursuit' })).toBeInTheDocument();
  });

  it('supports deterministic search and queue filtering', async () => {
    renderWithTheme(
      <AutopsyListView
        apiScope="bd-list"
        pursuitMetadata={[
          { pursuitId: 'pursuit-ready', pursuitName: 'Ready Pursuit', projectType: 'Healthcare' },
          { pursuitId: 'pursuit-corroboration', pursuitName: 'Corroboration Pursuit', projectType: 'Commercial' },
          { pursuitId: 'pursuit-stale', pursuitName: 'Stale Pursuit', projectType: 'Industrial' },
          { pursuitId: 'pursuit-conflict', pursuitName: 'Conflict Pursuit', projectType: 'Industrial' },
          { pursuitId: 'pursuit-archived', pursuitName: 'Archived Pursuit', projectType: 'Healthcare' },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText('Search autopsies'), {
      target: { value: 'stale' },
    });
    await waitFor(() => {
      expect(screen.getByText('Stale Pursuit')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Search autopsies'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by triage queue' }), {
      target: { value: 'conflict-review' },
    });
    await waitFor(() => {
      expect(screen.getByText('Conflict Pursuit')).toBeInTheDocument();
    });
  });
});
