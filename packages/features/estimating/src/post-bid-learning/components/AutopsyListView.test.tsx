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
import type { EstimatingAutopsyListRow } from './displayModel.js';

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
      data: EstimatingAutopsyListRow[];
      columns: Array<{
        id?: string;
        header?: string;
        accessorKey?: string;
        cell?: (args: { row: { original: EstimatingAutopsyListRow } }) => React.ReactNode;
      }>;
      onRowClick?: (row: EstimatingAutopsyListRow) => void;
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
        autopsyId: 'est-ready',
        pursuitId: 'est-pursuit-ready',
        outcome: 'won',
        status: 'approved',
        confidence: {
          tier: 'high',
          score: 0.91,
          reasons: ['Validated cost evidence'],
          evidenceCoverage: 1,
        },
        disagreements: [],
        evidence: [
          { evidenceId: 'e-1', type: 'cost-artifact', sourceRef: 'cost', capturedBy: 'u1', capturedAt: '2026-03-13T00:00:00.000Z', sensitivity: 'internal' },
          { evidenceId: 'e-2', type: 'field-observation', sourceRef: 'field', capturedBy: 'u1', capturedAt: '2026-03-13T00:00:00.000Z', sensitivity: 'internal' },
        ],
        publicationGate: {
          publishable: true,
          blockers: [],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
      }),
      assignments: {
        primaryAuthor: createMockAutopsyOwner({ displayName: 'Morgan Reviewer', role: 'Estimator' }),
        coAuthors: [],
        chiefEstimator: createMockAutopsyOwner({ displayName: 'Chief Estimator', role: 'Chief Estimator' }),
      },
    })
  );

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'est-conflict',
        pursuitId: 'est-pursuit-conflict',
        outcome: 'lost',
        status: 'superseded',
        confidence: {
          tier: 'low',
          score: 0.35,
          reasons: ['Weak pricing evidence'],
          evidenceCoverage: 0.5,
        },
        evidence: [],
        disagreements: [
          {
            disagreementId: 'd-1',
            criterion: 'pricing',
            participants: ['Estimator', 'Reviewer'],
            summary: 'Open disagreement',
            escalationRequired: false,
            resolutionStatus: 'open',
          },
        ],
        overrideGovernance: {
          overrideReason: 'Chief review',
          overriddenBy: 'chief-1',
          overriddenAt: '2026-03-13T00:00:00.000Z',
          approvalRequired: true,
          approvedBy: null,
          approvedAt: null,
        },
        supersession: {
          supersededByAutopsyId: 'est-ready',
        },
        publicationGate: {
          publishable: false,
          blockers: ['needs-pricing-evidence'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
        telemetry: {
          autopsyCompletionLatency: 4,
          repeatErrorReductionRate: 0.1,
          intelligenceSeedingConversionRate: 0.1,
          benchmarkAccuracyLift: 0.1,
          corroborationRate: 0.3,
          staleIntelligenceRate: 0.4,
          revalidationLatency: 3,
          reinsertionAdoptionRate: 0,
          autopsyCes: 0.4,
        },
      }),
      assignments: {
        primaryAuthor: createMockAutopsyOwner({ displayName: 'Riley Estimator', role: 'Estimator' }),
        coAuthors: [],
        chiefEstimator: createMockAutopsyOwner({ displayName: 'Chief Estimator', role: 'Chief Estimator' }),
      },
    })
  );

  setPostBidAutopsyApi('estimating-list', api);
};

describe('AutopsyListView', () => {
  beforeEach(() => {
    resetPostBidAutopsyStateStore();
    seedApi();
  });

  it('renders estimating-specific list queues, markers, and accessible deep links', async () => {
    renderWithTheme(
      <AutopsyListView
        apiScope="estimating-list"
        viewerRole="chief-estimator"
        pursuitMetadata={[
          { pursuitId: 'est-pursuit-ready', pursuitName: 'Ready Estimate', estimatorName: 'Morgan Reviewer', projectType: 'Healthcare' },
          { pursuitId: 'est-pursuit-conflict', pursuitName: 'Conflict Estimate', estimatorName: 'Riley Estimator', projectType: 'Commercial' },
        ]}
        buildWizardLink={(row) => ({ linkId: `wizard:${row.autopsyId}`, label: `Open wizard for ${row.pursuitName}`, href: `/wizard/${row.pursuitId}` })}
        buildSummaryLink={(row) => ({ linkId: `summary:${row.autopsyId}`, label: `Open summary for ${row.pursuitName}`, href: `/summary/${row.pursuitId}` })}
        buildRelatedItemsLink={(row) => ({ linkId: `related:${row.autopsyId}`, label: `Open related items for ${row.pursuitName}`, href: `/related/${row.pursuitId}` })}
      />,
    );

    expect(screen.getByText('Ready to publish 1')).toBeInTheDocument();
    expect(screen.getByText('Conflict review 1')).toBeInTheDocument();
    expect(screen.getAllByText('Superseded').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Manual override').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Ready Estimate'));
    await waitFor(() => {
      expect(screen.getByText('Autopsy detail: Ready Estimate')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Open wizard for Ready Estimate' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open summary for Ready Estimate' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open related items for Ready Estimate' })).toBeInTheDocument();
  });
});
