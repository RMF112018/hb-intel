/**
 * @hbc/activity-timeline/testing
 *
 * Test factories, mock adapters, and scenario fixtures.
 * Excluded from production bundles.
 *
 * @example
 * ```ts
 * import { createMockActivityEvent, mockActivityScenarios } from '@hbc/activity-timeline/testing';
 * ```
 */

export { createMockActivityEvent } from './createMockActivityEvent.js';
export { createMockEmissionInput } from './createMockEmissionInput.js';
export { createMockSourceAdapter, createMockSourceRegistration } from './createMockSourceAdapter.js';
export { mockActivityScenarios } from './mockActivityScenarios.js';
