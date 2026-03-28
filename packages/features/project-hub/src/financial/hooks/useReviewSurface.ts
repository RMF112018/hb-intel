/**
 * useReviewSurface — view-ready data hook for the Review / PER Annotation surface.
 *
 * Mock data initially. Will wire to IFinancialRepository.
 * Stage 3 — annotation contracts defined; custody state machine not yet implemented.
 */

import { useMemo } from 'react';
import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

export interface AnnotationRow {
  readonly id: string;
  readonly anchorType: 'field' | 'section' | 'block';
  readonly anchorLabel: string;
  readonly annotationText: string;
  readonly annotatedBy: string;
  readonly annotatedAt: string;
  readonly inheritanceStatus: 'Original' | 'Inherited';
  readonly pmDispositionStatus: 'Pending' | 'Addressed' | 'StillApplicable' | 'NeedsReviewerAttention' | null;
  readonly valueChangedFlag: boolean;
}

export interface ReviewCustodyState {
  readonly status: 'PmCourt' | 'SubmittedForReview' | 'InReview' | 'ReturnedForRevision' | 'Approved';
  readonly label: string;
  readonly owner: string;
  readonly canSubmit: boolean;
  readonly canAnnotate: boolean;
  readonly canReturn: boolean;
  readonly canApprove: boolean;
}

export interface ReviewSurfaceData {
  readonly annotations: readonly AnnotationRow[];
  readonly custody: ReviewCustodyState;
  readonly versionState: string;
  readonly versionNumber: number;
  readonly reportingMonth: string;
  readonly pendingDispositionCount: number;
}

export function useReviewSurface(_options?: {
  viewerRole?: FinancialViewerRole;
  complexityTier?: FinancialComplexityTier;
}): ReviewSurfaceData {
  return useMemo(() => {
    const annotations: AnnotationRow[] = [
      { id: 'ann-1', anchorType: 'field', anchorLabel: 'Budget Line 01-10-100 FTC', annotationText: 'Please verify the $15K increase against the revised SOW.', annotatedBy: 'Sarah Chen (PER)', annotatedAt: '2026-03-10T14:30:00Z', inheritanceStatus: 'Original', pmDispositionStatus: null, valueChangedFlag: false },
      { id: 'ann-2', anchorType: 'section', anchorLabel: 'Contingency Summary', annotationText: 'Contingency draw-down rate exceeds expected pace — recommend hold.', annotatedBy: 'Sarah Chen (PER)', annotatedAt: '2026-03-10T14:35:00Z', inheritanceStatus: 'Original', pmDispositionStatus: null, valueChangedFlag: false },
      { id: 'ann-3', anchorType: 'field', anchorLabel: 'Budget Line 03-20-200 FTC', annotationText: 'Prior month note: subcontractor delayed — still applicable?', annotatedBy: 'Sarah Chen (PER)', annotatedAt: '2026-02-15T10:00:00Z', inheritanceStatus: 'Inherited', pmDispositionStatus: 'Pending', valueChangedFlag: true },
    ];

    return {
      annotations,
      custody: {
        status: 'PmCourt',
        label: 'In PM Custody',
        owner: 'John Smith (PM)',
        canSubmit: true,
        canAnnotate: false,
        canReturn: false,
        canApprove: false,
      },
      versionState: 'Working',
      versionNumber: 3,
      reportingMonth: 'March 2026',
      pendingDispositionCount: annotations.filter((a) => a.pmDispositionStatus === 'Pending').length,
    };
  }, []);
}
