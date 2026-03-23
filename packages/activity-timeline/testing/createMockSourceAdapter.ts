/**
 * SF28-T08 — Mock factories for source adapters and registrations.
 */
import type {
  IActivitySourceAdapter,
  IActivitySourceRegistration,
} from '../src/types/index.js';

export function createMockSourceAdapter(
  moduleKey: string,
  overrides?: Partial<IActivitySourceAdapter>,
): IActivitySourceAdapter {
  return {
    moduleKey,
    isEnabled: () => true,
    loadRecentActivity: async () => [],
    getEventTypeMetadata: () => null,
    ...overrides,
  };
}

export function createMockSourceRegistration(
  moduleKey: string,
  overrides?: Partial<IActivitySourceRegistration>,
): IActivitySourceRegistration {
  return {
    moduleKey,
    supportedEventTypes: [`${moduleKey}.updated`],
    adapter: createMockSourceAdapter(moduleKey),
    enabledByDefault: true,
    significanceDefaults: {},
    ...overrides,
  };
}
