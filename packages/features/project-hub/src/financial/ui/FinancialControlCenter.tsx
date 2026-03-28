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
import { FinancialPeriodHeader } from './FinancialPeriodHeader.js';
import { FinancialToolPostureRail } from './FinancialToolPostureRail.js';
import { FinancialControlCenterCore } from './FinancialControlCenterCore.js';
import { FinancialActionRail } from './FinancialActionRail.js';
import { ForecastSummaryPage } from './ForecastSummaryPage.js';
import { BudgetPage } from './BudgetPage.js';
import { CashFlowPage } from './CashFlowPage.js';
import { BuyoutPage } from './BuyoutPage.js';

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

  // ── Deeper surface rendering ──────────────────────────────────────

  if (surfaceMode === 'forecast') {
    return (
      <ForecastSummaryPage
        projectId={projectId}
        viewerRole={viewerRole}
        complexityTier={complexityTier}
        onBack={handleBackToControlCenter}
      />
    );
  }

  if (surfaceMode === 'budget') {
    return (
      <BudgetPage
        projectId={projectId}
        viewerRole={viewerRole}
        complexityTier={complexityTier}
        onBack={handleBackToControlCenter}
      />
    );
  }

  if (surfaceMode === 'cash-flow') {
    return (
      <CashFlowPage
        projectId={projectId}
        viewerRole={viewerRole}
        complexityTier={complexityTier}
        onBack={handleBackToControlCenter}
      />
    );
  }

  if (surfaceMode === 'buyout') {
    return (
      <BuyoutPage
        projectId={projectId}
        viewerRole={viewerRole}
        complexityTier={complexityTier}
        onBack={handleBackToControlCenter}
      />
    );
  }

  // ── Control center rendering ──────────────────────────────────────

  const activityEntries: ActivityStripEntry[] = data.recentActivity.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    type: e.type,
    title: e.title,
    source: 'Financial',
    actor: e.actor,
  }));

  return (
    <>
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
    </>
  );
}
