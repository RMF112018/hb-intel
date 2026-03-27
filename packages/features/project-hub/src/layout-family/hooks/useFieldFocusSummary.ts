import { useMemo } from 'react';

/**
 * Field focus area — represents a project area/zone for field workers.
 *
 * NOTE: This is a governed placeholder. The spec envisions location-native
 * pin/sheet/overlay behavior that requires spatial data not yet in repo truth.
 * For now, field focus areas are derived from module posture categories
 * (the closest analog to "areas where work is happening").
 */
export interface FieldFocusArea {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly openItemCount: number;
  readonly urgentItemCount: number;
}

export interface FieldFocusSummary {
  readonly areas: readonly FieldFocusArea[];
  readonly selectedAreaId: string | null;
}

/**
 * Field action item — a work card sized for field use.
 */
export interface FieldActionItem {
  readonly id: string;
  readonly title: string;
  readonly areaId: string;
  readonly areaLabel: string;
  readonly sourceModule: string;
  readonly owner: string;
  readonly category: 'observation' | 'inspection' | 'punch-qc-safety' | 'next-move';
  readonly severity: 'critical' | 'high' | 'standard';
  readonly dueLabel: string | null;
  readonly ageDays: number | null;
}

export interface FieldActionStack {
  readonly items: readonly FieldActionItem[];
}

/**
 * Sync posture for field trust.
 */
export interface FieldSyncStatus {
  readonly state: 'synced' | 'syncing' | 'pending' | 'failed';
  readonly pendingUploads: number;
  readonly failedUploads: number;
  readonly lastSyncLabel: string;
}

/**
 * Returns mock field focus areas derived from module categories.
 * Real implementation would source from spatial/location data.
 */
export function useFieldFocusAreas(): FieldFocusSummary {
  return useMemo(
    () => ({
      areas: [
        { id: 'area-site-wide', label: 'Site-Wide', description: 'Cross-area items and general conditions', openItemCount: 4, urgentItemCount: 1 },
        { id: 'area-foundation', label: 'Foundation', description: 'Foundation and below-grade work', openItemCount: 6, urgentItemCount: 3 },
        { id: 'area-structural', label: 'Structural', description: 'Structural framing and connections', openItemCount: 3, urgentItemCount: 1 },
        { id: 'area-mep', label: 'MEP', description: 'Mechanical, electrical, and plumbing', openItemCount: 5, urgentItemCount: 2 },
        { id: 'area-exterior', label: 'Exterior', description: 'Envelope, windows, and waterproofing', openItemCount: 2, urgentItemCount: 0 },
      ],
      selectedAreaId: null,
    }),
    [],
  );
}

/**
 * Returns mock field action items for the action stack.
 * Items are tagged with area IDs so the stack filters by selected area.
 */
export function useFieldActionStack(): FieldActionStack {
  return useMemo(
    () => ({
      items: [
        { id: 'fa-1', title: 'Concrete placement inspection overdue', areaId: 'area-foundation', areaLabel: 'Foundation', sourceModule: 'safety', owner: 'Safety Lead', category: 'inspection' as const, severity: 'critical' as const, dueLabel: 'Due today', ageDays: 0 },
        { id: 'fa-2', title: 'Rebar placement observation — Zone B', areaId: 'area-foundation', areaLabel: 'Foundation', sourceModule: 'qc', owner: 'QC Inspector', category: 'observation' as const, severity: 'high' as const, dueLabel: 'Due today', ageDays: null },
        { id: 'fa-3', title: 'Electrical rough-in punch item', areaId: 'area-mep', areaLabel: 'MEP', sourceModule: 'constraints', owner: 'Superintendent', category: 'punch-qc-safety' as const, severity: 'high' as const, dueLabel: '2 days overdue', ageDays: 2 },
        { id: 'fa-4', title: 'Waterproofing checklist — complete remaining items', areaId: 'area-exterior', areaLabel: 'Exterior', sourceModule: 'closeout', owner: 'PM', category: 'next-move' as const, severity: 'standard' as const, dueLabel: 'Due Mar 30', ageDays: null },
        { id: 'fa-5', title: 'Steel connection inspection — Level 3', areaId: 'area-structural', areaLabel: 'Structural', sourceModule: 'safety', owner: 'Safety Lead', category: 'inspection' as const, severity: 'high' as const, dueLabel: 'Due tomorrow', ageDays: null },
        { id: 'fa-6', title: 'HVAC ductwork observation pending', areaId: 'area-mep', areaLabel: 'MEP', sourceModule: 'qc', owner: 'QC Inspector', category: 'observation' as const, severity: 'standard' as const, dueLabel: 'Due Apr 2', ageDays: null },
        { id: 'fa-7', title: 'Foundation backfill safety check', areaId: 'area-foundation', areaLabel: 'Foundation', sourceModule: 'safety', owner: 'Safety Lead', category: 'punch-qc-safety' as const, severity: 'critical' as const, dueLabel: 'Overdue 3 days', ageDays: 3 },
        { id: 'fa-8', title: 'Review subcontractor daily log', areaId: 'area-site-wide', areaLabel: 'Site-Wide', sourceModule: 'reports', owner: 'Superintendent', category: 'next-move' as const, severity: 'standard' as const, dueLabel: 'Today', ageDays: null },
      ],
    }),
    [],
  );
}

/**
 * Returns mock sync status.
 * Real implementation would integrate with offline/sync runtime.
 */
export function useFieldSyncStatus(): FieldSyncStatus {
  return useMemo(
    () => ({
      state: 'synced' as const,
      pendingUploads: 0,
      failedUploads: 0,
      lastSyncLabel: 'Just now',
    }),
    [],
  );
}
