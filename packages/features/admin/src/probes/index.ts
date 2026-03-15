export { ProbeScheduler } from './probeScheduler.js';
export { sharePointProbe, createSharePointProbe } from './sharePointProbe.js';
export { azureFunctionsProbe, createAzureFunctionsProbe } from './azureFunctionsProbe.js';
export type { ProbeConnectionConfig } from './azureFunctionsProbe.js';
export { searchProbe } from './searchProbe.js';
export { notificationProbe } from './notificationProbe.js';
export { moduleRecordHealthProbe } from './moduleRecordHealthProbe.js';

import { ProbeScheduler } from './probeScheduler.js';
import { sharePointProbe, createSharePointProbe } from './sharePointProbe.js';
import { azureFunctionsProbe, createAzureFunctionsProbe } from './azureFunctionsProbe.js';
import type { ProbeConnectionConfig } from './azureFunctionsProbe.js';
import { searchProbe } from './searchProbe.js';
import { notificationProbe } from './notificationProbe.js';
import { moduleRecordHealthProbe } from './moduleRecordHealthProbe.js';

/**
 * Creates a ProbeScheduler pre-loaded with all five probes.
 *
 * When a `config` is supplied, azure-functions and sharepoint probes use
 * real network connections. Otherwise stubs are registered.
 *
 * @design D-04, SF17-T03, G6-T06
 */
export function createDefaultProbeScheduler(config?: ProbeConnectionConfig): ProbeScheduler {
  const scheduler = new ProbeScheduler();
  scheduler.register(config ? createSharePointProbe(config) : sharePointProbe);
  scheduler.register(config ? createAzureFunctionsProbe(config) : azureFunctionsProbe);
  scheduler.register(searchProbe);
  scheduler.register(notificationProbe);
  scheduler.register(moduleRecordHealthProbe);
  return scheduler;
}
