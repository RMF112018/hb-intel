/**
 * useFinancialControlCenter — view-ready data hook for the Financial Control Center.
 *
 * Role-aware: shapes data differently based on the viewer's authority role.
 * Complexity-aware: supports Essential / Standard / Expert progressive disclosure.
 * Mock data initially. Will be replaced with real IFinancialRepository queries.
 */

import { useMemo, useState, useCallback } from 'react';

import type { FinancialVersionState, FinancialAuthorityRole } from '../types/index.js';

// ── Authority Role for View Shaping ─────────────────────────────────

export type FinancialViewerRole = 'pm' | 'pe' | 'finance' | 'leadership' | 'moe';
export type FinancialComplexityTier = 'essential' | 'standard' | 'expert';

// ── View-Ready Types ────────────────────────────────────────────────

export interface FinancialPeriodInfo {
  readonly reportingMonth: string;
  readonly versionState: FinancialVersionState;
  readonly versionNumber: number;
  readonly isReportCandidate: boolean;
  readonly priorVersionNumber: number | null;
}

export interface FinancialCustodyInfo {
  readonly owner: string;
  readonly role: string;
  readonly lastUpdated: string | null;
  readonly canEdit: boolean;
  readonly canReview: boolean;
  readonly canApprove: boolean;
  readonly canReopen: boolean;
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
  readonly changedSincePrior: boolean;
  readonly changeDescription?: string;
}

export interface FinancialToolPreview {
  readonly toolId: string;
  readonly label: string;
  readonly headline: string;
  readonly topIssue: string | null;
  readonly metricLabel: string;
  readonly metricValue: string;
  readonly contextualActions: readonly FinancialNextAction[];
  readonly route: string;
}

export interface FinancialNarrative {
  readonly overallPosture: string;
  readonly topDrivers: readonly string[];
  readonly blockers: readonly string[];
  readonly nextMilestone: string;
  readonly changeSincePrior: readonly string[];
}

export interface FinancialNextAction {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly urgency: 'critical' | 'high' | 'standard';
  readonly owner: string;
  readonly sourceToolId?: string;
}

export interface FinancialException {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly severity: 'critical' | 'high' | 'standard';
  readonly sourceToolId?: string;
}

export interface FinancialAnnotation {
  readonly id: string;
  readonly text: string;
  readonly author: string;
  readonly timestamp: string;
  readonly disposition: 'pending' | 'addressed' | 'still-applicable';
}

export interface FinancialActivityEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly type: 'version-transition' | 'stale-state' | 'return-for-revision' | 'approval' | 'publication' | 'refresh' | 'override';
  readonly title: string;
  readonly actor: string | null;
}

export interface FinancialControlCenterData {
  readonly viewerRole: FinancialViewerRole;
  readonly complexityTier: FinancialComplexityTier;
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
  readonly annotations: readonly FinancialAnnotation[];
  readonly recentActivity: readonly FinancialActivityEntry[];
  readonly selectTool: (toolId: string | null) => void;
}

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_TOOLS: FinancialToolPosture[] = [
  { id: 'forecast-summary', label: 'Forecast Summary', posture: 'watch', issueCount: 1, warningCount: 2, editable: true, blocked: false, changedSincePrior: true, changeDescription: 'Profit margin decreased 1.2pp since V3' },
  { id: 'budget', label: 'Budget', posture: 'healthy', issueCount: 0, warningCount: 0, editable: false, blocked: false, changedSincePrior: true, changeDescription: 'Budget re-imported with 3 new lines' },
  { id: 'gcgr', label: 'GC/GR', posture: 'at-risk', issueCount: 3, warningCount: 1, editable: true, blocked: false, changedSincePrior: true, changeDescription: 'GC variance increased $12,400' },
  { id: 'cash-flow', label: 'Cash Flow', posture: 'healthy', issueCount: 0, warningCount: 1, editable: true, blocked: false, changedSincePrior: false },
  { id: 'buyout', label: 'Buyout', posture: 'watch', issueCount: 2, warningCount: 0, editable: true, blocked: false, changedSincePrior: true, changeDescription: 'Electrical scope contract executed' },
  { id: 'checklist-review', label: 'Checklist & Review', posture: 'blocked', issueCount: 0, warningCount: 0, editable: false, blocked: true, blockReason: '3 required items incomplete', changedSincePrior: false },
  { id: 'history', label: 'Period History', posture: 'no-data', issueCount: 0, warningCount: 0, editable: false, blocked: false, changedSincePrior: false },
];

