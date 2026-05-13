import type { MyWorkModuleId } from '@hbc/models/myWork';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import { AdobeSignActionQueueHomeCard } from '../../modules/adobeSign/AdobeSignActionQueueHomeCard.js';
import { AdobeSignQueueStateCard } from '../../modules/adobeSign/AdobeSignQueueStateCard.js';
import { SourceReadinessCard } from './SourceReadinessCard.js';
import { WorkSummaryCard } from './WorkSummaryCard.js';

export type MyWorkSurfaceReadinessVariant = 'ready' | 'non-ready';

export interface MyWorkHomeSurfaceProps {
  /** Presentation-only readiness variant. Defaults to `'non-ready'`. */
  readonly readinessVariant?: MyWorkSurfaceReadinessVariant;
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
  onSelectModule,
}: MyWorkHomeSurfaceProps) {
  if (readinessVariant === 'ready') {
    return (
      <>
        <WorkSummaryCard spanOverrides={HOME_READY_WORK_SUMMARY_OVERRIDES} />
        <AdobeSignActionQueueHomeCard onSelectModule={onSelectModule} />
      </>
    );
  }
  return (
    <>
      <WorkSummaryCard spanOverrides={HOME_NON_READY_WORK_SUMMARY_OVERRIDES} />
      <AdobeSignQueueStateCard spanOverrides={HOME_NON_READY_QUEUE_STATE_OVERRIDES} />
      <SourceReadinessCard spanOverrides={HOME_NON_READY_SOURCE_READINESS_OVERRIDES} />
    </>
  );
}

export default MyWorkHomeSurface;
