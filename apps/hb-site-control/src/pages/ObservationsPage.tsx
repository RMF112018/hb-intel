/**
 * ObservationsPage — Procore-like observations list.
 * Foundation Plan Phase 6 — Blueprint §2i.
 * Touch-optimized data table with mock observation data.
 */
import type { ReactNode } from 'react';
import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { makeStyles } from '@griffel/react';
import { HbcDataTable, HbcStatusBadge, HbcCommandBar, WorkspacePageShell } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
});

interface Observation {
  id: string;
  title: string;
  type: 'Safety' | 'Quality' | 'Environmental' | 'General';
  status: 'Open' | 'In Progress' | 'Closed' | 'Overdue';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignee: string;
  date: string;
  location: string;
}

const STATUS_VARIANT: Record<Observation['status'], StatusVariant> = {
  Open: 'pending',
  'In Progress': 'inProgress',
  Closed: 'completed',
  Overdue: 'critical',
};

const PRIORITY_VARIANT: Record<Observation['priority'], StatusVariant> = {
  Critical: 'critical',
  High: 'error',
  Medium: 'warning',
  Low: 'info',
};

const MOCK_OBSERVATIONS: Observation[] = [
  { id: 'OBS-001', title: 'Missing guardrail — Level 3 east', type: 'Safety', status: 'Open', priority: 'Critical', assignee: 'Mike Torres', date: '2026-03-03', location: 'Level 3 East' },
  { id: 'OBS-002', title: 'Concrete curing temperature out of range', type: 'Quality', status: 'In Progress', priority: 'High', assignee: 'Sarah Chen', date: '2026-03-02', location: 'Foundation B' },
  { id: 'OBS-003', title: 'Dust control measures needed', type: 'Environmental', status: 'Open', priority: 'Medium', assignee: 'James Wilson', date: '2026-03-02', location: 'Site Perimeter' },
  { id: 'OBS-004', title: 'Fire extinguisher expired — Zone C', type: 'Safety', status: 'Overdue', priority: 'High', assignee: 'Lisa Park', date: '2026-02-28', location: 'Zone C Storage' },
  { id: 'OBS-005', title: 'Housekeeping — debris on walkway', type: 'General', status: 'Open', priority: 'Low', assignee: 'Tom Richards', date: '2026-03-03', location: 'Main Access Road' },
  { id: 'OBS-006', title: 'Scaffold inspection overdue', type: 'Safety', status: 'Overdue', priority: 'Critical', assignee: 'Mike Torres', date: '2026-02-25', location: 'Level 4 North' },
  { id: 'OBS-007', title: 'Welding fume extraction inadequate', type: 'Environmental', status: 'In Progress', priority: 'Medium', assignee: 'David Kim', date: '2026-03-01', location: 'Steel Shop' },
  { id: 'OBS-008', title: 'Rebar placement deviation noted', type: 'Quality', status: 'Closed', priority: 'Low', assignee: 'Sarah Chen', date: '2026-02-27', location: 'Foundation A' },
  { id: 'OBS-009', title: 'Crane swing radius encroachment', type: 'Safety', status: 'Open', priority: 'High', assignee: 'James Wilson', date: '2026-03-03', location: 'Tower Crane 1' },
  { id: 'OBS-010', title: 'PPE violation — no hard hat', type: 'Safety', status: 'In Progress', priority: 'Medium', assignee: 'Lisa Park', date: '2026-03-02', location: 'Level 2 West' },
];

const columnHelper = createColumnHelper<Observation>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    size: 90,
  }),
  columnHelper.accessor('title', {
    header: 'Observation',
    size: 250,
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    size: 100,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    size: 110,
    cell: (info) => {
      const val = info.getValue();
      return <HbcStatusBadge variant={STATUS_VARIANT[val]} label={val} size="small" />;
    },
  }),
  columnHelper.accessor('priority', {
    header: 'Priority',
    size: 100,
    cell: (info) => {
      const val = info.getValue();
      return <HbcStatusBadge variant={PRIORITY_VARIANT[val]} label={val} size="small" />;
    },
  }),
  columnHelper.accessor('assignee', {
    header: 'Assignee',
    size: 130,
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    size: 100,
  }),
];

export function ObservationsPage(): ReactNode {
  const styles = useStyles();
  const [searchValue, setSearchValue] = useState('');

  const filtered = MOCK_OBSERVATIONS.filter(
    (obs) =>
      obs.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      obs.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      obs.assignee.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <WorkspacePageShell layout="list" title="Observations">
      <div className={styles.container}>
        <HbcCommandBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search observations..."
          actions={[
            { key: 'new', label: 'New Observation', primary: true, onClick: () => {} },
          ]}
        />
        <HbcDataTable
          data={filtered}
          columns={columns as ColumnDef<Observation, unknown>[]}
          enableSorting
          height="calc(100vh - 280px)"
        />
      </div>
    </WorkspacePageShell>
  );
}
