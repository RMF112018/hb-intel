import { useState } from 'react';
import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';

export interface AdobeSignConnectionGuidanceCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  /**
   * Optional consent-start callback wired by the shell. When provided,
   * the card renders an actionable "Connect Adobe Sign" button that
   * delegates the OAuth start round trip + navigation to the parent.
   * When absent (fixture / pre-bearer mode), the card renders only the
   * static guidance paragraph — no silent no-op button.
   */
  readonly onConnect?: () => Promise<void>;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');

type ConnectState = 'idle' | 'connecting' | 'error';

export function AdobeSignConnectionGuidanceCard({
  spanOverrides,
  onConnect,
}: AdobeSignConnectionGuidanceCardProps) {
  const [state, setState] = useState<ConnectState>('idle');

  const handleClick = async (): Promise<void> => {
    if (!onConnect) return;
    setState('connecting');
    try {
      await onConnect();
      // On success the parent is expected to navigate the browser away
      // (page unloads). Fall back to 'idle' if the promise resolves in
      // an environment that doesn't actually navigate (e.g., tests).
      setState('idle');
    } catch {
      setState('error');
    }
  };

  const isConnecting = state === 'connecting';
  const buttonLabel = isConnecting ? 'Connecting…' : 'Connect Adobe Sign';

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
        Adobe Sign credentials and source authorization will be configured by an administrator. You
        will see your action queue here once the connection is approved.
      </p>
      {onConnect ? (
        <>
          <button
            type="button"
            className={styles.cta}
            data-adobe-sign-connect-action="start"
            data-adobe-sign-connect-state={state}
            disabled={isConnecting}
            aria-disabled={isConnecting ? 'true' : undefined}
            onClick={() => {
              void handleClick();
            }}
          >
            {buttonLabel}
          </button>
          {state === 'error' ? (
            <p className={styles.bodyText} role="alert">
              Unable to start the Adobe Sign connection. Please try again.
            </p>
          ) : null}
        </>
      ) : null}
    </MyWorkCard>
  );
}

export default AdobeSignConnectionGuidanceCard;
