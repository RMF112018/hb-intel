import type {
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import {
  selectAdobeAgreementListVm,
  selectAdobeQueueStateVmFromQueue,
  selectAdobeQueueSummaryVm,
  selectConnectionGuidanceVm,
} from '../../state/myWorkCardViewModel.js';
import type { MyWorkSurfaceReadinessVariant } from '../../state/myWorkSurfaceReadiness.js';
import { AdobeSignAgreementActionListCard } from './AdobeSignAgreementActionListCard.js';
import { AdobeSignConnectionGuidanceCard } from './AdobeSignConnectionGuidanceCard.js';
import { AdobeSignQueueStateCard } from './AdobeSignQueueStateCard.js';
import { AdobeSignQueueSummaryCard } from './AdobeSignQueueSummaryCard.js';

export type { MyWorkSurfaceReadinessVariant };

export interface AdobeSignActionQueueModuleSurfaceProps {
  /**
   * Readiness variant. `'loading'` and `'error'` are envelope-state variants
   * driven by the router; `'ready'` / `'non-ready'` are content variants
   * derived from `MyWorkReadModelSourceStatus`. Defaults to `'non-ready'` for
   * legacy callers that pre-date the live-envelope wiring.
   */
  readonly readinessVariant?: MyWorkSurfaceReadinessVariant;
  /** Source-status marker forwarded for partial-state signaling in Prompt 04. */
  readonly sourceStatus?: MyWorkReadModelSourceStatus;
  /**
   * Read-model envelope for the focused Adobe Sign queue route. When
   * provided, cards render envelope-derived values via view-model
   * selectors. When absent, cards fall back to legacy placeholder copy.
   */
  readonly queueEnvelope?: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>;
  /**
   * Optional consent-start callback. Forwarded to the connection
   * guidance card on the non-ready variant; the ready variant ignores
   * it. When absent, the connection card renders without the
   * "Connect Adobe Sign" button.
   */
  readonly onConnect?: () => Promise<void>;
}

const FOCUSED_READY_QUEUE_SUMMARY_OVERRIDES: MyWorkCardSpanOverrides = {
  largeLaptop: 4,
  desktop: 4,
  ultrawide: 4,
  standardLaptop: 3,
};

const FOCUSED_NON_READY_QUEUE_STATE_OVERRIDES: MyWorkCardSpanOverrides = {
  largeLaptop: 8,
  desktop: 8,
  ultrawide: 8,
  standardLaptop: 6,
};

const FOCUSED_NON_READY_GUIDANCE_OVERRIDES: MyWorkCardSpanOverrides = {
  largeLaptop: 4,
  desktop: 4,
  ultrawide: 4,
  standardLaptop: 4,
};

export function AdobeSignActionQueueModuleSurface({
  readinessVariant = 'non-ready',
  sourceStatus,
  queueEnvelope,
  onConnect,
}: AdobeSignActionQueueModuleSurfaceProps) {
  if (readinessVariant === 'loading') {
    return (
      <div data-my-work-readiness-state="loading" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }
  if (readinessVariant === 'error') {
    return (
      <div data-my-work-readiness-state="error" role="alert">
        Unable to load.
      </div>
    );
  }
  const statusMarker = sourceStatus ? (
    <span hidden data-my-work-source-status={sourceStatus} />
  ) : null;
  if (readinessVariant === 'ready') {
    const queueSummaryVm = selectAdobeQueueSummaryVm(queueEnvelope);
    const agreementListVm = selectAdobeAgreementListVm(queueEnvelope);
    return (
      <>
        {statusMarker}
        <AdobeSignQueueSummaryCard
          spanOverrides={FOCUSED_READY_QUEUE_SUMMARY_OVERRIDES}
          vm={queueSummaryVm}
        />
        <AdobeSignAgreementActionListCard vm={agreementListVm} />
      </>
    );
  }
  const queueStateVm = selectAdobeQueueStateVmFromQueue(queueEnvelope, sourceStatus);
  // Only thread a guidance VM when the source status is known. Without a
  // typed status, the guidance card preserves its legacy CTA-on-onConnect
  // behavior (used by preview/test contexts that do not supply envelope
  // metadata).
  const guidanceVm = sourceStatus ? selectConnectionGuidanceVm(sourceStatus) : undefined;
  return (
    <>
      {statusMarker}
      <AdobeSignQueueStateCard
        spanOverrides={FOCUSED_NON_READY_QUEUE_STATE_OVERRIDES}
        vm={queueStateVm}
      />
      <AdobeSignConnectionGuidanceCard
        spanOverrides={FOCUSED_NON_READY_GUIDANCE_OVERRIDES}
        vm={guidanceVm}
        onConnect={onConnect}
      />
    </>
  );
}

export default AdobeSignActionQueueModuleSurface;
