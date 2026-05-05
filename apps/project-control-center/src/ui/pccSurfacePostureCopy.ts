/**
 * Centralized product-grade surface header posture copy.
 *
 * Replaces the per-surface ad-hoc strings ("Read-only preview",
 * "Fixture default", "Read-model available", "Preview confidence",
 * "Runtime envelope timestamp", "Not connected in this prompt", etc.)
 * that previously leaked developer-facing vocabulary into the UI.
 *
 * Header components consume these via the `PccSurfaceContextHeader` props.
 */
export type PccSurfacePostureKind = 'reference' | 'loading' | 'error' | 'unavailable';

export interface PccSurfacePostureCopy {
  postureLabel: string;
  sourceStatusLabel: string;
  sourceConfidenceLabel: string;
  lastUpdatedLabel: string;
}

export const PCC_SURFACE_POSTURE_COPY: Record<PccSurfacePostureKind, PccSurfacePostureCopy> = {
  reference: {
    postureLabel: 'Reference view',
    sourceStatusLabel: 'Reference content',
    sourceConfidenceLabel: 'Reference view',
    lastUpdatedLabel: 'Not listed',
  },
  loading: {
    postureLabel: 'Reference view',
    sourceStatusLabel: 'Loading',
    sourceConfidenceLabel: '—',
    lastUpdatedLabel: 'Updating…',
  },
  error: {
    postureLabel: 'Reference view',
    sourceStatusLabel: 'Could not load',
    sourceConfidenceLabel: 'Unavailable',
    lastUpdatedLabel: 'Not available',
  },
  unavailable: {
    postureLabel: 'Reference view',
    sourceStatusLabel: 'Source unavailable',
    sourceConfidenceLabel: 'Unavailable',
    lastUpdatedLabel: 'Not listed',
  },
};

export const pccSurfacePostureCopy = (kind: PccSurfacePostureKind): PccSurfacePostureCopy =>
  PCC_SURFACE_POSTURE_COPY[kind];
