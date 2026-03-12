import type React from 'react';
import type { IReviewerConsensus } from '@hbc/score-benchmark';
import {
  getComplexityFlags,
  type ScoreBenchmarkComplexityMode,
} from './displayModel.js';

export interface ReviewerConsensusPanelProps {
  readonly consensus: IReviewerConsensus;
  readonly complexity: ScoreBenchmarkComplexityMode;
}

export function ReviewerConsensusPanel({
  consensus,
  complexity,
}: ReviewerConsensusPanelProps): JSX.Element {
  const flags = getComplexityFlags(complexity);

  return (
    <section aria-label="Reviewer Consensus Panel" data-testid="reviewer-consensus-panel">
      <h3>Reviewer Consensus</h3>
      <p data-testid="reviewer-consensus-variance">Variance: {consensus.variance.toFixed(2)}</p>
      <p data-testid="reviewer-consensus-strength">Consensus strength: {consensus.consensusStrength.toFixed(2)}</p>

      <section data-testid="reviewer-consensus-disagreements">
        <h4>Largest disagreements</h4>
        {consensus.largestDisagreements.length === 0 ? (
          <p>No major disagreements.</p>
        ) : (
          <ul>
            {consensus.largestDisagreements.map((entry) => (
              <li key={entry.criterionId}>{entry.criterionId}: {entry.spread.toFixed(2)}</li>
            ))}
          </ul>
        )}
      </section>

      {!flags.isEssential ? (
        <section data-testid="reviewer-consensus-role-comparisons">
          <h4>Role-based comparisons</h4>
          <ul>
            {consensus.roleComparisons.map((entry) => (
              <li key={entry.role}>
                {entry.role}: {entry.avgScore.toFixed(2)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {consensus.escalationRecommended ? (
        <p data-testid="reviewer-consensus-escalation-callout">Escalation recommended based on consensus divergence.</p>
      ) : null}
    </section>
  );
}
