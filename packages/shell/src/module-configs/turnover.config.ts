/**
 * Turnover Module Config — PH4.13 §13.7
 * Blueprint §1d — Turnover package / closeout management
 */
import { createColumnHelper } from '@tanstack/react-table';
import type { ModuleLandingConfig, ModuleDetailConfig } from './types.js';

type TurnoverRow = Record<string, unknown>;
const col = createColumnHelper<TurnoverRow>();

export const turnoverLanding: ModuleLandingConfig<TurnoverRow> = {
  toolName: 'Turnover',
  table: {
    columns: [
      col.accessor('packageNumber', { header: 'Package #', size: 120 }),
      col.accessor('packageName', { header: 'Package Name', size: 220 }),
      col.accessor('area', { header: 'Area / Zone', size: 150 }),
      col.accessor('status', { header: 'Status', size: 120 }),
      col.accessor('pendingSignatoryId', { header: 'Pending Signatory', size: 160 }),
      col.accessor('completionPercent', { header: '% Complete', size: 110 }),
      col.accessor('targetDate', { header: 'Target Date', size: 120 }),
    ],
    defaultSort: { id: 'targetDate', desc: false },
    responsibilityField: 'pendingSignatoryId',
    mobileCardFields: ['packageNumber', 'packageName', 'status', 'completionPercent'],
  },
  kpiCards: [
    { id: 'total', label: 'Total Packages', value: 0 },
    { id: 'inProgress', label: 'In Progress', value: 0 },
    { id: 'avgCompletion', label: 'Avg Completion', value: '0%' },
    { id: 'overdue', label: 'Overdue', value: 0, trend: 'up' },
  ],
};

export const turnoverDetail: ModuleDetailConfig = {
  tabs: [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'signatures', label: 'Signatures' },
    { id: 'history', label: 'History' },
  ],
  defaultTabId: 'overview',
};

/** Tearsheet wizard steps for creating a turnover package */
export const turnoverTearsheetSteps = [
  { id: 'area', label: 'Select Area' },
  { id: 'documents', label: 'Attach Documents' },
  { id: 'signatories', label: 'Assign Signatories' },
  { id: 'review', label: 'Review & Submit' },
] as const;
