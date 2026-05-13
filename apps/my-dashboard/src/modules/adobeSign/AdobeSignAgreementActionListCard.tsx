import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import type { AdobeAgreementListVm } from '../../state/myWorkCardViewModel.js';

export interface AdobeSignAgreementActionListCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  /**
   * View-model derived from the Adobe queue read-model envelope. When
   * provided with items, the card renders the agreement list. When the
   * vm reports `isEmpty`, the card renders a truthful empty-state row.
   * When the vm is absent entirely, the card preserves the legacy
   * "feed not yet available" guidance copy.
   */
  readonly vm?: AdobeAgreementListVm;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');

export function AdobeSignAgreementActionListCard({
  spanOverrides,
  vm,
}: AdobeSignAgreementActionListCardProps) {
  return (
    <MyWorkCard
      role="adobe-sign-agreement-action-list"
      footprint="wide"
      spanOverrides={spanOverrides}
      eyebrow={ADOBE_MODULE.sourceSystem}
      title="Agreement Action List"
      module={ADOBE_MODULE.id}
      extraDataAttributes={{ 'data-my-work-adobe-sign-queue': '' }}
    >
      {vm ? (
        vm.isEmpty ? (
          <p className={styles.bodyText} data-my-work-empty-queue="">
            Your Adobe Sign action queue is empty. New agreements awaiting your action will appear
            here as they arrive.
          </p>
        ) : (
          <ul
            className={styles.content}
            style={{ margin: 0, padding: 0, listStyle: 'none' }}
            data-my-work-agreement-list=""
          >
            {vm.items.map((item) => (
              <li
                key={item.itemId}
                className={styles.row}
                data-my-work-agreement-item={item.itemId}
                data-my-work-agreement-required-action={item.requiredAction}
              >
                <span className={styles.rowLabel}>{item.agreementName}</span>
                <span className={styles.rowValue}>
                  {item.requiredActionLabel}
                  {item.senderLabel ? ` · From ${item.senderLabel}` : ''}
                  {item.expiresLabel ? ` · Expires ${item.expiresLabel}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <p className={styles.bodyText}>
            Agreements awaiting your review, signature, or approval will appear here once the Adobe
            Sign queue feed is available.
          </p>
          <p className={styles.bodyText}>{ADOBE_MODULE.authorityCue}</p>
        </>
      )}
    </MyWorkCard>
  );
}

export default AdobeSignAgreementActionListCard;
