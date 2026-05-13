import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';

export interface WorkSummaryCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
}

const PENDING_VALUE = 'Pending source connection';
const ADOBE_SIGN_LABEL = 'Adobe Sign';

export function WorkSummaryCard({ spanOverrides }: WorkSummaryCardProps) {
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
          <span className={styles.rowValue}>—</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Connected sources</span>
          <span className={styles.rowValue}>{ADOBE_SIGN_LABEL}</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Last refresh</span>
          <span className={styles.rowValue}>{PENDING_VALUE}</span>
        </li>
      </ul>
    </MyWorkCard>
  );
}

export default WorkSummaryCard;
