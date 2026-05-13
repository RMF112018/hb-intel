import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';

export interface AdobeSignConnectionGuidanceCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');

export function AdobeSignConnectionGuidanceCard({
  spanOverrides,
}: AdobeSignConnectionGuidanceCardProps) {
  return (
    <MyWorkCard
      role="adobe-sign-connection-guidance"
      footprint="standard"
      spanOverrides={spanOverrides}
      eyebrow="Connection"
      title="Connect Adobe Sign"
      module={ADOBE_MODULE.id}
    >
      <p className={styles.bodyText}>
        Adobe Sign credentials and source authorization will be configured by an administrator.
        You will see your action queue here once the connection is approved.
      </p>
    </MyWorkCard>
  );
}

export default AdobeSignConnectionGuidanceCard;
