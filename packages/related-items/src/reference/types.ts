/**
 * Reference integration mock source record interfaces — D-SF14-T07, D-08
 *
 * Typed demo records for the three canonical modules:
 * BD Scorecard, Estimating Pursuit, and Project.
 */

/** BD Scorecard record with linked pursuit IDs. */
export interface IBdScorecardRecord {
  readonly id: string;
  readonly name: string;
  readonly clientName: string;
  readonly region: string;
  readonly pursuitIds: readonly string[];
}

/** Estimating Pursuit record with optional converted project reference. */
export interface IEstimatingPursuitRecord {
  readonly id: string;
  readonly name: string;
  readonly estimatedValue: number;
  readonly status: 'active' | 'won' | 'lost' | 'pending';
  readonly convertedProjectId?: string;
  readonly originatingScorecardId: string;
}

/** Project record with originating pursuit reference. */
export interface IProjectRecord {
  readonly id: string;
  readonly name: string;
  readonly projectManager: string;
  readonly status: 'pre-construction' | 'active' | 'closeout' | 'complete';
  readonly originatingPursuitId: string;
}
