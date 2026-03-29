/**
 * FinancialControlCenter — page orchestrator for the Financial module root.
 *
 * Manages surface-mode state: renders either the control center overview
 * or a deeper tool surface (e.g., Forecast Summary) based on the user's
 * navigation within the financial section.
 *
 * Route: /project-hub/$projectId/financial
 */

import type { ReactNode } from 'react';
import {
  MultiColumnLayout,
  HbcActivityStrip,
} from '@hbc/ui-kit';
import type { ActivityStripEntry } from '@hbc/ui-kit';

import { useFinancialControlCenter } from '../hooks/useFinancialControlCenter.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';
import { useFinancialOperationalState } from '../hooks/useFinancialOperationalState.js';
import { FinancialWorkspaceShell } from './FinancialWorkspaceShell.js';
import { FinancialOperationalBanner } from './FinancialOperationalBanner.js';
import type { FinancialWorkspaceState } from './FinancialWorkspaceShell.js';
import { FinancialPeriodHeader } from './FinancialPeriodHeader.js';
import { FinancialToolPostureRail } from './FinancialToolPostureRail.js';
import { FinancialControlCenterCore } from './FinancialControlCenterCore.js';
import { FinancialActionRail } from './FinancialActionRail.js';
import { ForecastSummaryPage } from './ForecastSummaryPage.js';
import { BudgetPage } from './BudgetPage.js';
import { CashFlowPage } from './CashFlowPage.js';
import { BuyoutPage } from './BuyoutPage.js';
import { ChecklistPage } from './ChecklistPage.js';
import { GCGRPage } from './GCGRPage.js';
import { ReviewPage } from './ReviewPage.js';
import { PublicationPage } from './PublicationPage.js';
import { HistoryPage } from './HistoryPage.js';

// ── Surface mode ────────────────────────────────────────────────────

/**
 * Surface modes — maps canonical FIN-04 route slugs to internal rendering modes.
 * Modes with dedicated page components render them directly;
 * modes without a dedicated component yet render the control-center overview
 * with the tool slug preserved in the route for deep-link safety.
 */
type FinancialSurfaceMode =
  | 'control-center'
  | 'budget'
  | 'forecast'
  | 'checklist'
  | 'gcgr'
  | 'cash-flow'
  | 'buyout'
  | 'review'
  | 'publication'
  | 'history';

const TOOL_TO_SURFACE: Record<string, FinancialSurfaceMode> = {
  'budget': 'budget',
  'forecast': 'forecast',
  'checklist': 'checklist',
  'gcgr': 'gcgr',
  'cash-flow': 'cash-flow',
  'buyout': 'buyout',
  'review': 'review',
  'publication': 'publication',
  'history': 'history',
};

const TOOL_LABELS: Record<string, string> = {
  'budget': 'Budget Import',
  'forecast': 'Forecast Summary',
  'checklist': 'Forecast Checklist',
  'gcgr': 'GC/GR Forecast',
  'cash-flow': 'Cash Flow',
  'buyout': 'Buyout',
  'review': 'Review & Annotation',
  'publication': 'Publication & Export',
  'history': 'History & Audit',
};

const VERSION_STATE_TO_WORKSPACE: Record<string, FinancialWorkspaceState> = {
  Working: 'working',
  ConfirmedInternal: 'confirmed',
  PublishedMonthly: 'published',
  Superseded: 'working',
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  'version-transition': 'Version',
  'stale-state': 'Stale',
  'return-for-revision': 'Returned',
  approval: 'Approved',
  publication: 'Published',
  refresh: 'Refresh',
  override: 'Override',
};

// ── Component ───────────────────────────────────────────────────────

export interface FinancialControlCenterProps {
  readonly projectId: string;
  /** Route-driven active tool slug (per FIN-04 §1.1). Undefined = control center overview. */
  readonly activeTool?: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  /** Navigate to a Financial tool via route (e.g., 'budget', 'forecast'). */
  readonly onOpenSurface?: (toolId: string) => void;
  readonly onSecondaryAction?: (action: string) => void;
  /** Navigate back to Financial home (control center). */
  readonly onBackToControlCenter?: () => void;
}

