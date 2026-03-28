/**
 * useChecklistSurface — view-ready data hook for the Forecast Checklist surface.
 *
 * Mock data initially. Will wire to IFinancialRepository.
 * Provides the 19-item checklist state, group summaries, and gate posture.
 */

import { useMemo } from 'react';
import { FORECAST_CHECKLIST_TEMPLATE } from '../constants/index.js';
import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

export interface ChecklistItemRow {
  readonly id: string;
  readonly label: string;
  readonly group: string;
  readonly required: boolean;
  readonly completed: boolean;
  readonly completedBy: string | null;
  readonly completedAt: string | null;
  readonly notes: string | null;
}

export interface ChecklistGroupSummary {
  readonly group: string;
  readonly total: number;
  readonly completed: number;
  readonly requiredTotal: number;
  readonly requiredCompleted: number;
}

export interface ChecklistGatePosture {
  readonly canConfirm: boolean;
  readonly requiredCompleted: number;
  readonly requiredTotal: number;
  readonly staleBudgetLineCount: number;
  readonly blockers: readonly string[];
}

export interface ChecklistSurfaceData {
  readonly items: readonly ChecklistItemRow[];
  readonly groups: readonly ChecklistGroupSummary[];
  readonly gate: ChecklistGatePosture;
  readonly versionState: string;
  readonly reportingMonth: string;
}

export function useChecklistSurface(_options?: {
  viewerRole?: FinancialViewerRole;
  complexityTier?: FinancialComplexityTier;
}): ChecklistSurfaceData {
  return useMemo(() => {
    const items: ChecklistItemRow[] = FORECAST_CHECKLIST_TEMPLATE.map((t: { label: string; group: string; required: boolean }, i: number) => ({
      id: `chk-${i}`,
      label: t.label,
      group: t.group,
      required: t.required,
      completed: i < 12, // Mock: first 12 of 19 completed
      completedBy: i < 12 ? 'John Smith' : null,
      completedAt: i < 12 ? '2026-03-15T10:00:00Z' : null,
      notes: null,
    }));

    const groupNames = [...new Set(items.map((i) => i.group))];
    const groups: ChecklistGroupSummary[] = groupNames.map((group) => {
      const groupItems = items.filter((i) => i.group === group);
      return {
        group,
        total: groupItems.length,
        completed: groupItems.filter((i) => i.completed).length,
        requiredTotal: groupItems.filter((i) => i.required).length,
        requiredCompleted: groupItems.filter((i) => i.required && i.completed).length,
      };
    });

    const requiredItems = items.filter((i) => i.required);
    const requiredCompleted = requiredItems.filter((i) => i.completed).length;
    const blockers: string[] = [];
    if (requiredCompleted < requiredItems.length) {
      blockers.push(`${requiredItems.length - requiredCompleted} required items incomplete`);
    }

    return {
      items,
      groups,
      gate: {
        canConfirm: blockers.length === 0,
        requiredCompleted,
        requiredTotal: requiredItems.length,
        staleBudgetLineCount: 0,
        blockers,
      },
      versionState: 'Working',
      reportingMonth: 'March 2026',
    };
  }, []);
}
