import {
  normalizeMyWorkModuleId,
  type MyWorkModuleId,
  type MyWorkPrimarySurfaceId,
} from '@hbc/models/myWork';
import { MyWorkHomeSurface } from '../surfaces/home/MyWorkHomeSurface.js';
import { AdobeSignActionQueueModuleSurface } from '../modules/adobeSign/AdobeSignActionQueueModuleSurface.js';

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
 * Surface router for the My Work shell. Transparent (no wrapping DOM
 * element, no data attribute). The shell `<main role="tabpanel">`
 * remains the sole owner of `data-my-work-active-surface-panel`.
 *
 * - `activeModuleId === 'adobe-sign-action-queue'` → focused Adobe surface
 * - any other value (including `undefined` and invalid strings via
 *   `normalizeMyWorkModuleId`) → home surface
 */
export function MyWorkSurfaceRouter({
  activeModuleId,
  onSelectModule,
  onConnectAdobeSign,
}: MyWorkSurfaceRouterProps) {
  const normalized = normalizeMyWorkModuleId(activeModuleId);
  if (normalized === 'adobe-sign-action-queue') {
    return <AdobeSignActionQueueModuleSurface onConnect={onConnectAdobeSign} />;
  }
  return <MyWorkHomeSurface onSelectModule={onSelectModule} />;
}

export default MyWorkSurfaceRouter;
