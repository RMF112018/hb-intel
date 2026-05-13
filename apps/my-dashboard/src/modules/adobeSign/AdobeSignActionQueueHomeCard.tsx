import { getMyWorkModule, type MyWorkModuleId } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';

export interface AdobeSignActionQueueHomeCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  readonly onSelectModule?: (id: MyWorkModuleId) => void;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');
const PENDING_VALUE = 'Pending source connection';

export function AdobeSignActionQueueHomeCard({
  spanOverrides,
  onSelectModule,
}: AdobeSignActionQueueHomeCardProps) {
  const ctaDisabled = !onSelectModule;
  const ctaProps = ctaDisabled
    ? { 'aria-disabled': 'true' as const, disabled: true }
    : { onClick: () => onSelectModule!(ADOBE_MODULE.id) };

  return (
    <MyWorkCard
      role="adobe-sign-action-queue-home"
      footprint="wide"
      spanOverrides={spanOverrides}
      eyebrow={ADOBE_MODULE.sourceSystem}
      title={ADOBE_MODULE.label}
      module={ADOBE_MODULE.id}
      action={
        <button type="button" className={styles.cta} {...ctaProps}>
          View queue
        </button>
      }
    >
      <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Pending agreements</span>
          <span className={styles.rowValue}>—</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Awaiting your action</span>
          <span className={styles.rowValue}>—</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Last refresh</span>
          <span className={styles.rowValue}>{PENDING_VALUE}</span>
        </li>
      </ul>
      <p className={styles.bodyText}>{ADOBE_MODULE.authorityCue}</p>
    </MyWorkCard>
  );
}

export default AdobeSignActionQueueHomeCard;
