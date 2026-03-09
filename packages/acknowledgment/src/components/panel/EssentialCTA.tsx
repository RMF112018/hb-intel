import type { IAcknowledgmentState } from '../../types';

interface EssentialCTAProps {
  state: IAcknowledgmentState;
  canAct: boolean;
  isSubmitting: boolean;
  onAcknowledge: () => void;
  onDecline?: () => void;
}

export function EssentialCTA({
  state,
  canAct,
  isSubmitting,
  onAcknowledge,
  onDecline,
}: EssentialCTAProps) {
  if (state.isComplete) {
    return (
      <p className="hbc-ack-panel__complete-msg" role="status">
        ✓ Sign-off complete
      </p>
    );
  }

  if (state.overallStatus === 'declined') {
    return (
      <p className="hbc-ack-panel__declined-msg" role="alert">
        ✗ Acknowledgment declined — workflow blocked
      </p>
    );
  }

  if (!canAct) {
    return (
      <p className="hbc-ack-panel__waiting-msg">
        ⏳ Waiting for sign-off
      </p>
    );
  }

  return (
    <div className="hbc-ack-panel__essential-cta">
      <p className="hbc-ack-panel__prompt">Your acknowledgment is required.</p>
      <div className="hbc-ack-panel__actions">
        <button
          onClick={onAcknowledge}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="hbc-btn hbc-btn--primary"
        >
          {isSubmitting ? 'Submitting…' : 'Acknowledge'}
        </button>
        {onDecline && (
          <button
            onClick={onDecline}
            disabled={isSubmitting}
            className="hbc-btn hbc-btn--ghost hbc-btn--danger"
          >
            Decline
          </button>
        )}
      </div>
    </div>
  );
}
