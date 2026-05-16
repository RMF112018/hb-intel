import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  AdobeSignActionLinkResolveResult,
  ResolveAdobeSignActionLinkRequest,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import { useMyWorkBentoContext } from '../../layout/MyWorkBentoGrid.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';
import localStyles from './AdobeSignActionQueueCard.module.css';
import type { MyWorkSurfaceReadinessVariant } from '../../state/myWorkSurfaceReadiness.js';
import {
  formatGeneratedAtUtc,
  selectAdobeCompletedPreviewContext,
  selectAdobeCompletedSummaryRail,
  selectAdobeAgreementListVmFromItems,
  selectAdobeQueuePreviewContext,
  selectAdobeRecentCompletionsListVmFromItems,
  selectAdobeRecentCompletionsSummaryVmFromSummary,
  selectAdobeQueueSummaryVmFromSummary,
  selectAdobeSignActionQueueStateCopy,
  selectAdobeSignCompletedViewStateCopy,
  selectAdobeSignSourceStatus,
} from '../../state/myWorkCardViewModel.js';
import { MY_WORK_MARK, markMyWork } from '../../runtime/myWorkPerformanceMarks.js';
import { useMyWorkReadModelClient } from '../../runtime/MyWorkReadModelClientProvider.js';
import { AdobeSignActivityList } from './AdobeSignActivityList.js';
import { AdobeSignStatePanel } from './AdobeSignStatePanel.js';
import { AdobeSignStatusRail } from './AdobeSignStatusRail.js';
import { AdobeSignViewSwitch } from './AdobeSignViewSwitch.js';
import { useAdobeSignRecentCompletionsReadModel } from './useAdobeSignRecentCompletionsReadModel.js';

const CARD_ROLE = 'adobe-sign-action-queue';
const MODULE_ID = 'adobe-sign-action-queue' as const;
const CARD_EYEBROW = 'Adobe Sign';
const CARD_TITLE = 'Agreement Activity';

const PREVIEW_ITEM_LIMIT = 5;

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

type QueueResolveUiState = 'idle' | 'resolving' | 'failed';

