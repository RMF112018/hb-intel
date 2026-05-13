import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import type { AdobeQueueSummaryVm } from '../../state/myWorkCardViewModel.js';

export interface AdobeSignQueueSummaryCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  /**
   * View-model derived from the Adobe queue read-model envelope. When
   * absent, the card renders three em-dash placeholders.
   */
  readonly vm?: AdobeQueueSummaryVm;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');

function formatCount(n: number | null | undefined): string {
  return n === null || n === undefined ? '—' : String(n);
}

export function AdobeSignQueueSummaryCard({ spanOverrides, vm }: AdobeSignQueueSummaryCardProps) {
  return (
    <MyWorkCard
      role="adobe-sign-queue-summary"
      footprint="standard"
      spanOverrides={spanOverrides}
      eyebrow={ADOBE_MODULE.sourceSystem}
      title="Adobe Sign Queue Summary"
      module={ADOBE_MODULE.id}
    >
      <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Pending agreements</span>
          <span
            className={styles.rowValue}
            data-adobe-queue-summary-pending={vm?.pendingAgreementsCount ?? ''}
          >
            {formatCount(vm?.pendingAgreementsCount)}
          </span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Signature actions</span>
          <span
            className={styles.rowValue}
            data-adobe-queue-summary-signature={vm?.signatureActionsCount ?? ''}
          >
            {formatCount(vm?.signatureActionsCount)}
          </span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Review actions</span>
          <span
            className={styles.rowValue}
            data-adobe-queue-summary-review={vm?.reviewActionsCount ?? ''}
          >
            {formatCount(vm?.reviewActionsCount)}
          </span>
        </li>
      </ul>
    </MyWorkCard>
  );
}

export default AdobeSignQueueSummaryCard;
