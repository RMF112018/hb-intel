export { MonitorRegistry } from './monitorRegistry.js';
export { provisioningFailureMonitor, createProvisioningFailureMonitor } from './provisioningFailureMonitor.js';
export { permissionAnomalyMonitor } from './permissionAnomalyMonitor.js';
export { stuckWorkflowMonitor, createStuckWorkflowMonitor } from './stuckWorkflowMonitor.js';
export { overdueProvisioningMonitor } from './overdueProvisioningMonitor.js';
export { upcomingExpirationMonitor } from './upcomingExpirationMonitor.js';
export { staleRecordMonitor } from './staleRecordMonitor.js';
export { routeAlert } from './notificationRouter.js';

import { MonitorRegistry } from './monitorRegistry.js';
import { provisioningFailureMonitor, createProvisioningFailureMonitor } from './provisioningFailureMonitor.js';
import { permissionAnomalyMonitor } from './permissionAnomalyMonitor.js';
import { stuckWorkflowMonitor, createStuckWorkflowMonitor } from './stuckWorkflowMonitor.js';
import { overdueProvisioningMonitor } from './overdueProvisioningMonitor.js';
import { upcomingExpirationMonitor } from './upcomingExpirationMonitor.js';
import { staleRecordMonitor } from './staleRecordMonitor.js';
import type { IProvisioningDataProvider } from '../types/IProvisioningDataProvider.js';

/**
 * Creates a MonitorRegistry pre-loaded with all six default monitors.
 *
 * When a `provider` is supplied, the provisioning-failure and stuck-workflow
 * monitors are wired with real data access. Otherwise stubs are registered
 * for backward compatibility.
 *
 * @design D-02, SF17-T03, G6-T04
 */
export function createDefaultMonitorRegistry(provider?: IProvisioningDataProvider): MonitorRegistry {
  const registry = new MonitorRegistry();
  registry.register(
    provider ? createProvisioningFailureMonitor(provider) : provisioningFailureMonitor,
  );
  registry.register(permissionAnomalyMonitor);
  registry.register(
    provider ? createStuckWorkflowMonitor(provider) : stuckWorkflowMonitor,
  );
  registry.register(overdueProvisioningMonitor);
  registry.register(upcomingExpirationMonitor);
  registry.register(staleRecordMonitor);
  return registry;
}
