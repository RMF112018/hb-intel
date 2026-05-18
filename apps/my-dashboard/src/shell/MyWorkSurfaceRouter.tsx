import type { MyWorkPrimarySurfaceId } from '@hbc/models/myWork';
import { selectSurfaceReadiness } from '../state/myWorkSurfaceReadiness.js';
import { MyWorkHomeSurface } from '../surfaces/home/MyWorkHomeSurface.js';
import { useMyWorkHomeEnvelopeContext } from './MyWorkActiveEnvelopeContext.js';

export interface MyWorkSurfaceRouterProps {
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
  /** Shell-wired Adobe Sign OAuth start callback. Forwarded transparently to the home surface. */
  readonly onConnectAdobeSign?: () => Promise<void>;
  /** Shell-wired Adobe Sign disconnect callback. Forwarded transparently to the home surface. */
  readonly onDisconnectAdobeSign?: () => Promise<void>;
}

/**
 * Surface router for the My Work shell. Transparent (no wrapping DOM
 * element, no data attribute). The shell `<main>` remains the sole owner
 * of `data-my-work-active-surface-panel`.
 *
 * The router renders the home surface as the single primary-page command
 * surface. Module focus / focused-module routing has been retired.
 *
 * The home route consumes its envelope from
 * `MyWorkActiveEnvelopeProvider` (mounted by the shell), so the hero band
 * shares the same fetch.
 */
export function MyWorkSurfaceRouter({
  onConnectAdobeSign,
  onDisconnectAdobeSign,
}: MyWorkSurfaceRouterProps) {
  const state = useMyWorkHomeEnvelopeContext();
  const readiness = selectSurfaceReadiness(state);
  return (
    <MyWorkHomeSurface
      readinessVariant={readiness.variant}
      sourceStatus={readiness.sourceStatus}
      homeEnvelope={readiness.envelope}
      onConnectAdobeSign={onConnectAdobeSign}
      onDisconnectAdobeSign={onDisconnectAdobeSign}
      onAfterDisconnectAdobeSign={state.refetch}
    />
  );
}

export default MyWorkSurfaceRouter;
