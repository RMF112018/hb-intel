import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import type { WorkSummaryVm } from '../../state/myWorkCardViewModel.js';

export interface WorkSummaryCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  /**
   * View-model derived from the home read-model envelope. When absent, the
   * card renders legacy placeholder copy so preview/test contexts that
   * supply no envelope continue to work.
   */
  readonly vm?: WorkSummaryVm;
}

const PENDING_VALUE = 'Pending source connection';
const ADOBE_SIGN_LABEL = 'Adobe Sign';

export function WorkSummaryCard({ spanOverrides, vm }: WorkSummaryCardProps) {
  const actionItems = vm?.actionItemCount ?? null;
  const connectedSources = vm?.connectedSourcesLabel ?? ADOBE_SIGN_LABEL;
  const lastRefresh = vm?.lastRefreshedLabel ?? PENDING_VALUE;
  return (
    <MyWorkCard
      role="work-summary"
      footprint="standard"
      spanOverrides={spanOverrides}
      eyebrow="Today"
      title="Work summary"
    >
      <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Action items</span>
          <span className={styles.rowValue} data-my-work-action-item-count={actionItems ?? ''}>
            {actionItems === null ? '—' : String(actionItems)}
          </span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Connected sources</span>
          <span className={styles.rowValue}>{connectedSources}</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Last refresh</span>
          <span className={styles.rowValue}>{lastRefresh}</span>
        </li>
      </ul>
    </MyWorkCard>
  );
}

export default WorkSummaryCard;
