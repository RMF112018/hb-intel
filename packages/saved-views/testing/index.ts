/**
 * @hbc/saved-views/testing
 *
 * @example
 * ```ts
 * import { createMockSavedViewDefinition, mockPersonalView } from '@hbc/saved-views/testing';
 * ```
 */

export { createMockSavedViewDefinition } from './createMockSavedViewDefinition.js';
export {
  mockPersonalView, mockTeamView, mockRoleView, mockSystemView,
  mockDegradedView, mockIncompatibleView,
  mockPermissionsPersonalOnly, mockPermissionsTeamWriter,
  mockSchemaV1, mockSchemaV2,
} from './mockSavedViewFixtures.js';
