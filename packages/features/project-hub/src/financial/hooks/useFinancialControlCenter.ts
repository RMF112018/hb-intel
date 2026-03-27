/**
 * useFinancialControlCenter — view-ready data hook for the Financial Control Center.
 *
 * Returns mock data initially. Will be replaced with real IFinancialRepository
 * queries when the data-access factory registration is complete.
 */

import { useMemo, useState, useCallback } from 'react';

import type { FinancialVersionState } from '../types/index.js';

// ── View-Ready Types ────────────────────────────────────────────────

export interface FinancialPeriodInfo {
  readonly reportingMonth: string;
  readonly versionState: FinancialVersionState;
  readonly versionNumber: number;
  readonly isReportCandidate: boolean;
}

export interface FinancialCustodyInfo {
  readonly owner: string;
  readonly role: string;
  readonly lastUpdated: string | null;
}

export interface FinancialFreshnessInfo {
  readonly budgetFresh: boolean;
  readonly budgetLabel: string;
  readonly actualsFresh: boolean;
  readonly actualsLabel: string;
  readonly payAppFresh: boolean;
  readonly payAppLabel: string;
}

export interface FinancialPrimaryAction {
  readonly label: string;
  readonly action: 'continue-working' | 'refresh-snapshot' | 'submit-for-review' | 'approve' | 'return-for-revision' | 'reopen' | 'open-history';
}

export type FinancialToolPostureState = 'healthy' | 'watch' | 'at-risk' | 'critical' | 'no-data' | 'blocked';

export interface FinancialToolPosture {
  readonly id: string;
  readonly label: string;
  readonly posture: FinancialToolPostureState;
  readonly issueCount: number;
  readonly warningCount: number;
  readonly editable: boolean;
  readonly blocked: boolean;
  readonly blockReason?: string;
}

export interface FinancialToolPreview {
  readonly toolId: string;
  readonly label: string;
  readonly headline: string;
  readonly topIssue: string | null;
  readonly metricLabel: string;
  readonly metricValue: string;
}

export interface FinancialNarrative {
  readonly overallPosture: string;
  readonly topDrivers: readonly string[];
  readonly blockers: readonly string[];
  readonly nextMilestone: string;
}

export interface FinancialNextAction {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly urgency: 'critical' | 'high' | 'standard';
  readonly owner: string;
}

export interface FinancialException {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly severity: 'critical' | 'high' | 'standard';
}

export interface FinancialActivityEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly type: 'version-transition' | 'stale-state' | 'return-for-revision' | 'approval' | 'publication' | 'refresh' | 'override';
  readonly title: string;
  readonly actor: string | null;
}

export interface FinancialControlCenterData {
  readonly period: FinancialPeriodInfo;
  readonly custody: FinancialCustodyInfo;
  readonly freshness: FinancialFreshnessInfo;
  readonly primaryAction: FinancialPrimaryAction | null;
  readonly tools: readonly FinancialToolPosture[];
  readonly narrative: FinancialNarrative;
  readonly selectedToolId: string | null;
  readonly selectedToolPreview: FinancialToolPreview | null;
  readonly nextActions: readonly FinancialNextAction[];
  readonly exceptions: readonly FinancialException[];
  readonly recentActivity: readonly FinancialActivityEntry[];
  readonly selectTool: (toolId: string | null) => void;
}

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_TOOLS: FinancialToolPosture[] = [
  { id: 'forecast-summary', label: 'Forecast Summary', posture: 'watch', issueCount: 1, warningCount: 2, editable: true, blocked: false },
  { id: 'budget', label: 'Budget', posture: 'healthy', issueCount: 0, warningCount: 0, editable: false, blocked: false },
  { id: 'gcgr', label: 'GC/GR', posture: 'at-risk', issueCount: 3, warningCount: 1, editable: true, blocked: false },
  { id: 'cash-flow', label: 'Cash Flow', posture: 'healthy', issueCount: 0, warningCount: 1, editable: true, blocked: false },
  { id: 'buyout', label: 'Buyout', posture: 'watch', issueCount: 2, warningCount: 0, editable: true, blocked: false },
  { id: 'checklist-review', label: 'Checklist & Review', posture: 'blocked', issueCount: 0, warningCount: 0, editable: false, blocked: true, blockReason: '3 required items incomplete' },
  { id: 'history', label: 'Period History', posture: 'no-data', issueCount: 0, warningCount: 0, editable: false, blocked: false },
];