export function FinancialControlCenter({
  projectId,
  activeTool,
  viewerRole,
  complexityTier,
  onOpenSurface,
  onSecondaryAction,
  onBackToControlCenter,
}: FinancialControlCenterProps): ReactNode {
  // Resolve surface mode from route-driven activeTool prop.
  // Falls back to control-center when no tool is specified.
  const surfaceMode: FinancialSurfaceMode = activeTool
    ? (TOOL_TO_SURFACE[activeTool] ?? 'control-center')
    : 'control-center';

  const data = useFinancialControlCenter({ viewerRole, complexityTier });

  const handleOpenSurface = (toolId: string): void => {
    // All navigation is now route-driven via the parent callback
    onOpenSurface?.(toolId);
  };

  const handleBackToControlCenter = (): void => {
    onBackToControlCenter?.();
  };

  // ── Workspace state ────────────────────────────────────────────────

  const workspaceState: FinancialWorkspaceState =
    !data.freshness?.budgetFresh ? 'stale' :
    VERSION_STATE_TO_WORKSPACE[data.period?.versionState ?? ''] ?? 'working';

  const toolTitle = activeTool ? (TOOL_LABELS[activeTool] ?? 'Financial') : 'Financial';

  // ── Operational state (runtime honesty) ───────────────────────────

  const operationalState = useFinancialOperationalState({
    toolSlug: activeTool,
    versionState: data.period?.versionState,
    staleBudgetLineCount: 0, // Will wire to real data via IFinancialRepository
    checklistComplete: false, // Will wire to real data via IFinancialRepository
    isReportCandidate: data.period?.isReportCandidate ?? false,
  });

  const operationalBanner = (
    <FinancialOperationalBanner
      state={operationalState}
      onNavigateToTool={handleOpenSurface}
    />
  );

  // ── Deeper surface rendering ──────────────────────────────────────

  const toolPageProps = { projectId, viewerRole, complexityTier, onBack: handleBackToControlCenter };

  if (surfaceMode === 'forecast') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <ForecastSummaryPage {...toolPageProps} />
      </FinancialWorkspaceShell>
    );
  }

  if (surfaceMode === 'budget') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <BudgetPage {...toolPageProps} />
      </FinancialWorkspaceShell>
    );
  }

  if (surfaceMode === 'cash-flow') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <CashFlowPage {...toolPageProps} />
      </FinancialWorkspaceShell>
    );
  }

  if (surfaceMode === 'buyout') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <BuyoutPage {...toolPageProps} />
      </FinancialWorkspaceShell>
    );
  }

  if (surfaceMode === 'checklist') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <ChecklistPage {...toolPageProps} />
      </FinancialWorkspaceShell>
    );
  }

  if (surfaceMode === 'gcgr') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <GCGRPage {...toolPageProps} />
      </FinancialWorkspaceShell>
    );
  }

  if (surfaceMode === 'review') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <ReviewPage {...toolPageProps} />
      </FinancialWorkspaceShell>
    );
  }

  if (surfaceMode === 'publication') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <PublicationPage {...toolPageProps} />
      </FinancialWorkspaceShell>
    );
  }

  if (surfaceMode === 'history') {
    return (
      <FinancialWorkspaceShell title={toolTitle} projectId={projectId} activeTool={activeTool} activeToolLabel={TOOL_LABELS[activeTool ?? '']} versionState={workspaceState} reportingPeriod={data.period?.reportingMonth}>
        {operationalBanner}
        <HistoryPage {...toolPageProps} onNavigateToTool={handleOpenSurface} />
      </FinancialWorkspaceShell>
    );
  }

  // ── Control center rendering (Financial home) ─────────────────────

  const activityEntries: ActivityStripEntry[] = data.recentActivity.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    type: e.type,
    title: e.title,
    source: 'Financial',
    actor: e.actor,
  }));

  return (
    <FinancialWorkspaceShell
      title="Financial"
      projectId={projectId}
      versionState={workspaceState}
      reportingPeriod={data.period?.reportingMonth}
      blockerCount={data.exceptions?.length}
      isStale={!data.freshness?.budgetFresh}
    >
      {operationalBanner}

      <FinancialPeriodHeader
        period={data.period}
        custody={data.custody}
        freshness={data.freshness}
        primaryAction={data.primaryAction}
        onSecondaryAction={onSecondaryAction}
      />

      <MultiColumnLayout
        testId="financial-control-center"
        config={{
          left: { width: 240, collapsible: true, collapsedWidth: 48 },
          right: { width: 300, hideOnTablet: true, hideOnMobile: true },
        }}
        leftSlot={
          <FinancialToolPostureRail
            tools={data.tools}
            selectedToolId={data.selectedToolId}
            onSelectTool={data.selectTool}
          />
        }
        centerSlot={
          <FinancialControlCenterCore
            narrative={data.narrative}
            tools={data.tools}
            selectedToolPreview={data.selectedToolPreview}
            onOpenSurface={handleOpenSurface}
          />
        }
        rightSlot={
          <FinancialActionRail
            nextActions={data.nextActions}
            exceptions={data.exceptions}
            annotations={data.annotations}
          />
        }
        bottomSlot={
          <HbcActivityStrip
            entries={activityEntries}
            typeLabels={ACTIVITY_TYPE_LABELS}
            testId="financial-activity-strip"
          />
        }
      />
    </FinancialWorkspaceShell>
  );
}
