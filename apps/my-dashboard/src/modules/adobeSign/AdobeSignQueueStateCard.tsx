import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import type { AdobeQueueStateVm } from '../../state/myWorkCardViewModel.js';

export interface AdobeSignQueueStateCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  /**
   * View-model derived from the active envelope's source status. When
   * provided, the card renders the typed state label and per-status
   * guidance. When absent, the card preserves the legacy generic
   * "Pending source connection" copy.
   */
  readonly vm?: AdobeQueueStateVm;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');
const PENDING_VALUE = 'Pending source connection';
const DEFAULT_GUIDANCE = 'Queue state will update once the Adobe Sign connection is configured.';

export function AdobeSignQueueStateCard({ spanOverrides, vm }: AdobeSignQueueStateCardProps) {
  const stateLabel = vm?.stateLabel ?? PENDING_VALUE;
  const guidance = vm?.guidance ?? DEFAULT_GUIDANCE;
  return (
    <MyWorkCard
      role="adobe-sign-queue-state"
      footprint="wide"
      spanOverrides={spanOverrides}
      eyebrow="Source posture"
      title="Adobe Sign Queue State"
      module={ADOBE_MODULE.id}
      extraDataAttributes={
        vm?.sourceStatus ? { 'data-adobe-sign-queue-state-status': vm.sourceStatus } : undefined
      }
    >
      <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Queue state</span>
          <span className={styles.rowValue}>{stateLabel}</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Source system</span>
          <span className={styles.rowValue}>{ADOBE_MODULE.sourceSystem}</span>
        </li>
      </ul>
      <p className={styles.bodyText}>{guidance}</p>
    </MyWorkCard>
  );
}

export default AdobeSignQueueStateCard;
