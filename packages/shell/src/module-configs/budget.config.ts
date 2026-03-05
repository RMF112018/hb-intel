/**
 * Budget Module Config — PH4.13 §13.7
 * Blueprint §1d — Cost code budget tracking
 */
import { createColumnHelper } from '@tanstack/react-table';
import type { ModuleLandingConfig } from './types.js';

type BudgetRow = Record<string, unknown>;
const col = createColumnHelper<BudgetRow>();

export const budgetLanding: ModuleLandingConfig<BudgetRow> = {
  toolName: 'Budget',
  table: {
    columns: [
      col.accessor('costCode', { header: 'Cost Code', size: 120 }),
      col.accessor('description', { header: 'Description', size: 220 }),
      col.accessor('originalBudget', { header: 'Original Budget', size: 140 }),
      col.accessor('approvedChanges', { header: 'Approved Changes', size: 140 }),
      col.accessor('revisedBudget', { header: 'Revised Budget', size: 140 }),
      col.accessor('committedCosts', { header: 'Committed', size: 130 }),
      col.accessor('pendingChanges', { header: 'Pending Changes', size: 140 }),
      col.accessor('projectedCost', { header: 'Projected Cost', size: 140 }),
      col.accessor('variance', { header: 'Variance', size: 120 }),
    ],
    defaultSort: { id: 'costCode', desc: false },
    frozenColumns: ['costCode', 'description'],
    defaultDensity: 'compact',
    mobileCardFields: ['costCode', 'description', 'revisedBudget', 'variance'],
  },
  kpiCards: [
    { id: 'totalBudget', label: 'Total Budget', value: '$0' },
    { id: 'committed', label: 'Committed', value: '$0' },
    { id: 'variance', label: 'Total Variance', value: '$0', trend: 'flat' },
    { id: 'pendingCOs', label: 'Pending COs', value: 0 },
    { id: 'contingency', label: 'Contingency Remaining', value: '$0', trend: 'down' },
  ],
};
