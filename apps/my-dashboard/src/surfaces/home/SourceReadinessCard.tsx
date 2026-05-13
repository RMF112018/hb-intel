import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import type { SourceReadinessVm } from '../../state/myWorkCardViewModel.js';

export interface SourceReadinessCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  /**
   * View-model derived from the home envelope's `sourceReadiness` array.
   * When provided, the card renders one row per source with its typed
   * status label and per-status guidance. When absent, the card preserves
   * the legacy generic "Connection pending" copy.
   */
  readonly vm?: SourceReadinessVm;
}

export function SourceReadinessCard({ spanOverrides, vm }: SourceReadinessCardProps) {
  const items = vm?.items ?? null;
  return (
    <MyWorkCard
      role="source-readiness"
      footprint="compact"
      spanOverrides={spanOverrides}
      eyebrow="Sources"
      title="Source readiness"
    >
      {items && items.length > 0 ? (
        <>
          <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {items.map((item) => (
              <li
                key={item.sourceSystem}
                className={styles.row}
                data-source-readiness-system={item.sourceSystem}
                data-source-readiness-status={item.sourceStatus}
              >
                <span className={styles.rowLabel}>{item.label}</span>
                <span className={styles.rowValue}>{item.statusCopy.stateLabel}</span>
              </li>
            ))}
          </ul>
          {items.map((item) => (
            <p key={`${item.sourceSystem}-guidance`} className={styles.bodyText}>
              {item.statusCopy.guidance}
            </p>
          ))}
        </>
      ) : (
        <>
          <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            <li className={styles.row}>
              <span className={styles.rowLabel}>Adobe Sign</span>
              <span className={styles.rowValue}>Connection pending</span>
            </li>
          </ul>
          <p className={styles.bodyText}>
            Configure the Adobe Sign connection to begin populating your action queue.
          </p>
        </>
      )}
    </MyWorkCard>
  );
}

export default SourceReadinessCard;
