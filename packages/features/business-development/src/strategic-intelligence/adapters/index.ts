import type {
  ICommitmentRegisterItem,
  IStrategicIntelligenceState,
  ISuggestedIntelligenceMatch,
} from '@hbc/strategic-intelligence';

export interface BdStrategicIntelligenceViewModel {
  snapshotId: string;
  decision: IStrategicIntelligenceState['heritageSnapshot']['decision'];
  decisionRationale: string;
  commitmentCount: number;
  suggestionCount: number;
  syncStatus: IStrategicIntelligenceState['syncStatus'];
  staleEntryCount: number;
}

export const mapStrategicIntelligenceStateToBdView = (
  state: IStrategicIntelligenceState
): BdStrategicIntelligenceViewModel => ({
  snapshotId: state.heritageSnapshot.snapshotId,
  decision: state.heritageSnapshot.decision,
  decisionRationale: state.heritageSnapshot.decisionRationale,
  commitmentCount: state.commitmentRegister.length,
  suggestionCount: state.livingEntries.reduce(
    (total, entry) => total + entry.suggestedMatches.length,
    0
  ),
  syncStatus: state.syncStatus,
  staleEntryCount: state.livingEntries.filter((entry) => entry.trust.isStale).length,
});

export interface CommitmentRegisterProjection {
  items: ICommitmentRegisterItem[];
}

export const projectCommitmentRegister = (
  state: IStrategicIntelligenceState
): CommitmentRegisterProjection => ({
  items: state.commitmentRegister,
});

export interface SuggestionCardProjection {
  items: ISuggestedIntelligenceMatch[];
}

export const projectSuggestionCards = (
  state: IStrategicIntelligenceState
): SuggestionCardProjection => ({
  items: state.livingEntries.flatMap((entry) => entry.suggestedMatches),
});
