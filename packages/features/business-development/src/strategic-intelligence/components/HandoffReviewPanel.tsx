import type { IHandoffReviewState } from '@hbc/strategic-intelligence';
import {
  HANDOFF_REQUIRED_ROLES,
  HANDOFF_STEPS,
  getDisplayDate,
} from './displayModel.js';

export interface HandoffReviewPanelProps {
  review: IHandoffReviewState | null;
  snapshotAligned: boolean;
  unresolvedCommitmentIds: string[];
  unacknowledgedParticipantIds: string[];
  onAcknowledgeParticipant?: (participantId: string, note?: string) => void;
  onMarkCompletion?: (note?: string) => void;
}

export const HandoffReviewPanel = ({
  review,
  snapshotAligned,
  unresolvedCommitmentIds,
  unacknowledgedParticipantIds,
  onAcknowledgeParticipant,
  onMarkCompletion,
}: HandoffReviewPanelProps) => {
  const participants = review?.participants ?? [];

  return (
    <section data-testid="handoff-review-panel" aria-label="Handoff review workflow">
      <h3>Handoff Review Workflow</h3>
      <p>
        Snapshot alignment:{' '}
        {snapshotAligned ? 'Aligned to heritage snapshot' : 'Not aligned to heritage snapshot'}
      </p>

      <ol aria-label="Handoff workflow steps">
        {HANDOFF_STEPS.map((step, index) => (
          <li key={step} data-testid={`handoff-step-${index + 1}`}>
            {index + 1}. {step}
          </li>
        ))}
      </ol>

      <section aria-label="Required participants">
        <h4>Required Participants</h4>
        <ul>
          {HANDOFF_REQUIRED_ROLES.map((role) => {
            const participant = participants.find((item) => item.role === role);
            const acknowledged = participant?.acknowledgedAt !== null && participant?.acknowledgedAt !== undefined;

            return (
              <li key={role} data-testid={`handoff-participant-${role.replace(/\s+/g, '-').toLowerCase()}`}>
                <p>{role}</p>
                <p>
                  {participant
                    ? acknowledged
                      ? `Acknowledged ${getDisplayDate(participant.acknowledgedAt)}`
                      : 'Pending acknowledgment'
                    : 'Missing participant'}
                </p>
                {participant && !acknowledged ? (
                  <button
                    type="button"
                    onClick={() => onAcknowledgeParticipant?.(participant.participantId)}
                    aria-label={`Acknowledge ${role}`}
                  >
                    Acknowledge
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Completion gate" data-testid="handoff-completion-gate">
        <h4>Completion Gate</h4>
        <p>
          Unresolved commitments: {unresolvedCommitmentIds.length}
        </p>
        <p>
          Missing acknowledgments: {unacknowledgedParticipantIds.length}
        </p>
        <p>
          {unresolvedCommitmentIds.length === 0 && unacknowledgedParticipantIds.length === 0
            ? 'Ready to complete handoff review'
            : 'Handoff review blocked until all acknowledgments and commitments are resolved'}
        </p>
        <button
          type="button"
          onClick={() => onMarkCompletion?.()}
          aria-label="Mark handoff review completion"
        >
          Mark completion
        </button>
      </section>
    </section>
  );
};
