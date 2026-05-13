import { useState } from 'react';
import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import type { ConnectionGuidanceVm } from '../../state/myWorkCardViewModel.js';

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
  /**
   * View-model derived from the active source status. When provided, the
   * card renders the typed per-status headline and guidance, and only
   * shows the Connect CTA when `vm.ctaVisible` is true (i.e., status is
   * `authorization-required`). When absent, the card preserves the
   * legacy generic guidance copy and shows the Connect CTA whenever
   * `onConnect` is supplied — preserving prior behavior.
   */
  readonly vm?: ConnectionGuidanceVm;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');
const DEFAULT_GUIDANCE =
  'Adobe Sign credentials and source authorization will be configured by an administrator. You will see your action queue here once the connection is approved.';

type ConnectState = 'idle' | 'connecting' | 'error';

export function AdobeSignConnectionGuidanceCard({
  spanOverrides,
  onConnect,
  vm,
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

  // When vm is supplied, the CTA visibility is gated on the typed status;
  // when vm is absent, preserve legacy behavior (CTA visible whenever onConnect provided).
  const ctaVisible = vm ? vm.ctaVisible && Boolean(onConnect) : Boolean(onConnect);
  const guidance = vm?.guidance ?? DEFAULT_GUIDANCE;

  return (
    <MyWorkCard
      role="adobe-sign-connection-guidance"
      footprint="standard"
      spanOverrides={spanOverrides}
      eyebrow="Connection"
      title={vm?.headline ?? 'Connect Adobe Sign'}
      module={ADOBE_MODULE.id}
      extraDataAttributes={
        vm?.sourceStatus ? { 'data-adobe-sign-guidance-status': vm.sourceStatus } : undefined
      }
    >
      <p className={styles.bodyText}>{guidance}</p>
      {ctaVisible ? (
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
