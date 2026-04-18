import type {
  LegacyFallbackMatchConfidence,
  LegacyFallbackMatchMethod,
  LegacyFallbackMatchStatus,
} from '@hbc/models/provisioning';
import { MATCH_METHOD_CONFIDENCE } from './matching-contracts.js';

export interface ILegacyFallbackProjectIndexRecord {
  readonly projectListItemId: number;
  readonly projectNumber: string;
  readonly projectTitle: string;
  readonly normalizedProjectTitle: string;
  readonly year: number | null;
}

export interface ILegacyFallbackMatchInput {
  readonly legacyYear: number;
  readonly projectNumber: string;
  readonly normalizedFolderName: string;
  readonly projectIndex: readonly ILegacyFallbackProjectIndexRecord[];
}

export interface ILegacyFallbackMatchDecision {
  readonly matchStatus: LegacyFallbackMatchStatus;
  readonly matchConfidence: LegacyFallbackMatchConfidence;
  readonly matchMethod: LegacyFallbackMatchMethod;
  readonly matchedProjectListItemId: number | null;
  readonly matchedProjectTitle: string;
  readonly notes: string;
}

function matchedDecision(
  method: LegacyFallbackMatchMethod,
  project: ILegacyFallbackProjectIndexRecord,
  notes: string,
): ILegacyFallbackMatchDecision {
  return {
    matchStatus: 'matched',
    matchConfidence: MATCH_METHOD_CONFIDENCE[method],
    matchMethod: method,
    matchedProjectListItemId: project.projectListItemId,
    matchedProjectTitle: project.projectTitle,
    notes,
  };
}

function reviewDecision(
  method: LegacyFallbackMatchMethod,
  notes: string,
): ILegacyFallbackMatchDecision {
  return {
    matchStatus: 'review-required',
    matchConfidence: 'low',
    matchMethod: method,
    matchedProjectListItemId: null,
    matchedProjectTitle: '',
    notes,
  };
}

function unmatchedDecision(notes: string): ILegacyFallbackMatchDecision {
  return {
    matchStatus: 'unmatched',
    matchConfidence: 'none',
    matchMethod: 'no-match',
    matchedProjectListItemId: null,
    matchedProjectTitle: '',
    notes,
  };
}

export interface ILegacyFallbackMatchingEngine {
  decide(input: ILegacyFallbackMatchInput): ILegacyFallbackMatchDecision;
}

export class LegacyFallbackMatchingEngine implements ILegacyFallbackMatchingEngine {
  decide(input: ILegacyFallbackMatchInput): ILegacyFallbackMatchDecision {
    const byProjectNumber = input.projectNumber
      ? input.projectIndex.filter((candidate) => candidate.projectNumber === input.projectNumber)
      : [];

    if (byProjectNumber.length === 1) {
      return matchedDecision(
        'project-number-exact',
        byProjectNumber[0],
        `project-number-exact:${input.projectNumber}`,
      );
    }

    if (byProjectNumber.length > 1) {
      return reviewDecision(
        'project-number-exact',
        `project-number-ambiguous:${input.projectNumber}:candidates=${byProjectNumber.length}`,
      );
    }

    if (!input.normalizedFolderName) {
      return unmatchedDecision('no-normalized-folder-name');
    }

    const yearCandidates = input.projectIndex.filter(
      (candidate) =>
        candidate.year === input.legacyYear &&
        candidate.normalizedProjectTitle === input.normalizedFolderName,
    );
    if (yearCandidates.length === 1) {
      return matchedDecision(
        'normalized-title-year',
        yearCandidates[0],
        `normalized-title-year:${input.normalizedFolderName}`,
      );
    }

    if (yearCandidates.length > 1) {
      return reviewDecision(
        'normalized-title-year',
        `normalized-title-year-ambiguous:${input.normalizedFolderName}:candidates=${yearCandidates.length}`,
      );
    }

    const globalCandidates = input.projectIndex.filter(
      (candidate) => candidate.normalizedProjectTitle === input.normalizedFolderName,
    );
    if (globalCandidates.length > 1) {
      return reviewDecision(
        'normalized-title-year',
        `normalized-title-cross-year-ambiguous:${input.normalizedFolderName}:candidates=${globalCandidates.length}`,
      );
    }

    return unmatchedDecision(`no-match:${input.normalizedFolderName}`);
  }
}
