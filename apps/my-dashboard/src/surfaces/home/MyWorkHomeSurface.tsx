import type {
  MyWorkHomeReadModel,
  MyWorkModuleId,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import { AdobeSignActionQueueCard } from '../../modules/adobeSign/AdobeSignActionQueueCard.js';
import { MyProjectsHomeCard } from '../../modules/myProjects/MyProjectsHomeCard.js';
import { selectSourceReadinessVm, selectWorkSummaryVm } from '../../state/myWorkCardViewModel.js';
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
  /** Source-status marker forwarded for partial-state signaling. */
  readonly sourceStatus?: MyWorkReadModelSourceStatus;
  /**
   * Read-model envelope for the home route. When provided, cards render
   * envelope-derived values via view-model selectors. When absent, cards
   * fall back to their legacy placeholder copy (preserves preview/test
   * contexts that do not supply data).
   */
  readonly homeEnvelope?: MyWorkReadModelEnvelope<MyWorkHomeReadModel>;
  readonly onSelectModule?: (id: MyWorkModuleId) => void;
  readonly getApiToken?: () => Promise<string>;
  /**
   * Shell-wired Adobe Sign OAuth start callback. Threaded down to
   * `AdobeSignActionQueueCard`, which renders the Connect CTA only when
   * `sourceStatus === 'authorization-required'` AND this prop is supplied.
   */
  readonly onConnectAdobeSign?: () => Promise<void>;
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

const HOME_NON_READY_SOURCE_READINESS_OVERRIDES: MyWorkCardSpanOverrides = {
  largeLaptop: 3,
  desktop: 3,
  ultrawide: 3,
  standardLaptop: 3,
};

export function MyWorkHomeSurface({
  readinessVariant = 'non-ready',
  sourceStatus,
  homeEnvelope,
  getApiToken,
  onConnectAdobeSign,
}: MyWorkHomeSurfaceProps) {
  const statusMarker = sourceStatus ? (
    <span hidden data-my-work-source-status={sourceStatus} />
  ) : null;

  const workSummaryVm = selectWorkSummaryVm(homeEnvelope);
  const sourceReadinessVm = selectSourceReadinessVm(homeEnvelope);

  const adobeCard = (
    <AdobeSignActionQueueCard
      readinessVariant={readinessVariant}
      homeEnvelope={homeEnvelope}
      sourceStatus={sourceStatus}
      onConnect={onConnectAdobeSign}
    />
  );

  if (readinessVariant === 'loading') {
    return (
      <>
        <span hidden data-my-work-readiness-state="loading" role="status" aria-live="polite" />
        {adobeCard}
      </>
    );
  }

  if (readinessVariant === 'error') {
    return (
      <>
        <span hidden data-my-work-readiness-state="error" role="alert" />
        {adobeCard}
      </>
    );
  }

  if (readinessVariant === 'ready') {
    return (
      <>
        {statusMarker}
        <MyProjectsHomeCard getApiToken={getApiToken} />
        <WorkSummaryCard spanOverrides={HOME_READY_WORK_SUMMARY_OVERRIDES} vm={workSummaryVm} />
        {adobeCard}
      </>
    );
  }

  return (
    <>
      {statusMarker}
      <MyProjectsHomeCard getApiToken={getApiToken} />
      <WorkSummaryCard spanOverrides={HOME_NON_READY_WORK_SUMMARY_OVERRIDES} vm={workSummaryVm} />
      {adobeCard}
      <SourceReadinessCard
        spanOverrides={HOME_NON_READY_SOURCE_READINESS_OVERRIDES}
        vm={sourceReadinessVm}
      />
    </>
  );
}

export default MyWorkHomeSurface;
