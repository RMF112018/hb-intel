import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import { AdobeSignAgreementActionListCard } from './AdobeSignAgreementActionListCard.js';
import { AdobeSignConnectionGuidanceCard } from './AdobeSignConnectionGuidanceCard.js';
import { AdobeSignQueueStateCard } from './AdobeSignQueueStateCard.js';
import { AdobeSignQueueSummaryCard } from './AdobeSignQueueSummaryCard.js';

export type MyWorkSurfaceReadinessVariant = 'ready' | 'non-ready';

export interface AdobeSignActionQueueModuleSurfaceProps {
  /** Presentation-only readiness variant. Defaults to `'non-ready'`. */
  readonly readinessVariant?: MyWorkSurfaceReadinessVariant;
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
}: AdobeSignActionQueueModuleSurfaceProps) {
  if (readinessVariant === 'ready') {
    return (
      <>
        <AdobeSignQueueSummaryCard spanOverrides={FOCUSED_READY_QUEUE_SUMMARY_OVERRIDES} />
        <AdobeSignAgreementActionListCard />
      </>
    );
  }
  return (
    <>
      <AdobeSignQueueStateCard spanOverrides={FOCUSED_NON_READY_QUEUE_STATE_OVERRIDES} />
      <AdobeSignConnectionGuidanceCard spanOverrides={FOCUSED_NON_READY_GUIDANCE_OVERRIDES} />
    </>
  );
}

export default AdobeSignActionQueueModuleSurface;
