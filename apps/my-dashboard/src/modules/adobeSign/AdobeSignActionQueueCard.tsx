import { useMemo, useState } from 'react';
import type {
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import localStyles from './AdobeSignActionQueueCard.module.css';
import type { MyWorkSurfaceReadinessVariant } from '../../state/myWorkSurfaceReadiness.js';
import {
  ADOBE_SIGN_ACTION_QUEUE_LOADING_BODY,
  ADOBE_SIGN_ACTION_QUEUE_READY_EMPTY_BODY,
  formatGeneratedAtUtc,
  selectAdobeAgreementListVmFromItems,
  selectAdobeRecentCompletionsListVmFromItems,
  selectAdobeRecentCompletionsSummaryVmFromSummary,
  selectAdobeQueueSummaryVmFromSummary,
  selectAdobeSignActionQueueStateCopy,
  selectAdobeSignCompletedViewStateCopy,
  selectAdobeSignSourceStatus,
} from '../../state/myWorkCardViewModel.js';
import { useMyWorkReadModelClient } from '../../runtime/MyWorkReadModelClientProvider.js';
import { AdobeSignStatusRail } from './AdobeSignStatusRail.js';
import { AdobeSignViewSwitch } from './AdobeSignViewSwitch.js';
import { useAdobeSignRecentCompletionsReadModel } from './useAdobeSignRecentCompletionsReadModel.js';

const CARD_ROLE = 'adobe-sign-action-queue';
const MODULE_ID = 'adobe-sign-action-queue' as const;
const CARD_EYEBROW = 'Adobe Sign';
const CARD_TITLE = 'Agreement Activity';

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
type ActiveView = 'action-queue' | 'completed';
type CompletedPanelState =
  | 'idle'
  | 'loading'
  | 'available-empty'
  | 'available-items'
  | 'partial'
  | 'source-unavailable'
  | 'backend-unavailable'
  | 'authorization-required'
  | 'configuration-required'
  | 'principal-unresolved';

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
  const readModelClient = useMyWorkReadModelClient();
  const [activeView, setActiveView] = useState<ActiveView>('action-queue');

  // Effective Adobe-specific source status: envelope-derived first, explicit prop fallback.
  const effectiveSourceStatus = useMemo<MyWorkReadModelSourceStatus | undefined>(
    () => selectAdobeSignSourceStatus(homeEnvelope) ?? sourceStatus,
    [homeEnvelope, sourceStatus],
  );

  const previewItems = homeEnvelope?.data.adobeSignActionQueue.previewItems ?? [];
  const itemCount = previewItems.length;

  const stateMarker = resolveStateMarker(readinessVariant, effectiveSourceStatus, itemCount);
  const toggleVisible =
    stateMarker === 'partial' ||
    stateMarker === 'available-empty' ||
    stateMarker === 'available-items';
  const effectiveActiveView: ActiveView = toggleVisible ? activeView : 'action-queue';

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

  const completedReadModel = useAdobeSignRecentCompletionsReadModel({
    client: readModelClient,
    enabled: effectiveActiveView === 'completed',
  });
  const completedEnvelope = completedReadModel.envelope;
  const completedSourceStatus = completedEnvelope?.sourceStatus;
  const completedSummaryVm = selectAdobeRecentCompletionsSummaryVmFromSummary(
    completedEnvelope?.data.summary,
    completedEnvelope?.generatedAtUtc,
  );
  const completedListVm = selectAdobeRecentCompletionsListVmFromItems(
    completedEnvelope?.data.items?.slice(0, PREVIEW_ITEM_LIMIT),
    completedEnvelope?.data.pagination?.hasMore ?? false,
  );
  const completedCopyVm = selectAdobeSignCompletedViewStateCopy(completedSourceStatus);
  const completedPanelState: CompletedPanelState =
    completedReadModel.status === 'idle' || completedReadModel.status === 'loading'
      ? completedReadModel.status
      : completedReadModel.status === 'error'
        ? 'backend-unavailable'
        : completedSourceStatus === 'available'
          ? completedListVm.isEmpty
            ? 'available-empty'
            : 'available-items'
          : completedSourceStatus === 'partial'
            ? 'partial'
            : completedSourceStatus === 'authorization-required'
              ? 'authorization-required'
              : completedSourceStatus === 'configuration-required'
                ? 'configuration-required'
                : completedSourceStatus === 'principal-unresolved'
                  ? 'principal-unresolved'
                  : completedSourceStatus === 'source-unavailable'
                    ? 'source-unavailable'
                    : 'backend-unavailable';
  const showCompletedMetric =
    completedPanelState === 'available-items' || completedPanelState === 'partial';
  const showCompletedList =
    (completedPanelState === 'available-items' || completedPanelState === 'partial') &&
    !completedListVm.isEmpty;
  const showCompletedBody =
    completedPanelState === 'loading' ||
    completedPanelState === 'available-empty' ||
    completedPanelState === 'partial' ||
    completedPanelState === 'source-unavailable' ||
    completedPanelState === 'backend-unavailable' ||
    completedPanelState === 'authorization-required' ||
    completedPanelState === 'configuration-required' ||
    completedPanelState === 'principal-unresolved';
  const completedBody =
    completedPanelState === 'loading'
      ? 'Loading completed Adobe Sign agreements…'
      : completedCopyVm.body;

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
        'data-adobe-sign-active-view': effectiveActiveView,
      }}
    >
      <div className={localStyles.upperLayout}>
        <AdobeSignStatusRail
          activeView={effectiveActiveView}
          queueState={stateMarker}
          completedState={completedPanelState}
          queueGeneratedAtUtc={homeEnvelope?.generatedAtUtc}
          completedGeneratedAtUtc={completedEnvelope?.generatedAtUtc}
          formatTimestamp={formatGeneratedAtUtc}
          className={localStyles.statusRail}
          chipClassName={localStyles.statusChip}
          freshnessClassName={localStyles.freshness}
        />
        {toggleVisible ? (
          <AdobeSignViewSwitch
            activeView={effectiveActiveView}
            onActivate={setActiveView}
            className={localStyles.adobeSignViewToggle}
            tabClassName={localStyles.adobeSignViewButton}
          />
        ) : null}
      </div>
      <section
        role="tabpanel"
        id="adobe-sign-panel-action-queue"
        aria-labelledby="adobe-sign-tab-action-queue"
        hidden={effectiveActiveView !== 'action-queue'}
      >
        {effectiveActiveView === 'action-queue' && showBodyCopy ? (
          <p
            className={styles.bodyText}
            data-my-work-empty-queue={stateMarker === 'available-empty' ? '' : undefined}
          >
            {bodyCopy}
          </p>
        ) : null}
        {effectiveActiveView === 'action-queue' && stateCopy.secondaryBody ? (
          <p className={styles.bodyText} data-adobe-sign-action-queue-secondary="">
            {stateCopy.secondaryBody}
          </p>
        ) : null}
        {effectiveActiveView === 'action-queue' && stateMarker === 'loading' ? (
          <ul className={styles.content} aria-hidden="true" data-adobe-sign-action-queue-skeleton="">
            {Array.from({ length: MAX_SKELETON_ROWS }, (_, idx) => (
              <li key={idx} className={styles.row}>
                <span className={styles.rowLabel}>·</span>
                <span className={styles.rowValue}>·</span>
              </li>
            ))}
          </ul>
        ) : null}
        {effectiveActiveView === 'action-queue' && showMetrics ? (
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
        {effectiveActiveView === 'action-queue' && showItemList && !agreementListVm.isEmpty ? (
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
        {effectiveActiveView === 'action-queue' && stateCopy.ctaVisible ? (
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
      </section>
      <section
        role="tabpanel"
        id="adobe-sign-panel-completed"
        aria-labelledby="adobe-sign-tab-completed"
        hidden={effectiveActiveView !== 'completed'}
        data-adobe-sign-completed-panel-state={completedPanelState}
      >
        {effectiveActiveView === 'completed' && showCompletedBody ? (
          <p className={styles.bodyText}>{completedBody}</p>
        ) : null}
        {effectiveActiveView === 'completed' && showCompletedMetric ? (
          <dl className={styles.content} data-adobe-sign-completed-metrics="">
            <div className={styles.row}>
              <dt className={styles.rowLabel}>Completed in last 30 days</dt>
              <dd className={styles.rowValue} data-adobe-completed-summary-count="">
                {completedSummaryVm.completedAgreementCount ?? '—'}
              </dd>
            </div>
          </dl>
        ) : null}
        {effectiveActiveView === 'completed' && showCompletedList ? (
          <ul className={styles.content} data-adobe-sign-completed-list="">
            {completedListVm.items.map((item) => (
              <li key={item.itemId} className={styles.row} data-adobe-sign-completed-item={item.itemId}>
                <span className={styles.rowLabel}>{item.agreementName}</span>
                <span className={styles.rowValue}>
                  {item.dateLabel ?? 'Updated date unavailable'}
                  {item.senderLabel ? ` · From ${item.senderLabel}` : ''}
                  {item.sourceOpenUrl ? (
                    <>
                      {' · '}
                      <a
                        href={item.sourceOpenUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-adobe-sign-completed-item-open-action="start"
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
      </section>
    </MyWorkCard>
  );
}

export default AdobeSignActionQueueCard;
