import { useMemo, useState } from 'react';
import type {
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import type { MyWorkSurfaceReadinessVariant } from '../../state/myWorkSurfaceReadiness.js';
import {
  ADOBE_SIGN_ACTION_QUEUE_LOADING_BODY,
  ADOBE_SIGN_ACTION_QUEUE_READY_EMPTY_BODY,
  selectAdobeAgreementListVmFromItems,
  selectAdobeQueueSummaryVmFromSummary,
  selectAdobeSignActionQueueStateCopy,
  selectAdobeSignSourceStatus,
} from '../../state/myWorkCardViewModel.js';

const CARD_ROLE = 'adobe-sign-action-queue';
const MODULE_ID = 'adobe-sign-action-queue' as const;
const CARD_EYEBROW = 'Adobe Sign';
const CARD_TITLE = 'Action Queue';

const PREVIEW_ITEM_LIMIT = 5;

const MAX_SKELETON_ROWS = 3;

export interface AdobeSignActionQueueCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
  readonly readinessVariant: MyWorkSurfaceReadinessVariant;
  readonly homeEnvelope?: MyWorkReadModelEnvelope<MyWorkHomeReadModel>;
  /** Fallback source status when `homeEnvelope` is absent (legacy preview/test contract). */
  readonly sourceStatus?: MyWorkReadModelSourceStatus;
  /**
   * Shell-wired OAuth start callback. The Connect CTA renders only when
   * `sourceStatus === 'authorization-required'` AND this prop is provided.
   */
  readonly onConnect?: () => Promise<void>;
  readonly ariaLabel?: string;
}

type StateMarker =
  | 'loading'
  | 'authorization-required'
  | 'configuration-required'
  | 'principal-unresolved'
  | 'source-unavailable'
  | 'backend-unavailable'
  | 'partial'
  | 'available-empty'
  | 'available-items';

type ConnectState = 'idle' | 'connecting' | 'error';

function resolveStateMarker(
  readinessVariant: MyWorkSurfaceReadinessVariant,
  effectiveSourceStatus: MyWorkReadModelSourceStatus | undefined,
  itemCount: number,
): StateMarker {
  if (readinessVariant === 'loading') return 'loading';
  if (readinessVariant === 'error') return 'backend-unavailable';
  switch (effectiveSourceStatus) {
    case 'available':
      return itemCount === 0 ? 'available-empty' : 'available-items';
    case 'partial':
      return 'partial';
    case 'authorization-required':
      return 'authorization-required';
    case 'configuration-required':
      return 'configuration-required';
    case 'principal-unresolved':
      return 'principal-unresolved';
    case 'source-unavailable':
      return 'source-unavailable';
    case 'backend-unavailable':
      return 'backend-unavailable';
    default:
      return 'backend-unavailable';
  }
}

