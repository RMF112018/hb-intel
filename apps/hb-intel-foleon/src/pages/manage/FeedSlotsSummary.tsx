import type { FeedSlotSummary } from './feedSlotsViewModel.js';
import shell from './manageShell.module.css';

export interface FeedSlotsSummaryProps {
  readonly slots: ReadonlyArray<FeedSlotSummary>;
  readonly onSelectSlot: (slot: FeedSlotSummary) => void;
}

export function FeedSlotsSummary(props: FeedSlotsSummaryProps): React.ReactNode {
  return (
    <section
      className={shell.feedSlotsPanel}
      role="region"
      aria-label="Feed Slots"
    >
      <header className={shell.feedSlotsHeader}>
        <h3 className={shell.feedSlotsHeading}>Feed Slots</h3>
        <p className={shell.feedSlotsIntro}>
          The three HB Central feeds that surface Foleon content to employees.
        </p>
      </header>
      <ul className={shell.feedSlotsList} role="list">
        {props.slots.map((slot) => (
          <li
            key={slot.lane}
            className={shell.feedSlotRow}
            data-feed-slot={slot.lane}
            data-feed-slot-state={slot.state}
          >
            <button
              type="button"
              className={shell.feedSlotButton}
              onClick={(): void => props.onSelectSlot(slot)}
              aria-label={`${slot.label} slot — ${slot.statusLabel}. ${slot.nextAction}`}
            >
              <span className={shell.feedSlotPrimary}>
                <span className={shell.feedSlotLabel}>{slot.label}</span>
                <span
                  className={shell.feedSlotStatusPill}
                  data-feed-slot-status={slot.state}
                >
                  {slot.statusLabel}
                </span>
              </span>
              <dl className={shell.feedSlotDetails}>
                <div>
                  <dt>Live</dt>
                  <dd>{slot.liveTitle ?? '—'}</dd>
                </div>
                <div>
                  <dt>Next</dt>
                  <dd>{slot.nextTitle ?? '—'}</dd>
                </div>
                <div>
                  <dt>Display window</dt>
                  <dd>{slot.displayWindow}</dd>
                </div>
                <div>
                  <dt>Blockers</dt>
                  <dd>{slot.blockerCount === 0 ? 'None' : `${slot.blockerCount}`}</dd>
                </div>
              </dl>
              <p className={shell.feedSlotNextAction}>{slot.nextAction}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