const MOCK_ALL_ACTIONS: FinancialNextAction[] = [
  { id: 'na-1', label: 'Complete forecast checklist', description: 'Required Documents group has 3 incomplete items', urgency: 'critical', owner: 'PM', sourceToolId: 'checklist-review' },
  { id: 'na-2', label: 'Review GC/GR variance', description: 'Superintendent labor line exceeds projection by $12,400', urgency: 'high', owner: 'PM', sourceToolId: 'gcgr' },
  { id: 'na-3', label: 'Disposition buyout savings', description: 'Electrical scope savings ($23,400) undispositioned', urgency: 'standard', owner: 'PM', sourceToolId: 'buyout' },
  { id: 'na-4', label: 'Upload pay-app evidence', description: 'February pay-app evidence not yet attached', urgency: 'high', owner: 'PM', sourceToolId: 'forecast-summary' },
  { id: 'na-5', label: 'Review profit margin alert', description: 'Margin dropped below 5% warning threshold', urgency: 'high', owner: 'PE', sourceToolId: 'forecast-summary' },
];

const MOCK_ALL_EXCEPTIONS: FinancialException[] = [
  { id: 'ex-1', title: 'Pay-app evidence incomplete', source: 'Freshness', severity: 'high', sourceToolId: 'forecast-summary' },
  { id: 'ex-2', title: 'GC estimate exceeds budget by 8%', source: 'GC/GR', severity: 'high', sourceToolId: 'gcgr' },
  { id: 'ex-3', title: 'Buyout savings undispositioned ($23,400)', source: 'Buyout', severity: 'standard', sourceToolId: 'buyout' },
];

const MOCK_ANNOTATIONS: FinancialAnnotation[] = [
  { id: 'ann-1', text: 'Confirm GC labor variance is within acceptable range before submission', author: 'PE — Jordan Wells', timestamp: '2026-03-24T10:00:00Z', disposition: 'pending' },
  { id: 'ann-2', text: 'Electrical buyout savings should be held in contingency per prior agreement', author: 'PE — Jordan Wells', timestamp: '2026-03-23T15:00:00Z', disposition: 'still-applicable' },
];

const MOCK_TOOL_PREVIEWS: Record<string, FinancialToolPreview> = {
  'forecast-summary': { toolId: 'forecast-summary', label: 'Forecast Summary', headline: 'February forecast pending confirmation — 2 exposure items require attention', topIssue: 'Profit margin dropped below 5% threshold', metricLabel: 'Current Profit', metricValue: '$142,500', route: 'financial/forecast-summary', contextualActions: MOCK_ALL_ACTIONS.filter(a => a.sourceToolId === 'forecast-summary') },
  'budget': { toolId: 'budget', label: 'Budget', headline: 'Budget baseline current — last import 2 days ago with 3 new lines', topIssue: null, metricLabel: 'Revised Budget', metricValue: '$8.2M', route: 'financial/budget', contextualActions: [] },
  'gcgr': { toolId: 'gcgr', label: 'GC/GR', headline: 'GC estimate at completion exceeds budget by 8% — 3 divisions over-projected', topIssue: 'Superintendent labor variance driving GC overrun (+$12,400 since V3)', metricLabel: 'GC Variance', metricValue: '-$67,200', route: 'financial/gcgr', contextualActions: MOCK_ALL_ACTIONS.filter(a => a.sourceToolId === 'gcgr') },
  'cash-flow': { toolId: 'cash-flow', label: 'Cash Flow', headline: 'Cash flow positive — peak requirement within working capital', topIssue: null, metricLabel: 'Peak Cash Req', metricValue: '-$132K', route: 'financial/cash-flow', contextualActions: [] },
  'buyout': { toolId: 'buyout', label: 'Buyout', headline: '72% buyout complete (dollar-weighted) — 2 undispositioned savings items', topIssue: 'Electrical scope savings undispositioned ($23,400)', metricLabel: 'Buyout Complete', metricValue: '72%', route: 'financial/buyout', contextualActions: MOCK_ALL_ACTIONS.filter(a => a.sourceToolId === 'buyout') },
  'checklist-review': { toolId: 'checklist-review', label: 'Checklist & Review', headline: 'Checklist 16 of 19 items complete — 3 required items blocking confirmation', topIssue: 'Required Documents group incomplete', metricLabel: 'Checklist', metricValue: '16/19', route: 'financial/checklist', contextualActions: MOCK_ALL_ACTIONS.filter(a => a.sourceToolId === 'checklist-review') },
  'history': { toolId: 'history', label: 'Period History', headline: '4 versions this period — V3 confirmed internal, V4 working', topIssue: null, metricLabel: 'Versions', metricValue: '4', route: 'financial/history', contextualActions: [] },
};

