export { MonitorRegistry } from './monitorRegistry.js';
export { provisioningFailureMonitor } from './provisioningFailureMonitor.js';
export { permissionAnomalyMonitor } from './permissionAnomalyMonitor.js';
export { stuckWorkflowMonitor } from './stuckWorkflowMonitor.js';
export { overdueProvisioningMonitor } from './overdueProvisioningMonitor.js';
export { upcomingExpirationMonitor } from './upcomingExpirationMonitor.js';
export { staleRecordMonitor } from './staleRecordMonitor.js';
export { routeAlert } from './notificationRouter.js';

import { MonitorRegistry } from './monitorRegistry.js';
import { provisioningFailureMonitor } from './provisioningFailureMonitor.js';
import { permissionAnomalyMonitor } from './permissionAnomalyMonitor.js';
import { stuckWorkflowMonitor } from './stuckWorkflowMonitor.js';
import { overdueProvisioningMonitor } from './overdueProvisioningMonitor.js';
import { upcomingExpirationMonitor } from './upcomingExpirationMonitor.js';
import { staleRecordMonitor } from './staleRecordMonitor.js';

/**
 * Creates a MonitorRegistry pre-loaded with all six default monitors.
 *
 * @design D-02, SF17-T03
 */
export function createDefaultMonitorRegistry(): MonitorRegistry {
  const registry = new MonitorRegistry();
  registry.register(provisioningFailureMonitor);
  registry.register(permissionAnomalyMonitor);
  registry.register(stuckWorkflowMonitor);
  registry.register(overdueProvisioningMonitor);
  registry.register(upcomingExpirationMonitor);
  registry.register(staleRecordMonitor);
  return registry;
}
