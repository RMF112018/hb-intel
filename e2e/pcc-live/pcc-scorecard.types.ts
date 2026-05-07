import type {
  PccEvidenceId,
  PccEvidenceRecord,
  PccHardStopRef,
  PccScorecardPillarRef,
} from './pcc-evidence.types';

export const PCC_SCORECARD_PILLAR_IDS = [
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
  'P7',
  'P8',
  'P9',
] as const;
export const PCC_HARD_STOP_IDS = [
  'HS-01',
  'HS-02',
  'HS-03',
  'HS-04',
  'HS-05',
  'HS-06',
  'HS-07',
  'HS-08',
  'HS-09',
  'HS-10',
] as const;

export type PccScorecardPillarId = (typeof PCC_SCORECARD_PILLAR_IDS)[number];
export type PccHardStopId = (typeof PCC_HARD_STOP_IDS)[number];

type IsExactlyString<T> = [T] extends [string] ? ([string] extends [T] ? true : false) : false;
type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type _PillarIdMustNotWidenToString = AssertFalse<IsExactlyString<PccScorecardPillarId>>;
type _HardStopIdMustNotWidenToString = AssertFalse<IsExactlyString<PccHardStopId>>;
type _PillarTypesCompatibleWithPrompt02 = AssertTrue<
  IsEqual<PccScorecardPillarId, PccScorecardPillarRef>
>;
type _HardStopTypesCompatibleWithPrompt02 = AssertTrue<IsEqual<PccHardStopId, PccHardStopRef>>;

export interface PccScorecardPillarModel {
  id: PccScorecardPillarId;
  title: string;
  weight: number;
  purpose: string;
  manualScoringRequired: true;
  scorecardSectionRef: string;
  sourceRefs: string[];
}

export interface PccHardStopModel {
  id: PccHardStopId;
  title: string;
  failure: string;
  blocksPhase4: true;
  manualReviewRequired: true;
  scorecardSectionRef: string;
  sourceRefs: string[];
}

export type PccManualScoreValue = null;

export type PccHardStopReviewStatus =
  | 'manual-review-required'
  | 'operator-pending'
  | 'passed'
  | 'failed'
  | 'not-applicable';

export type PccPillarEvidenceMap = Record<PccScorecardPillarId, PccEvidenceId[]>;
export type PccHardStopEvidenceMap = Record<PccHardStopId, PccEvidenceId[]>;

export type PccEvidenceScorecardMap = Record<
  PccEvidenceId,
  {
    evidenceId: PccEvidenceId;
    pillarRefs: PccScorecardPillarId[];
    hardStopRefs: PccHardStopId[];
  }
>;

export interface PccScorecardWorksheetRow {
  pillarId: PccScorecardPillarId;
  title: string;
  weight: number;
  manualScore: PccManualScoreValue;
  automatedScore: PccManualScoreValue;
  scoringOwner: 'expert-review';
  evidenceIds: PccEvidenceId[];
  notes: string;
}

export interface PccHardStopWorksheetRow {
  hardStopId: PccHardStopId;
  title: string;
  blocksPhase4: true;
  reviewStatus: 'manual-review-required';
  evidenceIds: PccEvidenceId[];
  notes: string;
}

export interface PccScorecardTraceabilityCoverage {
  expectedEvidenceCount: number;
  coveredEvidenceCount: number;
  missingEvidenceIds: PccEvidenceId[];
  missingPillars: PccScorecardPillarId[];
  missingHardStops: PccHardStopId[];
  unknownPillarRefs: string[];
  unknownHardStopRefs: string[];
  unknownEvidenceIds: string[];
}

export type PccTraceabilityRecordInput = Pick<
  PccEvidenceRecord,
  'id' | 'pillarRefs' | 'hardStopRefs'
>;