const MOCK_ACTIVITY: FinancialActivityEntry[] = [
  { id: 'ra-1', timestamp: '2026-03-25T14:30:00Z', type: 'version-transition', title: 'V4 derived from V3 (PostConfirmationEdit)', actor: 'PM — Alex Rivera' },
  { id: 'ra-2', timestamp: '2026-03-24T16:00:00Z', type: 'approval', title: 'V3 confirmed internal', actor: 'PM — Alex Rivera' },
  { id: 'ra-3', timestamp: '2026-03-23T10:15:00Z', type: 'refresh', title: 'Budget import — 247 lines reconciled, 3 new', actor: 'System' },
  { id: 'ra-4', timestamp: '2026-03-22T09:00:00Z', type: 'version-transition', title: 'V3 derived from V2 (BudgetImport)', actor: 'System' },
  { id: 'ra-5', timestamp: '2026-03-20T11:30:00Z', type: 'return-for-revision', title: 'V2 returned for revision — GC variance needs PM attention', actor: 'PE — Jordan Wells' },
  { id: 'ra-6', timestamp: '2026-03-18T14:00:00Z', type: 'stale-state', title: 'Budget snapshot marked stale — Procore update available', actor: 'System' },
];

// ── Role-Aware Resolution ───────────────────────────────────────────

function resolvePrimaryAction(
  versionState: FinancialVersionState,
  viewerRole: FinancialViewerRole,
): FinancialPrimaryAction | null {
  if (versionState === 'Working') {
    if (viewerRole === 'pm') return { label: 'Continue Working', action: 'continue-working' };
    if (viewerRole === 'pe') return null; // PE cannot edit working
    if (viewerRole === 'finance') return null;
    if (viewerRole === 'leadership') return null;
    return null;
  }
  if (versionState === 'ConfirmedInternal') {
    if (viewerRole === 'pe') return { label: 'Review & Approve', action: 'approve' };
    if (viewerRole === 'pm') return { label: 'Open History', action: 'open-history' };
    if (viewerRole === 'leadership') return { label: 'Review', action: 'open-history' };
    return null;
  }
  if (versionState === 'PublishedMonthly') {
    if (viewerRole === 'moe') return { label: 'Reopen', action: 'reopen' };
    return { label: 'Open History', action: 'open-history' };
  }
  return null;
}

function resolveCustodyPermissions(
  versionState: FinancialVersionState,
  viewerRole: FinancialViewerRole,
): Pick<FinancialCustodyInfo, 'canEdit' | 'canReview' | 'canApprove' | 'canReopen'> {
  return {
    canEdit: versionState === 'Working' && viewerRole === 'pm',
    canReview: versionState === 'ConfirmedInternal' && (viewerRole === 'pe' || viewerRole === 'leadership'),
    canApprove: versionState === 'ConfirmedInternal' && viewerRole === 'pe',
    canReopen: versionState === 'PublishedMonthly' && viewerRole === 'moe',
  };
}

