import type { GovernanceAssessment, ScoreBenchmarkProfile } from '../../types/index.js';

export interface GovernanceInput {
  selectedCohort: string;
  baselineCohort: string;
  profile: ScoreBenchmarkProfile;
  deltaMagnitude: number;
}

export const evaluateFilterGovernance = (input: GovernanceInput): GovernanceAssessment => ({
  defaultCohortLocked: input.selectedCohort === input.baselineCohort,
  approvedCohortApplied: input.profile.governancePolicy.approvedCohorts.includes(input.selectedCohort),
  filterChangeLogged: input.selectedCohort !== input.baselineCohort,
  warningTriggered: input.deltaMagnitude >= input.profile.governancePolicy.warningDeltaThreshold,
});
