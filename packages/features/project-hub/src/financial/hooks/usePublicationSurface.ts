/**
 * usePublicationSurface — view-ready data hook for the Publication / Export surface.
 *
 * Mock data initially. Will wire to IFinancialRepository.
 * Stage 2 — stub-ready via promoteToPublished(); B-FIN-03.
 */

import { useMemo } from 'react';
import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

export interface PublicationRecord {
  readonly id: string;
  readonly versionNumber: number;
  readonly publishedAt: string;
  readonly publishedBy: string;
  readonly reportingMonth: string;
  readonly status: 'Published' | 'Superseded';
}

export interface ExportRun {
  readonly id: string;
  readonly exportType: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly artifactCount: number;
  readonly status: 'Complete' | 'InProgress' | 'Failed';
}

export interface PublicationEligibility {
  readonly hasReportCandidate: boolean;
  readonly candidateVersionNumber: number | null;
  readonly isEligible: boolean;
  readonly blockers: readonly string[];
}

export interface PublicationSurfaceData {
  readonly publications: readonly PublicationRecord[];
  readonly exportRuns: readonly ExportRun[];
  readonly eligibility: PublicationEligibility;
  readonly reportingMonth: string;
}

export function usePublicationSurface(_options?: {
  viewerRole?: FinancialViewerRole;
  complexityTier?: FinancialComplexityTier;
}): PublicationSurfaceData {
  return useMemo(() => ({
    publications: [
      { id: 'pub-1', versionNumber: 1, publishedAt: '2026-01-31T18:00:00Z', publishedBy: 'System (P3-F1)', reportingMonth: 'January 2026', status: 'Superseded' },
      { id: 'pub-2', versionNumber: 2, publishedAt: '2026-02-28T18:00:00Z', publishedBy: 'System (P3-F1)', reportingMonth: 'February 2026', status: 'Published' },
    ],
    exportRuns: [
      { id: 'exp-1', exportType: 'Budget CSV', createdAt: '2026-02-28T18:05:00Z', createdBy: 'John Smith', artifactCount: 1, status: 'Complete' },
      { id: 'exp-2', exportType: 'Forecast Summary PDF', createdAt: '2026-02-28T18:10:00Z', createdBy: 'John Smith', artifactCount: 1, status: 'Complete' },
    ],
    eligibility: {
      hasReportCandidate: false,
      candidateVersionNumber: null,
      isEligible: false,
      blockers: ['No report candidate designated for current period'],
    },
    reportingMonth: 'March 2026',
  }), []);
}