interface QueueResolveRowState {
  readonly state: QueueResolveUiState;
  readonly lastFailure?: Exclude<AdobeSignActionLinkResolveResult['status'], 'redirect-ready'>;
}

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
  const { mode } = useMyWorkBentoContext();
  const [activeView, setActiveView] = useState<ActiveView>('action-queue');
  const [queueResolveStateByItemId, setQueueResolveStateByItemId] = useState<
    Readonly<Record<string, QueueResolveRowState>>
  >({});

  // Effective Adobe-specific source status: envelope-derived first, explicit prop fallback.
  const effectiveSourceStatus = useMemo<MyWorkReadModelSourceStatus | undefined>(
    () => selectAdobeSignSourceStatus(homeEnvelope) ?? sourceStatus,
    [homeEnvelope, sourceStatus],
  );

  const previewItems = homeEnvelope?.data.adobeSignActionQueue.previewItems ?? [];
  const itemCount = previewItems.length;

  const stateMarker = resolveStateMarker(readinessVariant, effectiveSourceStatus, itemCount);

  const usefulEmittedRef = useRef(false);
  useEffect(() => {
    if (stateMarker !== 'loading' && !usefulEmittedRef.current) {
      usefulEmittedRef.current = true;
      markMyWork(MY_WORK_MARK.moduleUseful(MODULE_ID));
    }
  }, [stateMarker]);

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

  const resolveFailureCopy = (
    status: Exclude<AdobeSignActionLinkResolveResult['status'], 'redirect-ready'>,
  ): string => {
    switch (status) {
      case 'authorization-required':
        return 'Unable to open right now. Reconnect Adobe Sign and try again.';
      case 'principal-unresolved':
      case 'scope-insufficient':
        return 'Unable to open right now. Reconnect Adobe Sign to refresh permissions and try again.';
      case 'source-unavailable':
      case 'not-ready':
      case 'no-action-url':
      case 'rate-limited':
      case 'policy-rejected':
      case 'invalid-input':
      default:
        return 'Unable to open right now. Please try again.';
    }
  };

  const handleActNow = async (input: ResolveAdobeSignActionLinkRequest): Promise<void> => {
    setQueueResolveStateByItemId((prev) => ({
      ...prev,
      [input.itemId]: { state: 'resolving' },
    }));

    let result: AdobeSignActionLinkResolveResult;
    try {
      result = await readModelClient.resolveAdobeSignActionLink(input);
    } catch {
      result = { status: 'source-unavailable' };
    }

    if (result.status === 'redirect-ready') {
      window.open(result.redirectUrl, '_blank', 'noopener,noreferrer');
      setQueueResolveStateByItemId((prev) => ({
        ...prev,
        [input.itemId]: { state: 'idle' },
      }));
      return;
    }

    setQueueResolveStateByItemId((prev) => ({
      ...prev,
      [input.itemId]: { state: 'failed', lastFailure: result.status },
    }));
  };

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

  const showQueueStatePanel =
    stateMarker === 'loading' ||
    stateMarker === 'authorization-required' ||
    stateMarker === 'configuration-required' ||
    stateMarker === 'principal-unresolved' ||
    stateMarker === 'source-unavailable' ||
    stateMarker === 'backend-unavailable' ||
    stateMarker === 'available-empty';

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
  const showCompletedStatePanel =
    completedPanelState === 'loading' ||
    completedPanelState === 'available-empty' ||
    completedPanelState === 'partial' ||
    completedPanelState === 'source-unavailable' ||
    completedPanelState === 'backend-unavailable' ||
    completedPanelState === 'authorization-required' ||
    completedPanelState === 'configuration-required' ||
    completedPanelState === 'principal-unresolved';
  const queuePreviewContext = selectAdobeQueuePreviewContext(
    agreementListVm.items.length,
    summaryVm.pendingAgreementsCount,
  );
  const completedPreviewContext = selectAdobeCompletedPreviewContext(
    completedListVm.items.length,
    completedSummaryVm.completedAgreementCount,
  );
  const completedSummaryRail = selectAdobeCompletedSummaryRail(completedSummaryVm);
  const showCompletedRetry =
    completedPanelState === 'partial' ||
    completedPanelState === 'source-unavailable' ||
    completedPanelState === 'backend-unavailable';

  const queuePanelCopy = useMemo(() => {
    switch (stateMarker) {
      case 'loading':
        return {
          title: 'Loading your Adobe Sign action queue…',
          body: '',
        };
      case 'available-empty':
        return {
          title: 'No Adobe Sign agreements need your action.',
          body: 'Your queue is clear based on the latest available Adobe Sign read.',
        };
      case 'authorization-required':
        return {
          title: 'Connect Adobe Sign to load your action queue.',
          body: 'Agreements needing your review, signature, approval, or other action will appear here after authorization.',
        };
      case 'configuration-required':
        return {
          title: 'Adobe Sign setup is required.',
          body: 'This dashboard cannot load agreement activity until Adobe Sign configuration is completed.',
        };
      case 'principal-unresolved':
        return {
          title: 'Adobe Sign account matching needs attention.',
          body: 'Your HB account could not be matched to an Adobe Sign user for this activity panel.',
          supporting: stateCopy.secondaryBody,
        };
      case 'source-unavailable':
        return {
          title: 'Adobe Sign is temporarily unavailable.',
          body: 'Your action queue will resume once the source is reachable.',
        };
      case 'backend-unavailable':
      default:
        return {
          title: 'The My Dashboard service is temporarily unavailable.',
          body: 'Try again shortly.',
        };
    }
  }, [stateCopy.body, stateCopy.secondaryBody, stateMarker]);

  const completedPanelCopy = useMemo(() => {
    switch (completedPanelState) {
      case 'loading':
        return {
          title: 'Loading recent Adobe Sign completions…',
          body: '',
        };
      case 'available-empty':
        return {
          title: 'No completed agreements were found in the last 30 days.',
          body: 'Recent completion history will appear here when Adobe Sign reports completed agreements.',
        };
      case 'partial':
        return {
          title: 'Partial completed history',
          body: completedCopyVm.body,
        };
      case 'authorization-required':
        return {
          title: 'Adobe Sign authorization is required.',
          body: 'Connect Adobe Sign before recent completion history can load.',
        };
      case 'configuration-required':
        return {
          title: 'Adobe Sign setup is required.',
          body: 'Recent completion history cannot load until Adobe Sign configuration is completed.',
        };
      case 'principal-unresolved':
        return {
          title: 'Adobe Sign account matching needs attention.',
          body: 'Your HB account could not be matched to an Adobe Sign user for recent completion history.',
        };
      case 'source-unavailable':
        return {
          title: 'Recent Adobe Sign completions are temporarily unavailable.',
          body: 'The source is not reachable right now.',
        };
      case 'backend-unavailable':
      default:
        return {
          title: 'Recent Adobe Sign completions are temporarily unavailable.',
          body: 'The My Dashboard service could not load completion history right now.',
        };
    }
  }, [completedCopyVm.body, completedPanelState]);

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
        'data-adobe-sign-layout-mode': mode,
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
        {effectiveActiveView === 'action-queue' && showQueueStatePanel ? (
          <AdobeSignStatePanel
            title={queuePanelCopy.title}
            body={queuePanelCopy.body}
            supportingText={queuePanelCopy.supporting}
            className={localStyles.statePanel}
            titleClassName={localStyles.statePanelTitle}
            bodyClassName={styles.bodyText}
            supportingClassName={styles.bodyText}
            actionsClassName={localStyles.statePanelActions}
            cta={
              stateCopy.ctaVisible ? (
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
              ) : undefined
            }
          />
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
          <AdobeSignActivityList
            variant="queue"
            items={agreementListVm.items.map((item) => ({
              ...(item.actionHandoff.posture === 'resolve-on-click'
                ? {
                    primaryActionLabel:
                      queueResolveStateByItemId[item.itemId]?.state === 'resolving'
                        ? 'Opening…'
                        : 'Act now',
                    primaryActionDisabled:
                      queueResolveStateByItemId[item.itemId]?.state === 'resolving',
                    onPrimaryActionClick: () =>
                      void handleActNow({
                        itemId: item.itemId,
                        agreementId: item.agreementId,
                        requiredAction: item.requiredAction,
                      }),
                  }
                : {}),
              key: item.itemId,
              title: item.agreementName,
              metadataParts: [
                item.requiredActionLabel,
                item.senderLabel ? `From ${item.senderLabel}` : '',
                item.expiresLabel ? `Expires ${item.expiresLabel}` : '',
              ],
              fallbackViewLabel: item.sourceOpenUrl ? 'View' : undefined,
              sourceOpenUrl: item.sourceOpenUrl,
              rowErrorMessage:
                queueResolveStateByItemId[item.itemId]?.state === 'failed' &&
                queueResolveStateByItemId[item.itemId]?.lastFailure
                  ? resolveFailureCopy(queueResolveStateByItemId[item.itemId]!.lastFailure!)
                  : undefined,
            }))}
            previewContext={queuePreviewContext ?? undefined}
            listClassName={localStyles.activityList}
            rowClassName={localStyles.activityRow}
            titleClassName={localStyles.activityTitle}
            metaRowClassName={localStyles.activityMetaRow}
            metadataClassName={localStyles.activityMetadata}
            actionClassName={localStyles.activityOpenAction}
            previewClassName={localStyles.previewContext}
          />
        ) : null}
        {effectiveActiveView === 'action-queue' && connectState === 'error' ? (
          <p className={styles.bodyText} role="alert">
            Unable to start the Adobe Sign connection. Please try again.
          </p>
        ) : null}
      </section>
      <section
        role="tabpanel"
        id="adobe-sign-panel-completed"
        aria-labelledby="adobe-sign-tab-completed"
        hidden={effectiveActiveView !== 'completed'}
        data-adobe-sign-completed-panel-state={completedPanelState}
      >
        {effectiveActiveView === 'completed' && showCompletedStatePanel ? (
          <AdobeSignStatePanel
            title={completedPanelCopy.title}
            body={completedPanelCopy.body}
            className={localStyles.statePanel}
            titleClassName={localStyles.statePanelTitle}
            bodyClassName={styles.bodyText}
            actionsClassName={localStyles.statePanelActions}
            statusRole={completedPanelState === 'loading' ? 'status' : undefined}
            ariaLive={completedPanelState === 'loading' ? 'polite' : undefined}
            retryAction={
              showCompletedRetry ? (
                <button
                  type="button"
                  className={styles.cta}
                  data-adobe-sign-completed-retry=""
                  onClick={() => completedReadModel.retry()}
                >
                  Retry
                </button>
              ) : undefined
            }
          />
        ) : null}
        {effectiveActiveView === 'completed' && showCompletedMetric && completedSummaryRail ? (
          <p className={localStyles.completedSummaryRail} data-adobe-sign-completed-metrics="">
            {completedSummaryRail}
          </p>
        ) : null}
        {effectiveActiveView === 'completed' && showCompletedList ? (
          <AdobeSignActivityList
            variant="completed"
            items={completedListVm.items.map((item) => ({
              key: item.itemId,
              title: item.agreementName,
              metadataParts:
                item.dateLabel || item.senderLabel
                  ? [item.dateLabel ?? '', item.senderLabel ? `From ${item.senderLabel}` : '']
                  : ['Completion metadata not reported.'],
              fallbackViewLabel: item.sourceOpenUrl ? 'View' : undefined,
              sourceOpenUrl: item.sourceOpenUrl,
            }))}
            previewContext={completedPreviewContext ?? undefined}
            listClassName={localStyles.activityList}
            rowClassName={localStyles.activityRow}
            titleClassName={localStyles.activityTitle}
            metaRowClassName={localStyles.activityMetaRow}
            metadataClassName={localStyles.activityMetadata}
            actionClassName={localStyles.activityOpenAction}
            previewClassName={localStyles.previewContext}
          />
        ) : null}
      </section>
    </MyWorkCard>
  );
}

export default AdobeSignActionQueueCard;