const MOCK_TOOL_PREVIEWS: Record<string, FinancialToolPreview> = {
  'forecast-summary': { toolId: 'forecast-summary', label: 'Forecast Summary', headline: 'February forecast pending confirmation — 2 exposure items require attention', topIssue: 'Profit margin dropped below 5% threshold', metricLabel: 'Current Profit', metricValue: '$142,500' },
  'budget': { toolId: 'budget', label: 'Budget', headline: 'Budget baseline current — last import 2 days ago', topIssue: null, metricLabel: 'Revised Budget', metricValue: '$8.2M' },
  'gcgr': { toolId: 'gcgr', label: 'GC/GR', headline: 'GC estimate at completion exceeds budget by 8% — 3 divisions over-projected', topIssue: 'Superintendent labor variance driving GC overrun', metricLabel: 'GC Variance', metricValue: '-$67,200' },
  'cash-flow': { toolId: 'cash-flow', label: 'Cash Flow', headline: 'Cash flow positive — peak requirement within working capital', topIssue: null, metricLabel: 'Peak Cash Req', metricValue: '-$132K' },
  'buyout': { toolId: 'buyout', label: 'Buyout', headline: '72% buyout complete (dollar-weighted) — 2 undispositioned savings items', topIssue: 'Electrical scope savings undispositioned', metricLabel: 'Buyout Complete', metricValue: '72%' },
  'checklist-review': { toolId: 'checklist-review', label: 'Checklist & Review', headline: 'Checklist 16 of 19 items complete — 3 required items blocking confirmation', topIssue: 'Required Documents group incomplete', metricLabel: 'Checklist', metricValue: '16/19' },
  'history': { toolId: 'history', label: 'Period History', headline: '4 versions this period — V3 confirmed internal, V4 working', topIssue: null, metricLabel: 'Versions', metricValue: '4' },
};

// ── Hook ─────────────────────────────────────────────────────────────

export function useFinancialControlCenter(): FinancialControlCenterData {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  const selectTool = useCallback((toolId: string | null) => {
    setSelectedToolId((prev) => (prev === toolId ? null : toolId));
  }, []);

  const selectedToolPreview = selectedToolId
    ? MOCK_TOOL_PREVIEWS[selectedToolId] ?? null
    : null;

  return useMemo(
    () => ({
      period: {
        reportingMonth: 'February 2026',
        versionState: 'Working' as const,
        versionNumber: 4,
        isReportCandidate: false,
      },
      custody: {
        owner: 'Alex Rivera',
        role: 'PM',
        lastUpdated: '2026-03-25T14:30:00Z',
      },
      freshness: {
        budgetFresh: true,
        budgetLabel: '2 days ago',
        actualsFresh: true,
        actualsLabel: 'current',
        payAppFresh: false,
        payAppLabel: 'evidence incomplete',
      },
      primaryAction: {
        label: 'Continue Working',
        action: 'continue-working' as const,
      },
      tools: MOCK_TOOLS,
      narrative: {
        overallPosture: 'February forecast on track with accelerated buyout',
        topDrivers: ['GC/GR variance above threshold', 'Profit margin approaching warning', 'Buyout savings undispositioned'],
        blockers: ['Checklist: 3 required items incomplete', 'Pay-app evidence not yet uploaded'],
        nextMilestone: 'Submit for review by March 28',
      },
      selectedToolId,
      selectedToolPreview,
      nextActions: [
        { id: 'na-1', label: 'Complete forecast checklist', description: 'Required Documents group has 3 incomplete items', urgency: 'critical' as const, owner: 'PM' },
        { id: 'na-2', label: 'Review GC/GR variance', description: 'Superintendent labor line exceeds projection', urgency: 'high' as const, owner: 'PM' },
        { id: 'na-3', label: 'Disposition buyout savings', description: 'Electrical scope savings ($23,400) undispositioned', urgency: 'standard' as const, owner: 'PM' },
      ],
      exceptions: [
        { id: 'ex-1', title: 'Pay-app evidence incomplete', source: 'Freshness', severity: 'high' as const },
        { id: 'ex-2', title: 'GC estimate exceeds budget by 8%', source: 'GC/GR', severity: 'high' as const },
      ],
      recentActivity: [
        { id: 'ra-1', timestamp: '2026-03-25T14:30:00Z', type: 'version-transition' as const, title: 'V4 derived from V3 (PostConfirmationEdit)', actor: 'PM — Alex Rivera' },
        { id: 'ra-2', timestamp: '2026-03-24T16:00:00Z', type: 'approval' as const, title: 'V3 confirmed internal', actor: 'PM — Alex Rivera' },
        { id: 'ra-3', timestamp: '2026-03-23T10:15:00Z', type: 'refresh' as const, title: 'Budget import — 247 lines reconciled', actor: 'System' },
        { id: 'ra-4', timestamp: '2026-03-22T09:00:00Z', type: 'version-transition' as const, title: 'V3 derived from V2 (BudgetImport)', actor: 'System' },
      ],
      selectTool,
    }),
    [selectedToolId, selectedToolPreview, selectTool],
  );
}