function filterActionsByRole(
  actions: readonly FinancialNextAction[],
  viewerRole: FinancialViewerRole,
): readonly FinancialNextAction[] {
  if (viewerRole === 'pm') return actions;
  if (viewerRole === 'pe') return actions.filter(a => a.urgency !== 'standard' || a.owner === 'PE');
  if (viewerRole === 'leadership') return actions.filter(a => a.urgency === 'critical');
  if (viewerRole === 'finance') return actions.filter(a => a.description.includes('evidence') || a.owner === 'Finance');
  return actions.slice(0, 3);
}

function filterActivityByTier(
  activity: readonly FinancialActivityEntry[],
  tier: FinancialComplexityTier,
): readonly FinancialActivityEntry[] {
  if (tier === 'essential') return activity.slice(0, 2);
  if (tier === 'standard') return activity.slice(0, 4);
  return activity; // expert: all
}

// ── Hook ─────────────────────────────────────────────────────────────

export interface UseFinancialControlCenterOptions {
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
}

export function useFinancialControlCenter(
  options?: UseFinancialControlCenterOptions,
): FinancialControlCenterData {
  const viewerRole = options?.viewerRole ?? 'pm';
  const complexityTier = options?.complexityTier ?? 'standard';

  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  const selectTool = useCallback((toolId: string | null) => {
    setSelectedToolId((prev) => (prev === toolId ? null : toolId));
  }, []);

  const selectedToolPreview = selectedToolId
    ? MOCK_TOOL_PREVIEWS[selectedToolId] ?? null
    : null;

  const versionState: FinancialVersionState = 'Working';
  const custodyPerms = resolveCustodyPermissions(versionState, viewerRole);
  const primaryAction = resolvePrimaryAction(versionState, viewerRole);

  // Filter actions/exceptions by selected tool when one is selected
  const contextFilteredActions = selectedToolId
    ? MOCK_ALL_ACTIONS.filter(a => a.sourceToolId === selectedToolId)
    : filterActionsByRole(MOCK_ALL_ACTIONS, viewerRole);

  const contextFilteredExceptions = selectedToolId
    ? MOCK_ALL_EXCEPTIONS.filter(e => e.sourceToolId === selectedToolId)
    : MOCK_ALL_EXCEPTIONS;

  const filteredActivity = filterActivityByTier(MOCK_ACTIVITY, complexityTier);

  // Change-since-prior summary
  const changeSincePrior = MOCK_TOOLS
    .filter(t => t.changedSincePrior && t.changeDescription)
    .map(t => t.changeDescription!);

  return useMemo(
    () => ({
      viewerRole,
      complexityTier,
      period: {
        reportingMonth: 'February 2026',
        versionState,
        versionNumber: 4,
        isReportCandidate: false,
        priorVersionNumber: 3,
      },
      custody: {
        owner: 'Alex Rivera',
        role: 'PM',
        lastUpdated: '2026-03-25T14:30:00Z',
        ...custodyPerms,
      },
      freshness: {
        budgetFresh: true,
        budgetLabel: '2 days ago',
        actualsFresh: true,
        actualsLabel: 'current',
        payAppFresh: false,
        payAppLabel: 'evidence incomplete',
      },
      primaryAction,
      tools: MOCK_TOOLS,
      narrative: {
        overallPosture: 'February forecast on track with accelerated buyout',
        topDrivers: ['GC/GR variance above threshold', 'Profit margin approaching warning', 'Buyout savings undispositioned'],
        blockers: ['Checklist: 3 required items incomplete', 'Pay-app evidence not yet uploaded'],
        nextMilestone: 'Submit for review by March 28',
        changeSincePrior,
      },
      selectedToolId,
      selectedToolPreview,
      nextActions: contextFilteredActions,
      exceptions: contextFilteredExceptions,
      annotations: viewerRole === 'pe' || viewerRole === 'leadership' ? MOCK_ANNOTATIONS : [],
      recentActivity: filteredActivity,
      selectTool,
    }),
    [viewerRole, complexityTier, versionState, custodyPerms, primaryAction, selectedToolId, selectedToolPreview, contextFilteredActions, contextFilteredExceptions, filteredActivity, changeSincePrior, selectTool],
  );
}
