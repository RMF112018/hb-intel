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
import { useState } from 'react';
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

// ── Surface mode ────────────────────────────────────────────────────

type FinancialSurfaceMode = 'control-center' | 'forecast-summary' | 'budget' | 'cash-flow';

const TOOL_TO_SURFACE: Record<string, FinancialSurfaceMode> = {
  'forecast-summary': 'forecast-summary',
  'budget': 'budget',
  'cash-flow': 'cash-flow',
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
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onOpenSurface?: (toolId: string) => void;
  readonly onSecondaryAction?: (action: string) => void;
}

export function FinancialControlCenter({
  projectId,
  viewerRole,
  complexityTier,
  onOpenSurface,
  onSecondaryAction,
}: FinancialControlCenterProps): ReactNode {
  const [surfaceMode, setSurfaceMode] = useState<FinancialSurfaceMode>('control-center');

  const data = useFinancialControlCenter({ viewerRole, complexityTier });

  const handleOpenSurface = (toolId: string): void => {
    const targetSurface = TOOL_TO_SURFACE[toolId];
    if (targetSurface) {
      setSurfaceMode(targetSurface);
    } else {
      // Tool surfaces not yet built — delegate to external handler
      onOpenSurface?.(toolId);
    }
  };

  const handleBackToControlCenter = (): void => {
    setSurfaceMode('control-center');
  };

  // ── Deeper surface rendering ──────────────────────────────────────

  if (surfaceMode === 'forecast-summary') {
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
