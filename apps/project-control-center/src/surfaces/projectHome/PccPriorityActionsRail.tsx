import { useId, useState, type FC } from 'react';
import { PRIORITY_ACTION_CATEGORY_LABELS } from '@hbc/models/pcc';
import type { PccPriorityTone } from './shared.js';
import type {
  IPccPriorityActionsRailCompactSummary,
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
 * Renders the Wave 5 view-model, augmented in Wave 15A wave-b6 Prompt 03
 * with a compact-by-default homepage projection plus a local display-only
 * toggle that reveals the existing four-group full view. Presentational
 * only:
 *  - no backend consumption;
 *  - no `fetch(`;
 *  - no execution affordance — per-row affordance is a non-interactive
 *    "Source-owned" `<span>` with `data-pcc-priority-rail-disabled-action`
 *    (no button, no onClick, no anchor, no href);
 *  - no auth/persona derivation, no shared-model mutation, no
 *    `HbcPriorityRail` reuse;
 *  - the rail's expand/collapse toggle is a local display-only control —
 *    it changes only React UI state and never executes a source-system
 *    action, workflow action, approval, submission, save, sync, upload,
 *    writeback, or external launch.
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
        <span className={styles.rowToneLabel} data-pcc-priority-rail-tone-label={item.tone}>
          Priority: {PRIORITY_TONE_LABELS[item.tone]}
        </span>
        <span className={styles.rowMetaSep}>{PRIORITY_ACTION_CATEGORY_LABELS[item.category]}</span>
        {item.dueDate ? <span className={styles.rowMetaSep}>Due {item.dueDate}</span> : null}
        {item.assigneePersona ? (
          <span className={styles.rowMetaSep}>{item.assigneePersona}</span>
        ) : null}
        {item.relatedWorkCenter ? (
          <span className={styles.rowMetaSep}>{item.relatedWorkCenter}</span>
        ) : null}
      </span>
    </div>
    <span className={styles.rowAffordance} data-pcc-priority-rail-disabled-action="">
      Source-owned · act in owning module
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
        <p className={styles.groupEmpty} data-pcc-priority-rail-group-empty="">
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

interface OverflowSummaryProps {
  readonly summary: IPccPriorityActionsRailCompactSummary;
}

const OverflowSummary: FC<OverflowSummaryProps> = ({ summary }) => {
  const visibleHiddenGroups = summary.hiddenByGroup.filter((g) => g.hiddenCount > 0);
  return (
    <div className={styles.overflowSummary} data-pcc-priority-rail-overflow="">
      <p className={styles.overflowSummaryHeading} data-pcc-priority-rail-overflow-summary="">
        Remaining reference items: {summary.hiddenCount}
      </p>
      {visibleHiddenGroups.length > 0 ? (
        <ul
          role="list"
          className={styles.overflowByGroup}
          data-pcc-priority-rail-overflow-by-group=""
        >
          {visibleHiddenGroups.map((g) => (
            <li key={g.groupId} data-pcc-priority-rail-overflow-group-id={g.groupId}>
              {g.displayName}: {g.hiddenCount} hidden
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export const PccPriorityActionsRail: FC<PccPriorityActionsRailProps> = ({
  viewModel,
  ariaLabel,
}) => {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

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

  const { compactSummary } = viewModel;
  const showToggle = compactSummary.hiddenCount > 0;
  const showOverflow = !expanded && compactSummary.hiddenCount > 0;

  return (
    <section
      className={styles.rail}
      data-pcc-priority-rail=""
      aria-label={ariaLabel ?? 'Priority Actions'}
    >
      <div id={bodyId} data-pcc-priority-rail-body="">
        {expanded ? (
          viewModel.groups.map((group) => <RailGroup key={group.id} group={group} />)
        ) : (
          <ul role="list" className={styles.compactList} data-pcc-priority-rail-compact-list="">
            {compactSummary.visibleItems.map((item) => (
              <RailRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
      {showOverflow ? <OverflowSummary summary={compactSummary} /> : null}
      {showToggle ? (
        <button
          type="button"
          className={styles.toggle}
          data-pcc-priority-rail-toggle=""
          data-pcc-priority-rail-toggle-state={expanded ? 'expanded' : 'collapsed'}
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show fewer reference items' : 'Show additional reference items'}
        </button>
      ) : null}
    </section>
  );
};

export default PccPriorityActionsRail;
