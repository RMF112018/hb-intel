import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';

export interface AdobeSignAgreementActionListCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');

export function AdobeSignAgreementActionListCard({
  spanOverrides,
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
      <p className={styles.bodyText}>
        Agreements awaiting your review, signature, or approval will appear here once the Adobe
        Sign queue feed is available.
      </p>
      <p className={styles.bodyText}>{ADOBE_MODULE.authorityCue}</p>
    </MyWorkCard>
  );
}

export default AdobeSignAgreementActionListCard;
