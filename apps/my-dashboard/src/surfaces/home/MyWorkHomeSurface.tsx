import type {
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import { AdobeSignActionQueueCard } from '../../modules/adobeSign/AdobeSignActionQueueCard.js';
import { MyProjectsHomeCard } from '../../modules/myProjects/MyProjectsHomeCard.js';
import type { MyWorkSurfaceReadinessVariant } from '../../state/myWorkSurfaceReadiness.js';

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
  readonly getApiToken?: () => Promise<string>;
  /**
   * Shell-wired Adobe Sign OAuth start callback. Threaded down to
   * `AdobeSignActionQueueCard`, which renders the Connect CTA only when
   * `sourceStatus === 'authorization-required'` AND this prop is supplied.
   */
  readonly onConnectAdobeSign?: () => Promise<void>;
}

const MY_PROJECTS_HOME_SPAN_OVERRIDES: MyWorkCardSpanOverrides = {
  phone: 1,
  tabletPortrait: 2,
  tabletLandscape: 6,
  smallLaptop: 8,
  standardLaptop: 6,
  largeLaptop: 7,
  desktop: 7,
  ultrawide: 7,
};

const ADOBE_SIGN_HOME_SPAN_OVERRIDES: MyWorkCardSpanOverrides = {
  phone: 1,
  tabletPortrait: 2,
  tabletLandscape: 6,
  smallLaptop: 8,
  standardLaptop: 4,
  largeLaptop: 5,
  desktop: 5,
  ultrawide: 5,
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

  const adobeCard = (
    <AdobeSignActionQueueCard
      readinessVariant={readinessVariant}
      homeEnvelope={homeEnvelope}
      sourceStatus={sourceStatus}
      onConnect={onConnectAdobeSign}
      spanOverrides={ADOBE_SIGN_HOME_SPAN_OVERRIDES}
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

  return (
    <>
      {statusMarker}
      <MyProjectsHomeCard
        getApiToken={getApiToken}
        footprint="full"
        spanOverrides={MY_PROJECTS_HOME_SPAN_OVERRIDES}
      />
      {adobeCard}
    </>
  );
}

export default MyWorkHomeSurface;
