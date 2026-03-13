import React, { useMemo, useState } from 'react';
import type { ColumnDef } from '@hbc/ui-kit';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcDataTable,
  HbcEmptyState,
  HbcPanel,
  HbcSelect,
  HbcStatusBadge,
  HbcTextField,
  HbcTooltip,
  HbcTypography,
} from '@hbc/ui-kit';
import { getPostBidAutopsyApi } from '@hbc/post-bid-autopsy';

import { businessDevelopmentPostBidLearningProfile } from '../profiles/index.js';
import { mapPostBidAutopsyToBusinessDevelopmentView } from '../adapters/index.js';
import {
  type AutopsyComplexityTier,
  type AutopsyDeepLink,
  type AutopsyListPursuitMetadata,
  type BusinessDevelopmentAutopsyListRow,
  type BusinessDevelopmentAutopsyViewerRole,
  createBusinessDevelopmentListRows,
  formatOutcomeLabel,
  formatStatusLabel,
  getOwnershipLabel,
  toConfidenceVariant,
  toLifecycleVariant,
  toOutcomeVariant,
} from './displayModel.js';

export interface AutopsyListViewProps {
  readonly apiScope?: string;
  readonly viewerRole?: BusinessDevelopmentAutopsyViewerRole;
  readonly complexityTier?: AutopsyComplexityTier;
  readonly pursuitMetadata?: readonly AutopsyListPursuitMetadata[];
  readonly buildWizardLink?: (row: BusinessDevelopmentAutopsyListRow) => AutopsyDeepLink;
  readonly buildSummaryLink?: (row: BusinessDevelopmentAutopsyListRow) => AutopsyDeepLink;
  readonly buildRelatedItemsLink?: (row: BusinessDevelopmentAutopsyListRow) => AutopsyDeepLink;
}

const DEFAULT_LINK = (row: BusinessDevelopmentAutopsyListRow, label: string): AutopsyDeepLink => ({
  linkId: `${label}:${row.autopsyId}`,
  label,
});

const styles = {
  shell: {
    display: 'grid',
    gap: '16px',
  },
  filters: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  } satisfies React.CSSProperties,
  badges: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    alignItems: 'center',
  },
  detail: {
    display: 'grid',
    gap: '12px',
  } satisfies React.CSSProperties,
  links: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
};

const renderDeepLink = (link: AutopsyDeepLink) => {
  if (link.href) {
    return (
      <a key={link.linkId} href={link.href} aria-label={link.label}>
        {link.label}
      </a>
    );
  }

  return (
    <button key={link.linkId} type="button" onClick={link.onClick} aria-label={link.label}>
      {link.label}
    </button>
  );
};

