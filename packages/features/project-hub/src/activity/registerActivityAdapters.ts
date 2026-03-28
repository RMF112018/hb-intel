/**
 * Activity spine adapter registration bootstrap.
 *
 * Call once at app initialization to register all known activity source
 * adapters with the ProjectActivityRegistry. Idempotent — safe to call
 * multiple times (registry freezes after first registration).
 *
 * @see ProjectActivityRegistry (registry singleton)
 * @see ALL_ACTIVITY_ADAPTERS (adapter list)
 */

import { ProjectActivityRegistry } from './ProjectActivityRegistry.js';
import { ALL_ACTIVITY_ADAPTERS } from './adapters/index.js';

let registered = false;

export function registerActivityAdapters(): void {
  if (registered && ProjectActivityRegistry.size() > 0) return;

  if (ProjectActivityRegistry.size() > 0) {
    registered = true;
    return;
  }

  ProjectActivityRegistry.register(ALL_ACTIVITY_ADAPTERS);
  registered = true;
}

/** Reset registration state for testing only. */
export function _resetRegistrationForTesting(): void {
  registered = false;
}
