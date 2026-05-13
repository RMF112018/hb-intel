import type { MyWorkReadModelSourceStatus } from '@hbc/models/myWork';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
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
    return (
      <>
        {statusMarker}
        <AdobeSignQueueSummaryCard spanOverrides={FOCUSED_READY_QUEUE_SUMMARY_OVERRIDES} />
        <AdobeSignAgreementActionListCard />
      </>
    );
  }
  return (
    <>
      {statusMarker}
      <AdobeSignQueueStateCard spanOverrides={FOCUSED_NON_READY_QUEUE_STATE_OVERRIDES} />
      <AdobeSignConnectionGuidanceCard
        spanOverrides={FOCUSED_NON_READY_GUIDANCE_OVERRIDES}
        onConnect={onConnect}
      />
    </>
  );
}

export default AdobeSignActionQueueModuleSurface;
