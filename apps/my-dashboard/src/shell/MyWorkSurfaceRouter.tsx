import {
  normalizeMyWorkModuleId,
  type MyWorkModuleId,
  type MyWorkPrimarySurfaceId,
} from '@hbc/models/myWork';
import { AdobeSignActionQueueModuleSurface } from '../modules/adobeSign/AdobeSignActionQueueModuleSurface.js';
import { selectSurfaceReadiness } from '../state/myWorkSurfaceReadiness.js';
import { MyWorkHomeSurface } from '../surfaces/home/MyWorkHomeSurface.js';
import {
  useMyWorkFocusedAdobeEnvelopeContext,
  useMyWorkHomeEnvelopeContext,
} from './MyWorkActiveEnvelopeContext.js';

export interface MyWorkSurfaceRouterProps {
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
  readonly activeModuleId?: MyWorkModuleId;
  readonly onSelectModule?: (id: MyWorkModuleId) => void;
  readonly getApiToken?: () => Promise<string>;
  /**
   * Optional Adobe Sign consent-start callback. Forwarded only when
   * the focused module is the Adobe Sign action queue. The shell
   * constructs this from `getApiToken` when in backend mode.
   */
  readonly onConnectAdobeSign?: () => Promise<void>;
}

/**
 * Home route container. Consumes the home read-model envelope from the
 * shell-level `MyWorkActiveEnvelopeProvider` so the hero band and this
 * route share a single fetch.
 */
function MyWorkHomeRoute({
  onSelectModule,
  getApiToken,
}: {
  readonly onSelectModule?: (id: MyWorkModuleId) => void;
  readonly getApiToken?: () => Promise<string>;
}) {
  const state = useMyWorkHomeEnvelopeContext();
  const readiness = selectSurfaceReadiness(state);
  return (
    <MyWorkHomeSurface
      readinessVariant={readiness.variant}
      sourceStatus={readiness.sourceStatus}
      homeEnvelope={readiness.envelope}
      onSelectModule={onSelectModule}
      getApiToken={getApiToken}
    />
  );
}

/**
 * Adobe Sign action queue route container. Consumes the queue envelope
 * from the shell-level `MyWorkActiveEnvelopeProvider` so the hero band and
 * this route share a single fetch.
 */
function AdobeSignActionQueueModuleRoute({
  onConnect,
}: {
  readonly onConnect?: () => Promise<void>;
}) {
  const state = useMyWorkFocusedAdobeEnvelopeContext();
  const readiness = selectSurfaceReadiness(state);
  return (
    <AdobeSignActionQueueModuleSurface
      readinessVariant={readiness.variant}
      sourceStatus={readiness.sourceStatus}
      queueEnvelope={readiness.envelope}
      onConnect={onConnect}
    />
  );
}

/**
 * Surface router for the My Work shell. Transparent (no wrapping DOM
 * element, no data attribute). The shell `<main role="tabpanel">`
 * remains the sole owner of `data-my-work-active-surface-panel`.
 *
 * - `activeModuleId === 'adobe-sign-action-queue'` → focused Adobe surface
 * - any other value (including `undefined` and invalid strings via
 *   `normalizeMyWorkModuleId`) → home surface
 *
 * Each branch delegates to a route container that consumes its envelope
 * from `MyWorkActiveEnvelopeProvider` (mounted by the shell), so the
 * inactive route never issues a read-model request and the hero band
 * shares the same fetch.
 */
export function MyWorkSurfaceRouter({
  activeModuleId,
  onSelectModule,
  onConnectAdobeSign,
  getApiToken,
}: MyWorkSurfaceRouterProps) {
  const normalized = normalizeMyWorkModuleId(activeModuleId);
  if (normalized === 'adobe-sign-action-queue') {
    return <AdobeSignActionQueueModuleRoute onConnect={onConnectAdobeSign} />;
  }
  return <MyWorkHomeRoute onSelectModule={onSelectModule} getApiToken={getApiToken} />;
}

export default MyWorkSurfaceRouter;
