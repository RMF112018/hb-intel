/**
 * RFIs Module Config — PH4.13 §13.7
 * Blueprint §1d — Requests for Information
 */
import { createColumnHelper } from '@tanstack/react-table';
import type { ModuleLandingConfig, ModuleDetailConfig } from './types.js';

type RfiRow = Record<string, unknown>;
const col = createColumnHelper<RfiRow>();

export const rfisLanding: ModuleLandingConfig<RfiRow> = {
  toolName: 'RFIs',
  table: {
    columns: [
      col.accessor('rfiNumber', { header: 'RFI #', size: 100 }),
      col.accessor('subject', { header: 'Subject', size: 250 }),
      col.accessor('status', { header: 'Status', size: 120 }),
      col.accessor('priority', { header: 'Priority', size: 100 }),
      col.accessor('ballInCourt', { header: 'Ball in Court', size: 150 }),
      col.accessor('dueDate', { header: 'Due Date', size: 120 }),
      col.accessor('daysOpen', { header: 'Days Open', size: 100 }),
      col.accessor('costImpact', { header: 'Cost Impact', size: 120 }),
    ],
    defaultSort: { id: 'dueDate', desc: false },
    frozenColumns: ['rfiNumber'],
    responsibilityField: 'ballInCourt',
    mobileCardFields: ['rfiNumber', 'subject', 'status', 'dueDate'],
  },
  kpiCards: [
    { id: 'open', label: 'Open RFIs', value: 0 },
    { id: 'overdue', label: 'Overdue', value: 0, trend: 'up' },
    { id: 'avgResponse', label: 'Avg Response (days)', value: 0 },
    { id: 'closedThisWeek', label: 'Closed This Week', value: 0, trend: 'down' },
  ],
};

export const rfisDetail: ModuleDetailConfig = {
  tabs: [
    { id: 'details', label: 'Details' },
    { id: 'responses', label: 'Responses' },
    { id: 'drawings', label: 'Linked Drawings' },
    { id: 'changeLog', label: 'Change Log' },
  ],
  defaultTabId: 'details',
};
