import React from 'react';
import type {
  ICommitmentRegisterItem,
  IHandoffReviewState,
  IHeritageSnapshot,
  IStrategicIntelligenceEntry,
  ISuggestedIntelligenceMatch,
} from '@hbc/strategic-intelligence';
import type {
  BdStrategicIntelligenceBicOwnerAvatarProjection,
} from '../hooks/index.js';
import {
  getAcknowledgmentSummary,
  getCommitmentSummary,
  getComplexityFlags,
  getDisplayDate,
  getReliabilityLabel,
  type StrategicIntelligenceComplexityMode,
} from './displayModel.js';
import {
  StrategicIntelligenceFeed,
  type StrategicIntelligenceFeedProps,
} from './StrategicIntelligenceFeed.js';
import type { SuggestedIntelligenceAction } from './SuggestedIntelligenceCard.js';

export interface BdHeritagePanelProps {
  heritageSnapshot: IHeritageSnapshot;
  livingEntries: IStrategicIntelligenceEntry[];
  commitments: ICommitmentRegisterItem[];
  handoffReview: IHandoffReviewState | null;
  suggestions: ISuggestedIntelligenceMatch[];
  bicOwnerAvatars?: BdStrategicIntelligenceBicOwnerAvatarProjection[];
  complexity: StrategicIntelligenceComplexityMode;
  canViewNonApproved?: boolean;
  canViewSensitiveContent?: boolean;
  syncBadge?: StrategicIntelligenceFeedProps['syncBadge'];
  roleLabel?: string;
  onOpenRelatedItem?: StrategicIntelligenceFeedProps['onOpenRelatedItem'];
  onOpenResolutionNote?: StrategicIntelligenceFeedProps['onOpenResolutionNote'];
  onSuggestionOutcome?: (suggestionId: string, action: SuggestedIntelligenceAction) => void;
  onOpenExplainability?: (suggestionId: string) => void;
  onOpenWorkflowAction?: () => void;
}

export const BdHeritagePanel = ({
  heritageSnapshot,
  livingEntries,
  commitments,
  handoffReview,
  suggestions,
  bicOwnerAvatars = [],
  complexity,
  canViewNonApproved = false,
  canViewSensitiveContent = false,
  syncBadge,
  roleLabel,
  onOpenRelatedItem,
  onOpenResolutionNote,
  onSuggestionOutcome,
  onOpenExplainability,
  onOpenWorkflowAction,
}: BdHeritagePanelProps) => {
  const flags = getComplexityFlags(complexity);
  const commitmentSummary = getCommitmentSummary(commitments);
  const acknowledgmentSummary = getAcknowledgmentSummary(handoffReview);

  const approvedEntries = livingEntries.filter((entry) => entry.lifecycleState === 'approved');
  const staleEntries = livingEntries.filter((entry) => entry.trust.isStale);

  return (
    <section aria-label="BD Heritage Panel" data-testid="bd-heritage-panel">
      <header>
        <h2>BD Heritage Panel</h2>
        <p data-testid="heritage-decision-badge">Decision: {heritageSnapshot.decision}</p>
        <p>Client context: {heritageSnapshot.clientPriorities.join(', ') || 'Not set'}</p>
        <p>Handoff date: {getDisplayDate(heritageSnapshot.capturedAt)}</p>
        <p data-testid="heritage-immutable-indicator">
          Immutable provenance: {heritageSnapshot.immutable ? 'Locked snapshot' : 'Mutable'}
        </p>
      </header>

      <section aria-label="Commitment register summary" data-testid="commitment-summary-strip">
        <h3>Commitment Register</h3>
        <p>Total commitments: {commitmentSummary.total}</p>
        <p>
          Unresolved commitments: {commitmentSummary.unresolvedCount}
          {commitmentSummary.hasWarning ? ' (warning)' : ''}
        </p>
      </section>

      <section aria-label="Handoff acknowledgment" data-testid="handoff-ack-summary">
        <h3>Handoff Review</h3>
        <p>
          Acknowledged: {acknowledgmentSummary.acknowledgedCount}/
          {acknowledgmentSummary.participantCount}
        </p>
        <p>{acknowledgmentSummary.isComplete ? 'Acknowledgment complete' : 'Acknowledgment pending'}</p>
      </section>

      <section aria-label="Heritage snapshot" data-testid="heritage-snapshot-section">
        <h3>Heritage Snapshot</h3>
        {flags.isEssential ? (
          <div data-testid="heritage-essential-summary">
            <p>{heritageSnapshot.decisionRationale}</p>
            <p>Trust summary: {staleEntries.length} stale entry markers across living intelligence.</p>
          </div>
        ) : (
          <dl>
            <div>
              <dt>Competitive context</dt>
              <dd>{heritageSnapshot.competitiveContext}</dd>
            </div>
            <div>
              <dt>Relationship intelligence</dt>
              <dd>{heritageSnapshot.relationshipIntelligence}</dd>
            </div>
            <div>
              <dt>Pursuit strategy</dt>
              <dd>{heritageSnapshot.pursuitStrategy}</dd>
            </div>
            <div>
              <dt>Risk assumptions</dt>
              <dd>{heritageSnapshot.riskAssumptions.join(', ') || 'None'}</dd>
            </div>
          </dl>
        )}
      </section>

      <section
        aria-label="Living strategic intelligence"
        data-testid="living-strategic-intelligence-section"
      >
        <h3>Living Strategic Intelligence</h3>
        {flags.isEssential ? (
          <div data-testid="living-essential-summary">
            <p>Entries: {livingEntries.length}</p>
            <p>Approved: {approvedEntries.length}</p>
            <p>Stale: {staleEntries.length}</p>
            <p>
              Trust badges:{' '}
              {livingEntries
                .map((entry) => getReliabilityLabel(entry.trust.reliabilityTier))
                .slice(0, 3)
                .join(' • ')}
            </p>
          </div>
        ) : (
          <StrategicIntelligenceFeed
            entries={livingEntries}
            suggestions={suggestions}
            bicOwnerAvatars={bicOwnerAvatars}
            canViewNonApproved={flags.isStandard ? false : canViewNonApproved}
            canViewSensitiveContent={canViewSensitiveContent}
            roleLabel={roleLabel}
            syncBadge={syncBadge}
            defaultLifecycleFilter={flags.isStandard ? 'approved' : 'all'}
            onOpenRelatedItem={onOpenRelatedItem}
            onOpenResolutionNote={onOpenResolutionNote}
            onSuggestionOutcome={onSuggestionOutcome}
            onOpenExplainability={onOpenExplainability}
          />
        )}
      </section>

      {flags.isExpert ? (
        <section data-testid="expert-workflow-cta" aria-label="Expert workflow actions">
          <button
            type="button"
            onClick={onOpenWorkflowAction}
            aria-label="Open workflow action center"
          >
            Open workflow actions
          </button>
          <p>Expert diagnostics include conflict resolution notes and explainability pathways.</p>
        </section>
      ) : null}
    </section>
  );
};
