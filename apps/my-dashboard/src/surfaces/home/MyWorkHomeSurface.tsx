import type { MyWorkModuleId, MyWorkReadModelSourceStatus } from '@hbc/models/myWork';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import { AdobeSignActionQueueHomeCard } from '../../modules/adobeSign/AdobeSignActionQueueHomeCard.js';
import { AdobeSignQueueStateCard } from '../../modules/adobeSign/AdobeSignQueueStateCard.js';
import type { MyWorkSurfaceReadinessVariant } from '../../state/myWorkSurfaceReadiness.js';
import { SourceReadinessCard } from './SourceReadinessCard.js';
import { WorkSummaryCard } from './WorkSummaryCard.js';

export type { MyWorkSurfaceReadinessVariant };

export interface MyWorkHomeSurfaceProps {
  /**
   * Readiness variant. `'loading'` and `'error'` are envelope-state variants
   * driven by the router; `'ready'` / `'non-ready'` are content variants
   * derived from `MyWorkReadModelSourceStatus`. Defaults to `'non-ready'` for
   * legacy callers that pre-date the live-envelope wiring.
   */
  readonly readinessVariant?: MyWorkSurfaceReadinessVariant;
  /** Source-status marker forwarded for partial-state signaling in Prompt 04. */
  readonly sourceStatus?: MyWorkReadModelSourceStatus;
  readonly onSelectModule?: (id: MyWorkModuleId) => void;
}

const HOME_READY_WORK_SUMMARY_OVERRIDES: MyWorkCardSpanOverrides = {
  largeLaptop: 4,
  desktop: 4,
  ultrawide: 4,
  standardLaptop: 3,
};

const HOME_NON_READY_WORK_SUMMARY_OVERRIDES: MyWorkCardSpanOverrides = {
  largeLaptop: 3,
  desktop: 3,
  ultrawide: 3,
  standardLaptop: 3,
};

const HOME_NON_READY_QUEUE_STATE_OVERRIDES: MyWorkCardSpanOverrides = {
  largeLaptop: 6,
  desktop: 6,
  ultrawide: 6,
  standardLaptop: 4,
};

const HOME_NON_READY_SOURCE_READINESS_OVERRIDES: MyWorkCardSpanOverrides = {
  largeLaptop: 3,
  desktop: 3,
  ultrawide: 3,
  standardLaptop: 3,
};

export function MyWorkHomeSurface({
  readinessVariant = 'non-ready',
  sourceStatus,
  onSelectModule,
}: MyWorkHomeSurfaceProps) {
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
        <WorkSummaryCard spanOverrides={HOME_READY_WORK_SUMMARY_OVERRIDES} />
        <AdobeSignActionQueueHomeCard onSelectModule={onSelectModule} />
      </>
    );
  }
  return (
    <>
      {statusMarker}
      <WorkSummaryCard spanOverrides={HOME_NON_READY_WORK_SUMMARY_OVERRIDES} />
      <AdobeSignQueueStateCard spanOverrides={HOME_NON_READY_QUEUE_STATE_OVERRIDES} />
      <SourceReadinessCard spanOverrides={HOME_NON_READY_SOURCE_READINESS_OVERRIDES} />
    </>
  );
}

export default MyWorkHomeSurface;