export const AutopsyListView: React.FC<AutopsyListViewProps> = ({
  apiScope,
  viewerRole = 'business-development',
  complexityTier = 'Standard',
  pursuitMetadata = [],
  buildWizardLink = (row) => DEFAULT_LINK(row, `Open wizard for ${row.pursuitName}`),
  buildSummaryLink = (row) => DEFAULT_LINK(row, `Open summary for ${row.pursuitName}`),
  buildRelatedItemsLink = (row) => DEFAULT_LINK(row, `Open related items for ${row.pursuitName}`),
}) => {
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [queueFilter, setQueueFilter] = useState('all');
  const [sortValue, setSortValue] = useState('due-date-desc');
  const [selectedRow, setSelectedRow] = useState<BusinessDevelopmentAutopsyListRow | null>(null);

  const records = useMemo(() => getPostBidAutopsyApi(apiScope).listRecords(), [apiScope]);
  const metadataByPursuit = useMemo(
    () => new Map(pursuitMetadata.map((item) => [item.pursuitId, item])),
    [pursuitMetadata]
  );
  const views = useMemo(
    () =>
      new Map(
        records.map((record) => [
          record.autopsy.autopsyId,
          mapPostBidAutopsyToBusinessDevelopmentView(record.autopsy, businessDevelopmentPostBidLearningProfile),
        ])
      ),
    [records]
  );

  const rows = useMemo(
    () => createBusinessDevelopmentListRows(records, views, metadataByPursuit, viewerRole),
    [metadataByPursuit, records, viewerRole, views]
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const nextRows = rows.filter((row) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        row.pursuitName.toLowerCase().includes(normalizedSearch) ||
        row.primaryFactor.toLowerCase().includes(normalizedSearch) ||
        row.topReusableFinding.toLowerCase().includes(normalizedSearch);

      return (
        matchesSearch &&
        (outcomeFilter === 'all' || row.outcome === outcomeFilter) &&
        (statusFilter === 'all' || row.status === statusFilter) &&
        (confidenceFilter === 'all' || row.confidenceTier === confidenceFilter) &&
        (projectTypeFilter === 'all' || row.projectType === projectTypeFilter) &&
        (queueFilter === 'all' || row.queueMemberships.includes(queueFilter as BusinessDevelopmentAutopsyListRow['queueMemberships'][number]))
      );
    });

    return [...nextRows].sort((left, right) => {
      switch (sortValue) {
        case 'due-date-asc':
          return left.dueDate.localeCompare(right.dueDate);
        case 'confidence-desc':
          return right.blockerCount - left.blockerCount;
        case 'confidence-asc':
          return left.blockerCount - right.blockerCount;
        case 'project-type':
          return left.projectType.localeCompare(right.projectType);
        case 'due-date-desc':
        default:
          return right.dueDate.localeCompare(left.dueDate);
      }
    });
  }, [confidenceFilter, outcomeFilter, projectTypeFilter, queueFilter, rows, search, sortValue, statusFilter]);

  const queueCounts = useMemo(
    () => ({
      corroboration: rows.filter((row) => row.queueMemberships.includes('needs-corroboration')).length,
      publish: rows.filter((row) => row.queueMemberships.includes('ready-to-publish')).length,
      stale: rows.filter((row) => row.queueMemberships.includes('stale-needs-revalidation')).length,
      conflict: rows.filter((row) => row.queueMemberships.includes('conflict-review')).length,
    }),
    [rows]
  );

  const columns = useMemo<ColumnDef<BusinessDevelopmentAutopsyListRow>[]>(
    () => [
      {
        accessorKey: 'pursuitName',
        header: 'Pursuit',
        cell: ({ row }) => (
          <div>
            <div>{row.original.pursuitName}</div>
            <div>{row.original.projectType}</div>
          </div>
        ),
      },
      {
        accessorKey: 'outcome',
        header: 'Outcome',
        cell: ({ row }) => (
          <HbcStatusBadge
            variant={toOutcomeVariant(row.original.outcome)}
            label={formatOutcomeLabel(row.original.outcome)}
          />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <div style={styles.badges}>
            <HbcStatusBadge
              variant={toLifecycleVariant(row.original.status)}
              label={formatStatusLabel(row.original.status)}
            />
            {row.original.markers.map((marker) => (
              <HbcTooltip key={marker} content={marker}>
                <span>{marker}</span>
              </HbcTooltip>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'confidenceTier',
        header: 'Confidence',
        cell: ({ row }) => (
          <HbcStatusBadge
            variant={toConfidenceVariant(row.original.confidenceTier)}
            label={`Confidence ${row.original.confidenceTier}`}
          />
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => row.original.dueDate.slice(0, 10),
      },
      {
        accessorKey: 'owners',
        header: 'Owners',
        cell: ({ row }) => row.original.owners.join(', '),
      },
      {
        accessorKey: 'queueMemberships',
        header: 'Queues',
        cell: ({ row }) => row.original.queueMemberships.join(', '),
      },
    ],
    []
  );

  if (rows.length === 0) {
    return (
      <HbcEmptyState
        title="No post-bid autopsies are available."
        description="Create or replay SF22 autopsy records before reviewing the list view."
      />
    );
  }

  return (
    <div style={styles.shell} data-testid="bd-autopsy-list-view">
      <HbcCard
        header={<HbcTypography intent="heading3">AutopsyListView</HbcTypography>}
      >
        <div style={styles.badges}>
          <HbcStatusBadge variant="warning" label={`Needs corroboration ${queueCounts.corroboration}`} />
          <HbcStatusBadge variant="success" label={`Ready to publish ${queueCounts.publish}`} />
          <HbcStatusBadge variant="error" label={`Stale backlog ${queueCounts.stale}`} />
          <HbcStatusBadge variant="info" label={`Conflict review ${queueCounts.conflict}`} />
          <HbcTypography intent="bodySmall">Role scope: {viewerRole}</HbcTypography>
          <HbcTypography intent="bodySmall">Complexity: {complexityTier}</HbcTypography>
        </div>
      </HbcCard>

      {queueCounts.stale > 0 ? (
        <HbcBanner variant="warning">
          Revalidation backlog is visible in text and badge state for {queueCounts.stale} autopsy row(s).
        </HbcBanner>
      ) : null}

      <HbcCard header={<HbcTypography intent="heading3">Filters and triage</HbcTypography>}>
        <div style={styles.filters}>
          <HbcTextField label="Search autopsies" value={search} onChange={setSearch} />
          <HbcSelect
            label="Filter by outcome"
            value={outcomeFilter}
            onChange={setOutcomeFilter}
            options={[
              { label: 'All outcomes', value: 'all' },
              { label: 'Won', value: 'won' },
              { label: 'Lost', value: 'lost' },
              { label: 'No-Bid', value: 'no-bid' },
            ]}
          />
          <HbcSelect
            label="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All statuses', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Review', value: 'review' },
              { label: 'Approved', value: 'approved' },
              { label: 'Published', value: 'published' },
              { label: 'Superseded', value: 'superseded' },
              { label: 'Archived', value: 'archived' },
              { label: 'Overdue', value: 'overdue' },
            ]}
          />
          <HbcSelect
            label="Filter by confidence"
            value={confidenceFilter}
            onChange={setConfidenceFilter}
            options={[
              { label: 'All confidence', value: 'all' },
              { label: 'High', value: 'high' },
              { label: 'Moderate', value: 'moderate' },
              { label: 'Low', value: 'low' },
              { label: 'Unreliable', value: 'unreliable' },
            ]}
          />
          <HbcSelect
            label="Filter by project type"
            value={projectTypeFilter}
            onChange={setProjectTypeFilter}
            options={[
              { label: 'All project types', value: 'all' },
              ...[...new Set(rows.map((row) => row.projectType))].map((projectType) => ({
                label: projectType,
                value: projectType,
              })),
            ]}
          />
          <HbcSelect
            label="Filter by triage queue"
            value={queueFilter}
            onChange={setQueueFilter}
            options={[
              { label: 'All queues', value: 'all' },
              { label: 'Needs corroboration', value: 'needs-corroboration' },
              { label: 'Ready to publish', value: 'ready-to-publish' },
              { label: 'Stale needs revalidation', value: 'stale-needs-revalidation' },
              { label: 'Conflict review', value: 'conflict-review' },
            ]}
          />
          <HbcSelect
            label="Sort rows"
            value={sortValue}
            onChange={setSortValue}
            options={[
              { label: 'Due date descending', value: 'due-date-desc' },
              { label: 'Due date ascending', value: 'due-date-asc' },
              { label: 'Confidence risk descending', value: 'confidence-desc' },
              { label: 'Confidence risk ascending', value: 'confidence-asc' },
              { label: 'Project type', value: 'project-type' },
            ]}
          />
        </div>
      </HbcCard>

      <HbcDataTable
        data={filteredRows}
        columns={columns}
        height="420px"
        enableSorting
        onRowClick={(row) => setSelectedRow(row)}
        emptyStateConfig={{
          title: 'No autopsies match the current filters.',
          description: 'Adjust outcome, status, confidence, project type, date, or queue filters.',
        }}
      />

      <HbcPanel
        open={selectedRow != null}
        onClose={() => setSelectedRow(null)}
        title={selectedRow ? `Autopsy detail: ${selectedRow.pursuitName}` : 'Autopsy detail'}
      >
        {selectedRow ? (
          <div style={styles.detail}>
            <HbcTypography intent="body">{selectedRow.detailSummary}</HbcTypography>
            <div style={styles.badges}>
              <HbcStatusBadge variant={toLifecycleVariant(selectedRow.status)} label={formatStatusLabel(selectedRow.status)} />
              <HbcStatusBadge variant={toConfidenceVariant(selectedRow.confidenceTier)} label={`Confidence ${selectedRow.confidenceTier}`} />
              <HbcStatusBadge variant={toOutcomeVariant(selectedRow.outcome)} label={formatOutcomeLabel(selectedRow.outcome)} />
            </div>
            <HbcTypography intent="bodySmall">
              Owners: {selectedRow.owners.join(', ')}. Escalations: {selectedRow.escalationTargets.join(', ') || 'None'}.
            </HbcTypography>
            <HbcTypography intent="bodySmall">
              Publication blockers: {selectedRow.blockerCount}. Evidence count: {selectedRow.evidenceCount}.
            </HbcTypography>
            <div style={styles.links}>
              {renderDeepLink(buildWizardLink(selectedRow))}
              {renderDeepLink(buildSummaryLink(selectedRow))}
              {renderDeepLink(buildRelatedItemsLink(selectedRow))}
            </div>
          </div>
        ) : null}
      </HbcPanel>
    </div>
  );
};
