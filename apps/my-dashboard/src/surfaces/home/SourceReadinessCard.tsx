import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';

export interface SourceReadinessCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
}

export function SourceReadinessCard({ spanOverrides }: SourceReadinessCardProps) {
  return (
    <MyWorkCard
      role="source-readiness"
      footprint="compact"
      spanOverrides={spanOverrides}
      eyebrow="Sources"
      title="Source readiness"
    >
      <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Adobe Sign</span>
          <span className={styles.rowValue}>Connection pending</span>
        </li>
      </ul>
      <p className={styles.bodyText}>
        Configure the Adobe Sign connection to begin populating your action queue.
      </p>
    </MyWorkCard>
  );
}

export default SourceReadinessCard;
