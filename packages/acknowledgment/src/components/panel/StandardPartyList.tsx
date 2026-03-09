import type {
  IAcknowledgmentConfig,
  IAcknowledgmentEvent,
  IAcknowledgmentParty,
  IAcknowledgmentState,
  AcknowledgmentStatus,
} from '../../types';

// ─── Inline Helpers ─────────────────────────────────────────────────────────

function Avatar({ displayName }: { displayName: string }) {
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="hbc-ack-avatar" aria-hidden="true">
      {initials}
    </span>
  );
}

function StatusBadge({
  status,
  isPendingSync,
  isBypass,
}: {
  status: AcknowledgmentStatus;
  isPendingSync: boolean;
  isBypass?: boolean;
}) {
  let label: string;
  let className = 'hbc-ack-status-badge';

  if (isPendingSync) {
    label = 'Syncing';
    className += ' hbc-ack-status-badge--syncing';
  } else if (isBypass) {
    label = 'Bypassed';
    className += ' hbc-ack-status-badge--bypassed';
  } else {
    switch (status) {
      case 'acknowledged':
        label = 'Acknowledged';
        className += ' hbc-ack-status-badge--acknowledged';
        break;
      case 'declined':
        label = 'Declined';
        className += ' hbc-ack-status-badge--declined';
        break;
      case 'bypassed':
        label = 'Bypassed';
        className += ' hbc-ack-status-badge--bypassed';
        break;
      default:
        label = 'Pending';
        className += ' hbc-ack-status-badge--pending';
    }
  }

  return <span className={className}>{label}</span>;
}

function LockIcon() {
  return (
    <span className="hbc-ack-lock-icon" aria-label="Waiting for earlier party to acknowledge">
      🔒
    </span>
  );
}

// ─── PartyRow ───────────────────────────────────────────────────────────────

interface PartyRowProps {
  party: IAcknowledgmentParty;
  event: IAcknowledgmentEvent | undefined;
  isCurrentUser: boolean;
  canAct: boolean;
  isCurrentTurn: boolean;
  isSubmitting: boolean;
  mode: IAcknowledgmentConfig<unknown>['mode'];
  onAcknowledge: () => void;
  onDecline?: () => void;
}

function PartyRow({
  party,
  event,
  isCurrentUser,
  canAct,
  isCurrentTurn,
  isSubmitting,
  mode,
  onAcknowledge,
  onDecline,
}: PartyRowProps) {
  const isPendingSync = event?.isPendingSync ?? false;
  const status = event?.status ?? 'pending';

  return (
    <li
      className="hbc-ack-party-row"
      aria-current={isCurrentUser && isCurrentTurn ? 'step' : undefined}
    >
      <Avatar displayName={party.displayName} />
      <div className="hbc-ack-party-row__info">
        <span className="hbc-ack-party-row__name">{party.displayName}</span>
        <span className="hbc-ack-party-row__role">{party.role}</span>
      </div>

      <StatusBadge
        status={status}
        isPendingSync={isPendingSync}
        isBypass={event?.isBypass}
      />

      {/* Sequential locked row — not yet their turn */}
      {mode === 'sequential' && !isCurrentTurn && status === 'pending' && (
        <LockIcon />
      )}

      {/* Action row — current user, their turn */}
      {isCurrentUser && canAct && isCurrentTurn && (
        <div className="hbc-ack-party-row__actions">
          <button
            onClick={onAcknowledge}
            disabled={isSubmitting}
            className="hbc-btn hbc-btn--primary hbc-btn--sm"
          >
            Acknowledge
          </button>
          {onDecline && (
            <button
              onClick={onDecline}
              disabled={isSubmitting}
              className="hbc-btn hbc-btn--ghost hbc-btn--danger hbc-btn--sm"
            >
              Decline
            </button>
          )}
        </div>
      )}
    </li>
  );
}

// ─── StandardPartyList ──────────────────────────────────────────────────────

export interface StandardPartyListProps {
  config: IAcknowledgmentConfig<unknown>;
  state: IAcknowledgmentState;
  parties: IAcknowledgmentParty[];
  currentUserId: string;
  canAct: boolean;
  isCurrentTurn: boolean;
  isSubmitting: boolean;
  onAcknowledge: () => void;
  onDecline?: () => void;
}

export function StandardPartyList({
  config,
  state,
  parties,
  currentUserId,
  canAct,
  isCurrentTurn,
  isSubmitting,
  onAcknowledge,
  onDecline,
}: StandardPartyListProps) {
  return (
    <ul className="hbc-ack-party-list" role="list">
      {parties.map((party) => {
        const event = state.events.find((e) => e.partyUserId === party.userId);
        const isCurrentUser = party.userId === currentUserId;
        const isThisPartyCurrentTurn =
          config.mode === 'sequential'
            ? state.currentSequentialParty?.userId === party.userId
            : isCurrentTurn;

        return (
          <PartyRow
            key={party.userId}
            party={party}
            event={event}
            isCurrentUser={isCurrentUser}
            canAct={canAct}
            isCurrentTurn={isThisPartyCurrentTurn}
            isSubmitting={isSubmitting}
            mode={config.mode}
            onAcknowledge={onAcknowledge}
            onDecline={onDecline}
          />
        );
      })}
    </ul>
  );
}
