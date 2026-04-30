import type { FC } from 'react';
import { useId } from 'react';
import { PRIORITY_ACTION_CATEGORY_LABELS } from '@hbc/models/pcc';
import type { PccPriorityTone } from './shared.js';
import type {
  IPccPriorityActionsRailViewModel,
  IPccPriorityRailGroup,
  IPccPriorityRailItem,
} from './priorityActionsRailViewModel.js';
import styles from './PccPriorityActionsRail.module.css';

/**
 * Visible, screen-reader-readable copy for the per-row priority chip.
 * Tone/status must not be color-only — the visible "Priority: …" text is
 * the primary signal; tone-tinted color is supplementary.
 */
const PRIORITY_TONE_LABELS: Readonly<Record<PccPriorityTone, string>> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/**
 * Wave 5 / Prompt 03 — PCC-local Priority Actions Rail UI.
 *
 * Renders the Prompt 02 view-model. Presentational only:
 *  - no backend consumption;
 *  - no `fetch(`;
 *  - no execution affordance — per-row affordance is a non-interactive
 *    "Preview only" span (no button, no onClick, no anchor, no href);
 *  - no auth/persona derivation, no shared-model mutation, no
 *    `HbcPriorityRail` reuse.
 *
 * Integration into `PccPriorityActionsCard` belongs to Prompt 04. Backend
 * `priority-actions` consumption is deferred to Prompt 05 under explicit
 * opt-in only (W5-OD-002).
 */

export interface PccPriorityActionsRailProps {
  readonly viewModel: IPccPriorityActionsRailViewModel;
  /** Optional `aria-label` for the rail region. Defaults to "Priority Actions". */
  readonly ariaLabel?: string;
}

interface RailRowProps {
  readonly item: IPccPriorityRailItem;
}

const RailRow: FC<RailRowProps> = ({ item }) => (
  <li
    className={styles.row}
    data-pcc-priority-rail-action-id={item.id}
    data-pcc-priority-rail-action-tone={item.tone}
  >
    <div className={styles.rowMain}>
      <span className={styles.rowTitle}>{item.title}</span>
      {item.summary ? <span className={styles.rowSummary}>{item.summary}</span> : null}
      <span className={styles.rowMeta}>
        <span
          className={styles.rowToneLabel}
          data-pcc-priority-rail-tone-label={item.tone}
        >
          Priority: {PRIORITY_TONE_LABELS[item.tone]}
        </span>
        <span className={styles.rowMetaSep}>{PRIORITY_ACTION_CATEGORY_LABELS[item.category]}</span>
        {item.dueDate ? (
          <span className={styles.rowMetaSep}>Due {item.dueDate}</span>
        ) : null}
        {item.assigneePersona ? (
          <span className={styles.rowMetaSep}>{item.assigneePersona}</span>
        ) : null}
        {item.relatedWorkCenter ? (
          <span className={styles.rowMetaSep}>{item.relatedWorkCenter}</span>
        ) : null}
      </span>
    </div>
    <span
      className={styles.rowAffordance}
      data-pcc-priority-rail-disabled-action=""
    >
      Preview only
    </span>
  </li>
);

interface RailGroupProps {
  readonly group: IPccPriorityRailGroup;
}

const RailGroup: FC<RailGroupProps> = ({ group }) => {
  const headingId = useId();
  return (
    <section
      className={styles.group}
      data-pcc-priority-rail-group={group.id}
      aria-labelledby={headingId}
    >
      <header className={styles.groupHeader}>
        <h4 id={headingId} className={styles.groupTitle}>
          {group.meta.displayName}
        </h4>
        <span className={styles.groupCount} aria-label={`${group.count} items`}>
          {group.count}
        </span>
      </header>
      {group.count === 0 ? (
        <p
          className={styles.groupEmpty}
          data-pcc-priority-rail-group-empty=""
        >
          No items
        </p>
      ) : (
        <ul role="list" className={styles.list}>
          {group.items.map((item) => (
            <RailRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
};

export const PccPriorityActionsRail: FC<PccPriorityActionsRailProps> = ({
  viewModel,
  ariaLabel,
}) => {
  // Rail-level empty: single clear state beats stacking a secondary empty
  // inside each empty lane. Skip the four lanes when nothing visible.
  if (viewModel.visibleCount === 0) {
    return (
      <section
        className={styles.rail}
        data-pcc-priority-rail=""
        aria-label={ariaLabel ?? 'Priority Actions'}
      >
        <p className={styles.railEmpty} data-pcc-priority-rail-empty="">
          No priority actions.
        </p>
      </section>
    );
  }
  return (
    <section
      className={styles.rail}
      data-pcc-priority-rail=""
      aria-label={ariaLabel ?? 'Priority Actions'}
    >
      {viewModel.groups.map((group) => (
        <RailGroup key={group.id} group={group} />
      ))}
    </section>
  );
};

export default PccPriorityActionsRail;
