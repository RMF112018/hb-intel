/**
 * FinancialControlCenter — page orchestrator for the Financial module root.
 *
 * Composes the 5-region Financial Control Center using:
 * - R1: FinancialPeriodHeader (in WorkspacePageShell headerSlot)
 * - R2: FinancialToolPostureRail (left, via MultiColumnLayout)
 * - R3: FinancialControlCenterCore (center)
 * - R4: FinancialActionRail (right)
 * - R5: HbcActivityStrip (bottom, generic from @hbc/ui-kit)
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
import { FinancialPeriodHeader } from './FinancialPeriodHeader.js';
import { FinancialToolPostureRail } from './FinancialToolPostureRail.js';
import { FinancialControlCenterCore } from './FinancialControlCenterCore.js';
import { FinancialActionRail } from './FinancialActionRail.js';

// ── Activity type labels ────────────────────────────────────────────

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
  readonly onOpenSurface?: (toolId: string) => void;
}

export function FinancialControlCenter({
  projectId,
  onOpenSurface,
}: FinancialControlCenterProps): ReactNode {
  const data = useFinancialControlCenter();

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
      {/* R1 — Period Header (renders above the multi-column grid) */}
      <FinancialPeriodHeader
        period={data.period}
        custody={data.custody}
        freshness={data.freshness}
        primaryAction={data.primaryAction}
      />

      {/* R2–R5 — Multi-column composition */}
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
            selectedToolPreview={data.selectedToolPreview}
            onOpenSurface={onOpenSurface}
          />
        }
        rightSlot={
          <FinancialActionRail
            nextActions={data.nextActions}
            exceptions={data.exceptions}
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
