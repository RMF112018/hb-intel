/**
 * Scorecards Module Config — PH4.13 §13.7
 * Blueprint §1d — Prequalification & performance scorecards
 */
import { createColumnHelper } from '@tanstack/react-table';
import type { ModuleLandingConfig, ModuleDetailConfig } from './types.js';

type ScorecardRow = Record<string, unknown>;
const col = createColumnHelper<ScorecardRow>();

export const scorecardsLanding: ModuleLandingConfig<ScorecardRow> = {
  toolName: 'Scorecards',
  table: {
    columns: [
      col.accessor('vendorName', { header: 'Vendor', size: 200 }),
      col.accessor('overallScore', { header: 'Score', size: 100 }),
      col.accessor('category', { header: 'Category', size: 140 }),
      col.accessor('status', { header: 'Status', size: 120 }),
      col.accessor('ballInCourt', { header: 'Ball in Court', size: 150 }),
      col.accessor('lastUpdated', { header: 'Last Updated', size: 130 }),
      col.accessor('expirationDate', { header: 'Expires', size: 120 }),
    ],
    defaultSort: { id: 'overallScore', desc: true },
    responsibilityField: 'ballInCourt',
    mobileCardFields: ['vendorName', 'overallScore', 'status', 'category'],
  },
  kpiCards: [
    { id: 'total', label: 'Total Scorecards', value: 0 },
    { id: 'pending', label: 'Pending Review', value: 0, trend: 'flat' },
    { id: 'avgScore', label: 'Avg Score', value: 0 },
    { id: 'expiring', label: 'Expiring Soon', value: 0, trend: 'up' },
  ],
};

export const scorecardsDetail: ModuleDetailConfig = {
  tabs: [
    { id: 'overview', label: 'Overview' },
    { id: 'scoreBreakdown', label: 'Score Breakdown' },
    { id: 'approvalChain', label: 'Approval Chain' },
  ],
  defaultTabId: 'overview',
};
