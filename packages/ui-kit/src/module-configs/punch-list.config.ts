/**
 * Punch List Module Config — PH4.13 §13.7
 * Blueprint §1d — Punch list / deficiency tracking
 */
import { createColumnHelper } from '@tanstack/react-table';
import type { ModuleLandingConfig, ModuleDetailConfig } from './types.js';

type PunchRow = Record<string, unknown>;
const col = createColumnHelper<PunchRow>();

export const punchListLanding: ModuleLandingConfig<PunchRow> = {
  toolName: 'Punch List',
  table: {
    columns: [
      col.accessor('itemNumber', { header: 'Item #', size: 90 }),
      col.accessor('description', { header: 'Description', size: 250 }),
      col.accessor('status', { header: 'Status', size: 120 }),
      col.accessor('priority', { header: 'Priority', size: 100 }),
      col.accessor('assigneeId', { header: 'Assignee', size: 150 }),
      col.accessor('location', { header: 'Location', size: 150 }),
      col.accessor('dueDate', { header: 'Due Date', size: 120 }),
      col.accessor('trade', { header: 'Trade', size: 120 }),
    ],
    defaultSort: { id: 'priority', desc: true },
    responsibilityField: 'assigneeId',
    mobileCardFields: ['itemNumber', 'description', 'status', 'assigneeId'],
  },
  kpiCards: [
    { id: 'total', label: 'Total Items', value: 0 },
    { id: 'open', label: 'Open', value: 0 },
    { id: 'closedPercent', label: '% Closed', value: '0%' },
    { id: 'overdue', label: 'Overdue', value: 0, trend: 'up' },
  ],
};

export const punchListDetail: ModuleDetailConfig = {
  tabs: [
    { id: 'details', label: 'Details' },
    { id: 'photos', label: 'Photos' },
    { id: 'history', label: 'History' },
  ],
  defaultTabId: 'details',
};
