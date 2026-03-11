export { ProbeScheduler } from './probeScheduler.js';
export { sharePointProbe } from './sharePointProbe.js';
export { azureFunctionsProbe } from './azureFunctionsProbe.js';
export { searchProbe } from './searchProbe.js';
export { notificationProbe } from './notificationProbe.js';
export { moduleRecordHealthProbe } from './moduleRecordHealthProbe.js';

import { ProbeScheduler } from './probeScheduler.js';
import { sharePointProbe } from './sharePointProbe.js';
import { azureFunctionsProbe } from './azureFunctionsProbe.js';
import { searchProbe } from './searchProbe.js';
import { notificationProbe } from './notificationProbe.js';
import { moduleRecordHealthProbe } from './moduleRecordHealthProbe.js';

/**
 * Creates a ProbeScheduler pre-loaded with all five default probes
 * in deterministic order: sharepoint → azure-functions → azure-search →
 * notification-system → module-record-health.
 *
 * @design D-04, SF17-T03
 */
export function createDefaultProbeScheduler(): ProbeScheduler {
  const scheduler = new ProbeScheduler();
  scheduler.register(sharePointProbe);
  scheduler.register(azureFunctionsProbe);
  scheduler.register(searchProbe);
  scheduler.register(notificationProbe);
  scheduler.register(moduleRecordHealthProbe);
  return scheduler;
}
