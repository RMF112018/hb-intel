import {
  normalizeMyWorkModuleId,
  type MyWorkModuleId,
  type MyWorkPrimarySurfaceId,
} from '@hbc/models/myWork';
import { AdobeSignActionQueueModuleSurface } from '../modules/adobeSign/AdobeSignActionQueueModuleSurface.js';
import {
  useAdobeSignActionQueueEnvelope,
  useMyWorkHomeEnvelope,
} from '../runtime/useMyWorkReadModelEnvelope.js';
import { selectSurfaceReadiness } from '../state/myWorkSurfaceReadiness.js';
import { MyWorkHomeSurface } from '../surfaces/home/MyWorkHomeSurface.js';

export interface MyWorkSurfaceRouterProps {
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
  readonly activeModuleId?: MyWorkModuleId;
  readonly onSelectModule?: (id: MyWorkModuleId) => void;
  /**
   * Optional Adobe Sign consent-start callback. Forwarded only when
   * the focused module is the Adobe Sign action queue. The shell
   * constructs this from `getApiToken` when in backend mode.
   */
  readonly onConnectAdobeSign?: () => Promise<void>;
}

/**
 * Home route container. Consumes the home read-model envelope via the
 * Prompt 02 hook and maps the envelope state into surface readiness props.
 * Co-located here so each route only fetches what its active surface needs.
 */
function MyWorkHomeRoute({
  onSelectModule,
}: {
  readonly onSelectModule?: (id: MyWorkModuleId) => void;
}) {
  const state = useMyWorkHomeEnvelope();
  const readiness = selectSurfaceReadiness(state);
  return (
    <MyWorkHomeSurface
      readinessVariant={readiness.variant}
      sourceStatus={readiness.sourceStatus}
      homeEnvelope={readiness.envelope}
      onSelectModule={onSelectModule}
    />
  );
}

/**
 * Adobe Sign action queue route container. Consumes the Adobe Sign queue
 * envelope and maps it into the focused module surface's readiness props.
 */
function AdobeSignActionQueueModuleRoute({
  onConnect,
}: {
  readonly onConnect?: () => Promise<void>;
}) {
  const state = useAdobeSignActionQueueEnvelope();
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
 * Each branch delegates to a route container that owns its envelope hook,
 * so the inactive route never issues a read-model request.
 */
export function MyWorkSurfaceRouter({
  activeModuleId,
  onSelectModule,
  onConnectAdobeSign,
}: MyWorkSurfaceRouterProps) {
  const normalized = normalizeMyWorkModuleId(activeModuleId);
  if (normalized === 'adobe-sign-action-queue') {
    return <AdobeSignActionQueueModuleRoute onConnect={onConnectAdobeSign} />;
  }
  return <MyWorkHomeRoute onSelectModule={onSelectModule} />;
}

export default MyWorkSurfaceRouter;