export function AdobeSignActionQueueCard({
  spanOverrides,
  readinessVariant,
  homeEnvelope,
  sourceStatus,
  onConnect,
  ariaLabel,
}: AdobeSignActionQueueCardProps) {
  // Effective Adobe-specific source status: envelope-derived first, explicit prop fallback.
  const effectiveSourceStatus = useMemo<MyWorkReadModelSourceStatus | undefined>(
    () => selectAdobeSignSourceStatus(homeEnvelope) ?? sourceStatus,
    [homeEnvelope, sourceStatus],
  );

  const previewItems = homeEnvelope?.data.adobeSignActionQueue.previewItems ?? [];
  const itemCount = previewItems.length;

  const stateMarker = resolveStateMarker(readinessVariant, effectiveSourceStatus, itemCount);

  const stateCopy = selectAdobeSignActionQueueStateCopy(
    readinessVariant === 'error' ? 'backend-unavailable' : effectiveSourceStatus,
    typeof onConnect === 'function',
  );

  const summaryVm = selectAdobeQueueSummaryVmFromSummary(
    homeEnvelope?.data.adobeSignActionQueue.summary,
    homeEnvelope?.generatedAtUtc,
  );

  const agreementListVm = selectAdobeAgreementListVmFromItems(
    previewItems.slice(0, PREVIEW_ITEM_LIMIT),
    false,
  );

  // CTA state machine — direct lift from the retired AdobeSignConnectionGuidanceCard.
  const [connectState, setConnectState] = useState<ConnectState>('idle');
  const handleConnectClick = async (): Promise<void> => {
    if (!onConnect) return;
    setConnectState('connecting');
    try {
      await onConnect();
      setConnectState('idle');
    } catch {
      setConnectState('error');
    }
  };
  const isConnecting = connectState === 'connecting';
  const ctaLabel = isConnecting ? 'Connecting…' : (stateCopy.ctaLabel ?? 'Connect Adobe Sign');

  const showMetrics = stateMarker === 'partial' || stateMarker === 'available-items';

  const showItemList = stateMarker === 'partial' || stateMarker === 'available-items';

  const showBodyCopy =
    stateMarker === 'loading' ||
    stateMarker === 'authorization-required' ||
    stateMarker === 'configuration-required' ||
    stateMarker === 'principal-unresolved' ||
    stateMarker === 'source-unavailable' ||
    stateMarker === 'backend-unavailable' ||
    stateMarker === 'partial' ||
    stateMarker === 'available-empty';

  const bodyCopy = useMemo<string>(() => {
    if (stateMarker === 'loading') return ADOBE_SIGN_ACTION_QUEUE_LOADING_BODY;
    if (stateMarker === 'available-empty') return ADOBE_SIGN_ACTION_QUEUE_READY_EMPTY_BODY;
    if (stateMarker === 'available-items') return '';
    return stateCopy.body;
  }, [stateMarker, stateCopy.body]);

  const badgeLabel = stateMarker === 'loading' ? 'Loading' : stateCopy.badge;

  return (
    <MyWorkCard
      role={CARD_ROLE}
      footprint="standard"
      spanOverrides={spanOverrides}
      eyebrow={CARD_EYEBROW}
      title={CARD_TITLE}
      module={MODULE_ID}
      ariaLabel={ariaLabel}
      extraDataAttributes={{
        'data-adobe-sign-action-queue-state': stateMarker,
        'data-adobe-sign-action-queue-badge': badgeLabel,
      }}
    >
      {showBodyCopy ? (
        <p
          className={styles.bodyText}
          data-my-work-empty-queue={stateMarker === 'available-empty' ? '' : undefined}
        >
          {bodyCopy}
        </p>
      ) : null}
      {stateCopy.secondaryBody ? (
        <p className={styles.bodyText} data-adobe-sign-action-queue-secondary="">
          {stateCopy.secondaryBody}
        </p>
      ) : null}
      {stateMarker === 'loading' ? (
        <ul className={styles.content} aria-hidden="true" data-adobe-sign-action-queue-skeleton="">
          {Array.from({ length: MAX_SKELETON_ROWS }, (_, idx) => (
            <li key={idx} className={styles.row}>
              <span className={styles.rowLabel}>·</span>
              <span className={styles.rowValue}>·</span>
            </li>
          ))}
        </ul>
      ) : null}
      {showMetrics ? (
        <dl className={styles.content} data-adobe-sign-action-queue-metrics="">
          <div className={styles.row}>
            <dt className={styles.rowLabel}>Pending agreements</dt>
            <dd className={styles.rowValue} data-adobe-queue-summary-pending="">
              {summaryVm.pendingAgreementsCount ?? '—'}
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.rowLabel}>Signature actions</dt>
            <dd className={styles.rowValue} data-adobe-queue-summary-signature="">
              {summaryVm.signatureActionsCount ?? '—'}
            </dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.rowLabel}>Review actions</dt>
            <dd className={styles.rowValue} data-adobe-queue-summary-review="">
              {summaryVm.reviewActionsCount ?? '—'}
            </dd>
          </div>
        </dl>
      ) : null}
      {showItemList && !agreementListVm.isEmpty ? (
        <ul className={styles.content} data-my-work-agreement-list="">
          {agreementListVm.items.map((item) => (
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
                {item.sourceOpenUrl ? (
                  <>
                    {' · '}
                    <a
                      href={item.sourceOpenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-adobe-sign-item-open-action="start"
                    >
                      Open in Adobe Sign
                    </a>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {stateCopy.ctaVisible ? (
        <>
          <button
            type="button"
            className={styles.cta}
            data-adobe-sign-connect-action="start"
            data-adobe-sign-connect-state={connectState}
            disabled={isConnecting}
            aria-disabled={isConnecting ? 'true' : undefined}
            onClick={() => {
              void handleConnectClick();
            }}
          >
            {ctaLabel}
          </button>
          {connectState === 'error' ? (
            <p className={styles.bodyText} role="alert">
              Unable to start the Adobe Sign connection. Please try again.
            </p>
          ) : null}
        </>
      ) : null}
    </MyWorkCard>
  );
}

export default AdobeSignActionQueueCard;
