import type { FC } from 'react';
import {
  PRIORITY_ACTION_CATEGORY_LABELS,
  SAMPLE_PRIORITY_ACTIONS,
  type IPriorityAction,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { priorityToneForAction, type PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

interface PccPriorityActionsCardProps extends PccProjectHomeCardProps {
  /** Optional read-model data; when omitted, falls back to SAMPLE_PRIORITY_ACTIONS. */
  readonly actions?: readonly IPriorityAction[];
}

const PriorityActionsBody: FC<{ actions: readonly IPriorityAction[] }> = ({ actions }) => (
  <ul className={styles.list} data-pcc-priority-actions-body="">
    {actions.map((action) => {
      const tone = priorityToneForAction(action);
      return (
        <li
          key={action.id}
          className={styles.listRow}
          data-pcc-priority-action-id={action.id}
          data-pcc-priority-tone={tone}
          data-pcc-priority-category={action.category}
        >
          <div className={styles.listRowMain}>
            <span className={styles.listRowTitle}>{action.title}</span>
            {action.summary ? (
              <span className={styles.listRowSummary}>{action.summary}</span>
            ) : null}
            <span className={styles.listRowMeta}>
              <span>{PRIORITY_ACTION_CATEGORY_LABELS[action.category]}</span>
              {action.dueDate ? (
                <span className={styles.listRowMetaSep}>Due {action.dueDate}</span>
              ) : null}
              {action.assigneePersona ? (
                <span className={styles.listRowMetaSep}>{action.assigneePersona}</span>
              ) : null}
            </span>
          </div>
        </li>
      );
    })}
  </ul>
);

export const PccPriorityActionsCard: FC<PccPriorityActionsCardProps> = ({
  state = 'preview',
  actions,
}) => (
  <PccDashboardCard footprint="tall" eyebrow="Today" title="Priority Actions">
    {state === 'preview' ? (
      <PriorityActionsBody actions={actions ?? SAMPLE_PRIORITY_ACTIONS} />
    ) : (
      <PccPreviewState state={state} />
    )}
  </PccDashboardCard>
);

export default PccPriorityActionsCard;
