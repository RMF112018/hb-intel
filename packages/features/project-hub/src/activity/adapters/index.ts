/**
 * Activity spine adapter barrel.
 *
 * Each module adapter is exported individually and as part of the
 * ALL_ACTIVITY_ADAPTERS array for batch registration.
 */

export {
  healthPulseActivityAdapter,
  HEALTH_PULSE_ACTIVITY_REGISTRATION,
} from './healthPulseActivityAdapter.js';

import type { IActivitySourceRegistration } from '@hbc/models';
import { HEALTH_PULSE_ACTIVITY_REGISTRATION } from './healthPulseActivityAdapter.js';

/**
 * All activity source adapter registrations.
 * Pass this to ProjectActivityRegistry.register() at app initialization.
 */
export const ALL_ACTIVITY_ADAPTERS: IActivitySourceRegistration[] = [
  HEALTH_PULSE_ACTIVITY_REGISTRATION,
];
